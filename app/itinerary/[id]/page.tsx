import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import ClientItineraryWrapper from "./ClientItineraryWrapper";
import Link from "next/link";
dayjs.extend(isSameOrBefore);

export default async function ItineraryDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: itinerary } = await supabase
    .from("itinerary")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!itinerary) return notFound();

  // Generate days array
  const days: string[] = [];
  let current = dayjs(itinerary.start_date);
  const end = dayjs(itinerary.end_date);
  while (current.isSameOrBefore(end)) {
    days.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  // Fetch activities for this itinerary
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("itinerary_id", itinerary.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/itinerary" 
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to My Itineraries</span>
          </Link>
        </div>

        {/* Client-side wrapper for real-time updates */}
        <ClientItineraryWrapper
          itinerary={itinerary}
          initialActivities={activities || []}
          days={days}
        />
      </div>
    </div>
  );
}