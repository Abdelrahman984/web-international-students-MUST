export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  href?: string;
};

type ActivitiesSectionProps = {
  title?: string;
  subtitle?: string;
  items: ActivityItem[];
};

export default function ActivitiesSection({
  title = 'Activities',
  subtitle = 'Sport (Menu Content)',
  items,
}: ActivitiesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pt-12 sm:px-8 lg:px-10">
      <div className="rounded-2xl border-2 border-purple-500/80 p-5 sm:p-7">
      <h2 className="mb-3 text-3xl font-bold text-white">{title}</h2>
      <p className="mb-8 text-xl font-semibold text-slate-200">{subtitle}</p>

      <div className="flex snap-y snap-mandatory flex-col gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex w-full snap-start flex-col overflow-hidden rounded-xl border border-slate-700 bg-[#111827] transition-all duration-300 hover:border-emerald-400"
          >
            <div className="flex flex-col md:flex-row">
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#0d1528] md:w-[340px] md:shrink-0">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-5 sm:px-6 sm:py-6">
              <p className="line-clamp-2 text-xl font-semibold leading-7 text-slate-100">{item.title}</p>
              {item.description ? (
                <p className="line-clamp-3 max-w-3xl text-base leading-6 text-slate-300">{item.description}</p>
              ) : null}
              <div className="mt-2">
                <a
                  href={item.href || '#'}
                  className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-md bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  See More
                </a>
              </div>
            </div>
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
