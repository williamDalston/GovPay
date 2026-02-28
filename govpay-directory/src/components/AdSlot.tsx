"use client";

/**
 * Ad placement component. Renders a container sized for standard IAB ad units.
 * When NEXT_PUBLIC_ADSENSE_ID is not set, renders nothing — zero layout impact.
 * When configured, renders the appropriately sized container for Google AdSense.
 *
 * Slot sizes:
 * - leaderboard: 728×90 (desktop), responsive on mobile
 * - rectangle: 300×250 (sidebar or in-content)
 * - skyscraper: 300×600 (sidebar sticky)
 */

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

type AdSlotVariant = "leaderboard" | "rectangle" | "skyscraper";

const slotStyles: Record<AdSlotVariant, string> = {
  leaderboard: "mx-auto h-[90px] max-w-[728px]",
  rectangle: "mx-auto h-[250px] w-[300px]",
  skyscraper: "mx-auto h-[600px] w-[300px]",
};

export function AdSlot({ slot }: { slot: AdSlotVariant }) {
  if (!ADSENSE_ID) return null;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg border border-navy-800 bg-navy-900/50 ${slotStyles[slot]}`}
      aria-hidden="true"
      data-ad-slot={slot}
    >
      {/* AdSense script injects here via data-ad-slot attribute */}
      <span className="text-[10px] text-navy-700">Ad</span>
    </div>
  );
}
