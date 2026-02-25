import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Breadcrumb", () => {
  it("renders all breadcrumb labels", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Agencies", href: "/agencies" },
          { label: "Department of Defense" },
        ]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Agencies")).toBeInTheDocument();
    expect(screen.getByText("Department of Defense")).toBeInTheDocument();
  });

  it("renders links for items with href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Current Page" },
        ]}
      />
    );
    const homeLink = screen.getByText("Home");
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("does not render link for the last item (no href)", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Current" },
        ]}
      />
    );
    const current = screen.getByText("Current");
    expect(current.closest("a")).toBeNull();
  });

  it("has proper aria-label", () => {
    render(
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Page" }]} />
    );
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("generates JSON-LD structured data", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "States", href: "/states" },
          { label: "California" },
        ]}
      />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[1].name).toBe("States");
  });
});
