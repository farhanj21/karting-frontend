"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Signature, firstSignature, secondSignature } from "@/components/ui/Signature";

export function SignatureInView() {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <a
      ref={ref}
      href="https://github.com/farhanj21/karting-frontend"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-zinc-500 transition-colors duration-150 hover:text-accent-soft"
    >
      <span className="text-xs">Made By</span>
      <Signature isInView={inView} data={firstSignature} />
      <Signature isInView={inView} data={secondSignature} />
    </a>
  );
}
