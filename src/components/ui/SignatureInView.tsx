"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Signature } from "@/components/ui/Signature";

export function SignatureInView() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <span ref={ref} className="inline-flex items-center">
      <Signature isInView={inView} />
    </span>
  );
}
