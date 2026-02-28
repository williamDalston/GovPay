"use client";

import dynamic from "next/dynamic";

const SalaryChart = dynamic(
  () => import("@/components/SalaryChart").then((m) => m.SalaryChart),
  {
    loading: () => (
      <div className="h-48 w-full animate-shimmer rounded-lg bg-navy-800 sm:h-64" />
    ),
    ssr: false,
  }
);

interface SalaryChartWrapperProps {
  data: { range: string; count: number }[];
  highlightIndex?: number;
}

export function SalaryChartWrapper({ data, highlightIndex }: SalaryChartWrapperProps) {
  return <SalaryChart data={data} highlightIndex={highlightIndex} />;
}
