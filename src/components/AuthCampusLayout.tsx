import type { ReactNode } from 'react';

/** Shared hero for login & register (`public/login-campus-bg.png`). */
const campusBackgroundUrl = `${import.meta.env.BASE_URL}login-campus-bg.png`;

export const authGlassInputClassName =
  'w-full rounded-xl border border-stone-200/90 bg-white/85 px-3 py-2.5 text-stone-900 shadow-sm outline-none ring-sky-200/40 transition-shadow placeholder:text-stone-400 focus:border-sky-300/80 focus:ring-2 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-500/50 dark:focus:ring-sky-900/50';

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
  return (
    <div className="relative isolate flex min-h-[calc(100vh-140px)] w-full items-center justify-center px-6 py-12">
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
          className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-slate-100/72 to-violet-100/86 dark:from-slate-950/75 dark:via-indigo-950/55 dark:to-slate-950/72"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-300/35 via-transparent to-indigo-100/22 dark:from-slate-950/50 dark:via-transparent dark:to-indigo-950/25"
          aria-hidden
        />
      </div>

      <div className={`relative z-0 w-full ${maxWidthClass}`}>
        <div className="rounded-[1.75rem] border border-white/60 bg-white/55 p-[1px] shadow-[0_25px_80px_-20px_rgba(30,58,90,0.28)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40 dark:shadow-[0_28px_90px_-24px_rgba(0,0,0,0.55)]">
          <div className="rounded-[1.6875rem] border border-stone-200/70 bg-white/75 p-8 shadow-inner shadow-white/40 backdrop-blur-xl backdrop-saturate-150 dark:border-slate-600/50 dark:bg-slate-900/70 dark:shadow-inner dark:shadow-slate-950/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
