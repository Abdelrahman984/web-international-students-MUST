import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCampusLayout, authGlassInputClassName, authPrimaryButtonClassName } from '../components/AuthCampusLayout';
import { ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

type LoginPortalTab = 'student' | 'admin';

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [portalTab, setPortalTab] = useState<LoginPortalTab>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setServerError(null);

    if (!identifier.trim() || !password.trim()) {
      setFieldError('Identifier and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const signedInUser = await login(identifier.trim(), password);
      const isAdminAccount = signedInUser.role?.type === ROLES.ADMIN;

      if (portalTab === 'admin' && !isAdminAccount) {
        await logout();
        setServerError('This sign-in is for administrator accounts only.');
        return;
      }

      if (portalTab === 'student' && isAdminAccount) {
        await logout();
        setServerError('Administrator accounts should sign in using the Admin tab.');
        return;
      }

      navigate('/profile');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCampusLayout>
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Login</h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-300">Welcome back — sign in to continue.</p>

      <div
        className="mb-6 flex rounded-xl border border-stone-200/80 bg-stone-100/45 p-1 shadow-inner backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/45"
        role="tablist"
        aria-label="Sign-in portal"
      >
        <button
          type="button"
          role="tab"
          aria-selected={portalTab === 'student'}
          onClick={() => {
            setPortalTab('student');
            setFieldError(null);
            setServerError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            portalTab === 'student'
              ? 'bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
          }`}
        >
          Student
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={portalTab === 'admin'}
          onClick={() => {
            setPortalTab('admin');
            setFieldError(null);
            setServerError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            portalTab === 'admin'
              ? 'bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
          }`}
        >
          Admin
        </button>
      </div>

      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        {portalTab === 'student'
          ? 'For students, visitors, and college members.'
          : 'For platform administrators only.'}
      </p>

      {fieldError && <p className="mb-3 text-sm text-red-600">{fieldError}</p>}
      {serverError && <p className="mb-3 text-sm text-red-600">{serverError}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Email or Username</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={authGlassInputClassName}
            placeholder="Enter your email or username"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authGlassInputClassName}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${authPrimaryButtonClassName} w-full`}
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-stone-200/60 pt-5 text-sm text-stone-600 dark:border-slate-600/50 dark:text-stone-400">
        <p>
          New here?{' '}
          <Link className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300" to="/register">
            Register
          </Link>
        </p>
        <p>Forgot password? Please contact support.</p>
      </div>
    </AuthCampusLayout>
  );
}
