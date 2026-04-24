import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlaygroundVideo } from "../../../components/PlaygroundVideo";
import { apiClient } from "../../../services/api";

type ResourceItem = {
  id: string;
  title: string;
  resourceUrl: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  resource_type: string;
};

export default function Registeration() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchRegistrationGuides = async () => {
      try {
        const response = await apiClient.get("/api/advisor_resources");
        const data = response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const rows: ResourceItem[] = data.map((item: any) => ({
            id: item.id || "",
            title: item.title || "",
            resourceUrl: item.resource_url || item.resourceUrl || "",
            description: item.description || "",
            duration: item.duration || "",
            thumbnailUrl: item.thumbnail_url || item.thumbnailUrl || "",
            resource_type: item.resource_type || "",
          }));
          const validRows = rows.filter(
            (row) => row.resourceUrl && row.resourceUrl !== "#" && row.resource_type === "Registration"
          );
          setResources(validRows);
          setStatus(validRows.length ? "" : "No registration guides available yet.");
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
        <Link
          to="/advising?tab=resources"
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
        >
          <span aria-hidden="true">←</span>
          Back to Advising Resources
        </Link>
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
          <div className="grid grid-cols-1 gap-6">
            {resources.map((resource) => (
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
                poster={resource.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
