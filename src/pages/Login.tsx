import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthCampusLayout,
  authGlassInputClassName,
  authPrimaryButtonClassName,
} from "../components/AuthCampusLayout";
import { ROLES } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { authNetService } from "../services/authNetService";

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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
      const rawRole = (signedInUser as { role?: unknown }).role;
      const normalizedRole =
        typeof rawRole === "string"
          ? rawRole.trim().toLowerCase()
          : rawRole && typeof rawRole === "object"
            ? ("type" in rawRole && typeof rawRole.type === "string"
              ? rawRole.type
              : "name" in rawRole && typeof rawRole.name === "string"
                ? rawRole.name
                : ""
            )
              .trim()
              .toLowerCase()
            : "";

      const isAdvisorAccount =
        normalizedRole === ROLES.ADMIN || normalizedRole === "advisor";
      const isVisitorAccount = normalizedRole === ROLES.VISITOR;

      if (portalTab === "advisor" && !isAdvisorAccount) {
        await logout();
        setServerError("This sign-in is for advisor accounts only.");
        return;
      }

      if (portalTab === "student" && isAdvisorAccount) {
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

      navigate("/");
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
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${portalTab === "student"
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
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${portalTab === "visitor"
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
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${portalTab === "advisor"
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
            Email
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

      <div className="relative z-20 mt-6 space-y-2 border-t border-stone-200/60 pt-5 text-sm text-stone-600 dark:border-slate-600/50 dark:text-stone-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg -mx-2 px-2">
        <p>
          New here?{" "}
          <Link
            className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
            to="/register"
          >
            Register
          </Link>
        </p>
        <p>
          Forgot password?{" "}
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Reset it here
          </button>
        </p>
      </div>

      {isForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setIsForgotPassword(false)}
          emailSuffix={EMAIL_SUFFIX}
          portalTab={portalTab}
        />
      )}
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

function ForgotPasswordModal({
  onClose,
  emailSuffix,
  portalTab,
}: {
  onClose: () => void;
  emailSuffix: string;
  portalTab: LoginPortalTab;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Email/OTP, 2: New Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isVisitor = portalTab === "visitor";

  const toFriendlyError = (err: any) => {
    const msg = err.message || String(err);
    if (msg.includes("404"))
      return "The reset service is currently unavailable. Please contact support.";
    if (msg.includes("400"))
      return "There was a problem with the reset request. Please check your details.";
    if (msg.toLowerCase().includes("user not found"))
      return "No account found with this email address.";
    if (msg.toLowerCase().includes("invalid otp"))
      return "The verification code is incorrect or has expired.";
    return msg;
  };

  const getFullEmail = () => {
    if (isVisitor) return email;
    return email.includes("@") ? email : `${email}${emailSuffix}`;
  };

  const handleRequestOtp = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authNetService.requestOtp(getFullEmail());
      setSuccess("Verification code sent! Check your inbox.");
      setStep(2);
    } catch (err: any) {
      if (err.message?.includes("404")) {
        setStep(2);
        setSuccess("Please enter the verification code sent to your email.");
      } else {
        setError(toFriendlyError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("The passwords you entered do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authNetService.forgotPassword({
        email: getFullEmail(),
        otp,
        newPassword,
      });
      setSuccess("Password reset successfully! You can now sign in.");
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(toFriendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-rose-600 font-medium">{error}</p>}
        {success && <p className="mb-4 text-sm text-emerald-600 font-medium">{success}</p>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {isVisitor ? "Your Email" : "University Email"}
            </label>
            <div className="flex items-center">
              <input
                disabled={step === 2}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${authGlassInputClassName} flex-1`}
                placeholder={isVisitor ? "e.g. user@gmail.com" : "Student ID"}
              />
              {!isVisitor && !email.includes("@") && (
                <span className="rounded-r border border-stone-200/90 bg-white/85 px-3 py-2.5 text-sm text-stone-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white">
                  {emailSuffix}
                </span>
              )}
            </div>
          </div>

          {step === 2 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">OTP Code</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={authGlassInputClassName}
                  placeholder="Enter the 6-digit code"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={authGlassInputClassName}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={authGlassInputClassName}
                  placeholder="Re-type new password"
                  required
                />
              </div>
            </>
          )}

          <div className="pt-2">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSubmitting || !email}
                className={`${authPrimaryButtonClassName} w-full`}
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${authPrimaryButtonClassName} flex-[2]`}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
