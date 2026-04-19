import { useEffect, useState } from 'react';
import { PlaygroundVideo } from '../../../components/PlaygroundVideo';
import { getStudentResourcesByCategory, type StudentResourceItem } from '../../../services/cmsApi';

export default function Registeration() {
  const [resources, setResources] = useState<StudentResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchRegistrationGuides = async () => {
      try {
        const rows = await getStudentResourcesByCategory('Registration Guide');
        const validRows = rows.filter((row) => row.resourceUrl && row.resourceUrl !== '#');
        setResources(validRows);
        setStatus(validRows.length ? '' : 'No registration guides available yet.');
      } catch (error) {
        console.error('Error fetching registration guides:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRegistrationGuides();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-slate-100">Registration Guides</h1>

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">Loading registration guides from Supabase...</div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {resources.map((resource) => (
              <PlaygroundVideo
                key={resource.id}
                src={resource.resourceUrl}
                externalUrl={resource.resourceUrl}
                title={resource.title}
                description={resource.description || 'Click play to open this registration guide video.'}
                durationText={resource.duration}
                poster={resource.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
