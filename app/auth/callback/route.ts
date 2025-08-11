import { NextResponse } from "next/server";

export async function GET() {
  // Supabase handles cookies via middleware; simply redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
