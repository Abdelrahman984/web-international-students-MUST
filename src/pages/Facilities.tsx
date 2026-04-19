import { useEffect, useState } from 'react';
import { PdfResourceCard } from '../components/PdfResourceCard';
import { getStudentResourcesByCategory } from '../services/cmsApi';

type FacilityPdfItem = {
  id: string;
  title: string;
  url: string;
};

export function Facilities() {
  const [resources, setResources] = useState<FacilityPdfItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const rows = await getStudentResourcesByCategory('Facilities Resource');
        const validRows = rows.filter((row) => row.resourceUrl && row.resourceUrl !== '#');

        setResources(validRows.map((row) => ({ id: row.id, title: row.title, url: row.resourceUrl })));

        setStatus(validRows.length ? '' : 'No facility resources available yet.');
      } catch (error) {
        console.error('Error fetching facilities resources:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFacilities();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">Loading facility resources from Supabase...</div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Facilities Resources</h2>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <PdfResourceCard key={resource.id} title={resource.title} url={resource.url} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
