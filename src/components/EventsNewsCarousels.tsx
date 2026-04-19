import { useState } from 'react';

interface EventCardItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[];
  imageAlt?: string;
  day: string;
  month: string;
  timeRange: string;
  title: string;
  description: string;
  href?: string;
}

interface NewsCardItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[];
  imageAlt?: string;
  title: string;
  description: string;
  href?: string;
}

interface RelatedEventsCarouselProps {
  events: EventCardItem[];
  onSeeAllEvents?: () => void;
}

interface NewsCarouselProps {
  news: NewsCardItem[];
  badgeLabel?: string;
}

export function RelatedEventsCarousel({ events, onSeeAllEvents }: RelatedEventsCarouselProps) {
  return (
    <section className="w-full">
      {/* CHANGED: xl:grid-cols-3 and increased gap so cards are wider */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-12">
        {events.map((item) => (
          <article
            key={item.id}
            className="group w-full flex flex-col rounded-2xl border border-slate-200 bg-white transition-all duration-300 overflow-hidden shadow-sm hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-navy-700 dark:bg-navy-800/40"
          >
            <a href={item.href || '#'} className="block flex-1 flex flex-col">
              {/* CHANGED: Image height from 280px to 360px */}
              <div className="relative overflow-hidden bg-slate-100 h-[360px] dark:bg-navy-800">
                <CardImageSlider
                  imageUrls={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl]}
                  imageAlt={item.imageAlt || item.title}
                  keyPrefix={item.id}
                />

                <div className="absolute bottom-5 left-5 rounded-xl border border-slate-200 bg-white/95 px-6 py-4 text-center shadow-2xl backdrop-blur-sm dark:border-navy-600 dark:bg-navy-900/90">
                  <p className="text-5xl font-black leading-none text-slate-900 dark:text-white">{item.day}</p>
                  <p className="mt-1 text-base font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{item.month}</p>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ClockIcon className="h-4 w-4" />
                  {item.timeRange}
                </p>
                <h3 className="line-clamp-2 mb-4 text-3xl font-bold text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{item.title}</h3>
                <p className="line-clamp-3 flex-1 text-xl leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            </a>
          </article>
        ))}
      </div>

      {onSeeAllEvents && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onSeeAllEvents}
            className="rounded-full bg-emerald-600 px-12 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-500"
          >
            See All Events
          </button>
        </div>
      )}
    </section>
  );
}

export function NewsCarousel({ news, badgeLabel = 'News' }: NewsCarouselProps) {
  return (
    <section className="w-full">
      {/* CHANGED: xl:grid-cols-3 and increased gap so cards are wider */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-12">
        {news.map((item) => (
          <article
            key={item.id}
            className="group w-full flex flex-col rounded-2xl border border-slate-200 bg-white transition-all duration-300 overflow-hidden shadow-sm hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 dark:border-navy-700 dark:bg-navy-800/40"
          >
            <a href={item.href || '#'} className="block flex-1 flex flex-col">
              {/* CHANGED: Image height from 280px to 360px */}
              <div className="overflow-hidden bg-slate-100 h-[360px] dark:bg-navy-800">
                <CardImageSlider
                  imageUrls={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl]}
                  imageAlt={item.imageAlt || item.title}
                  keyPrefix={item.id}
                />
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-5">
                   <span className="inline-block rounded-full border border-blue-300 bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">{badgeLabel}</span>
                </div>
                <h3 className="line-clamp-3 mb-4 text-3xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{item.title}</h3>
                <p className="line-clamp-3 flex-1 text-xl leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardImageSlider({
  imageUrls,
  imageAlt,
  keyPrefix,
}: {
  imageUrls: string[];
  imageAlt: string;
  keyPrefix: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = imageUrls.length > 1;

  const goPrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-full w-full">
      <img
        src={imageUrls[activeIndex]}
        alt={imageAlt}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            <span aria-hidden="true">›</span>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {imageUrls.map((_, index) => (
              <button
                key={`${keyPrefix}-${index}`}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                aria-label={`Go to image ${index + 1}`}
                className={`h-2 w-2 rounded-full ${index === activeIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function EventsNewsSection({ events, news, onSeeAllEvents }: { events: EventCardItem[], news: NewsCardItem[], onSeeAllEvents?: () => void }) {
  return (
    <section className="w-full bg-slate-50 py-16 dark:bg-[#0a111f]">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10">
        <h2 className="mb-10 text-4xl font-bold text-emerald-700 dark:text-emerald-400">Related Events</h2>
        <RelatedEventsCarousel events={events} onSeeAllEvents={onSeeAllEvents} />
        
        <div className="mt-24">
          <h2 className="mb-10 text-4xl font-bold text-blue-700 dark:text-blue-400">Latest News</h2>
          <NewsCarousel news={news} />
        </div>
      </div>
    </section>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5l3.5 2" />
    </svg>
  );
}