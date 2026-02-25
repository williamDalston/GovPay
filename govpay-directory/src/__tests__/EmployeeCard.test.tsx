import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Employee } from "@/lib/types";

// Mock next/link
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

const mockEmployee: Employee = {
  id: "1",
  name: "Jane Doe",
  firstName: "Jane",
  lastName: "Doe",
  jobTitle: "Software Engineer",
  agency: "Department of Defense",
  agencySlug: "department-of-defense",
  dutyStation: "Arlington, VA",
  state: "Virginia",
  stateSlug: "virginia",
  payPlan: "GS",
  grade: "13",
  step: "5",
  baseSalary: 99748,
  totalCompensation: 132326,
  occupationCode: "2210",
  occupationTitle: "IT Specialist",
  year: 2025,
  slug: "jane-doe-department-of-defense",
};

describe("EmployeeCard", () => {
  it("renders employee name", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders job title", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders formatted compensation", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText("$132,326")).toBeInTheDocument();
  });

  it("renders duty station", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText("Arlington, VA")).toBeInTheDocument();
  });

  it("renders pay plan and grade", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    expect(screen.getByText("GS-13")).toBeInTheDocument();
  });

  it("links to employee detail page", () => {
    render(<EmployeeCard employee={mockEmployee} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/employees/jane-doe-department-of-defense"
    );
  });

  it("truncates long agency names", () => {
    const longAgencyEmployee = {
      ...mockEmployee,
      agency:
        "Department of Health and Human Services Office of the Inspector General",
    };
    render(<EmployeeCard employee={longAgencyEmployee} />);
    expect(
      screen.getByText("Department of Health and Human...")
    ).toBeInTheDocument();
  });
});
