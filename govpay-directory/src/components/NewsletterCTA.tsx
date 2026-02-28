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
    let signups: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("govpay_signups") || "[]");
      signups = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
    } catch {
      signups = [];
    }
    if (!signups.includes(email)) {
      signups.push(email);
      localStorage.setItem("govpay_signups", JSON.stringify(signups));
    }

    setEmail("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-success-fade rounded-xl border border-accent-green/30 bg-accent-green/5 p-6 text-center">
        <div className="relative mx-auto w-fit">
          <CheckCircle size={24} className="animate-scale-bounce text-accent-green" />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-green" style={{ "--dx": "-12px", "--dy": "-16px", animation: "confetti-dot 0.6s 0.2s ease-out both" } as React.CSSProperties} />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-blue" style={{ "--dx": "14px", "--dy": "-10px", animation: "confetti-dot 0.6s 0.25s ease-out both" } as React.CSSProperties} />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-amber" style={{ "--dx": "-8px", "--dy": "14px", animation: "confetti-dot 0.6s 0.3s ease-out both" } as React.CSSProperties} />
        </div>
        <p className="mt-2 font-heading text-sm font-bold text-navy-100">
          Thanks for your interest!
        </p>
        <p className="mt-1 text-xs text-navy-400">
          We&apos;re setting up our newsletter. We&apos;ll notify you when
          it&apos;s ready.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-accent-blue" />
        <h3 className="font-heading text-sm font-bold text-navy-100">
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
        Coming soon — sign up to be notified at launch.
      </p>
    </div>
  );
}
