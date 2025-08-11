"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import TripsBrowser from "./TripsBrowser";
import Link from "next/link";
import dayjs from "dayjs";

type Itinerary = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  user_id: string;
};

type Activity = {
  id: string;
  activity_name: string;
  cost: number;
  date: string;
  itinerary_id: string;
};

interface ClientDashboardProps {
  initialItineraries: Itinerary[];
  initialActivities: Activity[];
  userEmail: string;
  userId: string;
}

export default function ClientDashboard({
  initialItineraries,
  initialActivities,
  userEmail,
  userId,
}: ClientDashboardProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const supabase = createSupabaseClient();

  // Calculate stats
  const today = dayjs();
  const activeTrips = itineraries.filter(trip => 
    dayjs(trip.end_date).isAfter(today) || dayjs(trip.end_date).isSame(today, 'day')
  ).length;
  const totalActivities = activities.length;
  const totalSpent = activities.reduce((sum, activity) => 
    sum + Number(activity.cost || 0), 0
  );

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to itinerary changes
    const itineraryChannel = supabase
      .channel('dashboard_itineraries')
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

    // Subscribe to activity changes for this user's itineraries
    const activityChannel = supabase
      .channel('dashboard_activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        async (payload) => {
          // Check if this activity belongs to one of the user's itineraries
          const itineraryIds = itineraries.map(trip => trip.id);
          
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as Activity;
            if (itineraryIds.includes(newActivity.itinerary_id)) {
              setActivities(prev => [...prev, newActivity]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedActivity = payload.new as Activity;
            if (itineraryIds.includes(updatedActivity.itinerary_id)) {
              setActivities(prev =>
                prev.map(activity =>
                  activity.id === updatedActivity.id ? updatedActivity : activity
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setActivities(prev =>
              prev.filter(activity => activity.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itineraryChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [userId, itineraries, supabase]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {userEmail.split('@')[0]}!</h2>
            <p className="text-green-100 text-lg">Ready to plan your next adventure?</p>
            <div className="flex items-center justify-center mt-2">
              <span className="text-xs text-green-200 mr-2">Live updates enabled</span>
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Trips Browser with Search/Filter/Sort/Group */}
        <TripsBrowser itineraries={itineraries} />

        {/* Top Regional Selections */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Regional Selections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Asia", icon: "🌏", color: "from-red-500 to-pink-500" },
              { name: "Europe", icon: "🏛️", color: "from-purple-500 to-purple-600" },
              { name: "Americas", icon: "🗽", color: "from-blue-500 to-teal-500" },
              { name: "Africa", icon: "🦁", color: "from-yellow-500 to-orange-500" },
              { name: "Oceania", icon: "🏝️", color: "from-emerald-500 to-green-500" }
            ].map((region, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${region.color} rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}
              >
                <div className="text-3xl mb-2">{region.icon}</div>
                <h4 className="font-semibold">{region.name}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Cards with Live Updates */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-green-600">{activeTrips}</div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-gray-600">Active Trips</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-blue-600">{totalActivities}</div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-purple-600">₹{totalSpent.toLocaleString()}</div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/itinerary"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">+</span>
          <span className="font-medium">Plan a trip</span>
        </div>
      </Link>
    </div>
  );
}
