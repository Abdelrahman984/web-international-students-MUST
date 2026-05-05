import { useId, type ReactNode } from "react";
import { Linkedin, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";

type Supervisor = {
  name: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
};

type Developer = {
  name: string;
  email: string;
  role: string;
  linkedInUrl: string;
  imageUrl?: string;
};

const supervisors: Supervisor[] = [
  {
    name: "Khaled Abdel Salam",
    title: "Assistant Professor at MUST University",
    subtitle: "Vice Dean for Community Service and Environmental",
    imageUrl: "/team/khaled.jpg",
  },
  {
    name: "Ayman S. Abdelaziz",
    title: "Assistant Lecturer at MUST University",
    subtitle: "Head of International Students Sector",
    imageUrl: "/team/ayman.jpeg",
  },
];

const developers: Developer[] = [
  {
    name: "Abdelrahman Alaa",
    email: "rafeeq220044@gmail.com",
    role: "Full-stack Developer",
    linkedInUrl: "https://www.linkedin.com/in/abdelrahman-alaa-backend",
    imageUrl: "/team/abdelrahman.jpeg",
  },
  {
    name: "Ammar Mahmoud",
    email: "secshgb@gmail.com",
    role: "SOC Analyst, Backend Developer",
    linkedInUrl: "https://www.linkedin.com/in/ammar-eldeeb",
    imageUrl: "/team/ammar.jpg",
  },
  {
    name: "Abdullah Azmy",
    email: "abdullahazmytech@gmail.com",
    role: ".NET Backend Developer",
    linkedInUrl: "https://www.linkedin.com/in/abdullahazmyelsherbini/",
    imageUrl: "/team/azmy.jpg",
  },
];

function HeadshotPlaceholder({ name }: { name: string }) {
  const gradientId = useId();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
      <svg
        viewBox="0 0 96 96"
        role="img"
        aria-label={`Headshot placeholder for ${name}`}
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="96" height="96" fill={`url(#${gradientId})`} />
        <circle cx="48" cy="38" r="16" fill="#94a3b8" fillOpacity="0.55" />
        <path
          d="M18 86c6-18 20-26 30-26s24 8 30 26"
          fill="#94a3b8"
          fillOpacity="0.45"
        />
        <text
          x="48"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontWeight="700"
          fill="#0f172a"
          opacity="0.65"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

function ProfileCard({
  name,
  title,
  subtitle,
  imageUrl,
  children,
}: {
  name: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  children?: ReactNode;
}) {
  return (
    <article className="card group h-full rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/40">
      <div className="flex items-start gap-5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Headshot of ${name}`}
            className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-slate-800"
          />
        ) : (
          <HeadshotPlaceholder name={name} />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </article>
  );
}

export default function MeetTheTeam() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16 dark:bg-[#070d19]">
      <Seo
        title="Meet the Team | International Students Portal"
        description="Meet the supervision and development teams behind the International Students Portal at MUST University."
        keywords={[
          "MUST University",
          "International Students Portal",
          "team",
          "supervision team",
          "development team",
          "web development",
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link
                to="/"
                className="rounded-md transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:hover:text-emerald-400 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-[#070d19]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="text-slate-900 dark:text-slate-200">
              Meet the Team
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Meet the Team
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            The people guiding and building the International Students Portal at
            MUST University.
          </p>
        </header>

        <section aria-labelledby="supervision-team" className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <h2
                id="supervision-team"
                className="text-2xl font-bold text-slate-900 dark:text-white"
              >
                Supervision Team
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Academic leadership and strategic supervision.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {supervisors.map((person) => (
              <ProfileCard
                key={person.name}
                name={person.name}
                title={person.title}
                subtitle={person.subtitle}
                imageUrl={person.imageUrl}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="development-team">
          <div className="mb-6">
            <h2
              id="development-team"
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              Development Team
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Engineering, delivery, and continuous improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev) => (
              <ProfileCard
                key={dev.email}
                name={dev.name}
                title={dev.role}
                imageUrl={dev.imageUrl}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${dev.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:border-slate-700 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-[#070d19]"
                    aria-label={`Email ${dev.name}`}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email
                  </a>

                  <a
                    href={dev.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:border-slate-700 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-[#070d19]"
                    aria-label={`LinkedIn profile for ${dev.name}`}
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </div>
              </ProfileCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
