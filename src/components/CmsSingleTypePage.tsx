import { AlertCircle, Loader } from 'lucide-react';
import { ContentBlocks } from './ContentBlocks';
import { useCmsData } from '../hooks/useCmsData';
import { CmsPage } from '../types/strapi';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CmsSingleTypePageData extends Pick<CmsPage, 'id' | 'title' | 'slug' | 'subtitle' | 'accessRole' | 'seo' | 'blocks'> {}

interface CmsSingleTypePageProps<T extends CmsSingleTypePageData> {
  fetcher: () => Promise<T>;
  fallbackTitle: string;
  fallbackSubtitle?: string;
}

const slugifyAnchor = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function CmsSingleTypePage<T extends CmsSingleTypePageData>({
  fetcher,
  fallbackTitle,
  fallbackSubtitle,
}: CmsSingleTypePageProps<T>) {
  const { data, loading, error } = useCmsData(fetcher, []);
  const location = useLocation();

  useEffect(() => {
    if (loading || !data || !location.hash) {
      return;
    }

    const anchor = decodeURIComponent(location.hash.replace(/^#/, ''));

    if (!anchor) {
      return;
    }

    const scrollToAnchor = () => {
      let element = document.getElementById(anchor);

      // Rich-text HTML blocks may render headings without ids; derive one from heading text.
      if (!element) {
        const heading = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')).find(
          (item) => slugifyAnchor(item.textContent || '') === anchor,
        );

        if (heading) {
          heading.id = anchor;
          element = heading;
        }
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToAnchor);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [data, loading, location.hash]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-green-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Failed to load page content</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {data?.title || fallbackTitle}
        </h1>
        {(data?.subtitle || fallbackSubtitle) && (
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">
            {data?.subtitle || fallbackSubtitle}
          </p>
        )}
      </header>

      {data?.blocks && data.blocks.length > 0 ? (
        <ContentBlocks blocks={data.blocks} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No content available.</p>
      )}
    </div>
  );
}
