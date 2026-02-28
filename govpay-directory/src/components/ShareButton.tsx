"use client";

import { useState } from "react";
import { Share2, Twitter, Linkedin, Link2, Check } from "lucide-react";

/**
 * Social share buttons for employee salary pages and articles.
 * Each share drives free traffic back to the site → more pageviews → more ad revenue.
 * Uses native Web Share API on mobile, falls back to direct links on desktop.
 */

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://www.govpay.directory${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
      } catch {
        // User cancelled — that's fine
      }
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-navy-500">Share:</span>

      {/* Native share on mobile */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-800 hover:text-accent-blue"
          aria-label="Share"
        >
          <Share2 size={14} />
        </button>
      )}

      {/* Twitter/X */}
      <a
        href={`https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-800 hover:text-accent-blue"
        aria-label="Share on X"
      >
        <Twitter size={14} />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-800 hover:text-accent-blue"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={14} />
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-800 hover:text-accent-blue"
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check size={14} className="animate-scale-bounce text-accent-green" />
        ) : (
          <Link2 size={14} />
        )}
      </button>
    </div>
  );
}
