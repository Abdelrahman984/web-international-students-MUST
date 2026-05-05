import React from "react";
import {
  Building2,
  BookOpen,
  GraduationCap,
  FileText,
  Mail,
} from "lucide-react";

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
  const getAbbreviation = (academicTitle?: string) => {
    if (!academicTitle) return "";
    const t = academicTitle.trim().toLowerCase();
    
    // If it's already an abbreviation, don't double up
    if (t.endsWith(".") || ["dr", "prof"].includes(t)) {
       return academicTitle.trim();
    }

    if (t === "professor") return "Prof.";
    if (t === "associate professor") return "Assoc. Prof.";
    if (t === "assistant professor") return "Asst. Prof.";
    if (t === "lecturer") return "Dr.";
    if (t === "assistant lecturer") return "Asst. Lect.";
    if (t === "teaching assistant" || t === "demonstrator") return "T.A.";
    return "";
  };

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || name;
  const abbreviation = getAbbreviation(title);
  
  // Check if the name already starts with the abbreviation to avoid duplicates
  const displayName = abbreviation && !fullName.startsWith(abbreviation) 
    ? `${abbreviation} ${fullName}` 
    : fullName;
  const displayPosition = position || role;

  return (
    <article className="group flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-emerald-200 hover:shadow-md sm:flex-row sm:p-8 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-900/50">
      {/* Avatar Section */}
      <div className="flex shrink-0 flex-col items-center gap-4 sm:w-36 sm:items-start">
        <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <img
            src={imageUrl}
            alt={imageAlt || name}
            className="h-full w-full object-fit transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Email Quick Action */}
        {email && email !== "#" && (
          <a
            href={`mailto:${email}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            title="Send Email"
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </a>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
              {displayName}
            </h2>
            {displayPosition && (
              <p className="mt-1 text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-500">
                {displayPosition}
              </p>
            )}
            {title && (
              <p className="mt-1 text-base font-semibold text-slate-700 dark:text-slate-200">
                {title}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            {cvUrl && cvUrl !== "#" && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 hover:shadow-sm dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                <FileText className="h-4 w-4" />
                <span>{cvLabel || "CV"}</span>
              </a>
            )}

            {googleScholarLink && googleScholarLink !== "#" && (
              <a
                href={googleScholarLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Google Scholar</span>
              </a>
            )}
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon={Building2}
            label="Department"
            value={department || role || "N/A"}
          />
          <InfoItem
            icon={BookOpen}
            label="Research Direction"
            value={specialty || "N/A"}
          />
        </div>
      </div>
    </article>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 transition-colors group-hover:bg-emerald-50/50 dark:bg-slate-800/50 dark:group-hover:bg-emerald-900/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-3">
          {value}
        </p>
      </div>
    </div>
  );
}
