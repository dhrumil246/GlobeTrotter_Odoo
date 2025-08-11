'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, LoadingState } from '@/app/components/ui';
import { useAuth } from '@/app/lib/context/AuthContext';
import { useTrips } from '@/app/lib/context/TripContext';
import { formatDateRange, formatCurrency } from '@/app/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { trips, isLoading: tripsLoading } = useTrips();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !user) {
    return <LoadingState title="Loading dashboard..." />;
  }

  const recentTrips = trips.slice(0, 3);
  const totalTrips = trips.length;
  const activeTrips = trips.filter(trip => trip.status === 'planned' || trip.status === 'active').length;
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Ready for your next adventure? Here&apos;s what&apos;s happening with your trips.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent padding="md" className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalTrips}</div>
            <div className="text-sm font-medium text-blue-800">Total Trips</div>
            <div className="text-xs text-blue-600 mt-1">All time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent padding="md" className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{activeTrips}</div>
            <div className="text-sm font-medium text-green-800">Active Trips</div>
            <div className="text-xs text-green-600 mt-1">Planned & ongoing</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent padding="md" className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(totalBudget, user.preferences.currency)}
            </div>
            <div className="text-sm font-medium text-purple-800">Total Budget</div>
            <div className="text-xs text-purple-600 mt-1">Across all trips</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Trips</h2>
            <Link href="/trips">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {tripsLoading ? (
            <LoadingState title="Loading trips..." />
          ) : recentTrips.length > 0 ? (
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <Card key={trip.id} hover className="cursor-pointer">
                  <Link href={`/trips/${trip.id}`}>
                    <CardContent padding="md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{trip.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDateRange(trip.startDate, trip.endDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {trip.destinations.length} destination{trip.destinations.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(trip.budget.total, trip.budget.currency)}
                          </div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                              trip.status === 'planned'
                                ? 'bg-blue-100 text-blue-800'
                                : trip.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : trip.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent padding="lg" className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-500 mb-4">Start planning your first adventure!</p>
                <Link href="/trips/new">
                  <Button variant="primary">Plan Your First Trip</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions & Recommendations */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="space-y-4 mb-8">
            <Link href="/trips/new">
              <Card hover className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent padding="md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Plan New Trip</h3>
                      <p className="text-sm text-gray-600">Start creating your next adventure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/search/cities">
              <Card hover className="cursor-pointer">
                <CardContent padding="md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Discover Destinations</h3>
                      <p className="text-sm text-gray-600">Explore amazing places to visit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card hover className="cursor-pointer">
                <CardContent padding="md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                      <p className="text-sm text-gray-600">Manage your account preferences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Travel Tips */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-orange-900">💡 Travel Tip</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-3">
                Did you know? Planning your trips 2-3 months in advance can save you up to 40% on flights and accommodation!
              </p>
              <p className="text-xs text-orange-700">
                Use our budget tracking feature to monitor your savings as you plan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}