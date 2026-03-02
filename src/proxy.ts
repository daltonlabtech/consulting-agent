import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next({ request: req });
  }

  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith("/admin/sponsors")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (!session.user.email?.endsWith("@daltonlab.ai")) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/admin?error=unauthorized", req.url)
      );
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/sponsors/:path*"],
};
