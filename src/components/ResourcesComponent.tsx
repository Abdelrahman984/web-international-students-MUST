import type { GenericResourcesConfig } from './genericResourcesMockData';

interface ResourcesComponentProps {
  config: GenericResourcesConfig;
}

export default function ResourcesComponent({ config }: ResourcesComponentProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-bold text-slate-900 md:text-3xl">{config.title}</h3>
      {config.description && <p className="mt-2 text-slate-600">{config.description}</p>}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {config.resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-green-700 transition-opacity hover:opacity-80"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-700">
              <PdfIcon className="h-6 w-6" />
            </span>

            <div className="min-w-0">
              <p className="font-semibold underline break-words text-slate-900">{resource.title}</p>
              <p className="text-sm text-gray-600">{resource.description || 'Download PDF resource'}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 3.75H7.5A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V8.25L14.5 3.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75v4.5h4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 14.25h6.5M8.75 16.75h4M8.75 11.75h6.5" />
    </svg>
  );
}
