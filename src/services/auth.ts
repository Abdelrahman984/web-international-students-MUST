import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { ROLES, type RoleType } from '../constants/roles';
import { getSupabaseConfigError, supabase } from './supabase';

export interface StrapiRole {
  id: string | number;
  name: string;
  type: RoleType;
}

export interface StrapiUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  universityId?: string;
  bio?: string;
  phoneNumber?: string;
  avatar?: {
    id: string | number;
    url: string;
  } | null;
  role?: StrapiRole;
}

interface AuthResponse {
  jwt: string | null;
  user: StrapiUser;
}

type ProfileRow = {
  student_id: string;
  full_name: string;
  nationality: string;
  major: 'cs' | 'is' | 'ai' | 'general';
  level: string;
  gpa?: number | null;
};

const getProfilesTable = () => import.meta.env.VITE_SUPABASE_STUDENTS_TABLE || 'students';

const getAvatarBucket = () => import.meta.env.VITE_SUPABASE_AVATARS_BUCKET || 'avatars';

const usernameFromEmail = (email?: string | null) => {
  if (!email) {
    return 'user';
  }

  const [localPart] = email.split('@');
  return localPart || 'user';
};

const majorValues = new Set(['cs', 'is', 'ai', 'general']);

const normalizeMajor = (value: unknown): 'cs' | 'is' | 'ai' | 'general' => {
  if (typeof value !== 'string') {
    return 'general';
  }

  const normalized = value.trim().toLowerCase();
  return majorValues.has(normalized) ? (normalized as 'cs' | 'is' | 'ai' | 'general') : 'general';
};

