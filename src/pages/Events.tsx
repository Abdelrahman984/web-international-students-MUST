import { useEffect, useState } from 'react';
import { RelatedEventsCarousel } from '../components/EventsNewsCarousels';
import { apiClient } from '../services/api';
import { resolveMediaUrl } from '../utils/media';

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
}

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<EventCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/events');
        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const mapped: EventCardItem[] = raw.map((item: any) => {
          // Swagger: events { image_url, image_urls, href, title, description, day, month, time_range }
          // image_urls is a JSON string of extra images stored by admin
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
        ) : (
          <RelatedEventsCarousel events={eventsList} />
        )}
      </div>
    </div>
  );
}