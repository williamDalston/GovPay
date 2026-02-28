"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { formatCurrency } from "@/lib/format";
import { COST_INDICES } from "@/lib/reference-data";
import { AdSlot } from "@/components/AdSlot";
import { ArrowRight } from "lucide-react";


export default function CostOfLivingPage() {
  const [salary, setSalary] = useState(85000);
  const [fromCity, setFromCity] = useState("Washington, DC");
  const [toCity, setToCity] = useState("Houston, TX");

  const fromIndex = COST_INDICES.find((c) => c.city === fromCity)?.index ?? 100;
  const toIndex = COST_INDICES.find((c) => c.city === toCity)?.index ?? 100;
  const adjustedSalary = Math.round((salary / fromIndex) * toIndex);
  const diff = adjustedSalary - salary;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools" },
          { label: "Cost of Living Adjuster" },
        ]}
      />

      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
        Cost of Living Salary Adjuster
      </h1>
      <p className="mt-2 text-navy-400">
        See what your salary is worth in a different city based on cost of
        living indices.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
            Configure
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-navy-400">
                Current Salary
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setSalary(Math.min(500000, Math.max(0, v)));
                }}
                min={0}
                max={500000}
                step={1000}
                className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-2.5 font-[family-name:var(--font-data)] text-lg text-navy-100 focus:border-accent-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-400">From City</label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-2.5 text-sm text-navy-100 focus:border-accent-blue focus:outline-none"
              >
                {COST_INDICES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} (Index: {c.index})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-400">To City</label>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-2.5 text-sm text-navy-100 focus:border-accent-blue focus:outline-none"
              >
                {COST_INDICES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} (Index: {c.index})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
            Results
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className="w-full flex-1 rounded-lg bg-navy-800 p-4 text-center">
                <p className="text-xs text-navy-500">{fromCity}</p>
                <p className="mt-1 font-[family-name:var(--font-data)] text-lg font-bold text-navy-100 sm:text-xl">
                  {formatCurrency(salary)}
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  COL Index: {fromIndex}
                </p>
              </div>
              <ArrowRight size={20} className="shrink-0 rotate-90 text-accent-blue sm:rotate-0" />
              <div className="w-full flex-1 rounded-lg bg-navy-800 p-4 text-center">
                <p className="text-xs text-navy-500">{toCity}</p>
                <p className="mt-1 font-[family-name:var(--font-data)] text-lg font-bold text-accent-green sm:text-xl">
                  {formatCurrency(adjustedSalary)}
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  COL Index: {toIndex}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-navy-800 p-4 text-center">
              <p className="text-xs text-navy-500">
                Equivalent Salary Difference
              </p>
              <p
                className={`mt-1 font-[family-name:var(--font-data)] text-2xl font-bold ${diff > 0 ? "text-accent-red" : "text-accent-green"}`}
              >
                {diff > 0 ? "+" : ""}
                {formatCurrency(diff)}
              </p>
              <p className="mt-1 text-xs text-navy-400">
                {diff > 0
                  ? `You would need ${formatCurrency(adjustedSalary)} in ${toCity} to maintain the same purchasing power`
                  : `Your salary goes ${((1 - toIndex / fromIndex) * 100).toFixed(1)}% further in ${toCity}`}
              </p>
            </div>

            {/* All cities comparison */}
            <div className="mt-4">
              <h3 className="text-xs font-medium text-navy-500">
                Your salary equivalent across cities
              </h3>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto" role="region" aria-label="Salary equivalents by city" aria-live="polite">
                {[...COST_INDICES].sort((a, b) => b.index - a.index).map((c) => {
                  const equiv = Math.round((salary / fromIndex) * c.index);
                  return (
                    <div
                      key={c.city}
                      className={`flex items-center justify-between rounded px-2 py-1 text-xs ${c.city === toCity ? "bg-accent-blue/10 text-accent-blue" : "text-navy-400"}`}
                    >
                      <span>{c.city}</span>
                      <span className="font-[family-name:var(--font-data)]">
                        {formatCurrency(equiv)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8"><AdSlot slot="leaderboard" /></div>

      {/* Related Guides */}
      <div className="mt-8">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { title: "Locality Pay Explained", href: "/insights/federal-locality-pay-explained", desc: "How your work location affects your federal salary." },
            { title: "Federal vs. Private Sector Pay", href: "/insights/federal-vs-private-sector-pay", desc: "Compare total compensation across sectors." },
          ].map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
            >
              <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100 group-hover:text-accent-blue">
                {guide.title}
              </p>
              <p className="mt-1 text-xs text-navy-400">{guide.desc}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent-blue">
                Read guide <ArrowRight size={10} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
