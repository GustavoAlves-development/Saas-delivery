import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/pedidos", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
