import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";
import { resolveMediaUrl } from "../utils/media";
import { Reports } from "./Reports";

type AdvisingTab = "resources" | "announcements" | "statistical-reports";

// ── Academic Advising resource types ──────────────────────────────────────────
type AcademicAdvisingResource = {
  id: string;
  title: string;
  resource_type: string;
  resource_url: string | null;
  file_path: string | null;
  description: string | null;
  thumbnail_path: string | null;
};

// ── Advising Announcements ────────────────────────────────────────────────────
type AnnouncementItem = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  thumbnail_path: string | null;
  file_path: string | null;
};

export default function AdvisingPage() {
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: AdvisingTab =
    tabParam === "announcements"
      ? "announcements"
      : tabParam === "statistical-reports"
        ? "statistical-reports"
        : "resources";

  // ── Academic Advising Resources ─────────────────────────────────────────────
  const [advisingResources, setAdvisingResources] = useState<AcademicAdvisingResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // ── Announcements ───────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  // Fetch Academic Advising resources
  useEffect(() => {
    if (activeTab !== "resources") return;
    const fetchResources = async () => {
      setIsLoadingResources(true);
      try {
        const response = await apiClient.get("/api/advisor_resources");
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];
        const filtered = raw.filter(
          (item: AcademicAdvisingResource) =>
            (item.resource_type ?? "").toLowerCase() === "academic advising"
        );
        setAdvisingResources(filtered);
      } catch (err) {
        console.error("Failed to fetch academic advising resources:", err);
        setAdvisingResources([]);
      } finally {
        setIsLoadingResources(false);
      }
    };
    void fetchResources();
  }, [activeTab]);

  // Fetch Announcements from API
  useEffect(() => {
    if (activeTab !== "announcements") return;
    const fetchAnnouncements = async () => {
      setIsLoadingAnnouncements(true);
      try {
        const response = await apiClient.get("/api/advising_announcements");
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];
        setAnnouncements(raw);
      } catch (err) {
        console.error("Failed to fetch advising announcements:", err);
        setAnnouncements([]);
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };
    void fetchAnnouncements();
  }, [activeTab]);

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

        {/* ── Statistical Reports Tab ──────────────────────────────────────── */}
        {activeTab === "statistical-reports" ? (
          <Reports userName="International Student Affairs" />

        /* ── Academic Advising Resources Tab ──────────────────────────────── */
        ) : activeTab === "resources" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Academic Advising
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Resources and guides for academic advising support.
              </p>
            </div>

            {isLoadingResources ? (
              <div className="flex justify-center items-center h-48 text-emerald-600 dark:text-emerald-400">
                <div className="animate-pulse text-base font-medium">
                  Loading academic advising resources...
                </div>
              </div>
            ) : advisingResources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No academic advising resources available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {advisingResources.map((resource) => {
                  const href =
                    resource.resource_url ||
                    (resource.file_path ? resolveMediaUrl(resource.file_path) : "#");
                  const thumbnailUrl = resource.thumbnail_path
                    ? resolveMediaUrl(resource.thumbnail_path)
                    : null;

                  return (
                    <article
                      key={resource.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      {thumbnailUrl ? (
                        <div className="relative h-44 overflow-hidden bg-slate-200 dark:bg-slate-800">
                          <img
                            src={thumbnailUrl}
                            alt={resource.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-emerald-50 dark:bg-emerald-950/30">
                          <i className="fa-solid fa-book-open text-4xl text-emerald-500 dark:text-emerald-400" />
                        </div>
                      )}

                      <div className="space-y-3 p-6">
                        <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {resource.description}
                          </p>
                        )}
                        {href && href !== "#" && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                            Open Resource
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        /* ── Announcements Tab ─────────────────────────────────────────────── */
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Announcements
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Latest advising announcements and updates.
              </p>
            </div>

            {isLoadingAnnouncements ? (
              <div className="flex justify-center items-center h-48 text-emerald-600 dark:text-emerald-400">
                <div className="animate-pulse text-base font-medium">
                  Loading announcements...
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No announcements available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {announcements.map((item) => {
                  const thumbnailUrl = item.thumbnail_path
                    ? resolveMediaUrl(item.thumbnail_path)
                    : null;
                  const fileUrl = item.file_path
                    ? resolveMediaUrl(item.file_path)
                    : null;

                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      {thumbnailUrl ? (
                        <div className="relative h-56 overflow-hidden bg-slate-200 dark:bg-slate-800">
                          <img
                            src={thumbnailUrl}
                            alt={item.title ?? "Announcement"}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {item.date && (
                            <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                              {item.date}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative flex h-24 items-center justify-center bg-emerald-50 dark:bg-emerald-950/30">
                          <i className="fa-solid fa-bullhorn text-3xl text-emerald-500 dark:text-emerald-400" />
                          {item.date && (
                            <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                              {item.date}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 p-6">
                        <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item.description}
                          </p>
                        )}
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                          >
                            <i className="fa-solid fa-file-lines text-xs" />
                            View Attachment
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
