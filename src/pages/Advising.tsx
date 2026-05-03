import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GoogleDriveLinkCard } from "../components/GoogleDriveLinkCard";
import { InternationalStudentsData } from "./InternationalStudentsData";
import { Reports } from "./Reports";
import { apiClient } from "../services/api";

type AdvisingTab =
  | "resources"
  | "announcements"
  | "students-data"
  | "statistical-reports";

type AnnouncementItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
};

const ADVISING_RESOURCE_CARDS = [
  {
    title: "Academic advising",
    description:
      "Open the academic advising guide and related support materials.",
    to: "/academic-advising",
  },
  {
    title: "Registration",
    description: "Go to the registration guides and Banner registration help.",
    to: "/registeration",
  },
  {
    title: "Schedules",
    description:
      "Check current lecture schedules and exam timetable documents.",
    to: "/schedules",
  },
];

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

const parseAnnouncementList = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  const asObject = getNestedObject(payload);
  if (!asObject) {
    return [];
  }

  if (Array.isArray(asObject.data)) {
    return asObject.data as Record<string, unknown>[];
  }

  const nestedData = getNestedObject(asObject.data);
  if (nestedData && Array.isArray(nestedData.items)) {
    return nestedData.items as Record<string, unknown>[];
  }

  if (Array.isArray(asObject.items)) {
    return asObject.items as Record<string, unknown>[];
  }

  return [];
};

const getImageUrl = (item: Record<string, unknown>): string => {
  const directImage =
    toStringValue(item.imageUrl) ||
    toStringValue(item.image_url) ||
    toStringValue(item.thumbnailUrl) ||
    toStringValue(item.thumbnail_url);

  if (directImage) {
    return directImage;
  }

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
  if (!dateValue) {
    return "";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export default function AdvisingPage() {
  const [searchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");

  const tabParam = searchParams.get("tab");
  const activeTab: AdvisingTab =
    tabParam === "announcements"
      ? "announcements"
      : tabParam === "students-data"
        ? "students-data"
        : tabParam === "statistical-reports"
          ? "statistical-reports"
          : "resources";

  useEffect(() => {
    if (activeTab !== "announcements") {
      return;
    }

    let cancelled = false;

    const fetchAnnouncements = async () => {
      setIsLoadingAnnouncements(true);
      setAnnouncementsError("");

      try {
        const response = await apiClient.get("/api/advising_announcements");
        const rows = parseAnnouncementList(response.data);

        const mapped = rows.map((item, index) => {
          const id =
            toStringValue(item.id) ||
            toStringValue(item.documentId) ||
            `announcement-${index}`;
          const title =
            toStringValue(item.title) ||
            toStringValue(item.name) ||
            "Advising Announcement";
          const description =
            toStringValue(item.description) ||
            toStringValue(item.content) ||
            toStringValue(item.body);
          const rawDate =
            toStringValue(item.date) ||
            toStringValue(item.publishedAt) ||
            toStringValue(item.createdAt);

          return {
            id,
            title,
            description,
            date: formatAnnouncementDate(rawDate),
            imageUrl: getImageUrl(item),
            imageAlt: `${title} image`,
          };
        });

        if (!cancelled) {
          setAnnouncements(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          setAnnouncements([]);
          setAnnouncementsError(
            error instanceof Error
              ? error.message
              : "Failed to load announcements.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAnnouncements(false);
        }
      }
    };

    void fetchAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Advising
            </h1>
          </div>
        </div>

        {activeTab === "statistical-reports" ? (
          <Reports userName="International Student Affairs" />
        ) : activeTab === "students-data" ? (
          <InternationalStudentsData />
        ) : activeTab === "resources" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {ADVISING_RESOURCE_CARDS.map((card) => (
                <GoogleDriveLinkCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  to={card.to}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 sm:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Announcements
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Latest advising notices from the API.
              </p>
            </div>

            {isLoadingAnnouncements ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="animate-pulse font-medium text-emerald-600 dark:text-emerald-400">
                    Loading announcements...
                  </p>
                </div>
              </div>
            ) : announcementsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {announcementsError}
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                No announcements available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {announcements.map((item) => (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20"
                  >
                    <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-emerald-600/90 px-4 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-md">
                        {item.date}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6 sm:p-8">
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-base text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>

                      <div className="mt-8 flex items-center justify-between mt-auto">
                        <Link
                          to={`/announcements/${item.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                          Read More
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
