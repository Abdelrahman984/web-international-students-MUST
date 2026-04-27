import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, type MyProfile } from "../services/profileApi";

export function Profile() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextProfile = await getMyProfile();
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName =
    profile?.fullName ||
    profile?.studentProfile?.fullName ||
    profile?.userName ||
    "User";
  const avatarLabel =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const avatarUrl = profile?.advisorProfile?.avatarUrl?.trim() || "";

  const roleBadges = useMemo(() => profile?.roles || [], [profile?.roles]);

  const detailItem = (label: string, value?: string | number | null) => (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
        {value?.toString().trim() || "—"}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-6">
            <Link
              to="/settings"
              className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Open Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/30 bg-white/15 text-2xl font-bold uppercase tracking-wider backdrop-blur-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLabel
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">
                My Profile
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80">
                {profile?.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {roleBadges.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    {role}
                  </span>
                ))}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    profile?.emailConfirmed
                      ? "bg-emerald-200/20 text-emerald-50"
                      : "bg-amber-200/20 text-amber-50"
                  }`}
                >
                  {profile?.emailConfirmed
                    ? "Email confirmed"
                    : "Email pending"}
                </span>
              </div>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Account Overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your core identity and contact details.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {detailItem("User ID", profile?.id)}
              {detailItem("Username", profile?.userName)}
              {detailItem("Email", profile?.email)}
              {detailItem("Phone", profile?.phoneNumber)}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Student Profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Academic data provided by the backend.
              </p>
            </div>
            {profile?.studentProfile ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {detailItem("Student ID", profile.studentProfile.studentId)}
                {detailItem("Full Name", profile.studentProfile.fullName)}
                {detailItem("Nationality", profile.studentProfile.nationality)}
                {detailItem("Major", profile.studentProfile.major)}
                {detailItem("College", profile.studentProfile.college)}
                {detailItem("GPA", profile.studentProfile.gpa)}
                {detailItem("Class", profile.studentProfile.className)}
                {detailItem("Mobile", profile.studentProfile.mobile)}
                {detailItem("Advisor", profile.studentProfile.advisorName)}
                {detailItem("Status", profile.studentProfile.status)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No student profile data is available for this account.
              </div>
            )}
          </section>

          {profile?.advisorProfile && (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Advisor Profile
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Only available when the account is linked to an advisor
                  record.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {detailItem("Advisor ID", profile.advisorProfile.id)}
                {detailItem("Advisor Name", profile.advisorProfile.fullName)}
                {detailItem(
                  "Advisor Username",
                  profile.advisorProfile.username,
                )}
                {detailItem("Advisor Email", profile.advisorProfile.email)}
                {detailItem(
                  "Status",
                  profile.advisorProfile.isActive ? "Active" : "Inactive",
                )}
                {detailItem(
                  "Super Admin",
                  profile.advisorProfile.isSuperAdmin ? "Yes" : "No",
                )}
              </div>
            </section>
          )}

          {!profile?.studentProfile && !profile?.advisorProfile && (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No nested profile details were returned for this account.
            </section>
          )}

          <div className="pt-2">
            <Link
              to="/settings"
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
