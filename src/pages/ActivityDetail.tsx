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
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-12">
        <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
          <Link
            to="/activities"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to activities
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="w-full sticky top-32 lg:order-last">
            {imageUrl ? (
              <img
                src={resolveMediaUrl(imageUrl)}
                alt={activity.title}
                className="w-full rounded-[20px] object-cover shadow-lg"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-[20px] shadow-lg flex items-center justify-center">
                <i className="fa-regular fa-image text-5xl text-slate-400" />
              </div>
            )}
          </div>

          <div className="w-full flex flex-col">
            <h1 className="mb-6 mt-2 text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              {activity.title}
            </h1>

            <div className="prose prose-lg max-w-none text-left leading-[1.8] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-bold prose-a:text-emerald-600">
              {/* The API may provide HTML or plain text in description/content */}
              {activity.content ? (
                <div dangerouslySetInnerHTML={{ __html: activity.content }} />
              ) : (
                <p className="text-xl text-slate-600 dark:text-slate-300">
                  {activity.description ||
                    activity.summary ||
                    "No additional content."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
