"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Get current user immediately
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
        }
        if (mounted) {
          setUser(user);
          
          // Check admin role from users table
          if (user) {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('email', user.email)
              .single();
            
            setIsAdmin(userData?.role === 'admin');
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    // Listen for auth changes with more detailed logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        // Check admin role when auth state changes
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
        
        // Force a re-render by updating the router
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // Additional effect to check auth state periodically (fallback)
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    // Check auth state every 2 seconds as a fallback
    const interval = setInterval(checkAuthState, 2000);
    
    return () => clearInterval(interval);
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowDropdown(false);
      setUser(null);
      setIsAdmin(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <nav className="bg-gradient-to-br from-gray-900 to-black border-b border-red-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold hover:text-red-400 transition-colors">
              GlobalTrotters
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              // Show loading state
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : user ? (
              // User is signed in - show profile photo
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/32x32/red/white?text=U";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.email}</span>
                  {isAdmin && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">ADMIN</span>
                  )}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-red-500/20 rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/itinerary"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Itineraries
                    </Link>
                    {isAdmin && (
                      <>
                        <hr className="my-1 border-gray-700" />
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 font-semibold"
                          onClick={() => setShowDropdown(false)}
                        >
                          🛠️ Admin Dashboard
                        </Link>
                      </>
                    )}
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not signed in - show Login/Signup
              <>
                <Link href="/login" className="text-white hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}