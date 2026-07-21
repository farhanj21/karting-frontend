import { auth } from '@clerk/nextjs/server';

/**
 * The single choke-point for per-user authorization.
 *
 * MongoDB has no row-level security like Postgres, so ownership is enforced
 * here in the app layer instead: every session query MUST be scoped by the
 * userId this returns. Returns the Clerk user id, or null if unauthenticated.
 *
 * Middleware already gates /api/sessions/**, but routes still call this so
 * authorization never depends on middleware config alone (defense in depth).
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
