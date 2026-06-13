import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/matching",
    "/applications",
    "/tasks",
    "/company/setup",
    "/company",
    "/jobs",
    "/students",
    "/schools",
    "/members",
  ];

  const isProtectedPath = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // UI demo phase: bypass auth enforcement entirely to avoid env-related middleware failures on Vercel.
  // Auth will be restored when Supabase envs are configured.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPath) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
