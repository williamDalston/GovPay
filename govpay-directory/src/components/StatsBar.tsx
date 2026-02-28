import { formatNumber, formatCurrency } from "@/lib/format";
import { getGlobalStats } from "@/lib/db";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface Stat {
  label: string;
  value: string;
}

interface StatsBarProps {
  stats: Stat[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="overflow-hidden rounded-xl border border-navy-700 bg-navy-900 px-3 py-3 sm:px-4"
        >
          <p className="truncate font-[family-name:var(--font-data)] text-lg font-bold text-navy-100 sm:text-xl md:text-2xl">
            <AnimatedNumber value={stat.value} />
          </p>
          <p className="mt-0.5 truncate text-[11px] text-navy-400 sm:text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

const FALLBACK_STATS: Stat[] = [
  { label: "Employees Indexed", value: "—" },
  { label: "Government Agencies", value: "—" },
  { label: "Average Salary", value: "—" },
  { label: "Data Updated", value: "—" },
];

async function fetchStats(): Promise<Stat[]> {
  try {
    const stats = await getGlobalStats();
    return [
      { label: "Employees Indexed", value: formatNumber(stats.totalEmployees) },
      { label: "Government Agencies", value: formatNumber(stats.totalAgencies) },
      { label: "Average Salary", value: formatCurrency(stats.avgSalary) },
      { label: "Data Updated", value: stats.lastUpdated },
    ];
  } catch {
    return FALLBACK_STATS;
  }
}

export async function GlobalStatsBar() {
  const items = await fetchStats();
  return <StatsBar stats={items} />;
}
