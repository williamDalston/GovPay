import { Metadata } from "next";
import GSPayScaleClient from "./GSPayScaleClient";

export const metadata: Metadata = {
  title: "GS Pay Scale 2026 — Federal General Schedule Pay Table",
  description:
    "Complete 2026 General Schedule (GS) pay table with all 15 grades, 10 steps, and 50+ locality adjustments. Compare federal employee salaries by grade and location.",
  alternates: { canonical: "https://www.govpay.directory/pay-scales/gs" },
};

export default function GSPayScalePage() {
  return <GSPayScaleClient />;
}
