import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AcademicStaffProfileCard, { AcademicStaffProfileCardProps } from './AcademicStaffProfileCard';

interface StaffAccordionProps {
  roleName: string;
  staffList: AcademicStaffProfileCardProps[];
  defaultOpen?: boolean;
}

export default function StaffAccordion({ roleName, staffList, defaultOpen = false }: StaffAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between bg-white px-6 py-5 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:ring-inset dark:bg-slate-800 dark:hover:bg-slate-800/80"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{roleName || 'Other Staff'}</h3>
          <span className="flex h-6 flex-col items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {staffList.length}
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-slate-200 dark:bg-slate-700 dark:group-hover:bg-slate-600">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
      </button>

      {/* Expandable Content Area */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            {staffList.map((member, index) => (
              <AcademicStaffProfileCard key={index} {...member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
