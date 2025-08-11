"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Itinerary {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: string;
  created_at: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  itineraries: Itinerary[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('itinerary')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching itineraries:', error);
        return;
      }

      setItineraries(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate the start date for the calendar grid
    // We want to show the full week that contains the first day of the month
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Generate 42 days (6 weeks * 7 days) to ensure we cover the entire month
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      
      // Find itineraries for this date - FIXED DATE COMPARISON
      const dayItineraries = itineraries.filter(itinerary => {
        const startDate = new Date(itinerary.start_date);
        const endDate = new Date(itinerary.end_date);
        
        // Reset time to midnight for accurate date comparison
        const currentDateMidnight = new Date(currentDate);
        currentDateMidnight.setHours(0, 0, 0, 0);
        
        const startDateMidnight = new Date(startDate);
        startDateMidnight.setHours(0, 0, 0, 0);
        
        const endDateMidnight = new Date(endDate);
        endDateMidnight.setHours(0, 0, 0, 0);
        
        // Check if current date is between start and end dates (inclusive)
        return currentDateMidnight >= startDateMidnight && currentDateMidnight <= endDateMidnight;
      });

      days.push({
        date: currentDate,
        isCurrentMonth,
        isToday,
        itineraries: dayItineraries
      });
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const calendarDays = generateCalendarDays(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Travel Calendar</h1>
          <p className="text-gray-300">View all your upcoming trips and adventures</p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            ← Previous Month
          </button>
          
          <h2 className="text-2xl font-semibold text-white">
            {formatDate(currentDate)}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Next Month →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-gray-700 rounded-lg
                  ${day.isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900 text-gray-600'}
                  ${day.isToday ? 'ring-2 ring-red-500' : ''}
                  ${day.itineraries.length > 0 ? 'bg-red-900/20 border-red-500/50' : ''}
                `}
              >
                {/* Day Number */}
                <div className={`
                  text-sm font-medium mb-2
                  ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                  ${day.isToday ? 'text-red-400 font-bold' : ''}
                `}>
                  {formatDay(day.date)}
                </div>

                {/* Itineraries for this day */}
                {day.itineraries.map((itinerary, idx) => (
                  <div
                    key={idx}
                    className="mb-1 p-1 bg-red-600/80 text-white text-xs rounded cursor-pointer hover:bg-red-500/80 transition-colors"
                    title={`${itinerary.title} - ${itinerary.description}`}
                  >
                    <div className="font-medium truncate">{itinerary.title}</div>
                    <div className="text-red-200 truncate">{itinerary.description}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Calendar Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-600/80 rounded"></div>
              <span className="text-gray-300">Trip Day</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-transparent border-2 border-red-500 rounded"></div>
              <span className="text-gray-300">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span className="text-gray-300">Current Month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

