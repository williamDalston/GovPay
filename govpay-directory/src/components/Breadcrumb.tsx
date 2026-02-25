import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://govpay.directory${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-400">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="mx-1 text-navy-600">&rsaquo;</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-accent-blue hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-navy-200">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
