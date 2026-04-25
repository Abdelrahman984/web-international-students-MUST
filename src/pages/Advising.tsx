import { useSearchParams } from "react-router-dom";
import { GoogleDriveLinkCard } from "../components/GoogleDriveLinkCard";
import { Reports } from "./Reports";

type AdvisingTab = "resources" | "announcements" | "statistical-reports";

type AnnouncementItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
};

const ADVISING_RESOURCE_CARDS = [
  {
    title: "Academic advising",
    description:
      "Open the academic advising guide and related support materials.",
    to: "/academic-advising",
  },
  {
    title: "Registration",
    description: "Go to the registration guides and Banner registration help.",
    to: "/registeration",
  },
  {
    title: "Schedules",
    description:
      "Check current lecture schedules and exam timetable documents.",
    to: "/schedules",
  },
];

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "announcement-1",
    title: "Advising office hours updated",
    description:
      "The advising desk has new weekly office hours to help students with registration and study plans.",
    date: "20 Apr 2026",
    imageUrl: "/must.jpg",
    imageAlt: "Campus announcement banner",
  },
  {
    id: "announcement-2",
    title: "Registration support sessions",
    description:
      "Book a support slot before registration opens to review your courses and avoid conflicts.",
    date: "18 Apr 2026",
    imageUrl: "/Image.png",
    imageAlt: "Student support announcement graphic",
  },
  {
    id: "announcement-3",
    title: "Schedule review reminder",
    description:
      "Students should review the latest schedules before the start of each semester to confirm sections.",
    date: "15 Apr 2026",
    imageUrl: "/must.jpg",
    imageAlt: "University announcement image",
  },
];

export default function AdvisingPage() {
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: AdvisingTab =
    tabParam === "announcements"
      ? "announcements"
      : tabParam === "statistical-reports"
        ? "statistical-reports"
        : "resources";

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Advising
            </h1>
          </div>
        </div>

        {activeTab === "statistical-reports" ? (
          <Reports userName="International Student Affairs" />
        ) : activeTab === "resources" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {ADVISING_RESOURCE_CARDS.map((card) => (
                <GoogleDriveLinkCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  to={card.to}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Announcement
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Static campus updates for advising-related notices.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {ANNOUNCEMENTS.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                      {item.date}
                    </div>
                  </div>

                  <div className="space-y-3 p-6">
                    <h3 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                      {item.title}
                    </h3>
                    <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
