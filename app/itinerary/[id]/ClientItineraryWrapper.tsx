"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import AddActivitySection from "./AddActivitySection";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

type Activity = {
  id: string;
  activity_name: string;
  cost: number;
  date: string;
  itinerary_id: string;
};

type Itinerary = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

interface ClientItineraryWrapperProps {
  itinerary: Itinerary;
  initialActivities: Activity[];
  days: string[];
}

export default function ClientItineraryWrapper({
  itinerary,
  initialActivities,
  days,
}: ClientItineraryWrapperProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [totalTripCost, setTotalTripCost] = useState<number>(0);
  const [isCostUpdating, setIsCostUpdating] = useState(false);
  const supabase = createSupabaseClient();

  // Group activities by day
  const activitiesByDay: Record<string, Activity[]> = days.reduce((acc, day) => {
    acc[day] = activities?.filter((a: Activity) => a.date === day) || [];
    return acc;
  }, {} as Record<string, Activity[]>);

  // Calculate initial total trip cost
  useEffect(() => {
    const initialTotal = activities?.reduce((sum, activity) => sum + Number(activity.cost), 0) || 0;
    setTotalTripCost(initialTotal);
  }, [activities]);

  // Handle total cost updates from AddActivitySection
  const handleTotalCostChange = (newTotalCost: number) => {
    setIsCostUpdating(true);
    setTotalTripCost(newTotalCost);
    
    // Hide updating animation after a brief moment
    setTimeout(() => {
      setIsCostUpdating(false);
    }, 500);
  };

  // Set up real-time subscription for activities
  useEffect(() => {
    const channel = supabase
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `itinerary_id=eq.${itinerary.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setActivities(prev => [...prev, payload.new as Activity]);
          } else if (payload.eventType === 'UPDATE') {
            setActivities(prev => 
              prev.map(activity => 
                activity.id === payload.new.id ? payload.new as Activity : activity
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setActivities(prev => 
              prev.filter(activity => activity.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itinerary.id, supabase]);

  return (
    <>
      {/* Updated Header with Real-time Cost */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{itinerary.title}</h1>
            <p className="text-gray-300 mt-1">
              {dayjs(itinerary.start_date).format("MMM DD")} - {dayjs(itinerary.end_date).format("MMM DD, YYYY")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1 flex items-center">
              Total Trip Cost
              {isCostUpdating && (
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse"></div>
              )}
            </div>
            <div className={`text-3xl font-bold transition-all duration-300 ${
              isCostUpdating ? 'text-red-300 scale-105' : 'text-red-400'
            }`}>
              ₹{totalTripCost.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Updates live</div>
          </div>
        </div>
        {itinerary.description && (
          <p className="text-gray-300 text-lg">{itinerary.description}</p>
        )}
      </div>

      {/* Itinerary Content */}
      <AddActivitySection
        itinerary={itinerary}
        days={days}
        activitiesByDay={activitiesByDay}
        onTotalCostChange={handleTotalCostChange}
      />
    </>
  );
}