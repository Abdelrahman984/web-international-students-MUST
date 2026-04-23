import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleDriveCategoryCard } from "../../../components/GoogleDriveCategoryCard";
import { getSchedulesList, type ScheduleItem } from "../../../services/cmsApi";

type ScheduleCategory = "lectures_sections" | "exams";

type ScheduleRow = ScheduleItem & {
  category?: string;
};

type ScheduleCardConfig = {
  category: ScheduleCategory;
  title: string;
  description: string;
};

const scheduleCards: ScheduleCardConfig[] = [
  {
    category: "lectures_sections",
    title: "Lectures & Sections",
    description: "Lecture schedules and section timetables.",
  },
  {
    category: "exams",
    title: "Exams",
    description: "Quiz and final exam timetables.",
  },
];

export default function Schedules() {
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [openCategory, setOpenCategory] = useState<ScheduleCategory | null>(
    null,
  );

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const rows = await getSchedulesList();
        setSchedules(
          rows.filter(
            (row) => row.fileUrl && row.fileUrl !== "#",
          ) as ScheduleRow[],
        );
        setStatus(rows.length ? "" : "No schedule files available yet.");
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setStatus("Network error: Could not connect to backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSchedules();
  }, []);

  const getScheduleDescription = (scheduleType: string) => {
    const normalized = scheduleType.toLowerCase();
    if (normalized === "normal") {
      return "Current Semester's Nomral Schedule.";
    }
    if (normalized.includes("quiz")) {
      return "Quiz examination timetable.";
    }
    if (normalized === "final") {
      return "Final examination timetable.";
    }
    return "Academic schedule document.";
  };

  const getCategoryLabel = (category: ScheduleCategory) =>
    category === "lectures_sections" ? "Lectures & Sections" : "Exams";

  const selectedCard =
    scheduleCards.find((card) => card.category === openCategory) ?? null;
  const selectedItems = openCategory
    ? schedules.filter((item) => item.category === openCategory)
    : [];

  return (
    <section className="w-full min-h-screen bg-slate-50 py-20 px-6 pt-32 lg:px-24 dark:bg-[#0b132b]">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/advising?tab=resources"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
        >
          <span aria-hidden="true">←</span>
          Back to Advising Resources
        </Link>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-slate-900 text-4xl lg:text-5xl font-bold mb-6 dark:text-white">
            Academic Schedules
          </h2>
          <p className="text-slate-600 text-lg lg:text-xl dark:text-gray-400">
            Access live lecture schedules and exam timetables updated from the
            registrar.
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse text-emerald-700 text-xl font-bold text-center p-12 dark:text-emerald-400">
            Loading schedules from API...
          </div>
        ) : status ? (
          <div className="text-center text-emerald-700 text-xl font-bold p-12 border border-dashed border-slate-300 rounded-xl dark:text-emerald-400 dark:border-slate-700">
            {status}
          </div>
        ) : openCategory && selectedCard ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedCard.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-gray-400">
                  {selectedCard.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenCategory(null)}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                <span aria-hidden="true">←</span>
                Back to categories
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {selectedItems.length ? (
                selectedItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-10 text-center no-underline shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <i className="fa-brands fa-google-drive text-[40px] text-[#00A152] transition-transform duration-300 group-hover:scale-110 dark:text-[#00c968]"></i>
                    <div>
                      <h4 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                        {(item.title || item.scheduleType) +
                          " - " +
                          item.semester +
                          " " +
                          item.year}
                      </h4>
                      <p className="mt-1 max-w-md text-base text-slate-600 dark:text-slate-300">
                        {getScheduleDescription(item.scheduleType)}
                      </p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center text-slate-600 dark:text-gray-400 rounded-2xl border border-dashed border-slate-300 p-8 dark:border-slate-700">
                  No {getCategoryLabel(openCategory).toLowerCase()} schedules
                  available yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {scheduleCards.map((card) => (
              <GoogleDriveCategoryCard
                key={card.category}
                title={card.title}
                description={card.description}
                isOpen={false}
                onClick={() => setOpenCategory(card.category)}
              >
                <></>
              </GoogleDriveCategoryCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
