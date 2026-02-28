"use client";

import { useState } from "react";
import {
  GS_BASE_PAY_2026,
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
  const basePay = GS_BASE_PAY_2026[config.grade]?.[config.step - 1] ?? 0;
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
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
      <h3 className="font-heading text-sm font-bold text-navy-100">
        {label}
      </h3>
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`${id}-grade`} className="block text-xs text-navy-500">Grade</label>
          <select
            id={`${id}-grade`}
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
          <label htmlFor={`${id}-step`} className="block text-xs text-navy-500">Step</label>
          <select
            id={`${id}-step`}
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
          <label htmlFor={`${id}-locality`} className="block text-xs text-navy-500">Locality</label>
          <select
            id={`${id}-locality`}
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
        <p className="mt-1 font-data text-2xl font-bold text-accent-green sm:text-3xl">
          {formatCurrency(calculateSalary(config))}
        </p>
        <p className="mt-1 text-xs text-navy-500">
          Base: {formatCurrency(GS_BASE_PAY_2026[config.grade][config.step - 1])}
        </p>
      </div>
    </div>
  );
}

export default function CompareClient() {
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
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="lg:order-1">
        <SalarySelector label="Position A" config={configA} onChange={setConfigA} />
      </div>
      <div className="lg:order-3">
        <SalarySelector label="Position B" config={configB} onChange={setConfigB} />
      </div>

      <div className="flex flex-col items-center justify-center sm:col-span-2 lg:order-2 lg:col-span-1">
        <div className="w-full rounded-xl border border-navy-700 bg-navy-900 p-6 text-center">
          <ArrowLeftRight size={24} className="mx-auto text-accent-blue" />
          <p className="mt-3 text-xs text-navy-500">Difference</p>
          <p
            className={`mt-1 font-data text-xl font-bold sm:text-2xl ${diff > 0 ? "text-accent-green" : diff < 0 ? "text-accent-red" : "text-navy-400"}`}
          >
            {diff > 0 ? "+" : ""}
            {formatCurrency(diff)}
          </p>
          <p
            className={`mt-1 font-data text-sm ${diff > 0 ? "text-accent-green" : diff < 0 ? "text-accent-red" : "text-navy-400"}`}
          >
            {diff > 0 ? "+" : ""}
            {diffPct}%
          </p>

          {/* Visual comparison bar */}
          <div className="mx-auto mt-4 max-w-sm space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs text-navy-500">
                <span>Position A</span>
                <span className="font-data">
                  {formatCurrency(salaryA)}
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-navy-800">
                <div
                  className="h-3 rounded-full bg-accent-blue transition-all duration-300"
                  style={{
                    width: `${(salaryA / Math.max(salaryA, salaryB)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-navy-500">
                <span>Position B</span>
                <span className="font-data">
                  {formatCurrency(salaryB)}
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-navy-800">
                <div
                  className="h-3 rounded-full bg-accent-green transition-all duration-300"
                  style={{
                    width: `${(salaryB / Math.max(salaryA, salaryB)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
