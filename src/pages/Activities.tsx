import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
// ActivitiesSection replaced by card grid layout
import { AdDetailCard } from "../components/AdDetailCard";
import { apiClient } from "../services/api";
import type { ActivityType, NewsCardItem } from "../services/cmsApi";
import { resolveMediaUrl } from "../utils/media";

type ActivityRouteConfig = {
  title: string;
  subtitle: string;
  activityType?: ActivityType;
};

const ACTIVITY_ROUTE_MAP: Record<string, ActivityRouteConfig> = {
  "/activities": {
    title: "Student Activities",
    subtitle:
      "Discover campus activities across sports, cultural, art, and student clubs.",
  },
  "/cultural": {
    title: "Cultural Activities",
    subtitle: "Cultural programs and events for international students.",
    activityType: "cultural",
  },
  "/sports": {
    title: "Sports Activities",
    subtitle: "Sports activities and competitions on campus.",
    activityType: "sport",
  },
  "/art": {
    title: "Art Activities",
    subtitle: "Art-focused activities and creative initiatives.",
    activityType: "art",
  },
  "/student-clubs": {
    title: "Student Clubs",
    subtitle: "Student club activities and community programs.",
    activityType: "student club",
  },
};

export default function ActivitiesPage() {
  const location = useLocation();
  const [allActivities, setAllActivities] = useState<NewsCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeConfig = useMemo(() => {
    return (
      ACTIVITY_ROUTE_MAP[location.pathname] || ACTIVITY_ROUTE_MAP["/activities"]
    );
  }, [location.pathname]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/activities");
        const data =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const mapped: NewsCardItem[] = data.map((item: any) => ({
            id: item.id || "",
            title: item.title || "",
            description: item.description || "",
            imageUrl: resolveMediaUrl(item.image_url || item.imageUrl || ""),
            href: item.href || item.link || "#",
            activityType: item.activity_type || "",
          }));
          setAllActivities(mapped);
        } else {
          setAllActivities([]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setAllActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchActivities();
  }, []);

  const activities = useMemo(() => {
    if (!routeConfig.activityType) return allActivities;
    return allActivities.filter(
      (item) =>
        item.activityType?.toLowerCase() ===
        routeConfig.activityType?.toLowerCase(),
    );
  }, [allActivities, routeConfig.activityType]);

  const featuredActivity = activities[0];

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {routeConfig.title}
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            {routeConfig.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            Loading activities...
          </div>
        ) : activities.length ? (
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
                {routeConfig.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {activities.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`block overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow duration-150 dark:bg-[#071123] max-h-70 `}
                  >
                    {item.imageUrl ? (
                      <div className="relative">
                        <span className="absolute top-3 left-3 z-10 rounded-md bg-emerald-700 px-2 py-1 text-xs font-semibold text-white uppercase dark:bg-emerald-500">
                          {item.activityType
                            ? item.activityType.charAt(0).toUpperCase() +
                              item.activityType.slice(1)
                            : "General"}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className={"h-44 w-full object-cover"}
                        />
                      </div>
                    ) : null}

                    <div className="p-4">
                      {!item.imageUrl && (
                        <span className="mb-2 inline-block rounded-md bg-emerald-700 px-2 py-1 text-xs font-semibold text-white uppercase dark:bg-emerald-500">
                          {item.activityType
                            ? item.activityType.charAt(0).toUpperCase() +
                              item.activityType.slice(1)
                            : "General"}
                        </span>
                      )}

                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p
                        className="text-sm text-slate-600 dark:text-slate-300 truncate"
                        title={item.description}
                      >
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-300"
                        >
                          External link
                        </a>

                        <Link
                          to={`/activities/${item.id}`}
                          className="rounded bg-emerald-700 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          Read more
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No activities available yet.
          </div>
        )}
      </div>
    </div>
  );
}
