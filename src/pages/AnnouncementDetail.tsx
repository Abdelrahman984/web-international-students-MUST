import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, ChevronRight } from "lucide-react";
import { apiClient } from "../services/api";

interface AnnouncementDetail {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
  author?: string;
}

const DEFAULT_ANNOUNCEMENT_IMAGE = "/must-announcement-default.png";

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const getNestedObject = (
  value: unknown,
): Record<string, unknown> | undefined => {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
};

const getImageUrl = (item: Record<string, unknown>): string => {
  const directImage =
    toStringValue(item.imageUrl) ||
    toStringValue(item.image_url) ||
    toStringValue(item.thumbnailUrl) ||
    toStringValue(item.thumbnail_url);

  if (directImage) return directImage;

  const image = getNestedObject(item.image);
  const imageUrl = image
    ? toStringValue(image.url) ||
      toStringValue(getNestedObject(image.data)?.url) ||
      toStringValue(
        getNestedObject(getNestedObject(image.data)?.attributes)?.url,
      )
    : "";

  return imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE;
};

const formatAnnouncementDate = (dateValue: string): string => {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncementDetail = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetching all announcements and finding the specific one
        // This is a fallback if the API doesn't support fetching by ID directly
        const response = await apiClient.get("/api/advising_announcements");

        let items: Record<string, unknown>[] = [];

        const payload = response.data;
        if (Array.isArray(payload)) {
          items = payload;
        } else {
          const asObject = getNestedObject(payload);
          if (asObject) {
            if (Array.isArray(asObject.data)) items = asObject.data;
            else {
              const nestedData = getNestedObject(asObject.data);
              if (nestedData && Array.isArray(nestedData.items))
                items = nestedData.items;
              else if (Array.isArray(asObject.items)) items = asObject.items;
            }
          }
        }

        const foundItem = items.find(
          (item) =>
            toStringValue(item.id) === id ||
            toStringValue(item.documentId) === id,
        );

        if (!foundItem) {
          throw new Error("Announcement not found.");
        }

        const title =
          toStringValue(foundItem.title) ||
          toStringValue(foundItem.name) ||
          "Advising Announcement";
        const rawDate =
          toStringValue(foundItem.date) ||
          toStringValue(foundItem.publishedAt) ||
          toStringValue(foundItem.createdAt);

        // Use full content if available, fallback to description
        const content =
          toStringValue(foundItem.content) ||
          toStringValue(foundItem.body) ||
          toStringValue(foundItem.description);

        if (!cancelled) {
          setAnnouncement({
            id: id!,
            title,
            description: toStringValue(foundItem.description),
            content,
            date: formatAnnouncementDate(rawDate),
            imageUrl: getImageUrl(foundItem),
            imageAlt: `${title} image`,
            author: toStringValue(foundItem.author) || "MUST Advising Team",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load announcement details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      void fetchAnnouncementDetail();
    } else {
      setError("Invalid announcement ID.");
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center space-x-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link
            to="/academics"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Academics
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to="/advising?tab=announcements"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Advising
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
            {announcement?.title || "Announcement Details"}
          </span>
        </nav>

        <div className="mb-8 flex justify-start">
          <Link
            to="/advising?tab=announcements"
            className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-slate-100 hover:shadow-md hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white no-underline"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Announcements
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="animate-pulse font-medium text-emerald-600 dark:text-emerald-400">
                Loading announcement details...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 py-16 text-center dark:border-red-900/50 dark:bg-red-900/20">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/50">
              <p className="text-4xl">⚠️</p>
            </div>
            <h3 className="mt-4 text-xl font-bold text-red-800 dark:text-red-400">
              Oops! Something went wrong
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
            <Link
              to="/advising?tab=announcements"
              className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Return to Advising
            </Link>
          </div>
        ) : announcement ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="w-full sticky top-32 lg:order-last">
              <img
                src={announcement.imageUrl}
                alt={announcement.imageAlt}
                className="w-full rounded-[20px] object-cover shadow-lg"
              />
            </div>

            <div className="w-full flex flex-col">
              <h1 className="mb-6 mt-2 text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
                {announcement.title}
              </h1>

              <div className="mb-8 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-base font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-sm">
                  <Calendar className="h-4 w-4" />
                  {announcement.date}
                </span>
                {announcement.author && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-base font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm">
                    <User className="h-4 w-4" />
                    {announcement.author}
                  </span>
                )}
              </div>

              <div className="prose prose-lg max-w-none text-left leading-[1.8] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-bold prose-a:text-emerald-600">
                <div
                  dangerouslySetInnerHTML={{
                    __html: announcement.content || announcement.description,
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
