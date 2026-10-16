import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedUser, isFixtureMode, supabaseConfig } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  if (isFixtureMode()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const { url, key } = supabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            domain: undefined,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          }),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/update-password" ||
    path.startsWith("/auth/") ||
    path === "/access-pending";

  if (!user && !isPublic && !path.startsWith("/api/")) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  if (user && !isAllowedUser(user.id) && path !== "/access-pending" && !path.startsWith("/api/")) {
    const pending = request.nextUrl.clone();
    pending.pathname = "/access-pending";
    pending.search = "";
    return NextResponse.redirect(pending);
  }

  if (user && isAllowedUser(user.id) && (path === "/login" || path === "/access-pending")) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}
