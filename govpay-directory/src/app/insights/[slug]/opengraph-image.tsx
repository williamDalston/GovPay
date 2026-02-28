import { ImageResponse } from "next/og";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/articles";

export const alt = "GovPay.Directory Article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  const title = article?.title ?? "Article";
  const category = article?.category ?? "Insights";
  const readingTime = article?.readingTime ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0F1B2D 0%, #1E293B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
            }}
          >
            GP
          </div>
          <div style={{ fontSize: "20px", color: "#64748B" }}>
            GovPay.Directory
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3B82F6",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          {readingTime && (
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              {readingTime}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#E2E8F0",
            lineHeight: 1.2,
            maxWidth: "900px",
            flex: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "24px",
              background: "#3B82F6",
              borderRadius: "4px",
            }}
          />
          <div style={{ fontSize: "18px", color: "#94A3B8" }}>
            Federal Salary Insights & Analysis
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
