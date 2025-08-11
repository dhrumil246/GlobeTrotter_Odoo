import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ClientDashboard from "./ClientDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  // Fetch user's itineraries
  const { data: itineraries } = await supabase
    .from("itinerary")
    .select("*")
    .eq("user_id", data.user.id);

  // Fetch user's activities
  let activities: any[] = [];
  if (itineraries && itineraries.length > 0) {
    const itineraryIds = itineraries.map(trip => trip.id);
    const { data: activitiesData } = await supabase
      .from("activities")
      .select("*")
      .in("itinerary_id", itineraryIds);
    activities = activitiesData || [];
  }

  return (
    <ClientDashboard
      initialItineraries={itineraries || []}
      initialActivities={activities}
      userEmail={data.user.email || ""}
      userId={data.user.id}
    />
  );
}