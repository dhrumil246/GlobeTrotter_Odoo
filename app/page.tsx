'use client';

import Link from 'next/link';
import { Button } from './components/ui/Button';
import { useAuth } from './lib/context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Plan Your Perfect
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Dream, design, and organize your trips with GlobeTrotter. 
            Discover amazing destinations, create detailed itineraries, and manage your travel budget all in one place.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-6">
                Welcome back, {user?.name}! Ready for your next adventure?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/trips/new">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Plan New Trip
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/search/cities">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Destinations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to plan amazing trips
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features to help you create unforgettable travel experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Itinerary Builder</h3>
            <p className="text-gray-600">
              Create detailed day-by-day itineraries with drag-and-drop simplicity. 
              Add cities, activities, and accommodations with ease.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Tracking</h3>
            <p className="text-gray-600">
              Keep track of your travel expenses with detailed budget breakdowns. 
              Get insights into costs and stay within your limits.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Destination Discovery</h3>
            <p className="text-gray-600">
              Explore amazing destinations and discover activities tailored to your interests. 
              Find hidden gems and popular attractions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start planning?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust GlobeTrotter to plan their perfect trips.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
