import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { LinkResourceCard } from "../../../components/LinkResourceCard";
import { apiClient } from "../../../services/api";
import { getPublicBaseUrl } from "../../../lib/api";

const E_LEARNING_URL = "https://smartlearning.must.edu.eg/";

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
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <div className="sticky top-28 z-40 mb-10 flex justify-start">
          <Link
            to="/academics"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to Academics
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          E-Learning
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Access the university Smart Learning portal.
        </p>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Loading e-learning resources...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : (
          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-4">
            <LinkResourceCard title="E-Learning" href={E_LEARNING_URL} />
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
