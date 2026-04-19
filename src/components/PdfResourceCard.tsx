interface PdfResourceCardProps {
  title: string;
  url: string;
  className?: string;
}

export function PdfResourceCard({ title, url, className = '' }: PdfResourceCardProps) {
  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.12)] dark:bg-slate-800 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] ${className}`}
    >
      <div className="mt-2 flex flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f8f9fc] dark:bg-slate-700/50">
          <i className="fa-solid fa-file-lines text-[32px] text-[#1e293b] dark:text-slate-300"></i>
        </div>
        
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="focus:outline-none text-decoration-none"
        >
          <h4 className="text-[15px] font-bold text-[#1e293b] transition-colors duration-300 group-hover:text-[#27ae60] hover:text-[#27ae60] dark:text-white dark:group-hover:text-[#27ae60] dark:hover:text-[#27ae60]">
            {title}
          </h4>
        </a>
      </div>

      <div className="mt-8 w-full">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-[8px] bg-[#27ae60] px-4 py-3 text-[14px] font-bold text-white transition-colors duration-300 hover:bg-[#219653]"
        >
          View File
        </a>
      </div>
    </div>
  );
}
