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
          className="rounded-xl border border-navy-700 bg-navy-900 px-4 py-3"
        >
          <p className="font-[family-name:var(--font-data)] text-xl font-bold text-navy-100 md:text-2xl">
            <AnimatedNumber value={stat.value} />
          </p>
          <p className="mt-0.5 text-xs text-navy-400">{stat.label}</p>
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
