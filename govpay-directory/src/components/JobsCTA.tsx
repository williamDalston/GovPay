import { ExternalLink } from "lucide-react";

/**
 * Affiliate CTA linking to USAJobs search filtered by agency or keyword.
 * Natural fit on agency detail and employee detail pages.
 * USAJobs search URL: https://www.usajobs.gov/Search/Results?k={keyword}&a={agency}
 */

interface JobsCTAProps {
  agencyName: string;
  keyword?: string;
}

export function JobsCTA({ agencyName, keyword }: JobsCTAProps) {
  const params = new URLSearchParams();
  if (keyword) params.set("k", keyword);
  params.set("a", agencyName);

  const url = `https://www.usajobs.gov/Search/Results?${params.toString()}`;

  return (
    <div className="rounded-xl border border-accent-blue/30 bg-accent-blue/5 p-5">
      <h3 className="font-heading text-sm font-bold text-navy-100">
        Work at {agencyName.length > 40 ? agencyName.slice(0, 40) + "..." : agencyName}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-400">
        Browse current job openings and apply directly on USAJobs, the official
        federal government job board.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-blue/80 active:scale-[0.98]"
      >
        Browse Open Positions
        <ExternalLink size={12} />
      </a>
      <p className="mt-2 text-[10px] text-navy-600">
        USAJobs.gov — Official U.S. Government job board
      </p>
    </div>
  );
}
