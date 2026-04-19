import { Link2 } from 'lucide-react';

interface LinkResourceCardProps {
  title: string;
  href: string;
  className?: string;
}

export function LinkResourceCard({ title, href, className = '' }: LinkResourceCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 text-sky-700 transition-opacity hover:opacity-80 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 ${className}`}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
        <Link2 className="h-8 w-8" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-semibold underline break-words text-slate-900 dark:text-slate-100">{title}</p>
      </div>
      <ExternalLinkIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-300" />
    </a>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14 19 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
    </svg>
  );
}