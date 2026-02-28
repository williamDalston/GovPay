"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SalaryChartProps {
  data: { range: string; count: number }[];
  highlightIndex?: number;
}

export function SalaryChart({ data, highlightIndex }: SalaryChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div
        className="h-48 w-full sm:h-64"
        role="img"
        aria-label={`Salary distribution chart showing ${data.length} salary ranges for ${total.toLocaleString()} total employees`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="range"
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#F1F5F9",
                fontFamily: "var(--font-data)",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#94A3B8" }}
              formatter={(value: number | undefined) => [
                (value ?? 0).toLocaleString() + " employees",
                "Count",
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={index === highlightIndex ? "#3B82F6" : "#334155"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>Salary distribution</caption>
        <thead>
          <tr>
            <th scope="col">Salary Range</th>
            <th scope="col">Employee Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.range}>
              <td>{d.range}</td>
              <td>{d.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
