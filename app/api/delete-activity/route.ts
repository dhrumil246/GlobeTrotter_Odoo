import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { activity_id } = body;

  if (!activity_id) {
    return NextResponse.json({ error: "Missing activity_id" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  // Ensure user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Delete the activity
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activity_id);

    if (error) {
      console.error('Error deleting activity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}