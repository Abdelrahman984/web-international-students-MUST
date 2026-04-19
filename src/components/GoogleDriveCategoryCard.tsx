import type { ReactNode } from "react";

interface GoogleDriveCategoryCardProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function GoogleDriveCategoryCard({
  title,
  description,
  isOpen,
  onClick,
  children,
}: GoogleDriveCategoryCardProps) {
  return (
    <article className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-10 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:bg-slate-800">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col items-center justify-center gap-4 text-center"
      >
        <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
        <div className="min-w-0">
          <h3 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
            {title}
          </h3>
          <p className="mt-1 max-w-md text-base text-slate-600 dark:text-slate-300">
            {description}
          </p>
          <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {isOpen ? "Click to hide schedules" : "Click to view schedules"}
          </p>
        </div>
      </button>

      {children}
    </article>
  );
}
