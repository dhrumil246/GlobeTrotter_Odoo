import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import ClientItineraryList from "./ClientItineraryList";

export default async function ItineraryBuilderPage() {
  const supabase = createSupabaseServerClient();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your itineraries.</p>
          <Link 
            href="/login" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Fetch only this user's itineraries
  const { data: itineraries, error } = await supabase
    .from("itinerary")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Itineraries</h2>
          <p className="text-gray-600 mb-6">There was an error loading your itineraries: {error.message}</p>
          <Link 
            href="/dashboard" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Client-side component for real-time updates */}
        <ClientItineraryList
          initialItineraries={itineraries || []}
          userId={user.id}
        />
      </div>
    </div>
  );
}