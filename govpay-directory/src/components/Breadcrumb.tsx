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
      ...(item.href ? { item: `https://www.govpay.directory${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="-mx-1 flex items-center gap-1 overflow-x-auto py-1 text-sm text-navy-400 scrollbar-none">
          {items.map((item, index) => (
            <li key={item.href ?? item.label} className="flex shrink-0 items-center gap-1 last:shrink last:min-w-0">
              {index > 0 && (
                <span className="mx-1 text-navy-600" aria-hidden="true">&rsaquo;</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="whitespace-nowrap px-1 py-1.5 transition-colors hover:text-accent-blue hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate px-1 py-1.5 text-navy-200">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
