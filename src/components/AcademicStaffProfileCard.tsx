import React from 'react';

export interface AcademicStaffProfileCardProps {
  title?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  name: string;
  role: string;
  specialty: string;
  department: string;
  email: string;
  imageUrl: string;
  imageAlt?: string;
  cvLabel: string;
  cvUrl: string;
  googleScholarLink?: string;
  bio: string;
}

export default function AcademicStaffProfileCard({
  title,
  firstName,
  lastName,
  position,
  name,
  role,
  specialty,
  email,
  imageUrl,
  imageAlt,
  cvLabel,
  cvUrl,
  googleScholarLink,
  bio,
  department,
}: AcademicStaffProfileCardProps) {
  const displayName = [title, firstName, lastName].filter(Boolean).join(' ').trim() || name;
  const displayPosition = position || role || 'N/A';

  return (
    <article className="w-full rounded-xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-700 dark:bg-slate-800">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <img
            src={imageUrl}
            alt={imageAlt || name}
            className="h-24 w-24 rounded-lg object-cover border border-blue-400/30"
          />

          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{displayName}</h2>
            <p className="mt-1 text-base font-medium text-slate-600 dark:text-slate-300">{displayPosition}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={cvUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-fit items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-800/40"
          >
            <PdfIcon className="h-5 w-5" />
            <span className="font-medium">{cvLabel}</span>
          </a>

          {googleScholarLink && (
            <a
              href={googleScholarLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-fit items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-200 dark:hover:bg-emerald-800/40"
            >
              <ScholarIcon className="h-5 w-5" />
              <span className="font-medium">Google Scholar</span>
            </a>
          )}
        </div>
      </header>

      <div className="mt-8 space-y-5">
        <SectionCard title="Department">
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{department || role || 'N/A'}</p>
        </SectionCard>

        <SectionCard title="Research Direction">
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{specialty || 'N/A'}</p>
        </SectionCard>
      </div>
    </article>
  );
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 md:p-6 dark:border-slate-700 dark:bg-slate-900/50">
      <h3 className="text-2xl font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{title}</h3>
      <div className="my-3 h-px w-full bg-slate-200 dark:bg-slate-700" />
      {children}
    </section>
  );
}

function PdfIcon({ className }: { className?: string }) {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 3.75H7.5A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V8.25L14.5 3.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75v4.5h4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 14.25h6.5M8.75 16.75h4M8.75 11.75h6.5" />
    </svg>
  );
}

function ScholarIcon({ className }: { className?: string }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 10.5 9-6 9 6-9 6-9-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12.75v3.75c0 1.25 2.35 2.25 5.25 2.25s5.25-1 5.25-2.25v-3.75" />
    </svg>
  );
}