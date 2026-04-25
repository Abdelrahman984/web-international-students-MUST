import { Link } from "react-router";

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
  return (
    <Link
      to={to}
      className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-10 text-center no-underline shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:bg-slate-800"
    >
      <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
      <h2 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
        {title}
      </h2>
      <p className="max-w-md text-base text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </Link>
  );
}