const getStudentIdFromAuthUser = (authUser: SupabaseAuthUser): string => {
  const metadata = authUser.user_metadata || {};
  const fromMetadata = metadata.universityId ?? metadata.university_id ?? metadata.student_id;
  if (typeof fromMetadata === 'string' && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  return authUser.id;
};

async function ensureProfile(authUser: SupabaseAuthUser, profilePatch: Partial<ProfileRow> = {}): Promise<void> {
  const profilesTable = getProfilesTable();
  const metadata = authUser.user_metadata || {};
  const resolvedStudentId = profilePatch.student_id || getStudentIdFromAuthUser(authUser);

  const upsertPayload: ProfileRow = {
    student_id: resolvedStudentId,
    full_name:
      profilePatch.full_name ??
      metadata.displayName ??
      metadata.display_name ??
      metadata.full_name ??
      usernameFromEmail(authUser.email),
    nationality: profilePatch.nationality ?? metadata.nationality ?? 'Unknown',
    major: normalizeMajor(profilePatch.major ?? metadata.major),
    level: profilePatch.level ?? metadata.level ?? 'Unknown',
    gpa: typeof profilePatch.gpa === 'number' ? profilePatch.gpa : null,
  };

  const { error } = await supabase.from(profilesTable).upsert(upsertPayload, { onConflict: 'student_id' });
  if (error) {
    throw new Error(error.message);
  }
}

async function fetchProfile(studentId: string): Promise<ProfileRow | null> {
  const profilesTable = getProfilesTable();
  const { data, error } = await supabase
    .from(profilesTable)
    .select('student_id, full_name, nationality, major, level, gpa')
    .eq('student_id', studentId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function buildUser(authUser: SupabaseAuthUser, profile: ProfileRow | null): StrapiUser {
  const roleType: RoleType = (authUser.user_metadata?.role || 'visitor') as RoleType;
  const metadata = authUser.user_metadata || {};
  const avatarUrl =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
    (typeof metadata.avatarUrl === 'string' && metadata.avatarUrl) ||
    null;
  const bio = (typeof metadata.bio === 'string' && metadata.bio) || undefined;
  const phone =
    (typeof metadata.phone_number === 'string' && metadata.phone_number) ||
    (typeof metadata.phoneNumber === 'string' && metadata.phoneNumber) ||
    undefined;

  return {
    id: profile?.student_id || getStudentIdFromAuthUser(authUser),
    username: (typeof metadata.username === 'string' && metadata.username) || usernameFromEmail(authUser.email),
    email: authUser.email || '',
    displayName:
      profile?.full_name ||
      (typeof metadata.displayName === 'string' ? metadata.displayName : undefined) ||
      (typeof metadata.display_name === 'string' ? metadata.display_name : undefined),
    universityId:
      profile?.student_id ||
      (typeof metadata.universityId === 'string' ? metadata.universityId : undefined) ||
      (typeof metadata.university_id === 'string' ? metadata.university_id : undefined),
    bio,
    phoneNumber: phone,
    avatar: avatarUrl
      ? {
        id: profile?.student_id || authUser.id,
        url: avatarUrl,
      }
      : null,
    role: {
      id: roleType,
      name: roleType,
      type: roleType,
    },
  };
}

async function isAdvisorUser(authUser: SupabaseAuthUser): Promise<boolean> {
  const candidateEmail = (authUser.email || '').trim().toLowerCase();

  let byIdQuery = supabase
    .from('advisor_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('id', authUser.id)
    .eq('is_active', true);

  const byIdResult = await byIdQuery;
  if (!byIdResult.error && (byIdResult.count || 0) > 0) {
    return true;
  }

  if (candidateEmail) {
    const byEmailResult = await supabase
      .from('advisor_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('email', candidateEmail)
      .eq('is_active', true);

    if (!byEmailResult.error && (byEmailResult.count || 0) > 0) {
      return true;
    }
  }

  return false;
}

async function buildCurrentUser(authUser: SupabaseAuthUser): Promise<StrapiUser> {
  const studentId = getStudentIdFromAuthUser(authUser);
  let advisorFlag = false;

  try {
    advisorFlag = await isAdvisorUser(authUser);
  } catch (error) {
    console.warn('Advisor role lookup failed, falling back to auth metadata role.', error);
  }

  try {
    const profile = await fetchProfile(studentId);
    const baseUser = buildUser(authUser, profile);

    if (advisorFlag) {
      return {
        ...baseUser,
        role: {
          id: ROLES.ADMIN,
          name: 'Advisor',
          type: ROLES.ADMIN,
        },
      };
    }

    return baseUser;
  } catch (error) {
    // Keep auth usable even if profile table sync/read fails.
    console.warn('Profile fetch failed, using auth metadata fallback.', error);
    const baseUser = buildUser(authUser, null);

    if (advisorFlag) {
      return {
        ...baseUser,
        role: {
          id: ROLES.ADMIN,
          name: 'Advisor',
          type: ROLES.ADMIN,
        },
      };
    }

    return baseUser;
  }
}

function normalizeAuthError(err: unknown, mode: 'login' | 'register'): Error {
  const message = err instanceof Error ? err.message : String(err);

  if (message.toLowerCase() === 'forbidden') {
    if (mode === 'register') {
      return new Error('Registration is currently disabled by the server. Please contact an administrator.');
    }
    return new Error('Login is forbidden for this account. Check if the account is blocked or not permitted.');
  }

  if (mode === 'login' && /invalid identifier or password/i.test(message)) {
    return new Error('Invalid email/username or password.');
  }

  return new Error(message || 'Authentication failed.');
}

function ensureSupabaseAuthReady(): void {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: 'visitor' | 'college-member';
  universityId?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  ensureSupabaseAuthReady();

  if (!identifier.includes('@')) {
    throw new Error('Please sign in with your email address.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed.');
    }

    try {
      await ensureProfile(data.user);
    } catch (profileError) {
      console.warn('Profile sync failed during login. Continuing with auth user.', profileError);
    }
    const user = await buildCurrentUser(data.user);

    return {
      jwt: data.session?.access_token || null,
      user,
    };
  } catch (err) {
    throw normalizeAuthError(err, 'login');
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  ensureSupabaseAuthReady();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          username: payload.username,
          displayName: payload.displayName,
          role: payload.role,
          universityId: payload.universityId || null,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed.');
    }

    try {
      await ensureProfile(data.user, {
        student_id: payload.universityId || data.user.id,
        full_name: payload.displayName,
        nationality: 'Unknown',
        major: 'general',
        level: payload.role === 'college-member' ? 'College Member' : 'Visitor',
      });
    } catch (profileError) {
      console.warn('Profile sync failed during registration. Continuing with auth user.', profileError);
    }

    let accessToken = data.session?.access_token || null;
    if (!accessToken) {
      const loginResponse = await login(payload.email, payload.password);
      return loginResponse;
    }

    const user = await buildCurrentUser(data.user);

    return {
      jwt: accessToken,
      user,
    };
  } catch (err) {
    throw normalizeAuthError(err, 'register');
  }
}

export async function me(token: string): Promise<StrapiUser> {
  const { data, error } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No active user session found.');
  }

  try {
    await ensureProfile(data.user);
  } catch (profileError) {
    console.warn('Profile sync failed during session restore. Continuing with auth user.', profileError);
  }

  return buildCurrentUser(data.user);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  if (!payload.currentPassword) {
    throw new Error('Current password is required.');
  }

  const { error } = await supabase.auth.updateUser({
    password: payload.password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProfile(userId: string, data: UpdateProfilePayload): Promise<StrapiUser> {
  const profilesTable = getProfilesTable();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error(userError?.message || 'No active user session found.');
  }

  const currentAuthUser = userData.user;
  const currentMetadata = currentAuthUser.user_metadata || {};
  const resolvedStudentId =
    userId ||
    (typeof currentMetadata.universityId === 'string' ? currentMetadata.universityId : '') ||
    (typeof currentMetadata.university_id === 'string' ? currentMetadata.university_id : '') ||
    currentAuthUser.id;

  const mergedMetadata = {
    ...currentMetadata,
    displayName: data.displayName ?? currentMetadata.displayName ?? currentMetadata.display_name ?? null,
    display_name: data.displayName ?? currentMetadata.display_name ?? currentMetadata.displayName ?? null,
    universityId: resolvedStudentId,
    university_id: resolvedStudentId,
    bio: data.bio ?? currentMetadata.bio ?? null,
    phoneNumber: data.phoneNumber ?? currentMetadata.phoneNumber ?? currentMetadata.phone_number ?? null,
    phone_number: data.phoneNumber ?? currentMetadata.phone_number ?? currentMetadata.phoneNumber ?? null,
    avatarUrl: data.avatarUrl ?? currentMetadata.avatarUrl ?? currentMetadata.avatar_url ?? null,
    avatar_url: data.avatarUrl ?? currentMetadata.avatar_url ?? currentMetadata.avatarUrl ?? null,
  };

  const { error: metadataError } = await supabase.auth.updateUser({
    data: mergedMetadata,
  });

  if (metadataError) {
    throw new Error(metadataError.message);
  }

  if (data.displayName) {
    const { error: profileError } = await supabase
      .from(profilesTable)
      .update({ full_name: data.displayName.trim() })
      .eq('student_id', resolvedStudentId);

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  return me('');
}

export async function uploadAvatar(file: File): Promise<{ id: number; url: string }> {
  const { data: currentUserResponse, error: userError } = await supabase.auth.getUser();
  if (userError || !currentUserResponse.user) {
    throw new Error('You must be logged in to upload an avatar.');
  }

  const bucket = getAvatarBucket();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const path = `${currentUserResponse.user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Failed to generate avatar URL.');
  }

  return {
    id: 0,
    url: data.publicUrl,
  };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data.session?.access_token || null;
}
