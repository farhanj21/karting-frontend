import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Only the personal features are gated. Everything else — the public
 * leaderboards, track pages, and their APIs — stays open and unauthenticated.
 */
const isProtectedRoute = createRouteMatcher([
  '/my-sessions(.*)',
  '/api/sessions(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals...
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|map)).*)',
    // ...and always run on API routes.
    '/(api|trpc)(.*)',
    // Clerk auto-proxy path (handshake/session endpoints).
    '/__clerk/:path*',
  ],
};
