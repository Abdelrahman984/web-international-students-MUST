import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PdfResourceCard } from "../../../components/PdfResourceCard";
import { apiClient } from "../../../services/api";

type AdvisingPdfItem = {
  id: string;
  title: string;
  url: string;
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

export default function Advising() {
  const [academicAdvisingPdfs, setAcademicAdvisingPdfs] = useState<
    AdvisingPdfItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await apiClient.get(
          "/api/advisor_resources/Academic_Advising",
        );
        const data =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const mapped = data.map((item) => {
            const row = item as Record<string, unknown>;

            return {
              id: toStringValue(row.id),
              title:
                toStringValue(row.title) ||
                toStringValue(row.name) ||
                "Academic Advising Guide",
              url:
                toStringValue(row.resource_url) ||
                toStringValue(row.file_path) ||
                toStringValue(row.resourceUrl) ||
                toStringValue(row.url),
            };
          });
          const valid = mapped.filter((item) => item.url && item.url !== "#");
          setAcademicAdvisingPdfs(valid);
        } else {
          setAcademicAdvisingPdfs([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load resources"),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <Link
          to="/advising?tab=resources"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
        >
          <span aria-hidden="true">←</span>
          Back to Advising Resources
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Academic Advising
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Download or open the official academic advising guides.
        </p>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Loading academic advising resources...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error.message || "Failed to load academic advising resources."}
          </div>
        ) : (academicAdvisingPdfs?.length || 0) > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {academicAdvisingPdfs?.map((item, index) => (
              <PdfResourceCard
                key={item.id || `${item.url}-${index}`}
                title={item.title}
                url={item.url}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            No academic advising documents are available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
