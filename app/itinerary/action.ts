"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createItinerary(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");

  const supabase = createSupabaseServerClient();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "User not authenticated" };
  }

  // Insert itinerary with user_id
  const { error } = await supabase.from("itinerary").insert([
    { title, description, start_date: startDate, end_date: endDate, user_id: user.id }
  ]);

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true };
}