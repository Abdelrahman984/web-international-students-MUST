import { useEffect, useState } from 'react';
import { getSchedulesList, type ScheduleItem } from '../../../services/cmsApi';

export default function Schedules() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const rows = await getSchedulesList();
        setSchedules(rows.filter((row) => row.fileUrl && row.fileUrl !== '#'));
        setStatus(rows.length ? '' : 'No schedule files available yet.');
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSchedules();
  }, []);

  const getScheduleDescription = (scheduleType: string) => {
    const normalized = scheduleType.toLowerCase();
    if (normalized === 'normal') {
      return 'Current Semester\'s Nomral Schedule.';
    }
    if (normalized.includes('quiz')) {
      return 'Quiz examination timetable.';
    }
    if (normalized === 'final') {
      return 'Final examination timetable.';
    }
    return 'Academic schedule document.';
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 py-20 px-6 pt-32 lg:px-24 dark:bg-[#0b132b]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-slate-900 text-4xl lg:text-5xl font-bold mb-6 dark:text-white">Academic Schedules</h2>
          <p className="text-slate-600 text-lg lg:text-xl dark:text-gray-400">
            Access live lecture schedules and exam timetables updated from the registrar.
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse text-emerald-700 text-xl font-bold text-center p-12 dark:text-emerald-400">Loading schedules from Supabase...</div>
        ) : status ? (
          <div className="text-center text-emerald-700 text-xl font-bold p-12 border border-dashed border-slate-300 rounded-xl dark:text-emerald-400 dark:border-slate-700">
            {status}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {schedules.map((item) => (
              <article key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col dark:bg-slate-800 dark:border-slate-700">
                <div className="bg-slate-100 p-6 border-b border-slate-200 flex items-center space-x-4 dark:bg-[#0f1d36] dark:border-slate-700">
                  <div className="bg-slate-200 p-3 rounded-xl dark:bg-white/10">
                    <svg className="w-6 h-6 text-slate-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 text-2xl font-bold dark:text-white">
                    {item.scheduleType} - {item.semester} {item.year}
                  </h3>
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <p className="text-slate-600 text-sm dark:text-gray-400">{getScheduleDescription(item.scheduleType)}</p>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition inline-flex items-center justify-center"
                  >
                    Download PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}