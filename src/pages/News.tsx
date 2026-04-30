import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { Pagination } from '../components/Pagination';

interface NewsCardItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[];
  title: string;
  description: string;
  href?: string;
  content?: string;
}

const ITEMS_PER_PAGE = 9;

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newsList, setNewsList] = useState<NewsCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedId = searchParams.get('id');
  const selectedItem = selectedId ? newsList.find(n => String(n.id) === selectedId) || null : null;

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/news');
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const mapped: NewsCardItem[] = raw.map((item: any) => {
          let extraUrls: string[] = [];
          try {
            if (item.image_urls && typeof item.image_urls === 'string') {
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
            : '';

          const imageUrls = [
            ...(primaryImageUrl ? [primaryImageUrl] : []),
            ...extraUrls.map((u: string) => resolveMediaUrl(u)),
          ].filter(Boolean);

          return {
            id: item.id || '',
            title: item.title || 'Untitled News',
            description: item.description || '',
            content: item.content || item.description || '',
            href: item.href || '#',
            imageUrl: imageUrls[0] || '',
            imageUrls,
          };
        });

        setNewsList(mapped);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNews();
  }, []);

  const totalPages = Math.ceil(newsList.length / ITEMS_PER_PAGE);
  const paginatedNews = newsList.slice(
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
            University News
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            Stay updated with the latest happenings around campus.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-emerald-700 dark:text-emerald-400 animate-pulse text-lg font-medium">
            Loading news...
          </div>
        ) : newsList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No news available at this time.
          </div>
        ) : selectedItem ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeDetail}
              className="mb-6 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              Back to News
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

            {selectedItem.imageUrls && selectedItem.imageUrls.length > 1 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedItem.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${selectedItem.title} ${i + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedNews.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                    <span className="mb-3 w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      News
                    </span>
                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mb-6 line-clamp-3 flex-1 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                    <button
                      onClick={() => openDetail(item.id)}
                      className="mt-auto w-fit font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Read more &rarr;
                    </button>
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