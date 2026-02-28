"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Mail, MessageSquare, Send, Check, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");

    // For now, open mailto with form data
    // Can be replaced with a proper form backend (Formspree, etc.)
    const mailtoLink = `mailto:info@alstonanalytics.com?subject=${encodeURIComponent(
      `[GovPay] ${formData.subject}: ${formData.name}`
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;

    window.location.href = mailtoLink;
    setFormState("success");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <div className="mt-6">
        <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
          Contact Us
        </h1>
        <p className="mt-2 text-navy-400">
          Have a question, feedback, or data inquiry? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-navy-100 placeholder-navy-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-navy-100 placeholder-navy-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-navy-300">
                Subject
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-navy-100 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                <option value="general">General Inquiry</option>
                <option value="data">Data Question</option>
                <option value="correction">Data Correction Request</option>
                <option value="removal">Removal Request</option>
                <option value="partnership">Partnership / Media</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-navy-300">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-navy-100 placeholder-navy-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-medium text-white transition-all hover:bg-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50"
            >
              {formState === "submitting" ? (
                <>Sending...</>
              ) : formState === "success" ? (
                <>
                  <Check size={18} />
                  Email Client Opened
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>

            {formState === "success" && (
              <p className="flex items-center gap-2 text-sm text-accent-green">
                <Check size={16} />
                Your email client should have opened. If not, email us directly at info@alstonanalytics.com
              </p>
            )}

            {formState === "error" && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle size={16} />
                Something went wrong. Please email us directly at info@alstonanalytics.com
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/20">
                <Mail size={20} className="text-accent-blue" />
              </div>
              <div>
                <h3 className="font-medium text-navy-100">Email</h3>
                <a
                  href="mailto:info@alstonanalytics.com"
                  className="text-sm text-accent-blue hover:underline"
                >
                  info@alstonanalytics.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/20">
                <MessageSquare size={20} className="text-accent-green" />
              </div>
              <div>
                <h3 className="font-medium text-navy-100">Response Time</h3>
                <p className="text-sm text-navy-400">Usually within 1-2 business days</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-6">
            <h3 className="font-medium text-navy-100">Common Questions</h3>
            <ul className="mt-3 space-y-2 text-sm text-navy-400">
              <li>
                <strong className="text-navy-300">Data accuracy:</strong> All data comes from official government sources.
              </li>
              <li>
                <strong className="text-navy-300">Removal requests:</strong> This data is publicly available under FOIA.
              </li>
              <li>
                <strong className="text-navy-300">API access:</strong> Contact us for data licensing inquiries.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
