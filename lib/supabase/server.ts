import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // @ts-expect-error: cookies() typing differs in edge vs node, normalize at runtime
          return cookieStore.get?.(name)?.value;
        },
        set(name, value, options) {
          // @ts-expect-error see above
          cookieStore.set?.(name, value, options);
        },
        remove(name, options) {
          // @ts-expect-error see above
          cookieStore.set?.(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
};
