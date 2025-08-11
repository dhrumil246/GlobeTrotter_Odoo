"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function DebugUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No user logged in</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">User Debug Information</h1>
        
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Data</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-green-400 text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Metadata</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-green-400 text-sm overflow-auto">
            {JSON.stringify(user.user_metadata, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Role Check</h2>
          <div className="space-y-2">
            <p className="text-gray-300">
              <span className="text-white">Email:</span> {user.email}
            </p>
            <p className="text-gray-300">
              <span className="text-white">Role from metadata:</span> {user.user_metadata?.role || 'undefined'}
            </p>
            <p className="text-gray-300">
              <span className="text-white">Is Admin:</span> 
              <span className={user.user_metadata?.role === 'admin' ? 'text-green-400' : 'text-red-400'}>
                {user.user_metadata?.role === 'admin' ? ' YES' : ' NO'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
