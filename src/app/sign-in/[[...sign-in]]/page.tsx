import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = {
  title: 'Sign in · Karting Analysis',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-sm text-zinc-500 transition-colors duration-150 hover:text-zinc-300"
      >
        ← Back to leaderboards
      </Link>
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/my-sessions"
      />
    </div>
  );
}
