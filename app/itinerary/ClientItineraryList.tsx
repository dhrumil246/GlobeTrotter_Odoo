"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import ItineraryForm from "./ItineraryForm";
import Link from "next/link";

type Itinerary = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  user_id: string;
};

interface ClientItineraryListProps {
  initialItineraries: Itinerary[];
  userId: string;
}

export default function ClientItineraryList({
  initialItineraries,
  userId,
}: ClientItineraryListProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries);
  const supabase = createSupabaseClient();

  // Set up real-time subscription for itineraries
  useEffect(() => {
    const channel = supabase
      .channel('itineraries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItineraries(prev => [...prev, payload.new as Itinerary]);
          } else if (payload.eventType === 'UPDATE') {
            setItineraries(prev =>
              prev.map(itinerary =>
                itinerary.id === payload.new.id ? payload.new as Itinerary : itinerary
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setItineraries(prev =>
              prev.filter(itinerary => itinerary.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return (
    <>
      {/* Header Section */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Itineraries</h1>
            <p className="text-gray-400">Create and manage your travel plans</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">
              Total Trips
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse" title="Live updates"></span>
            </div>
            <div className="text-2xl font-bold text-red-500">{itineraries.length}</div>
          </div>
        </div>
      </div>

      {/* Create New Itinerary Section */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Create New Itinerary</h2>
        <ItineraryForm />
      </div>

      {/* Itineraries List */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Your Itineraries</h2>

        {itineraries.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary.id}
                href={`/itinerary/${itinerary.id}`}
                className="block group"
              >
                <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-500/30 rounded-xl p-6 hover:shadow-lg hover:border-red-500/50 transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                      {itinerary.title}
                    </h3>
                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                      <span className="text-red-300 text-sm">✈️</span>
                    </div>
                  </div>

                  {itinerary.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {itinerary.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>
                        {new Date(itinerary.start_date).toLocaleDateString()} -{" "}
                        {new Date(itinerary.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-red-400 font-medium">View Details →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Itineraries Yet</h3>
            <p className="text-gray-400 mb-6">
              Start planning your next adventure by creating your first itinerary!
            </p>
            <div className="w-16 h-16 bg-red-900 border border-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-400 text-2xl">+</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
