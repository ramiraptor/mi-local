"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/constants";

export function TrackedLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event: AnalyticsEvent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track(event, { path: href })}>
      {children}
    </Link>
  );
}
