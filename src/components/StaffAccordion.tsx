import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AcademicStaffProfileCard, {
  AcademicStaffProfileCardProps,
} from "./AcademicStaffProfileCard";

interface StaffAccordionProps {
  roleName: string;
  staffList: AcademicStaffProfileCardProps[];
  defaultOpen?: boolean;
}

export default function StaffAccordion({
  roleName,
  staffList,
  defaultOpen = false,
}: StaffAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "border-emerald-200 bg-white shadow-lg shadow-emerald-100/50 dark:border-emerald-900/50 dark:bg-slate-900 dark:shadow-emerald-900/20"
          : "border-slate-200 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <h3
            className={`text-xl font-bold transition-colors ${
              isOpen
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {roleName || "Other Staff"}
          </h3>
          <span
            className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-sm font-semibold transition-colors ${
              isOpen
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {staffList.length}
          </span>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
              : "bg-slate-50 text-slate-400 dark:bg-slate-800"
          }`}
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "-rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex flex-col gap-6">
                {staffList.map((member, index) => (
                  <AcademicStaffProfileCard key={index} {...member} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
