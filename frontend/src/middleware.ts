// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "admin" | "employee";

type Rule = {
  pattern: RegExp; // paths to guard
  allow: Role[]; // allowed roles
  loginFallback?: boolean; // if true and no token => redirect to /login
};

// ضيف/عدّل القواعد زي ما تحب
const rules: Rule[] = [
  { pattern: /^\/admin(\/.*)?$/, allow: ["admin"], loginFallback: true },
  {
    pattern: /^\/checkpoint(\/.*)?$/,
    allow: [ "employee"],
    loginFallback: true,
  },
  // مثال لو عايز تحمي الجيت:
  // { pattern: /^\/gate(\/.*)?$/, allow: ["employee", "admin"], loginFallback: false },
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("ps_token")?.value;
  const role = req.cookies.get("ps_role")?.value as Role | undefined;
  const { pathname, search } = req.nextUrl;

  if (pathname === "/login" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/checkpoint";
    return NextResponse.redirect(url);
  }

  const matched = rules.find((r) => r.pattern.test(pathname));
  if (!matched) return NextResponse.next();

// if no token
  if (!token) {
    if (matched.loginFallback) {
      const url = req.nextUrl.clone();
      const next = pathname + (search || "");
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(next)}`;
      return NextResponse.redirect(url);
    }
    // if no loginFallback, just 403
    const url = req.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  // if has token but no role (invalid state) => 403
  if (!role || !matched.allow.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Specify the paths that will be protected by this middleware
export const config = {
  matcher: [
    "/login",
    "/checkpoint",
    "/admin/:path*",
  ],
};
