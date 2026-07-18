import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProctedRoute = createRouteMatcher([
    "/my-events(.*)",
    "/create-event(.*)",
    "/my-tickets(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth();

    if (!userId && isProctedRoute(req)) {
        return redirectToSignIn();
    }
    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\..(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docz?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
        "/__clerk/(.*)",
    ],
};