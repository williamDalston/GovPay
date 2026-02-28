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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100 group-hover:text-accent-blue sm:text-base">
            {employee.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-navy-400">{employee.jobTitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-[family-name:var(--font-data)] text-base font-bold text-accent-green sm:text-lg">
            {formatCurrency(employee.totalCompensation)}
          </p>
          <p className="font-[family-name:var(--font-data)] text-xs text-navy-500">
            total comp
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-navy-400">
        <span className="flex items-center gap-1" title={employee.agency}>
          <Building2 size={12} className="shrink-0" />
          <span className="truncate">
            {employee.agency.length > 30
              ? employee.agency.substring(0, 30) + "..."
              : employee.agency}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{employee.dutyStation}</span>
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={12} className="shrink-0" />
          {employee.payPlan}-{employee.grade}
        </span>
      </div>
    </Link>
  );
}
