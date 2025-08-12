"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { success: false; message: string } | { success: true; redirect?: string } | null;

export async function loginAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function signupAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  } catch (error) {
    return { success: false, message: "Failed to sign out" };
  }
}
