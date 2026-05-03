import { resolveMediaUrl } from '../utils/media';
import { FileText, ExternalLink } from 'lucide-react';

interface PdfResourceCardProps {
  title: string;
  url: string;
  className?: string;
}

export function PdfResourceCard({ title, url, className = '' }: PdfResourceCardProps) {
  const resolvedUrl = resolveMediaUrl(url);
  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20 ${className}`}
    >
      <div className="mt-2 flex flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
          <FileText className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
        </div>
        
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noreferrer"
          className="focus:outline-none no-underline outline-none"
        >
          <h4 className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
            {title}
          </h4>
        </a>
      </div>

      <div className="mt-8 w-full">
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20 no-underline"
        >
          <span>View Document</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
