"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const supabase = createSupabaseClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('Please log in first');
          window.location.href = '/login';
          return;
        }

        setUser(user);

        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!userData || userData.role !== 'admin') {
          alert('You are not an admin user');
          window.location.href = '/dashboard';
          return;
        }

        // Fetch data
        await fetchData();
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        alert('Error checking admin access');
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*');
      setUsers(usersData || []);

      // Fetch itineraries
      const { data: itinerariesData } = await supabase
        .from('itinerary')
        .select('*');
      setItineraries(itinerariesData || []);

      // Fetch activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*');
      setActivities(activitiesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">�� ADMIN DASHBOARD</h1>
          <p className="text-gray-300">Welcome, {user?.email}</p>
          <p className="text-red-400 text-sm">You have admin privileges</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-2 mb-8">
          <div className="flex justify-center space-x-2">
            {['overview', 'users', 'itineraries', 'activities'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
                <div className="text-gray-400">Total Users</div>
              </div>
              <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">✈️</div>
                <div className="text-2xl font-bold text-white">{itineraries.length}</div>
                <div className="text-gray-400">Itineraries</div>
              </div>
              <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-white">{activities.length}</div>
                <div className="text-gray-400">Activities</div>
              </div>
              <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-white">
                  ${activities.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(2)}
                </div>
                <div className="text-gray-400">Total Revenue</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold">Manage Users</div>
                </button>
                <button
                  onClick={() => setActiveTab('itineraries')}
                  className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <div className="text-2xl mb-2">✈️</div>
                  <div className="font-semibold">View Itineraries</div>
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold">View Activities</div>
                </button>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                🔄 Refresh All Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">All Users ({users.length})</h3>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left text-gray-300">Email</th>
                      <th className="py-3 px-4 text-left text-gray-300">Role</th>
                      <th className="py-3 px-4 text-left text-gray-300">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No users found</p>
            )}
          </div>
        )}

        {activeTab === 'itineraries' && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">All Itineraries ({itineraries.length})</h3>
            {itineraries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((itinerary) => (
                  <div key={itinerary.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">{itinerary.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{itinerary.description}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No itineraries found</p>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">All Activities ({activities.length})</h3>
            {activities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left text-gray-300">Activity</th>
                      <th className="py-3 px-4 text-left text-gray-300">Cost</th>
                      <th className="py-3 px-4 text-left text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{activity.activity_name}</td>
                        <td className="py-3 px-4 text-white">${activity.cost}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No activities found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}