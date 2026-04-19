import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye } from 'lucide-react';

export function MyRequests() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];
  const requests = [
  {
    id: 'REQ-2025-089',
    type: 'Visa Renewal Support Letter',
    date: 'Oct 12, 2025',
    status: 'Pending',
    statusColor: 'text-status-pending bg-status-pending/10',
    icon: Clock
  },
  {
    id: 'REQ-2025-082',
    type: 'Enrollment Letter',
    date: 'Oct 05, 2025',
    status: 'Under Review',
    statusColor: 'text-status-review bg-status-review/10',
    icon: FileText
  },
  {
    id: 'REQ-2025-045',
    type: 'Official Transcript',
    date: 'Sep 20, 2025',
    status: 'Approved',
    statusColor: 'text-status-approved bg-status-approved/10',
    icon: CheckCircle2
  },
  {
    id: 'REQ-2025-031',
    type: 'Change of Major',
    date: 'Sep 10, 2025',
    status: 'Rejected',
    statusColor: 'text-status-rejected bg-status-rejected/10',
    icon: XCircle
  },
  {
    id: 'REQ-2025-012',
    type: 'Enrollment Letter',
    date: 'Aug 15, 2025',
    status: 'Approved',
    statusColor: 'text-status-approved bg-status-approved/10',
    icon: CheckCircle2
  }];

  const filteredRequests =
  activeTab === 'All' ?
  requests :
  requests.filter((r) => r.status === activeTab);
  return (
    <div className="page-container space-y-6 bg-transparent dark:bg-transparent text-navy-900 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 dark:text-white">
            My Requests
          </h1>
          <p className="text-navy-400 dark:text-navy-200 mt-1">
            Track the status of your submitted applications
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300 dark:text-navy-400" />
          <input
            type="text"
            placeholder="Search requests..."
            className="pl-9 pr-4 py-2 bg-white dark:bg-navy-800 dark:text-white border border-surface-200 dark:border-navy-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 w-full sm:w-64" />
          
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-surface-200 dark:border-navy-700">
        {tabs.map((tab) =>
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`whitespace-nowrap px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-navy-500 text-navy-900 dark:text-white' : 'border-transparent text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-white hover:border-surface-300 dark:hover:border-navy-500'}`}>
          
            {tab}
          </button>
        )}
      </div>

      {/* Requests List */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="card overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-navy-800 text-navy-400 dark:text-navy-200 text-sm border-b border-surface-200 dark:border-navy-700">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Request Type</th>
                <th className="p-4 font-medium">Submission Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-navy-700 bg-white dark:bg-navy-900">
              {filteredRequests.map((req, idx) =>
              <motion.tr
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: idx * 0.05
                }}
                key={req.id}
                className="hover:bg-surface-50 dark:hover:bg-navy-800 transition-colors group">
                
                  <td className="p-4 font-semibold text-navy-900 dark:text-white">{req.id}</td>
                  <td className="p-4 font-medium text-navy-700 dark:text-gray-300">{req.type}</td>
                  <td className="p-4 text-navy-500 dark:text-gray-400 text-sm">{req.date}</td>
                  <td className="p-4">
                    <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${req.statusColor}`}>
                    
                      <req.icon className="w-3 h-3" />
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-navy-300 dark:text-navy-400 hover:text-navy-600 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-navy-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              )}
              {filteredRequests.length === 0 &&
              <tr>
                  <td colSpan={5} className="p-8 text-center text-navy-400 dark:text-navy-300">
                    No requests found for this status.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>);

}