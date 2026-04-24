import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/api";

type ImportantLink = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

function resolveThumbnail(imagePath: string | null): string | null {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return imagePath;
}

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
        const response = await apiClient.get('/api/Links');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.items || [];
        
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
              const thumbnail = resolveThumbnail(item.image_path);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0d1628]"
                >
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={item.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500 dark:bg-white/5 dark:text-slate-300">
                      No thumbnail
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.description || "No description available."}
                    </p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-[#1f3769] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#294b8f]"
                    >
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
