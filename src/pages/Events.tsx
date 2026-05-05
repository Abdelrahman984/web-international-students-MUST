import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";
import { resolveMediaUrl } from "../utils/media";
import { Pagination } from "../components/Pagination";

interface EventCardItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[];
  day: string;
  month: string;
  timeRange: string;
  title: string;
  description: string;
  href?: string;
  content?: string;
  locationName?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 9;

const normalizeHref = (value: unknown): string => {
  if (typeof value !== "string") return "";

  const cleaned = value.trim().replaceAll("`", "");
  return cleaned;
};


export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eventsList, setEventsList] = useState<EventCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const selectedId = searchParams.get("id");
  const selectedItem = selectedId
    ? eventsList.find((e) => String(e.id) === selectedId) || null
    : null;

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/events");
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const mapped: EventCardItem[] = raw.map((item: any) => {
          let extraUrls: string[] = [];
          try {
            if (item.image_urls && typeof item.image_urls === "string") {
              const parsed = JSON.parse(item.image_urls);
              if (Array.isArray(parsed)) extraUrls = parsed;
            } else if (Array.isArray(item.image_urls)) {
              extraUrls = item.image_urls;
            }
          } catch {
            extraUrls = [];
          }

          const primaryImageUrl = item.image_url
            ? resolveMediaUrl(item.image_url)
            : "";

          const imageUrls = [
            ...(primaryImageUrl ? [primaryImageUrl] : []),
            ...extraUrls.map((u: string) => resolveMediaUrl(u)),
          ].filter(Boolean);

          return {
            id: item.id || "",
            title: item.title || "Untitled Event",
            description: item.description || "",
            content: item.content || item.description || "",
            day: item.day || "",
            month: item.month || "",
            timeRange: item.time_range || item.timeRange || "",
            href: normalizeHref(item.href) || "#",
            imageUrl: imageUrls[0] || "",
            imageUrls,
            locationName: item.location_name || item.locationName || "",
            createdAt: item.created_at || item.createdAt || "",
          };
        });

        mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();

          if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
          if (Number.isNaN(dateA)) return 1;
          if (Number.isNaN(dateB)) return -1;
          return dateB - dateA;
        });

        setEventsList(mapped);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  const totalPages = Math.ceil(eventsList.length / ITEMS_PER_PAGE);
  const paginatedEvents = eventsList.slice(
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
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Upcoming Events
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            Don't miss out on important academic and social events.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-emerald-700 dark:text-emerald-400 animate-pulse text-lg font-medium">
            Loading events...
          </div>
        ) : eventsList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No events available at this time.
          </div>
        ) : selectedItem ? (
          <section className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {/* Sticky Back Button */}
            <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
              <button
                type="button"
                onClick={closeDetail}
                className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30"
              >
                <i className="fa-solid fa-arrow-left text-lg" /> Back to Events
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
                      <i className="fa-regular fa-calendar-days text-5xl text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="w-full flex flex-col">
                  <h3 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 mt-2">
                    {selectedItem.title}
                  </h3>

                  <div className="mb-8 flex flex-wrap justify-start gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-base font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-sm">
                      <i className="fa-regular fa-calendar" />{" "}
                      {selectedItem.day} {selectedItem.month}
                    </span>
                    {selectedItem.timeRange && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-base font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm">
                        <i className="fa-regular fa-clock" />{" "}
                        {selectedItem.timeRange}
                      </span>
                    )}
                    {selectedItem.locationName && (
                      <a
                        href={selectedItem.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-base font-bold text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 shadow-sm hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
                      >
                        <i className="fa-solid fa-location-dot" />{" "}
                        {selectedItem.locationName}
                      </a>
                    )}
                  </div>

                  {selectedItem.content || selectedItem.description ? (
                    <div
                      className="prose prose-lg max-w-none text-justify leading-[1.8] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-bold prose-a:text-emerald-600"
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedItem.content || selectedItem.description,
                      }}
                    />
                  ) : (
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                      No additional details available for this event.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedItem.imageUrls && selectedItem.imageUrls.length > 1 && (
              <div className="mt-20 border-t border-slate-200 pt-16 dark:border-slate-800">
                <h4 className="mb-10 text-center text-[2rem] font-bold text-[#009b4d]">
                  Gallery
                </h4>

                {/* Horizontal Swipe Gallery (Matches Main Cards exactly: 3 per row on Desktop, 2 on Tablet, 1 on Mobile) */}
                <div className="flex w-full snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedItem.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative flex-none w-[85vw] md:w-[calc(50%-16px)] lg:w-[calc(33.333333%-21.33px)] snap-start overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={url}
                          alt={`${selectedItem.title} gallery ${i + 1}`}
                          className="h-full w-full object-cover pointer-events-none"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedEvents.map((item) => (
                <article
                  key={item.id}
                  className="group relative h-[400px] w-full overflow-hidden rounded-[16px] shadow-lg cursor-pointer"
                  onClick={() => openDetail(item.id)}
                >
                  {/* Background Image */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500">
                      <i className="fa-regular fa-calendar-days text-4xl" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-500 group-hover:from-[#11203d]/95 group-hover:via-[#162a52]/80 group-hover:to-[#162a52]/40" />

                  {/* Static Top-Left Badge (Does NOT move on hover) */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col items-center justify-center rounded-xl bg-white/95 px-3 py-2 text-center shadow-md backdrop-blur-sm dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50">
                    <span className="text-xl font-black leading-none text-slate-900 dark:text-white">
                      {item.day}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      {item.month}
                    </span>
                    {item.timeRange && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-1 w-full">
                        {item.timeRange}
                      </span>
                    )}
                  </div>

                  {/* Location Top-Right Badge */}
                  {item.locationName && (
                    <div className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-md backdrop-blur-sm dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50">
                      <span className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot text-purple-500" />
                        {item.locationName}
                      </span>
                    </div>
                  )}

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 flex h-full flex-col items-center justify-end p-6">
                    {/* translate-y-[44px] perfectly hides the "Read more" button below the card bound. */}
                    <div className="flex w-full flex-col items-center transform translate-y-[44px] transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:translate-y-0">
                      <h3 className="mb-3 text-center text-xl font-bold text-white drop-shadow-md line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-justify text-sm font-medium leading-relaxed text-slate-200 drop-shadow-sm line-clamp-2 w-full px-2">
                        {item.description}
                      </p>

                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 text-base font-bold text-emerald-400 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hover:text-emerald-300 drop-shadow-md"
                      >
                        Read more{" "}
                        <i className="fa-solid fa-arrow-right text-sm" />
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
          </>
        )}
      </div>
    </div>
  );
}
