"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'completed';
  image?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plannedTrips, setPlannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await createUserProfile(user);
        await fetchUserTrips(user.id);
      }
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  const createUserProfile = async (user: any) => {
    try {
      // Create profile from user data instead of fetching from non-existent table
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        created_at: user.created_at || new Date().toISOString()
      };
      
      setProfile(userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const fetchUserTrips = async (userId: string) => {
    try {
      // Fetch from the 'itinerary' table (which actually exists in your app)
      const { data: itineraryData } = await supabase
        .from('itinerary')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (itineraryData && itineraryData.length > 0) {
        // Convert itinerary data to trip format
        const convertedTrips: Trip[] = itineraryData.map((item: any) => ({
          id: item.id,
          title: item.title,
          destination: item.description || 'No destination specified',
          start_date: item.start_date,
          end_date: item.end_date,
          status: 'planned' as const,
          image: undefined
        }));
        
        setPlannedTrips(convertedTrips);
        setPreviousTrips([]); // No completed trips in itinerary table
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h1>
          <Link href="/login" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextSibling) nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile?.full_name || 'Traveler'}
              </h1>
              <p className="text-lg text-gray-300 mb-4">{profile?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* My Itineraries Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Itineraries</h2>
          {plannedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plannedTrips.map((trip) => (
                <div key={trip.id} className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <span className="text-6xl">✈️</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{trip.title}</h3>
                    <p className="text-gray-300 mb-2">📍 {trip.destination}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                    <Link 
                      href={`/itinerary/${trip.id}`}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors inline-block text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No itineraries yet</h3>
              <p className="text-gray-300 mb-4">Start planning your next adventure!</p>
              <Link href="/itinerary" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                Create Itinerary
              </Link>
            </div>
          )}
        </div>

        {/* Footer with Three Buttons */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/calendar" 
              className="flex items-center justify-center px-8 py-4 bg-gray-800 border-2 border-red-500/30 text-white rounded-xl font-semibold hover:bg-gray-700 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="mr-3 text-xl">📅</span>
              Calendar
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center justify-center px-8 py-4 bg-gray-800 border-2 border-red-500/30 text-white rounded-xl font-semibold hover:bg-gray-700 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="mr-3 text-xl">📊</span>
              Dashboard
            </Link>
            <Link 
              href="/itinerary" 
              className="flex items-center justify-center px-8 py-4 bg-gray-800 border-2 border-red-500/30 text-white rounded-xl font-semibold hover:bg-gray-700 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="mr-3 text-xl">✈️</span>
              My Itineraries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}