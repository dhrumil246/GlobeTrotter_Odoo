"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial user state
    checkUser();
    
    // Set up real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Check if admin immediately
          if (session.user.email === '24cs058@charusat.edu.in') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Check if user is admin
      if (user && user.email === '24cs058@charusat.edu.in') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/GlobeTrotter.png"
                  alt="GlobeTrotter"
                  width={40}
                  height={40}
                  className="h-8 w-auto group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300"
                />
                <span className="ml-2 text-xl font-bold text-white group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300">
                  GlobeTrotter
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/GlobeTrotter.png"
                alt="GlobeTrotter"
                width={40}
                height={40}
                className="h-8 w-auto group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300"
              />
              <span className="ml-2 text-xl font-bold text-white group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300">
                GlobeTrotter
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
              Dashboard
            </Link>
            <Link href="/itinerary" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
              My Trips
            </Link>
            <Link href="/calendar" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
              Calendar
            </Link>
            <Link href="/community" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
              Community
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
                  <span className="mr-2">{user.email}</span>
                  {isAdmin && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full hover:bg-red-500 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300">ADMIN</span>
                  )}
                  <svg className="ml-1 h-4 w-4 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-700">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300">
                      🛠️ Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-red-600 hover:to-red-700 hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] transition-all duration-300">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}