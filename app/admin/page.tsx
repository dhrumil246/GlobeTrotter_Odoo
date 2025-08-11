"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const supabase = createSupabaseClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log("=== ADMIN CHECK START ===");
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("User check result:", { user, error: userError });
        
        if (userError || !user) {
          console.log("No user found, redirecting to login");
          setError("No user found");
          setLoading(false);
          return;
        }

        console.log("User found:", user.email);
        setUser(user);

        // Check if user is admin from users table
        console.log("Checking admin role from users table...");
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        console.log("Role check result:", { userData, error: roleError });

        if (roleError) {
          console.error("Role check error:", roleError);
          setError(`Role check failed: ${roleError.message}`);
          setLoading(false);
          return;
        }

        if (!userData || userData.role !== 'admin') {
          console.log("User is not admin");
          setError("You are not an admin user!");
          setLoading(false);
          return;
        }

        console.log("User is admin, setting state...");
        setIsAdmin(true);
        setLoading(false);
        
      } catch (error) {
        console.error("Admin check error:", error);
        setError(`Error: ${error}`);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-xl">Checking Admin Access...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Admin Access Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">You are not authorized to view this page.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4"> ADMIN DASHBOARD</h1>
          <p className="text-2xl text-white mb-2">Welcome, {user?.email}</p>
          <p className="text-red-400 text-lg font-semibold">You have ADMIN privileges</p>
          <div className="mt-4 p-2 bg-red-600 text-white rounded-lg inline-block">
             SECURE ADMIN AREA
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-900 border-2 border-green-500 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">✅ ADMIN ACCESS SUCCESSFUL!</h2>
          <p className="text-green-200">You are now viewing the admin dashboard</p>
        </div>

        {/* Admin Features */}
        <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center"> ADMIN FEATURES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-800 rounded-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-white font-semibold">Manage Users</div>
              <div className="text-red-200 text-sm">View all users</div>
            </div>
            <div className="p-4 bg-red-800 rounded-lg text-center">
              <div className="text-3xl mb-2">✈️</div>
              <div className="text-white font-semibold">View All Trips</div>
              <div className="text-red-200 text-sm">All itineraries</div>
            </div>
            <div className="p-4 bg-red-800 rounded-lg text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-white font-semibold">Analytics</div>
              <div className="text-red-200 text-sm">Platform stats</div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300">User Email: <span className="text-white">{user?.email}</span></p>
              <p className="text-gray-300">User ID: <span className="text-white">{user?.id}</span></p>
              <p className="text-gray-300">Admin Status: <span className="text-green-400 font-bold">{isAdmin ? 'YES' : 'NO'}</span></p>
            </div>
            <div>
              <p className="text-gray-300">Current URL: <span className="text-white">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span></p>
              <p className="text-gray-300">Page Type: <span className="text-red-400 font-bold">ADMIN DASHBOARD</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}