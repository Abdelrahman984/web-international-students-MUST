import type { ReactNode } from 'react';


export const authGlassInputClassName =
  'w-full rounded-l border border-stone-200/90 bg-white/85 px-3 py-2.5 text-stone-900 shadow-sm outline-none ring-sky-200/40 transition-shadow placeholder:text-stone-400 focus:border-sky-300/80 focus:ring-2 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-500/50 dark:focus:ring-sky-900/50';

export const authPrimaryButtonClassName =
  'rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 px-4 py-2.5 font-semibold text-white shadow-lg shadow-emerald-900/20 outline-none ring-1 ring-emerald-500/30 transition hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-60 dark:shadow-emerald-950/40';

export const authSecondaryButtonClassName =
  'rounded-xl border border-stone-200/90 bg-white/70 px-4 py-2.5 font-medium text-stone-800 shadow-sm backdrop-blur-sm transition hover:bg-white/90 dark:border-slate-600 dark:bg-slate-800/60 dark:text-stone-200 dark:hover:bg-slate-800/90';

type AuthCampusLayoutProps = {
  children: ReactNode;
  /** Tailwind width constraint, e.g. max-w-md or max-w-2xl */
  maxWidthClass?: string;
};

export function AuthCampusLayout({ children, maxWidthClass = 'max-w-md' }: AuthCampusLayoutProps) {
  const campusBackgroundUrl = `${import.meta.env.BASE_URL}login-campus-bg.png`;
  const headerUrl = `${import.meta.env.BASE_URL}auth-header.png`;
  const footerUrl = `${import.meta.env.BASE_URL}auth-footer.png`;

  return (
    <div className="relative isolate flex min-h-[110vh] w-full flex-col items-center justify-start px-6 pt-36 pb-24 overflow-hidden">
      {/* Global Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src={campusBackgroundUrl}
          alt=""
          width={1024}
          height={682}
          decoding="async"
          fetchPriority="high"
          className="h-full w-full scale-105 object-cover object-center [image-rendering:high-quality]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-indigo-950/5 via-transparent to-indigo-900/20 dark:from-slate-950/90 dark:via-slate-950/60 dark:to-slate-950/95"
          aria-hidden
        />
      </div>

      <div className={`relative z-10 w-full ${maxWidthClass}`}>
        {/* The "Word Doc" Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:border-slate-800 dark:bg-slate-900">
          
          {/* Internal Doc Header (The Line) */}
          <div className="absolute top-0 left-0 right-0 z-30 h-4 w-full">
            <img
              src={headerUrl}
              alt=""
              className="h-full w-full object-fill"
              aria-hidden
            />
          </div>

          <div className="relative z-10 p-8 sm:p-10 pb-48">
            {children}
          </div>

          {/* Internal Doc Footer (The Building & Line) */}
          <div className="absolute bottom-0 left-0 right-0 z-0 h-44 w-full pointer-events-none overflow-hidden">
            <img
              src={footerUrl}
              alt=""
              className="h-full w-full object-cover object-bottom opacity-100"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
