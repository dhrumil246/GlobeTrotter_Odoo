"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
}

interface Activity {
  id: string;
  itinerary_id: string;
  cost: number;
  date: string;
}

interface SpendingData {
  month: string;
  amount: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if user is admin (simple email check)
      if (user.email !== '24cs058@charusat.edu.in') {
        router.push('/dashboard');
        return;
      }

      setUser(user);
      setIsAdmin(true);
      
      // Fetch admin data
      await fetchAdminData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch all itineraries
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('itinerary')
        .select('*')
        .order('created_at', { ascending: false });

      if (itinerariesError) {
        console.error('Error fetching itineraries:', itinerariesError);
      } else {
        setItineraries(itinerariesData || []);
      }

      // Fetch all activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const totalTrips = itineraries.length;
  const totalSpent = activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
  
  // Calculate spending by month for the last 6 months
  const getSpendingByMonth = (): SpendingData[] => {
    const months: SpendingData[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.getMonth() === date.getMonth() && 
               activityDate.getFullYear() === date.getFullYear();
      });
      
      const monthTotal = monthActivities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
      months.push({ month: monthName, amount: monthTotal });
    }
    
    return months;
  };

  // Get user statistics
  const getUserStats = (userId: string) => {
    const userItineraries = itineraries.filter(trip => trip.user_id === userId);
    const userActivities = activities.filter(activity => 
      userItineraries.some(trip => trip.id === activity.itinerary_id)
    );
    const userSpent = userActivities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
    
    return {
      tripCount: userItineraries.length,
      totalSpent: userSpent
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
          <Link href="/dashboard" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const spendingData = getSpendingByMonth();
  const maxSpending = Math.max(...spendingData.map(d => d.amount));
  const minSpending = Math.min(...spendingData.map(d => d.amount));
  const range = maxSpending - minSpending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">️ Admin Dashboard</h1>
              <p className="text-gray-300">Welcome back, {user?.email}</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-red-500">{totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trips</p>
                <p className="text-3xl font-bold text-red-400">{totalTrips}</p>
              </div>
              <div className="text-4xl">✈️</div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-red-300">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Simple Spending Chart */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">💰 Monthly Spending Trend</h3>
          
          <div className="h-64 bg-gray-800 rounded-lg p-4">
            <div className="relative h-full">
              {/* Simple line chart */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={spendingData.map((data, index) => {
                    const x = (index / (spendingData.length - 1)) * 100;
                    const y = range > 0 ? 100 - ((data.amount - minSpending) / range) * 100 : 50;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1"
                />
              </svg>
              
              {/* Month labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
                {spendingData.map((data, index) => (
                  <div key={index} className="text-center">
                    <div className="text-white font-medium">₹{data.amount.toLocaleString()}</div>
                    <div>{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">👥 All Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300 font-medium">User</th>
                  <th className="py-3 px-4 text-gray-300 font-medium">Joined</th>
                  <th className="py-3 px-4 text-gray-300 font-medium">Trips</th>
                  <th className="py-3 px-4 text-gray-300 font-medium">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const stats = getUserStats(user.id);
                  return (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                          {stats.tripCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        ₹{stats.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAdminData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}