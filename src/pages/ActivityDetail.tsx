import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "../services/api";
import { resolveMediaUrl } from "../utils/media";

export default function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        // Try fetching detail endpoint first
        let response;
        try {
          response = await apiClient.get(`/api/activities/${id}`);
        } catch (err) {
          // fallback to list and find by id
          response = await apiClient.get(`/api/activities`);
        }

        const raw =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(raw)) {
          const found = raw.find((it: any) => String(it.id) === String(id));
          setActivity(found || null);
        } else if (raw) {
          setActivity(raw);
        } else {
          setActivity(null);
        }
      } catch (error) {
        console.error("Error fetching activity detail:", error);
        setActivity(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-700 dark:text-emerald-400">Loading...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">
          Activity not found.
        </div>
      </div>
    );
  }

  const imageUrl =
    activity.image_url || activity.imageUrl || activity.imageUrl || "";

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1000px] px-6 sm:px-12">
        <Link
          to="/activities"
          className="mb-6 inline-block text-emerald-700 dark:text-emerald-400"
        >
          ← Back to activities
        </Link>

        <h1 className="mb-4 text-4xl font-extrabold text-slate-900 dark:text-white">
          {activity.title}
        </h1>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(imageUrl)}
            alt={activity.title}
            className="mb-6 w-full rounded-lg object-cover"
          />
        )}

        <div className="prose max-w-none dark:prose-invert text-slate-700 dark:text-slate-200">
          {/* The API may provide HTML or plain text in description/content */}
          {activity.content ? (
            <div dangerouslySetInnerHTML={{ __html: activity.content }} />
          ) : (
            <p>
              {activity.description ||
                activity.summary ||
                "No additional content."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
