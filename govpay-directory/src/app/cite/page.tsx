"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Copy, Check, FileText, Code, Link2, Quote } from "lucide-react";

export default function CitePage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const accessDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const citations = [
    {
      id: "apa",
      label: "APA",
      text: `GovPay.Directory. (${currentYear}). Public employee compensation data. Retrieved ${accessDate}, from https://www.govpay.directory`,
    },
    {
      id: "mla",
      label: "MLA",
      text: `"Public Employee Compensation Data." GovPay.Directory, ${currentYear}, www.govpay.directory. Accessed ${accessDate}.`,
    },
    {
      id: "chicago",
      label: "Chicago",
      text: `GovPay.Directory. "Public Employee Compensation Data." Accessed ${accessDate}. https://www.govpay.directory.`,
    },
    {
      id: "bibtex",
      label: "BibTeX",
      text: `@misc{govpay${currentYear},
  title = {Public Employee Compensation Data},
  author = {{GovPay.Directory}},
  year = {${currentYear}},
  url = {https://www.govpay.directory},
  note = {Accessed: ${accessDate}}
}`,
    },
  ];

  const embedCode = `<a href="https://www.govpay.directory" target="_blank" rel="noopener">
  Data from GovPay.Directory
</a>`;

  const badgeCode = `<a href="https://www.govpay.directory" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#0F1B2D;border:1px solid #1E3A5F;border-radius:8px;color:#E2E8F0;font-size:14px;text-decoration:none;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
  Data from GovPay.Directory
</a>`;

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cite This Data" },
        ]}
      />

      <div className="mt-6">
        <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
          Cite This Data
        </h1>
        <p className="mt-2 text-navy-400">
          Using GovPay.Directory data in your research, article, or project? Here&apos;s how to cite us properly.
        </p>
      </div>

      {/* Citation Formats */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Quote size={20} className="text-accent-blue" />
          <h2 className="font-heading text-lg font-bold text-navy-100">Citation Formats</h2>
        </div>
        <p className="mt-2 text-sm text-navy-400">
          Click any citation to copy it to your clipboard.
        </p>

        <div className="mt-4 space-y-4">
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-xl border border-navy-700 bg-navy-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-navy-800 px-2 py-1 text-xs font-medium text-navy-300">
                  {citation.label}
                </span>
                <button
                  onClick={() => copyToClipboard(citation.text, citation.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-navy-400 transition-colors hover:bg-navy-800 hover:text-accent-blue"
                >
                  {copiedId === citation.id ? (
                    <>
                      <Check size={14} className="text-accent-green" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-navy-300">
                {citation.text}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Link to Us */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Link2 size={20} className="text-accent-green" />
          <h2 className="font-heading text-lg font-bold text-navy-100">Link to Us</h2>
        </div>
        <p className="mt-2 text-sm text-navy-400">
          Add a link to GovPay.Directory in your article or website.
        </p>

        <div className="mt-4 rounded-xl border border-navy-700 bg-navy-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-navy-800 px-2 py-1 text-xs font-medium text-navy-300">
              HTML Link
            </span>
            <button
              onClick={() => copyToClipboard(embedCode, "embed")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-navy-400 transition-colors hover:bg-navy-800 hover:text-accent-blue"
            >
              {copiedId === "embed" ? (
                <>
                  <Check size={14} className="text-accent-green" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-navy-300">
            {embedCode}
          </pre>
        </div>
      </section>

      {/* Badge */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Code size={20} className="text-accent-blue" />
          <h2 className="font-heading text-lg font-bold text-navy-100">Embed Badge</h2>
        </div>
        <p className="mt-2 text-sm text-navy-400">
          Add a styled badge to your website that links back to us.
        </p>

        <div className="mt-4 rounded-xl border border-navy-700 bg-navy-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-navy-800 px-2 py-1 text-xs font-medium text-navy-300">
              Badge HTML
            </span>
            <button
              onClick={() => copyToClipboard(badgeCode, "badge")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-navy-400 transition-colors hover:bg-navy-800 hover:text-accent-blue"
            >
              {copiedId === "badge" ? (
                <>
                  <Check size={14} className="text-accent-green" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center rounded-lg bg-navy-950 p-6">
            <a
              href="https://www.govpay.directory"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-navy-200 transition-colors hover:border-accent-blue/50 hover:text-accent-blue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-blue">
                <path d="M12 2v20M2 12h20" />
              </svg>
              Data from GovPay.Directory
            </a>
          </div>

          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-navy-400">
            {badgeCode}
          </pre>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-accent-green" />
          <h2 className="font-heading text-lg font-bold text-navy-100">Our Data Sources</h2>
        </div>
        <p className="mt-2 text-sm text-navy-400">
          All data on GovPay.Directory comes from official government sources:
        </p>

        <ul className="mt-4 space-y-2 text-sm text-navy-300">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span><strong>Federal data:</strong> Office of Personnel Management (OPM) FedScope</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span><strong>California:</strong> State Controller&apos;s Office Public Pay</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span><strong>Texas:</strong> Texas Tribune Government Salaries Explorer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span><strong>New York:</strong> SeeThroughNY / data.ny.gov</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span><strong>Other states:</strong> Official state transparency portals</span>
          </li>
        </ul>

        <p className="mt-4 text-sm text-navy-400">
          For more details, see our{" "}
          <a href="/about#data-sources" className="text-accent-blue hover:underline">
            About page
          </a>.
        </p>
      </section>

      {/* Contact */}
      <section className="mt-12 rounded-xl border border-navy-700 bg-navy-900/50 p-6">
        <h2 className="font-heading text-lg font-bold text-navy-100">Questions?</h2>
        <p className="mt-2 text-sm text-navy-400">
          If you&apos;re a journalist, researcher, or need data for a specific project, feel free to reach out.
        </p>
        <a
          href="/contact"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
}
