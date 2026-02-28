import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { AdSlot } from "@/components/AdSlot";
import { ShareButton } from "@/components/ShareButton";
import {
  getArticleBySlug,
  getAllArticleSlugs,
  ARTICLES,
} from "@/lib/articles";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://govpay.directory/insights/${slug}` },
    openGraph: {
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
    },
  };
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const otherArticles = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "GovPay.Directory",
      url: "https://govpay.directory",
    },
    publisher: {
      "@type": "Organization",
      name: "GovPay.Directory",
      url: "https://govpay.directory",
    },
    mainEntityOfPage: `https://govpay.directory/insights/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Insights", href: "/insights" },
            { label: article.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Article Content */}
          <article className="lg:col-span-2">
            <header>
              <span className="inline-block rounded-full bg-accent-blue/20 px-3 py-1 text-xs font-bold text-accent-blue">
                {article.category}
              </span>
              <h1 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-navy-100 sm:text-3xl">
                {article.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-navy-400">
                {article.description}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500">
                  <span>
                    By{" "}
                    <span className="font-medium text-navy-400">
                      GovPay.Directory Research
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {article.readingTime}
                  </span>
                </div>
                <ShareButton
                  title={article.title}
                  text={article.description}
                  url={`/insights/${slug}`}
                />
              </div>
            </header>

            <div className="mt-8 space-y-8">
              {article.sections.map((section, index) => (
                <section key={section.heading}>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-navy-300 sm:text-base">
                    {section.content.split("\n\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  {/* Ad slot after the second section */}
                  {index === 1 && <AdSlot slot="leaderboard" />}
                </section>
              ))}
            </div>

            {/* Related Data Links */}
            <div className="mt-10 rounded-xl border border-navy-700 bg-navy-900 p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
                Explore Related Data
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {article.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-300 transition-all hover:border-accent-blue/50 hover:text-accent-blue"
                  >
                    <ArrowRight size={14} className="text-accent-blue" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <NewsletterCTA />

            <AdSlot slot="rectangle" />

            {/* More Articles */}
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                More Insights
              </h3>
              <div className="mt-3 space-y-3">
                {otherArticles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/insights/${a.slug}`}
                    className="group block"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-600">
                      {a.category}
                    </span>
                    <p className="text-sm font-medium text-navy-300 group-hover:text-accent-blue">
                      {a.title}
                    </p>
                    <span className="text-[10px] text-navy-500">
                      {a.readingTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tools CTA */}
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                Salary Tools
              </h3>
              <div className="mt-3 space-y-2">
                <Link
                  href="/pay-scales/gs"
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <BookOpen size={14} />
                  GS Pay Scale Table
                </Link>
                <Link
                  href="/tools/compare"
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <BookOpen size={14} />
                  Salary Comparison Tool
                </Link>
                <Link
                  href="/tools/cost-of-living"
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <BookOpen size={14} />
                  Cost of Living Calculator
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* More Articles Grid */}
        <div className="mt-12 border-t border-navy-700 pt-8">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Continue Reading
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/insights/${a.slug}`}
                className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                  {a.category}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100 group-hover:text-accent-blue">
                  {a.title}
                </h3>
                <p className="mt-1 text-xs text-navy-400 line-clamp-2">
                  {a.description}
                </p>
                <span className="mt-2 inline-block text-[10px] text-navy-500">
                  {a.readingTime}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
