import Link from "next/link";
import MovingDestinationCards from "./components/MovingDestinationCards";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Plan your next adventure with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
              GlobalTrotter
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create detailed itineraries, track your travel budget, and discover amazing destinations. 
            Your perfect journey starts here.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✈️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create Itineraries</h3>
            <p className="text-gray-300 mb-4">Plan your trips day by day with detailed activities and schedules.</p>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Budget</h3>
            <p className="text-gray-300 mb-4">Monitor your travel expenses and stay within your budget.</p>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Start Planning
            </Link>
          </div>

          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Discover Places</h3>
            <p className="text-gray-300 mb-4">Explore new destinations and create unforgettable memories.</p>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Explore Now
            </Link>
          </div>
        </div>

        {/* Moving Destination Cards */}
        <MovingDestinationCards />

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Ready to start your journey?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
            >
              <span className="mr-2">🚀</span>
              Create Account
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-red-600 text-red-400 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all"
            >
              <span className="mr-2">🔑</span>
              Log In
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <span className="mr-2">📊</span>
              Dashboard
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📅</div>
            <h4 className="font-semibold text-white">Day-by-Day Planning</h4>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">💳</div>
            <h4 className="font-semibold text-white">Budget Tracking</h4>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📱</div>
            <h4 className="font-semibold text-white">Mobile Friendly</h4>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-white">Secure & Private</h4>
          </div>
        </div>
      </div>
    </div>
  );
}