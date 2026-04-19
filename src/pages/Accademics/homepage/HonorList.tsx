import { useEffect, useState } from 'react';
import { PdfResourceCard } from '../../../components/PdfResourceCard';
import { getHonorListDocuments, type HonorListDocumentItem } from '../../../services/cmsApi';

export default function HonorList() {
  const [documents, setDocuments] = useState<HonorListDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchHonorList = async () => {
      try {
        const rows = await getHonorListDocuments();
        setDocuments(rows);
        setStatus(rows.length ? '' : 'No honor list documents available yet.');
      } catch (error) {
        console.error('Error fetching honor list documents:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHonorList();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-slate-100">Honor List</h1>

        {isLoading ? (
          <div className="animate-pulse text-emerald-600 dark:text-emerald-400">Loading honor list documents from Supabase...</div>
        ) : status ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
            {status}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <PdfResourceCard key={document.id} title={document.title} url={document.fileUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
