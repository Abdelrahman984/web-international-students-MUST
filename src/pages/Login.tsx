import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthCampusLayout,
  authGlassInputClassName,
  authPrimaryButtonClassName,
} from "../components/AuthCampusLayout";
import { ROLES } from "../constants/roles";
import { useAuth } from "../context/AuthContext";

type LoginPortalTab = "student" | "visitor" | "advisor";

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [portalTab, setPortalTab] = useState<LoginPortalTab>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const EMAIL_SUFFIX = "@must.edu.eg";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setServerError(null);

    if (!identifier.trim() || !password.trim()) {
      setFieldError("Identifier and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let identifierToUse = identifier.trim();
      if (
        (portalTab === "student" || portalTab === "advisor") &&
        !identifierToUse.includes("@")
      ) {
        identifierToUse = `${identifierToUse}${EMAIL_SUFFIX}`;
      }

      const signedInUser = await login(identifierToUse, password);
      const isAdminAccount = signedInUser.role?.type === ROLES.ADMIN;
      const isVisitorAccount = signedInUser.role?.type === ROLES.VISITOR;

      if (portalTab === "advisor" && !isAdminAccount) {
        await logout();
        setServerError("This sign-in is for advisor accounts only.");
        return;
      }

      if (portalTab === "student" && isAdminAccount) {
        await logout();
        setServerError(
          "Advisor accounts should sign in using the Advisor tab.",
        );
        return;
      }

      if (portalTab === "visitor" && !isVisitorAccount) {
        await logout();
        setServerError("This sign-in is for visitor accounts only.");
        return;
      }

      navigate("/profile");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCampusLayout>
      <div id="auth-top" className="scroll-mt-44" />
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
        Login
      </h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-300">
        Welcome back — sign in to continue.
      </p>

      <div
        className="mb-6 flex rounded-xl border border-stone-200/80 bg-stone-100/45 p-1 shadow-inner backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/45"
        role="tablist"
        aria-label="Sign-in portal"
      >
        <button
          type="button"
          role="tab"
          aria-selected={portalTab === "student"}
          onClick={() => {
            setPortalTab("student");
            setFieldError(null);
            setServerError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            portalTab === "student"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={portalTab === "visitor"}
          onClick={() => {
            setPortalTab("visitor");
            setFieldError(null);
            setServerError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            portalTab === "visitor"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Visitor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={portalTab === "advisor"}
          onClick={() => {
            setPortalTab("advisor");
            setFieldError(null);
            setServerError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            portalTab === "advisor"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Advisor
        </button>
      </div>

      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        {portalTab === "student"
          ? "For only international students."
          : portalTab === "visitor"
            ? "For visitors."
            : "For platform advisors only."}
      </p>

      {fieldError && <p className="mb-3 text-sm text-red-600">{fieldError}</p>}
      {serverError && (
        <p className="mb-3 text-sm text-red-600">{serverError}</p>
      )}

      <form
        id="auth-form"
        onSubmit={onSubmit}
        className="space-y-4 scroll-mt-36"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Email or Username
          </label>
          {portalTab === "student" || portalTab === "advisor" ? (
            <div className="flex items-center">
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`${authGlassInputClassName} max-w-[calc(100%-140px)]`}
                placeholder="Enter email local part"
                aria-label="Email local part"
              />
              <span className="rounded-r border border-stone-200/90 bg-white/85 px-3 py-2.5 text-stone-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white select-none">
                {EMAIL_SUFFIX}
              </span>
            </div>
          ) : (
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={authGlassInputClassName}
              placeholder="Enter your email or username"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
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
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-stone-200/60 pt-5 text-sm text-stone-600 dark:border-slate-600/50 dark:text-stone-400">
        <p>
          New here?{" "}
          <Link
            className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
            to="/register"
          >
            Register
          </Link>
        </p>
        <p>Forgot password? Please contact support.</p>
      </div>
      <ScrollToHash />
    </AuthCampusLayout>
  );
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#auth") return;

    const scrollToAuthForm = () => {
      const targetEl =
        document.getElementById("auth-top") ||
        document.getElementById("auth-form");
      if (!targetEl) return;

      const headerEl = document.querySelector<HTMLElement>(".must-header");
      const headerHeight = headerEl?.getBoundingClientRect().height ?? 0;
      const safeSpacing = 28;
      const targetY =
        targetEl.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        safeSpacing;

      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
    };

    let timeoutId: number | undefined;
    const animationFrameId = window.requestAnimationFrame(() => {
      scrollToAuthForm();
      timeoutId = window.setTimeout(scrollToAuthForm, 120);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [location.hash, location.pathname]);

  return null;
}
