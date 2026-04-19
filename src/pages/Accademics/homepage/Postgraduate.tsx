import { useEffect, useState } from 'react';
import NewStudyPlanResources from '../../../components/NewStudyPlanResources';
import { postgradStudyPlanConfig } from '../../../components/newStudyPlanResourcesMockData';
import { getFileUrl, getManyFileLinks, getStudyPlansRow } from '../../../services/cmsApi';

export default function Postgraduate() {
  const [config, setConfig] = useState<any>(postgradStudyPlanConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const attrs = await getStudyPlansRow();

        setConfig({
          mode: 'degree-tracks',
          title: 'Study Plans',
          tracks: {
            msc: {
              type: 'research', label: 'M. SC',
              resourcesBySpecialty: {
                CS: attrs.postgrad_cs ? [{ id: 'pg-msc-cs', title: 'MSc Computer Science', url: getFileUrl(attrs.postgrad_cs) }] : [],
                IS: attrs.postgrad_ai ? [{ id: 'pg-msc-is', title: 'MSc Artificial Intelligence', url: getFileUrl(attrs.postgrad_ai) }] : [],
              },
            },
            phd: {
              type: 'research', label: 'PH.D',
              resourcesBySpecialty: {
                CS: attrs.postgrad_cs ? [{ id: 'pg-phd-cs', title: 'PhD Computer Science', url: getFileUrl(attrs.postgrad_cs) }] : [],
                IS: attrs.postgrad_ai ? [{ id: 'pg-phd-is', title: 'PhD Artificial Intelligence', url: getFileUrl(attrs.postgrad_ai) }] : [],
              },
            },
            professional: {
              type: 'professional', label: 'Professional Degrees',
              resources: getManyFileLinks(attrs.professional_diplomas, 'prof'),
            },
          },
        });
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    void fetchPlans();
  }, []);

  return (
    <div className="py-24 bg-white min-h-screen dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">Postgraduate Programs</h1>
        {isLoading ? <div className="animate-pulse text-emerald-600 dark:text-emerald-400">Loading Plans...</div> : <NewStudyPlanResources config={config} />}
      </div>
    </div>
  );
}