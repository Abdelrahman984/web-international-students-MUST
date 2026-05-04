import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";
import type { ActivityType } from "../services/cmsApi";
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

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const selectedId = searchParams.get("id");

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/activities");
        const data =
          response.data?.data || response.data?.items || response.data;
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => {
            const resolvedUrl = resolveMediaUrl(
              item.image_url || item.imageUrl || "",
            );
            return {
              id: item.id || "",
              title: item.title || "",
              description: item.description || "",
              content: item.content || item.description || "",
              imageUrl: resolvedUrl,
              imageUrls: item.imageUrls || (resolvedUrl ? [resolvedUrl] : []),
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

  const selectedItem = selectedId
    ? activities.find((a) => String(a.id) === selectedId) || null
    : null;

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const paginatedActivities = activities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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
    nextParams.set("page", page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <header className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {routeConfig.title}
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            {routeConfig.subtitle}
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            Loading activities...
          </div>
        ) : activities.length ? (
          <div className="space-y-8">
            {selectedItem ? (
              <section className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 animate-in fade-in duration-500 slide-in-from-bottom-4">
                {/* Sticky Back Button */}
                <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30"
                  >
                    <i className="fa-solid fa-arrow-left text-lg" /> Back to{" "}
                    {routeConfig.title}
                  </button>
                </div>

                <div className="mx-auto max-w-6xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="w-full sticky top-32 lg:order-last">
                      {selectedItem.imageUrl ? (
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.title}
                          className="w-full object-cover rounded-[20px] shadow-lg"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-[20px] shadow-lg flex items-center justify-center">
                          <i className="fa-regular fa-image text-5xl text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col">
                      <h3 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 mt-2">
                        {selectedItem.title}
                      </h3>

                      {selectedItem.content || selectedItem.description ? (
                        <div
                          className="prose prose-lg max-w-none text-left leading-[1.8] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-bold prose-a:text-emerald-600"
                          dangerouslySetInnerHTML={{
                            __html:
                              selectedItem.content || selectedItem.description,
                          }}
                        />
                      ) : (
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                          No additional details available for this activity.
                        </p>
                      )}

                      {selectedItem.href && selectedItem.href !== "#" && (
                        <div className="mt-12 flex justify-start">
                          <a
                            href={selectedItem.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-md transition-all hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg"
                          >
                            Visit Official Activity Page
                            <i className="fa-solid fa-external-link ml-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedItem.imageUrls &&
                  selectedItem.imageUrls.length > 1 && (
                    <div className="mt-20 border-t border-slate-200 pt-16 dark:border-slate-800">
                      <h4 className="mb-10 text-center text-[2rem] font-bold text-[#009b4d]">
                        Gallery
                      </h4>

                      {/* Horizontal Swipe Gallery */}
                      <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {selectedItem.imageUrls.map(
                          (url: string, i: number) => (
                            <div
                              key={i}
                              className="relative flex-none w-[90vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333333%-16px)] snap-start overflow-hidden bg-slate-100 dark:bg-slate-800"
                            >
                              <div className="aspect-[3/2] w-full overflow-hidden">
                                <img
                                  src={url}
                                  alt={`${selectedItem.title} gallery ${i + 1}`}
                                  className="h-full w-full object-cover pointer-events-none"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </section>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedActivities.map((item, idx) => {
                    // Extract a clean excerpt for the hover reveal
                    const excerpt =
                      item.description?.substring(0, 120) +
                        (item.description?.length > 120 ? "..." : "") || "";

                    return (
                      <article
                        key={item.id || idx}
                        onClick={() => openDetail(item.id)}
                        className="group relative h-[450px] w-full cursor-pointer overflow-hidden rounded-[24px] bg-slate-200 shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-800"
                      >
                        {/* Background Image with Zoom Effect */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500">
                            <i className="fa-solid fa-users-rays text-4xl" />
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-500 group-hover:from-[#11203d]/95 group-hover:via-[#162a52]/90 group-hover:to-[#162a52]/80" />

                        {/* Badges */}
                        <span className="absolute top-6 left-6 z-10 rounded-full bg-emerald-600/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-lg">
                          {item.activityType || "General"}
                        </span>

                        {/* Content Container */}
                        <div className="absolute inset-x-0 bottom-0 flex h-full flex-col items-center justify-end p-8">
                          <div className="flex w-full flex-col items-center transform translate-y-[80px] transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:-translate-y-10">
                            <h3 className="text-center text-2xl font-black uppercase tracking-wider text-white drop-shadow-lg">
                              {item.title}
                            </h3>

                            {/* Excerpt revealed on hover */}
                            <div className="mt-4 grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:grid-rows-[1fr] w-full">
                              <div className="overflow-hidden">
                                <p className="text-center text-base font-medium leading-relaxed text-slate-100 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100 px-4">
                                  {excerpt}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="mt-6 text-xl font-bold text-emerald-400 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hover:text-emerald-300 drop-shadow-md"
                            >
                              See More
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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
