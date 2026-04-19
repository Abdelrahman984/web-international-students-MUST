import { motion } from 'framer-motion';
import { CheckCircle2, Megaphone, Calendar, Info, Check } from 'lucide-react';

export function Notifications() {
  const notifications = [
  {
    id: 1,
    type: 'status',
    title: 'Request Approved',
    desc: 'Your request for "Official Transcript" has been approved and is ready for pickup.',
    time: '2 hours ago',
    unread: true,
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    id: 2,
    type: 'announcement',
    title: 'New Announcement',
    desc: 'Important: Visa Renewal Deadline for Fall 2025.',
    time: '5 hours ago',
    unread: true,
    icon: Megaphone,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 3,
    type: 'schedule',
    title: 'Schedule Update',
    desc: 'Room change for CS301 Software Engineering to B-302.',
    time: '1 day ago',
    unread: false,
    icon: Calendar,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 4,
    type: 'system',
    title: 'System Maintenance',
    desc: 'The portal will be down for maintenance on Saturday from 2 AM to 4 AM.',
    time: '2 days ago',
    unread: false,
    icon: Info,
    color: 'text-slate-500 bg-slate-50 dark:bg-slate-800'
  },
  {
    id: 5,
    type: 'status',
    title: 'Request Under Review',
    desc: 'Your request for "Visa Renewal Support Letter" is now under review.',
    time: '3 days ago',
    unread: false,
    icon: Info,
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    id: 6,
    type: 'announcement',
    title: 'Event Reminder',
    desc: 'International Food & Culture Festival starts tomorrow at 10 AM.',
    time: '1 week ago',
    unread: false,
    icon: Megaphone,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }];

  return (
    <div className="page-container max-w-3xl space-y-6 bg-white dark:bg-slate-900">
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with your latest alerts
          </p>
        </div>
        <button className="text-sm font-medium text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
          <Check className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, idx) =>
        <motion.div
          initial={{
            opacity: 0,
            x: -10
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          transition={{
            delay: idx * 0.05
          }}
          key={notif.id}
          className={`p-4 rounded-xl border transition-colors flex gap-4 items-start bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 ${notif.unread ? 'border-emerald-200 shadow-sm' : 'border-gray-200 dark:border-slate-700 opacity-75 hover:opacity-100'}`}>
          
            <div className={`p-2.5 rounded-full shrink-0 ${notif.color}`}>
              <notif.icon className="w-5 h-5" />
            </div>

            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-bold ${notif.unread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {notif.title}
                </h3>
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                  {notif.time}
                </span>
              </div>
              <p className={`text-sm ${notif.unread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {notif.desc}
              </p>
            </div>

            {notif.unread &&
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></div>
          }
          </motion.div>
        )}
      </div>
    </div>
  );
}

