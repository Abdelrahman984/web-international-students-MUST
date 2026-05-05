import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiClient } from "../services/api";
import { Pagination } from "../components/Pagination";

const ITEMS_PER_PAGE = 9;

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const getNestedObject = (
  value: unknown,
): Record<string, unknown> | undefined => {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
};

const parseAnnouncementList = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  const asObject = getNestedObject(payload);
  if (!asObject) return [];
  if (Array.isArray(asObject.data))
    return asObject.data as Record<string, unknown>[];
  const nestedData = getNestedObject(asObject.data);
  if (nestedData && Array.isArray(nestedData.items))
    return nestedData.items as Record<string, unknown>[];
  if (Array.isArray(asObject.items))
    return asObject.items as Record<string, unknown>[];
  return [];
};

type AnnouncementItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  urgent?: boolean;
  createdAt: string;
};

export function Announcements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/advising_announcements");
        const rows = parseAnnouncementList(response.data);

        const mapped: AnnouncementItem[] = rows.map((item, index) => {
          const id =
            toStringValue(item.id) ||
            toStringValue(item.documentId) ||
            `announcement-${index}`;
          const title =
            toStringValue(item.title) ||
            toStringValue(item.name) ||
            "Announcement";
          const description =
            toStringValue(item.description) ||
            toStringValue(item.excerpt) ||
            toStringValue(item.content) ||
            toStringValue(item.body);
          const rawDate =
            toStringValue(item.date) ||
            toStringValue(item.publishedAt) ||
            toStringValue(item.createdAt);

          const createdAt =
            toStringValue(item.created_at) ||
            toStringValue(item.createdAt) ||
            rawDate;

          return {
            id,
            title,
            description,
            date: rawDate,
            category: toStringValue(item.category),
            urgent: Boolean(item.urgent),
            createdAt,
          };
        });

        // Sort by created_at descending
        mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
          }
          // Fallback to sorting by id or something else if dates are invalid
          return b.id.localeCompare(a.id);
        });

        if (!cancelled) {
          setItems(mapped);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void fetchItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
            Announcements
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            Latest updates and notices
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-emerald-700 dark:text-emerald-400 animate-pulse text-lg font-medium">
            Loading announcements...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No announcements available at this time.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedItems.map((item) => {
                return (
                  <article
                    key={item.id}
                    className={`group flex flex-col overflow-hidden rounded-2xl border ${item.urgent ? "border-red-300 shadow-red-100 dark:border-red-900 dark:shadow-none" : "border-slate-200"} bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900`}
                  >
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        {item.category ? (
                          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                            {item.category}
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Announcement
                          </span>
                        )}
                        {item.urgent && (
                          <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700 dark:bg-red-500/20 dark:text-red-300">
                            Urgent
                          </span>
                        )}
                      </div>

                      <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                        <i className="fa-regular fa-calendar mr-2" />
                        {item.date}
                      </p>

                      <p className="mb-6 line-clamp-3 flex-1 text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>

                      <Link
                        to={`/announcements/${item.id}`}
                        className="mt-auto w-fit font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Read more &rarr;
                      </Link>
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
          </>
        )}
      </div>
    </div>
  );
}
