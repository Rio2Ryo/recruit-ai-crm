import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "recruit-ai-session-email";

export async function middleware(request: NextRequest) {
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
    "/resumes",
    "/schedules",
    "/pipeline",
    "/settings/line",
  ];

  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const sessionEmail = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname === "/login" && sessionEmail) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPath && !sessionEmail) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
