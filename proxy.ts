import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// 1. Specify protected and public routes
const protectedRoutes = ["/", "/farmers", "/warehouse", "/monitoring", "/brigades", "/brigadier-dashboard"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path) || protectedRoutes.some(route => path.startsWith(route) && route !== "/");
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get("session")?.value;
    let session = null;
    if (cookie) {
        try {
            session = await decrypt(cookie);
        } catch (e) {
            // Token invalid
        }
    }

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 5. Redirect to / if the user is authenticated and trying to access login
    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // 6. Role based access (Simple for now)
    if (session && session.role === "FARMER" && (path.includes("/monitoring") || path.includes("/farmers") || path.includes("/warehouse"))) {
        // Farmers can only see their own dashboard (to be implemented)
        // For now, redirect to home
        // return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
