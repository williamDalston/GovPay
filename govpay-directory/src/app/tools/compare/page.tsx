"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  GS_BASE_PAY_2025,
  GS_GRADES,
  GS_STEPS,
  LOCALITY_AREAS,
} from "@/lib/reference-data";
import { formatCurrency } from "@/lib/format";
import { ArrowLeftRight } from "lucide-react";

interface SalaryConfig {
  grade: number;
  step: number;
  locality: string;
}

function calculateSalary(config: SalaryConfig): number {
  const basePay = GS_BASE_PAY_2025[config.grade]?.[config.step - 1] ?? 0;
  const area = LOCALITY_AREAS.find((a) => a.slug === config.locality);
  return Math.round(basePay * (area?.adjustment ?? 1));
}

function SalarySelector({
  label,
  config,
  onChange,
}: {
  label: string;
  config: SalaryConfig;
  onChange: (config: SalaryConfig) => void;
}) {
  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
      <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
        {label}
      </h3>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs text-navy-500">Grade</label>
          <select
            value={config.grade}
            onChange={(e) =>
              onChange({ ...config, grade: parseInt(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-navy-100 focus:border-accent-blue focus:outline-none"
          >
            {GS_GRADES.map((g) => (
              <option key={g} value={g}>
                GS-{g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-navy-500">Step</label>
          <select
            value={config.step}
            onChange={(e) =>
              onChange({ ...config, step: parseInt(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-navy-100 focus:border-accent-blue focus:outline-none"
          >
            {GS_STEPS.map((s) => (
              <option key={s} value={s}>
                Step {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-navy-500">Locality</label>
          <select
            value={config.locality}
            onChange={(e) => onChange({ ...config, locality: e.target.value })}
            className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-navy-100 focus:border-accent-blue focus:outline-none"
          >
            {LOCALITY_AREAS.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.area.length > 35
                  ? area.area.substring(0, 35) + "..."
                  : area.area}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-navy-800 p-4 text-center">
        <p className="text-xs text-navy-500">Adjusted Salary</p>
        <p className="mt-1 font-[family-name:var(--font-data)] text-3xl font-bold text-accent-green">
          {formatCurrency(calculateSalary(config))}
        </p>
        <p className="mt-1 text-xs text-navy-500">
          Base: {formatCurrency(GS_BASE_PAY_2025[config.grade][config.step - 1])}
        </p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [configA, setConfigA] = useState<SalaryConfig>({
    grade: 12,
    step: 5,
    locality: "washington-dc",
  });
  const [configB, setConfigB] = useState<SalaryConfig>({
    grade: 13,
    step: 1,
    locality: "rest-of-us",
  });

  const salaryA = calculateSalary(configA);
  const salaryB = calculateSalary(configB);
  const diff = salaryB - salaryA;
  const diffPct = ((diff / salaryA) * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools" },
          { label: "Salary Comparison" },
        ]}
      />

      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
        Salary Comparison Tool
      </h1>
      <p className="mt-2 text-navy-400">
        Compare GS pay grades side by side with locality adjustments.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <SalarySelector label="Position A" config={configA} onChange={setConfigA} />

        <div className="flex flex-col items-center justify-center">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center">
            <ArrowLeftRight size={24} className="mx-auto text-accent-blue" />
            <p className="mt-3 text-xs text-navy-500">Difference</p>
            <p
              className={`mt-1 font-[family-name:var(--font-data)] text-2xl font-bold ${diff > 0 ? "text-accent-green" : diff < 0 ? "text-accent-red" : "text-navy-400"}`}
            >
              {diff > 0 ? "+" : ""}
              {formatCurrency(diff)}
            </p>
            <p
              className={`mt-1 font-[family-name:var(--font-data)] text-sm ${diff > 0 ? "text-accent-green" : diff < 0 ? "text-accent-red" : "text-navy-400"}`}
            >
              {diff > 0 ? "+" : ""}
              {diffPct}%
            </p>

            {/* Visual comparison bar */}
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <span>Position A</span>
                  <span className="font-[family-name:var(--font-data)]">
                    {formatCurrency(salaryA)}
                  </span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-navy-800">
                  <div
                    className="h-3 rounded-full bg-accent-blue"
                    style={{
                      width: `${(salaryA / Math.max(salaryA, salaryB)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <span>Position B</span>
                  <span className="font-[family-name:var(--font-data)]">
                    {formatCurrency(salaryB)}
                  </span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-navy-800">
                  <div
                    className="h-3 rounded-full bg-accent-green"
                    style={{
                      width: `${(salaryB / Math.max(salaryA, salaryB)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SalarySelector label="Position B" config={configB} onChange={setConfigB} />
      </div>

      {/* Info */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
          About This Tool
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-300">
          This tool compares two GS positions by combining the base pay for a
          given grade and step with the locality pay adjustment for the selected
          area. Locality pay can significantly impact total compensation — for
          example, a GS-12 in San Francisco earns about 45% more than the same
          grade in a non-locality area. Use this tool to understand how
          promotions, step increases, or geographic moves affect your pay.
        </p>
      </div>
    </div>
  );
}
