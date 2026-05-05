import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthCampusLayout,
  authGlassInputClassName,
  authPrimaryButtonClassName,
} from "../components/AuthCampusLayout";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { apiRequest } from "../services/api";

type RegistrationRole = "visitor" | "student" | "advisor";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const EMAIL_SUFFIX = "@must.edu.eg";

  const [roleTab, setRoleTab] = useState<RegistrationRole>("visitor");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !otp.trim()
    ) {
      return false;
    }
    return true;
  }, [roleTab, firstName, lastName, email, password, confirmPassword, otp]);

  const getFullEmail = () => {
    const trimmed = email.trim();
    if (roleTab === "visitor") {
      return trimmed;
    }
    return trimmed.includes("@") ? trimmed : `${trimmed}${EMAIL_SUFFIX}`;
  };

  const handleSendOtp = async () => {
    setOtpError(null);
    setOtpStatus(null);

    if (!email.trim()) {
      setOtpError("Please enter your email first.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await apiRequest("/api/Otp/send", {
        method: "POST",
        body: { email: getFullEmail() },
        auth: false,
      });
      setOtpStatus("Verification code sent. Check your inbox.");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalEmail = getFullEmail();

      const displayNameValue = `${firstName.trim()} ${lastName.trim()}`.trim();

      await register({
        email: finalEmail,
        password,
        displayName: displayNameValue,
        otp: otp.trim(),
        role: roleTab === "visitor" ? ROLES.VISITOR : ROLES.COLLEGE_MEMBER,
      });
      navigate("/profile");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed.";
      if (/otp/i.test(message)) {
        setOtpError(message);
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCampusLayout maxWidthClass="max-w-2xl">
      <div id="auth-top" className="scroll-mt-44" />
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
        Register
      </h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-300">
        Create your account — fill in your details below.
      </p>

      <div
        className="mb-6 flex rounded-xl border border-stone-200/80 bg-stone-100/45 p-1 shadow-inner backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/45"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "student"}
          onClick={() => {
            setRoleTab("student");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            roleTab === "student"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "visitor"}
          onClick={() => {
            setRoleTab("visitor");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            roleTab === "visitor"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Visitor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "advisor"}
          onClick={() => {
            setRoleTab("advisor");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            roleTab === "advisor"
              ? "bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 dark:bg-slate-800/95 dark:text-white dark:ring-slate-600/60"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          Advisor
        </button>
      </div>

      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        {roleTab === "visitor"
          ? "For general access without a university ID."
          : roleTab === "student"
            ? "For students — university ID is required."
            : "For advisors — university ID is required."}
      </p>

      <form
        id="auth-form"
        onSubmit={onSubmit}
        className="space-y-4 scroll-mt-36"
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={authGlassInputClassName}
              placeholder="First name"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={authGlassInputClassName}
              placeholder="Last name"
              required
              minLength={2}
            />
          </div>
        </div>{" "}
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Email
          </label>
          {roleTab === "student" || roleTab === "advisor" ? (
            <div className="flex items-center">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${authGlassInputClassName} max-w-[calc(100%-140px)]`}
                placeholder="Enter email local part"
                aria-label="Email local part"
                required
                pattern="[A-Za-z0-9._%+-]+"
                title="Enter the email part before @must.edu.eg"
              />
              <span className="rounded-r border border-stone-200/90 bg-white/85 px-3 py-2.5 text-stone-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white select-none">
                {EMAIL_SUFFIX}
              </span>
            </div>
          ) : (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={authGlassInputClassName}
              placeholder="Email"
              required
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Verification code
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`${authGlassInputClassName} flex-1 min-w-[160px]`}
              placeholder="Enter code"
              inputMode="numeric"
              aria-label="Verification code"
              required
              minLength={4}
              maxLength={6}
              pattern="\d{4,6}"
              title="Enter the 4-6 digit code from your email."
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp}
              className={`${authPrimaryButtonClassName} px-4 py-2.5 text-sm`}
            >
              {isSendingOtp ? "Sending..." : "Send code"}
            </button>
          </div>
          {otpStatus && (
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
              {otpStatus}
            </p>
          )}
          {otpError && <p className="mt-2 text-xs text-red-600">{otpError}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className={authGlassInputClassName}
            placeholder="Password"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Confirm password
          </label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className={authGlassInputClassName}
            placeholder="Confirm password"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`${authPrimaryButtonClassName} mt-1 w-full`}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-stone-200/60 pt-5 text-sm text-stone-600 dark:border-slate-600/50 dark:text-stone-400">
        <p>
          Already have an account?{" "}
          <Link
            className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
            to="/login"
          >
            Login
          </Link>
        </p>
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
