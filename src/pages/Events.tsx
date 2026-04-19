import { useEffect, useState } from 'react';
import { RelatedEventsCarousel } from '../components/EventsNewsCarousels';
import { getEventsList, type EventCardItem } from '../services/cmsApi';

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<EventCardItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEventsList();
        setEventsList(events);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsList([]);
      }
    };

    void fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Upcoming Events</h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">Don't miss out on important academic and social events.</p>
        </div>
        <RelatedEventsCarousel events={eventsList} />
      </div>
    </div>
  );
}