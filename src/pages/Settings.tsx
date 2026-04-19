import { FormEvent, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  changePassword,
  updateProfile,
  uploadAvatar,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
} from '../services/auth';

type SettingsTab = 'profile' | 'security';

export function Settings() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSavePassword = useMemo(() => {
    return currentPassword.trim() && newPassword.trim() && confirmPassword.trim();
  }, [currentPassword, newPassword, confirmPassword]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSavingProfile(true);

    try {
      let uploadedAvatarUrl: string | undefined;
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        uploadedAvatarUrl = uploaded.url;
      }

      const payload: UpdateProfilePayload = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      };

      if (uploadedAvatarUrl) {
        payload.avatarUrl = uploadedAvatarUrl;
      }

      await updateProfile(user.id, payload);
      await refreshUser();
      setAvatarFile(null);
      setMessage('Profile settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!canSavePassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const payload: ChangePasswordPayload = {
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      };
      await changePassword(payload);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'security' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
          >
            Security
          </button>
        </div>

        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Write something about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 dark:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={!canSavePassword || isSavingPassword}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
