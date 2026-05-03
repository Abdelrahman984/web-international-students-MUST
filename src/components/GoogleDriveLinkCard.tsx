import { Link } from "react-router";
import { GraduationCap, BookOpen } from "lucide-react";

interface GoogleDriveLinkCardProps {
  title: string;
  description: string;
  to: string;
}

export function GoogleDriveLinkCard({
  title,
  description,
  to,
}: GoogleDriveLinkCardProps) {
  const isUndergrad = title.toLowerCase().includes("undergraduate");
  const Icon = isUndergrad ? BookOpen : GraduationCap;

  return (
    <Link
      to={to}
      className="group flex w-full flex-col items-center justify-center gap-5 rounded-2xl border border-slate-100 bg-white p-8 text-center no-underline transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
        <Icon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
