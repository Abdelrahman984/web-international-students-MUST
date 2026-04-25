import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/api";
import { resolveMediaUrl } from "../utils/media";

// Swagger schema: Links { id, title, description, linkUrl, photo, created_at, updated_at }
type ImportantLink = {
  id: string;
  title: string | null;
  description: string | null;
  linkUrl: string | null;
  photo: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function LinksPage() {
  const [items, setItems] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchImportantLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get("/api/Links");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        if (!isMounted) return;
        setItems(data as ImportantLink[]);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load important links.");
        setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchImportantLinks();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            University Links
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            Visit our important links.
          </p>
        </div>

        {loading && (
          <p className="text-center text-base font-medium text-slate-700 dark:text-slate-200">
            Loading links...
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-base font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && !hasItems && (
          <p className="text-center text-base font-medium text-slate-700 dark:text-slate-200">
            No links found.
          </p>
        )}

        {!loading && !error && hasItems && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              // Swagger field: photo (not image_path)
              const thumbnailSrc = item.photo
                ? resolveMediaUrl(item.photo)
                : null;
              // Swagger field: linkUrl (not href)
              const href = item.linkUrl || "#";
              const title = item.title || "Untitled Link";

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0d1628]"
                >
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={title}
                      className="h-48 w-full object-fit"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500 dark:bg-white/5 dark:text-slate-300">
                      <i className="fa-solid fa-link text-3xl text-slate-400 dark:text-slate-500" />
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h2>
                    {item.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    )}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f3769] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#294b8f]"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                      Open Link
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
