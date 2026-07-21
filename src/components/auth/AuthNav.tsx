'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ClipboardList } from 'lucide-react';

/**
 * Header account control. Additive — shows a "My Sessions" link + account
 * button to signed-in users, and a "Sign in" link to everyone else. Safe to
 * drop into any page header; unauthenticated visitors just see "Sign in".
 */
export default function AuthNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="hidden rounded-lg bg-accent-strong px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent sm:inline-block"
        >
          Sign up
        </Link>
      </SignedOut>

      <SignedIn>
        {pathname !== '/my-sessions' && (
          <Link
            href="/my-sessions"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">My Sessions</span>
          </Link>
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: 'h-7 w-7' } }}
        />
      </SignedIn>
    </div>
  );
}
