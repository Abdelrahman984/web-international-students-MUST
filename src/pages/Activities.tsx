import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";
import type { ActivityType, NewsCardItem } from "../services/cmsApi";
import { resolveMediaUrl } from "../utils/media";
import { Pagination } from "../components/Pagination";

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

const ITEMS_PER_PAGE = 9;

export default function ActivitiesPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeConfig = useMemo(() => {
    return (
      ACTIVITY_ROUTE_MAP[location.pathname] || ACTIVITY_ROUTE_MAP["/activities"]
    );
  }, [location.pathname]);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedId = searchParams.get('id');

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/activities");
        const data =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => {
            const resolvedUrl = resolveMediaUrl(item.image_url || item.imageUrl || "");
            return {
              id: item.id || "",
              title: item.title || "",
              description: item.description || "",
              content: item.content || item.description || "",
              imageUrl: resolvedUrl,
              imageUrls: resolvedUrl ? [resolvedUrl] : [],
              href: item.href || item.link || "#",
              activityType: item.activity_type || "",
            };
          });
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

  const selectedItem = selectedId ? activities.find((a) => String(a.id) === selectedId) || null : null;

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const paginatedActivities = activities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openDetail = (id: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("id", id);
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetail = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("id");
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {selectedItem ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={closeDetail}
                  className="mb-6 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                >
                  Back to {routeConfig.title}
                </button>

                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  {selectedItem.title}
                </h3>

                {selectedItem.imageUrl && (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="mb-8 max-h-[500px] w-full object-cover rounded-xl"
                  />
                )}

                <div
                  className="prose mt-6 max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: selectedItem.content || selectedItem.description,
                  }}
                />

                {selectedItem.href && selectedItem.href !== "#" && (
                  <div className="mt-8">
                    <a
                      href={selectedItem.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      Visit External Link
                    </a>
                  </div>
                )}
              </section>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedActivities.map((item, idx) => (
                    <article
                      key={item.id || idx}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-[#071123]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <span className="absolute top-4 left-4 z-10 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm dark:bg-emerald-500">
                          {item.activityType
                            ? item.activityType
                            : "General"}
                        </span>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mb-6 line-clamp-3 flex-1 text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <button
                            onClick={() => openDetail(item.id)}
                            className="w-fit font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            Read more &rarr;
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
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
