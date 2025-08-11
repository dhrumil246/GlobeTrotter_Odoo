import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const supabase = createSupabaseServerClient();

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.email);
    console.log('Current metadata:', user.user_metadata);

    // Update user metadata to set admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        ...user.user_metadata, 
        role: 'admin' 
      }
    });

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${email} is now an admin`,
      userId: user.id 
    });
  } catch (error) {
    console.error('Error in set-admin-role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
