import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAnnouncements } from '../services/cmsApi';
import { Pagination } from '../components/Pagination';
import { resolveMediaUrl } from '../utils/media';
import type { Announcements as AnnouncementsType } from '../types/strapi';

const ITEMS_PER_PAGE = 9;

export function Announcements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcementsData, setAnnouncementsData] = useState<AnnouncementsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedId = searchParams.get('id');

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const data = await getAnnouncements();
        setAnnouncementsData(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchItems();
  }, []);

  const items = announcementsData?.announcements_items || [];
  
  // We use index as ID if there is no id field in announcements_items
  const selectedItem = selectedId ? items[parseInt(selectedId, 10)] || null : null;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openDetail = (index: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("id", index.toString());
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
            {announcementsData?.title || 'Announcements'}
          </h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
            {announcementsData?.subtitle || 'Latest updates and notices'}
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
        ) : selectedItem ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Sticky Back Button */}
            <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
              <button
                type="button"
                onClick={closeDetail}
                className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30"
              >
                <i className="fa-solid fa-arrow-left text-lg" /> Back to Announcements
              </button>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {selectedItem.title}
            </h3>

            {selectedItem.category && (
               <span className="mb-4 inline-block rounded-md bg-emerald-700 px-3 py-1 text-sm font-semibold text-white uppercase dark:bg-emerald-500">
                 {selectedItem.category}
               </span>
            )}

            {selectedItem.date && (
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                <i className="fa-regular fa-calendar mr-2" />
                {selectedItem.date}
              </p>
            )}

            <div
              className="prose mt-6 max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{
                __html: selectedItem.content || selectedItem.excerpt || 'No additional details.',
              }}
            />

            {selectedItem.attachments?.data && selectedItem.attachments.data.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Attachments</h4>
                {selectedItem.attachments.data.map((att: any, idx: number) => (
                  <a
                    key={idx}
                    href={resolveMediaUrl(att.attributes.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <i className="fa-solid fa-paperclip" />
                    {att.attributes.name}
                  </a>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedItems.map((item, idx) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                return (
                  <article
                    key={globalIndex}
                    className={`group flex flex-col overflow-hidden rounded-2xl border ${item.urgent ? 'border-red-300 shadow-red-100 dark:border-red-900 dark:shadow-none' : 'border-slate-200'} bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900`}
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
                        {item.excerpt || item.content}
                      </p>
                      
                      <button
                        onClick={() => openDetail(globalIndex)}
                        className="mt-auto w-fit font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Read more &rarr;
                      </button>
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
