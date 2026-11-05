"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/constants";

export function PageViewTracker({
  event,
  propertyId,
  props,
}: {
  event: AnalyticsEvent;
  propertyId?: string;
  props?: Record<string, string>;
}) {
  useEffect(() => {
    track(event, props ?? {}, propertyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
