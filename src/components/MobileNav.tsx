'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface MobileNavProps {
  currentPath?: string;
}

export default function MobileNav({ currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tracks = [
    { name: 'Sportzilla', href: '/tracks/sportzilla-formula-karting' },
    { name: 'Apex Autodrome', href: '/tracks/apex-autodrome' },
    { name: '2F2F Lahore', href: '/tracks/2f2f-formula-karting' },
    { name: '2F2F Islamabad', href: '/tracks/2f2f-formula-karting-islamabad' },
    { name: 'Omni Circuit', href: '/tracks/omni-karting-circuit' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 transition-colors duration-150 hover:text-zinc-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-4/5 max-w-sm transform border-l bg-surface transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-sm font-semibold tracking-tight">Select Track</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-surfaceHover/60 hover:text-zinc-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 p-3">
          {tracks.map((track) => (
            <Link
              key={track.href}
              href={track.href}
              onClick={handleLinkClick}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                currentPath === track.href
                  ? 'bg-accent/10 text-accent-soft'
                  : 'text-zinc-400 hover:bg-surfaceHover/60 hover:text-zinc-100'
              }`}
            >
              {track.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
