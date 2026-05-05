import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  ChevronRight,
  FileText,
  Download,
  X,
} from "lucide-react";
import { apiClient, getCurrentApiBaseUrl } from "../services/api";

interface AnnouncementDetail {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
  author?: string;
  photoPaths?: string[];
  filePath?: string;
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

const getFullUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = getCurrentApiBaseUrl();
  const separator = path.startsWith("/") ? "" : "/";
  return `${baseUrl}${separator}${path}`;
};

const getImageUrl = (item: Record<string, unknown>): string => {
  const directImage =
    toStringValue(item.imageUrl) ||
    toStringValue(item.image_url) ||
    toStringValue(item.thumbnailUrl) ||
    toStringValue(item.thumbnail_url) ||
    toStringValue(item.thumbnail_path);

  let finalImage = directImage;

  if (!finalImage) {
    const image = getNestedObject(item.image);
    finalImage = image
      ? toStringValue(image.url) ||
        toStringValue(getNestedObject(image.data)?.url) ||
        toStringValue(
          getNestedObject(getNestedObject(image.data)?.attributes)?.url,
        )
      : "";
  }

  if (finalImage && !finalImage.startsWith("http")) {
    finalImage = getFullUrl(finalImage);
  }

  return finalImage || DEFAULT_ANNOUNCEMENT_IMAGE;
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
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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

        const photoPathsRaw = toStringValue(foundItem.photo_paths);
        let photoPaths: string[] = [];
        if (photoPathsRaw) {
          try {
            photoPaths = JSON.parse(photoPathsRaw);
          } catch (e) {
            // ignore
          }
        } else if (Array.isArray(foundItem.photo_paths)) {
          photoPaths = foundItem.photo_paths.map(toStringValue);
        }

        const filePath = toStringValue(foundItem.file_path);

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
            photoPaths,
            filePath,
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="w-full sticky top-32 lg:col-span-5 lg:order-last flex flex-col gap-6">
              <img
                src={announcement.imageUrl}
                alt={announcement.imageAlt}
                className="w-full rounded-[20px] object-cover shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setExpandedImage(announcement.imageUrl)}
              />

              {announcement.photoPaths &&
                announcement.photoPaths.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {announcement.photoPaths.map((photoPath, index) => {
                      const fullPath = getFullUrl(photoPath);
                      return (
                        <img
                          key={index}
                          src={fullPath}
                          alt={`${announcement.title} photo ${index + 1}`}
                          className="w-full h-48 rounded-2xl object-cover shadow-md transition-all hover:opacity-90 hover:scale-[1.02] cursor-pointer"
                          onClick={() => setExpandedImage(fullPath)}
                        />
                      );
                    })}
                  </div>
                )}
            </div>

            <div className="w-full flex flex-col lg:col-span-7">
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

              {announcement.filePath && (
                <div className="mt-8">
                  <a
                    href={getFullUrl(announcement.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 rounded-2xl bg-emerald-50 px-6 py-4 text-emerald-800 transition-all hover:bg-emerald-100 hover:shadow-md dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40 no-underline shadow-sm border border-emerald-100 dark:border-emerald-800/30 w-full sm:w-auto"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200/50 dark:bg-emerald-800/50">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">Attached File</span>
                      <span className="text-sm font-medium opacity-80">
                        Click to view or download
                      </span>
                    </div>
                    <Download className="ml-auto h-6 w-6 sm:ml-4 opacity-70" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setExpandedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(null);
            }}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-h-[65vh] max-w-[65vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
