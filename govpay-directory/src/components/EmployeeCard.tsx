import Link from "next/link";
import { Employee } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Building2, MapPin, Briefcase } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Link
      href={`/employees/${employee.slug}`}
      className="group block rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-navy-100 group-hover:text-accent-blue">
            {employee.name}
          </h3>
          <p className="mt-0.5 text-sm text-navy-400">{employee.jobTitle}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="font-[family-name:var(--font-data)] text-lg font-bold text-accent-green">
            {formatCurrency(employee.totalCompensation)}
          </p>
          <p className="font-[family-name:var(--font-data)] text-xs text-navy-500">
            total comp
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-navy-400">
        <span className="flex items-center gap-1" title={employee.agency}>
          <Building2 size={12} />
          {employee.agency.length > 30
            ? employee.agency.substring(0, 30) + "..."
            : employee.agency}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {employee.dutyStation}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={12} />
          {employee.payPlan}-{employee.grade}
        </span>
      </div>
    </Link>
  );
}
