import { FormEvent, useEffect, useMemo, useState } from "react";
import { changePassword, type ChangePasswordPayload } from "../services/auth";
import {
  getMyProfile,
  updateMyProfile,
  type MyProfile,
} from "../services/profileApi";

type SettingsTab = "profile" | "security";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const nextProfile = await getMyProfile();
        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
        setDisplayName(
          nextProfile.fullName || nextProfile.studentProfile?.fullName || "",
        );
        setPhoneNumber(
          nextProfile.phoneNumber || nextProfile.studentProfile?.mobile || "",
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load profile settings.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const canSavePassword = useMemo(() => {
    return Boolean(
      currentPassword.trim() && newPassword.trim() && confirmPassword.trim(),
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const displayNamePreview =
    profile?.fullName ||
    profile?.studentProfile?.fullName ||
    displayName ||
    profile?.userName ||
    "Your profile";
  const roles = profile?.roles || [];
  const avatarUrl = profile?.advisorProfile?.avatarUrl?.trim() || "";
  const avatarLabel =
    displayNamePreview
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const profileStat = (label: string, value?: string | number | null) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
        {value?.toString().trim() || "—"}
      </p>
    </div>
  );

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!profile) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSavingProfile(true);

    try {
      const updatedProfile = await updateMyProfile({
        fullName: displayName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setProfile(updatedProfile);
      setDisplayName(
        updatedProfile.fullName ||
          updatedProfile.studentProfile?.fullName ||
          "",
      );
      setPhoneNumber(
        updatedProfile.phoneNumber ||
          updatedProfile.studentProfile?.mobile ||
          "",
      );
      setMessage("Profile details saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!canSavePassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Profile data could not be loaded.
          </p>
          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 text-xl font-black uppercase tracking-wider backdrop-blur-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayNamePreview}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLabel
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/70">
                  Settings
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Edit your profile
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  Keep your account identity, contact details, and security
                  settings in sync with the profile service.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  {role}
                </span>
              ))}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${profile.emailConfirmed ? "bg-emerald-200/20 text-emerald-50" : "bg-amber-200/20 text-amber-50"}`}
              >
                {profile.emailConfirmed ? "Email confirmed" : "Email pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "profile" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "security" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
            >
              Security
            </button>
          </div>

          {message && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">
              {error}
            </p>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Editable Profile
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    These fields are sent to PUT /api/Profiles/me.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone Number
                    </label>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Read Only Details
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Derived from the profile API response.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {profileStat("Email", profile.email)}
                  {profileStat("Username", profile.userName)}
                  {profileStat(
                    "Email Confirmed",
                    profile.emailConfirmed ? "Yes" : "No",
                  )}
                  {profileStat("Roles", roles.length ? roles.join(", ") : "—")}
                </div>
              </section>

              {profile.studentProfile && (
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Student Profile
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      For visibility only in this screen.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {profileStat(
                      "Student ID",
                      profile.studentProfile.studentId,
                    )}
                    {profileStat(
                      "Nationality",
                      profile.studentProfile.nationality,
                    )}
                    {profileStat("Major", profile.studentProfile.major)}
                    {profileStat("College", profile.studentProfile.college)}
                    {profileStat("GPA", profile.studentProfile.gpa)}
                    {profileStat("Class", profile.studentProfile.className)}
                    {profileStat("Mobile", profile.studentProfile.mobile)}
                    {profileStat("Advisor", profile.studentProfile.advisorName)}
                    {profileStat("Status", profile.studentProfile.status)}
                  </div>
                </section>
              )}

              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSavePassword || isSavingPassword}
                className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
