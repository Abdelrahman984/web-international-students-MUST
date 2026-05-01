import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlaygroundVideo } from "../../../components/PlaygroundVideo";
import { PdfResourceCard } from "../../../components/PdfResourceCard";
import { apiClient } from "../../../services/api";

type ResourceItem = {
  id: string;
  title: string;
  resourceUrl: string;
  filePath: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
};

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const isVideoUrl = (url: string): boolean => {
  const normalized = url.toLowerCase();
  return (
    normalized.includes("youtube.com") ||
    normalized.includes("youtu.be") ||
    normalized.endsWith(".mp4") ||
    normalized.endsWith(".webm") ||
    normalized.endsWith(".ogg") ||
    normalized.endsWith(".mov") ||
    normalized.endsWith(".m3u8")
  );
};

export default function Registeration() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchRegistrationGuides = async () => {
      try {
        const response = await apiClient.get(
          "/api/advisor_resources/Registration",
        );
        const data =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const rows: ResourceItem[] = data.map((item) => {
            const row = item as Record<string, unknown>;

            return {
              id: toStringValue(row.id),
              title: toStringValue(row.title),
              resourceUrl:
                toStringValue(row.resource_url) ||
                toStringValue(row.resourceUrl),
              filePath:
                toStringValue(row.file_path) || toStringValue(row.filePath),
              description: toStringValue(row.description),
              duration: toStringValue(row.duration),
              thumbnailUrl:
                toStringValue(row.thumbnail_path) ||
                toStringValue(row.thumbnail_url) ||
                toStringValue(row.thumbnailUrl),
            };
          });
          const validRows = rows.filter(
            (row) =>
              (row.resourceUrl && row.resourceUrl !== "#") ||
              (row.filePath && row.filePath !== "#"),
          );
          setResources(validRows);
          setStatus(
            validRows.length ? "" : "No registration guides available yet.",
          );
        } else {
          setResources([]);
          setStatus("No registration guides available yet.");
        }
      } catch (error) {
        console.error("Error fetching registration guides:", error);
        setStatus("Network error: Could not connect to backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRegistrationGuides();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <div className="sticky top-28 z-40 mb-10 flex justify-start">
          <Link
            to="/advising?tab=resources"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to Advising Resources
          </Link>
        </div>
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Registration Guides
        </h1>

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">
            Loading registration guides from API...
          </div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) =>
              isVideoUrl(resource.resourceUrl) ? (
                <PlaygroundVideo
                  key={resource.id}
                  src={resource.resourceUrl}
                  externalUrl={resource.resourceUrl}
                  title={resource.title}
                  description={
                    resource.description ||
                    "Click play to open this registration guide video."
                  }
                  durationText={resource.duration}
                  poster={resource.thumbnailUrl || undefined}
                />
              ) : (
                <PdfResourceCard
                  key={resource.id}
                  title={resource.title}
                  url={resource.filePath || resource.resourceUrl}
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
