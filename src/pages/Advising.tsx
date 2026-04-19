import { useEffect, useState } from 'react';
import { LinkResourceCard } from '../components/LinkResourceCard';
import { PdfResourceCard } from '../components/PdfResourceCard';
import { PlaygroundVideo } from '../components/PlaygroundVideo';
import { getAdvisorResources, type AdvisorResourceItem } from '../services/cmsApi';

function isVideoResource(resource: AdvisorResourceItem): boolean {
  if (resource.resourceType === 'video') {
    return true;
  }

  const url = resource.resourceUrl.toLowerCase();
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg')
  );
}

export default function AdvisingPage() {
  const [resources, setResources] = useState<AdvisorResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const rows = await getAdvisorResources();
        setResources(rows);
        setStatus(rows.length ? '' : 'No advisor resources available yet.');
      } catch (error) {
        console.error('Error fetching advisor resources:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResources();
  }, []);

  const videoResources = resources.filter((resource) => isVideoResource(resource));
  const fileOrLinkResources = resources.filter((resource) => !isVideoResource(resource));

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-slate-100">Advising Resources</h1>

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">Loading advisor resources from Supabase...</div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : (
          <>
            {videoResources.length > 0 && (
              <div className="mb-8 grid grid-cols-1 gap-6">
                {videoResources.map((resource) => (
                  <PlaygroundVideo
                    key={resource.id}
                    src={resource.resourceUrl}
                    externalUrl={resource.resourceUrl}
                    title={resource.title}
                    description={resource.description || 'Click play to open this advising video resource.'}
                    durationText={resource.duration}
                    poster={resource.thumbnailUrl}
                  />
                ))}
              </div>
            )}

            {fileOrLinkResources.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fileOrLinkResources.map((resource) => {
                  if (resource.resourceType === 'link') {
                    return (
                      <LinkResourceCard
                        key={resource.id}
                        title={resource.title}
                        href={resource.resourceUrl}
                      />
                    );
                  }

                  return (
                    <PdfResourceCard
                      key={resource.id}
                      title={resource.title}
                      url={resource.resourceUrl}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
