import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { Pagination } from '../components/Pagination';

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
}

const ITEMS_PER_PAGE = 9;

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eventsList, setEventsList] = useState<EventCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedId = searchParams.get('id');
  const selectedItem = selectedId ? eventsList.find(e => String(e.id) === selectedId) || null : null;

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/events');
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const mapped: EventCardItem[] = raw.map((item: any) => {
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
            title: item.title || 'Untitled Event',
            description: item.description || '',
            content: item.content || item.description || '',
            day: item.day || '',
            month: item.month || '',
            timeRange: item.time_range || item.timeRange || '',
            href: item.href || '#',
            imageUrl: imageUrls[0] || '',
            imageUrls,
          };
        });

        setEventsList(mapped);
      } catch (error) {
        console.error('Error fetching events:', error);
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
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeDetail}
              className="mb-6 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              Back to Events
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

            <div className="mb-6 flex gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <i className="fa-regular fa-calendar text-emerald-600 dark:text-emerald-400" />
                <span>{selectedItem.day} {selectedItem.month}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <i className="fa-regular fa-clock text-emerald-600 dark:text-emerald-400" />
                <span>{selectedItem.timeRange}</span>
              </div>
            </div>

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

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 flex h-full flex-col items-center justify-end p-6">
                    {/* translate-y-[44px] perfectly hides the "Read more" button below the card bound. */}
                    <div className="flex w-full flex-col items-center transform translate-y-[44px] transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:translate-y-0">
                      
                      <span className="mb-3 w-fit rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold uppercase text-white backdrop-blur-sm">
                        Event
                      </span>
                      
                      <h3 className="mb-3 text-center text-xl font-bold text-white drop-shadow-md line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-center text-sm font-medium leading-relaxed text-slate-200 drop-shadow-sm line-clamp-2 w-full">
                        {item.description}
                      </p>

                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 text-base font-bold text-emerald-400 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hover:text-emerald-300 drop-shadow-md"
                      >
                        Read more <i className="fa-solid fa-arrow-right text-sm" />
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