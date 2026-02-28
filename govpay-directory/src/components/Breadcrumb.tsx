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
      <nav aria-label="Breadcrumb" className="mb-6 overflow-hidden">
        <ol className="flex items-center gap-1 overflow-x-auto text-sm text-navy-400 scrollbar-none">
          {items.map((item, index) => (
            <li key={index} className="flex shrink-0 items-center gap-1">
              {index > 0 && (
                <span className="mx-1 text-navy-600">&rsaquo;</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="whitespace-nowrap transition-colors hover:text-accent-blue hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="max-w-[200px] truncate text-navy-200 sm:max-w-none">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
