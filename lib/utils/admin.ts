"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setUserAsAdmin(userId: string) {
  const supabase = createSupabaseServerClient();
  
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    });
    
    if (error) {
      console.error('Error setting admin role:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting admin role:', error);
    return { success: false, error: 'Failed to set admin role' };
  }
}
