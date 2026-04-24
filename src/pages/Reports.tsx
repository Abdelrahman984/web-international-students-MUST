import { useEffect, useState } from "react";
import { apiClient } from "../services/api";
import { resolveMediaUrl } from "../utils/media";

// Swagger: advisor_resources { id, title, resource_type, resource_url, file_path, description, thumbnail_path }
interface AdvisorResource {
  id: string;
  title: string | null;
  resource_type: string | null;
  resource_url: string | null;
  file_path: string | null;
  description: string | null;
  thumbnail_path: string | null;
}

interface ReportsProps {
  userName: string;
}

export function Reports({ userName: _userName }: ReportsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<AdvisorResource[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/api/advisor_resources");
        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const filtered = items.filter(
          (item: AdvisorResource) =>
            (item.resource_type ?? "").toLowerCase() === "statistical reports"
        );
        setReports(filtered);
      } catch (error) {
        console.error("Failed to fetch statistical reports:", error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          No Reports Available
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          There are currently no statistical reports published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Statistical Reports
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          View and download published statistical reports and analytical data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          // Determine correct href: prefer resource_url (external link), fallback to file_path (downloadable file)
          const href =
            report.resource_url ||
            (report.file_path ? resolveMediaUrl(report.file_path) : "#");
          const thumbnailUrl = report.thumbnail_path
            ? resolveMediaUrl(report.thumbnail_path)
            : null;
          const title = report.title || "Untitled Report";

          return (
            <article
              key={report.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
            >
              {thumbnailUrl ? (
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center bg-blue-50 dark:bg-blue-950/30">
                  <i className="fa-solid fa-chart-bar text-4xl text-blue-500 dark:text-blue-400" />
                </div>
              )}

              <div className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">
                  {title}
                </h3>
                {report.description && (
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {report.description}
                  </p>
                )}
                {href && href !== "#" && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                    {report.file_path ? "View File" : "Open Report"}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
