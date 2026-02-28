"use client";

import { useEffect, useRef } from "react";

/**
 * Ad placement component. Renders Google AdSense responsive ad units.
 * When NEXT_PUBLIC_ADSENSE_ID is not set, renders nothing — zero layout impact.
 *
 * Slot sizes:
 * - leaderboard: 728×90 (desktop), responsive on mobile
 * - rectangle: 300×250 (sidebar or in-content)
 * - skyscraper: 300×600 (sidebar sticky)
 */

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

type AdSlotVariant = "leaderboard" | "rectangle" | "skyscraper";

const slotStyles: Record<AdSlotVariant, { minWidth: string; minHeight: string; className: string }> = {
  leaderboard: { minWidth: "320px", minHeight: "90px", className: "mx-auto max-w-[728px]" },
  rectangle: { minWidth: "300px", minHeight: "250px", className: "mx-auto w-[300px]" },
  skyscraper: { minWidth: "300px", minHeight: "600px", className: "mx-auto w-[300px]" },
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSlot({ slot }: { slot: AdSlotVariant }) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script not loaded or blocked
    }
  }, []);

  if (!ADSENSE_ID) return null;

  const style = slotStyles[slot];

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${style.className}`}
      aria-hidden="true"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minWidth: style.minWidth, minHeight: style.minHeight }}
        data-ad-client={ADSENSE_ID}
        data-ad-format={slot === "leaderboard" ? "horizontal" : "auto"}
        data-full-width-responsive={slot === "leaderboard" ? "true" : "false"}
      />
    </div>
  );
}
