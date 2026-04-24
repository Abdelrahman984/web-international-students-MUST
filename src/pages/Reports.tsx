import { useEffect, useState } from "react";
import { apiClient } from "../services/api";
import { PdfResourceCard } from "../components/PdfResourceCard";

interface ReportsProps {
  userName: string;
}

export function Reports({ userName }: ReportsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/advisor_resources');
        const items = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.items || [];
        
        const filtered = items.filter(
          (item: any) => item.resource_type === "Statistical Reports"
        );
        setReports(filtered);
      } catch (error) {
        console.error("Failed to fetch statistical reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          No Reports Available
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          There are currently no statistical reports published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Statistical Reports
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          View and download published statistical reports and analytical data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <PdfResourceCard
            key={report.id}
            title={report.title}
            url={report.file_path || report.link || report.file_url || report.resource_url || report.resourceUrl || ""}
          />
        ))}
      </div>
    </div>
  );
}
