type AdDetailCardProps = {
  image: string;
  title: string;
  description: string;
  href?: string;
  onLearnMore?: () => void;
};

export function AdDetailCard({ image, title, description, href, onLearnMore }: AdDetailCardProps) {
  return (
    <article className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-navy-700 dark:bg-navy-900">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-80 lg:w-96">
          <img
            src={image}
            alt={title}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-full"
          />
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white md:text-3xl">{title}</h3>
          <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
          <div className="mt-6 flex justify-end">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Learn More
              </a>
            ) : (
              <button
                type="button"
                onClick={onLearnMore}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Learn More
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
