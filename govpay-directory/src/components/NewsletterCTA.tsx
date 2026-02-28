"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

/**
 * Email capture component for building first-party audience.
 * Stores signup intent locally until a backend/service is connected.
 * Can be wired to Mailchimp, ConvertKit, or a Supabase table later.
 */

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;

    // TODO: Wire to email service (Mailchimp, ConvertKit, or Supabase table)
    // For now, store in localStorage so signups aren't lost
    const signups = JSON.parse(
      localStorage.getItem("govpay_signups") || "[]"
    ) as string[];
    if (!signups.includes(email)) {
      signups.push(email);
      localStorage.setItem("govpay_signups", JSON.stringify(signups));
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-accent-green/30 bg-accent-green/5 p-6 text-center">
        <CheckCircle size={24} className="mx-auto text-accent-green" />
        <p className="mt-2 font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
          You&apos;re on the list!
        </p>
        <p className="mt-1 text-xs text-navy-400">
          We&apos;ll send you federal salary updates and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-accent-blue" />
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
          Federal Pay Updates
        </h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-navy-400">
        Get notified when new pay scales are released, locality adjustments
        change, or we publish new salary insights.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 min-[360px]:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="min-w-0 flex-1 rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-blue/80 active:scale-[0.98]"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-2 text-[10px] text-navy-600">
        Free, no spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
