import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCmsMediaUrl } from '../services/cmsApi';

export function Profile() {
  const { user } = useAuth();

  const rawAvatarUrl = user?.avatar?.url || '';
  const avatarSrc = rawAvatarUrl
    ? getCmsMediaUrl(rawAvatarUrl)
    : 'https://via.placeholder.com/80x80?text=User';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatarSrc}
            alt={user?.displayName || user?.username || 'User'}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.displayName || user?.username}</h1>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {(user?.role?.name || user?.role?.type) && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Role</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.role?.name || user.role?.type}</p>
            </div>
          )}

          <div className="md:col-span-2">
            <p className="text-gray-500 dark:text-gray-400">Bio</p>
            <p className="font-medium text-gray-900 dark:text-white">{user?.bio || 'No bio yet.'}</p>
          </div>
          {user?.phoneNumber && (
            <div className="md:col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.phoneNumber}</p>
            </div>
          )}
        </div>

        {user?.profileMetadata && (
          <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Academic Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {user.profileMetadata.studentId && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Student ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.studentId}</p>
                </div>
              )}
              {user.profileMetadata.college && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">College</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.college}</p>
                </div>
              )}
              {user.profileMetadata.major && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Major</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.major}</p>
                </div>
              )}
              {user.profileMetadata.gpa && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">GPA</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.gpa}</p>
                </div>
              )}
              {user.profileMetadata.advisorName && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Advisor</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.advisorName}</p>
                </div>
              )}
              {user.profileMetadata.nationality && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nationality</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.nationality}</p>
                </div>
              )}
              {user.profileMetadata.className && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Class</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.className}</p>
                </div>
              )}
              {user.profileMetadata.status && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.status}</p>
                </div>
              )}
              {user.profileMetadata.termCodeAdmit && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Admit Term Code</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.profileMetadata.termCodeAdmit}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link to="/settings" className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white">
            Go to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
