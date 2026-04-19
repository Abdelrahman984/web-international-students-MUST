import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCampusLayout, authGlassInputClassName, authPrimaryButtonClassName } from '../components/AuthCampusLayout';
import { useAuth } from '../context/AuthContext';

type RegistrationRole = 'visitor' | 'college-member';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState<RegistrationRole>('visitor');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return false;
    }
    if (roleTab === 'college-member' && !universityId.trim()) {
      return false;
    }
    return true;
  }, [roleTab, displayName, username, email, password, confirmPassword, universityId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        role: roleTab,
        universityId: roleTab === 'college-member' ? universityId.trim() : undefined,
      });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCampusLayout maxWidthClass="max-w-2xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Register</h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-300">Create your account — fill in your details below.</p>

      <div
        className="mb-6 flex rounded-xl border border-stone-200/80 bg-stone-100/45 p-1 shadow-inner backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/45"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === 'visitor'}
          onClick={() => {
            setRoleTab('visitor');
            setError(null);
            setUniversityId('');
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            roleTab === 'visitor'
              ? 'bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
          }`}
        >
          Visitor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === 'college-member'}
          onClick={() => {
            setRoleTab('college-member');
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            roleTab === 'college-member'
              ? 'bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
          }`}
        >
          College member
        </button>
      </div>

      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        {roleTab === 'visitor'
          ? 'For general access without a university ID.'
          : 'For students and staff — university ID is required.'}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={authGlassInputClassName}
            placeholder="Display name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={authGlassInputClassName}
            placeholder="Username"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className={authGlassInputClassName}
            placeholder="Email"
          />
        </div>

        {roleTab === 'college-member' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">University ID</label>
            <input
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className={authGlassInputClassName}
              placeholder="University ID"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className={authGlassInputClassName}
            placeholder="Password"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Confirm password</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className={authGlassInputClassName}
            placeholder="Confirm password"
          />
        </div>

        <button type="submit" disabled={!canSubmit || isSubmitting} className={`${authPrimaryButtonClassName} mt-1 w-full`}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-stone-200/60 pt-5 text-sm text-stone-600 dark:border-slate-600/50 dark:text-stone-400">
        <p>
          Already have an account?{' '}
          <Link className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300" to="/login">
            Login
          </Link>
        </p>
      </div>
    </AuthCampusLayout>
  );
}
