"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'completed';
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTrip: boolean;
  tripDetails?: Trip[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserTrips();
    
    // Set up interval to refresh data every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      fetchUserTrips();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, userTrips]);

  const fetchUserTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: trips } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: true });

        if (trips) {
          setUserTrips(trips);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get first day of calendar (including previous month's days)
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    
    // Get last day of calendar (including next month's days)
    const lastDayOfCalendar = new Date(lastDayOfMonth);
    lastDayOfCalendar.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDateObj = new Date(firstDayOfCalendar);
    
    while (currentDateObj <= lastDayOfCalendar) {
      const tripsOnThisDate = userTrips.filter(trip => {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        return currentDateObj >= startDate && currentDateObj <= endDate;
      });

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        hasTrip: tripsOnThisDate.length > 0,
        tripDetails: tripsOnThisDate
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Link 
              href="/profile" 
              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
            >
              <span className="mr-2">⬅️</span>
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Travel Calendar</h1>
          </div>
          <button
            onClick={goToToday}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Today
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goToPreviousMonth}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-3xl font-bold text-gray-800">
              {formatMonthYear(currentDate)}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b-2 border-gray-200">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {getDayName(index).slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 border-r border-b border-gray-200 last:border-r-0 relative ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${day.isToday ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                >
                  {/* Date Number */}
                  <div className={`text-lg font-semibold mb-2 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${day.isToday ? 'text-blue-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Trip Indicators */}
                  {day.hasTrip && day.tripDetails && (
                    <div className="space-y-2">
                      {day.tripDetails.slice(0, 3).map((trip, tripIndex) => (
                        <div
                          key={tripIndex}
                          className={`text-xs p-2 rounded-lg border ${
                            trip.status === 'planned' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                          title={`${trip.title} - ${trip.destination}`}
                        >
                          <div className="font-medium truncate">{trip.title}</div>
                          <div className="text-xs opacity-75 truncate">{trip.destination}</div>
                        </div>
                      ))}
                      {day.tripDetails.length > 3 && (
                        <div className="text-xs text-gray-500 text-center bg-gray-100 rounded px-2 py-1">
                          +{day.tripDetails.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
          <div className="flex flex-wrap items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-50 border-2 border-blue-200 rounded-lg"></div>
              <span className="text-sm text-gray-700 font-medium">Planned Trips</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-50 border-2 border-green-200 rounded-lg"></div>
              <span className="text-sm text-gray-700 font-medium">Completed Trips</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-50 ring-2 ring-blue-500 rounded-lg"></div>
              <span className="text-sm text-gray-700 font-medium">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
