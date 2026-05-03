import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { LinkResourceCard } from "../../../components/LinkResourceCard";
import { apiClient } from "../../../services/api";
import { getPublicBaseUrl } from "../../../lib/api";

type StudentResource = {
  id: string;
  title: string;
  url: string;
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const PUBLIC_BASE_URL = getPublicBaseUrl().replace(/\/+$/, "");

const toAbsoluteResourceUrl = (value: string): string => {
  const raw = value.trim();
  if (!raw) {
    return "";
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  const normalized = raw.replace(/^\/+/, "");
  return `${PUBLIC_BASE_URL}/${normalized}`;
};

export default function ELearning() {
  const [resources, setResources] = useState<StudentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await apiClient.get("/api/student_resources");
        const data =
          response.data?.data || response.data?.items || response.data;

        if (Array.isArray(data)) {
          const mapped = data
            .map((item, index) => {
              const row = item as Record<string, unknown>;
              const url =
                toStringValue(row.resource_url) ||
                toStringValue(row.file_path) ||
                toStringValue(row.resourceUrl) ||
                toStringValue(row.url);
              const title =
                toStringValue(row.title) ||
                toStringValue(row.name) ||
                "E-Learning";
              const id =
                toStringValue(row.id) ||
                toStringValue(row.resource_id) ||
                `${title}-${index}`;

              return { id, title, url: toAbsoluteResourceUrl(url) };
            })
            .filter((item) => item.url && item.url !== "#");

          setResources(mapped);
        } else {
          setResources([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resources.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchResources();
  }, []);

  return (
    <section className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            E-Learning
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Access the university Smart Learning portal and associated online
            resources.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="animate-pulse font-medium text-emerald-600 dark:text-emerald-400">
                Loading e-learning resources...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {resources.map((resource, index) => (
              <LinkResourceCard
                key={resource.id || `${resource.url}-${index}`}
                title={resource.title}
                href={resource.url}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
