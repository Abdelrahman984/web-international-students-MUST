import { Link2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LinkResourceCardProps {
  title: string;
  href: string;
  className?: string;
}

export function LinkResourceCard({ title, href, className = '' }: LinkResourceCardProps) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
  const targetHref = href || '#';
  
  const cardClassName = `group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20 no-underline ${className}`;

  const content = (
    <>
      <div className="mt-2 flex flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
          <Link2 className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} aria-hidden="true" />
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 break-words">
            {title}
          </h4>
        </div>
      </div>

      <div className="mt-8 w-full">
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
          <span>Open Link</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </>
  );

  return isExternal ? (
    <a href={targetHref} target="_blank" rel="noopener noreferrer" className={cardClassName}>
      {content}
    </a>
  ) : (
    <Link to={targetHref} className={cardClassName}>
      {content}
    </Link>
  );
}
