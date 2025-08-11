"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Check if user is admin
      if (user && user.email === '24cs058@charusat.edu.in') {
        setIsAdmin(true);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-900 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-700 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/GlobeTrotter.png" alt="GlobeTrotter" width={40} height={40} />
            <span className="text-xl font-bold text-white">GlobeTrotter</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/itinerary" className="text-gray-300 hover:text-white transition-colors">
              My Trips
            </Link>
            <Link href="/calendar" className="text-gray-300 hover:text-white transition-colors">
              Calendar
            </Link>
            <Link href="/community" className="text-gray-300 hover:text-white transition-colors">
              Community
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-red-400 hover:text-red-300 transition-colors font-medium">
                🛠️ Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block">{user.email?.split('@')[0]}</span>
                  {isAdmin && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      ADMIN
                    </span>
                  )}
                  <span>▼</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-red-500/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                      Signed in as {user.email}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      👤 Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        🛠️ Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
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