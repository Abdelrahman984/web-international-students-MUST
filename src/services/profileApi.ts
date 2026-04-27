import { apiClient } from "./api";

export interface StudentProfile {
  studentId: string;
  fullName: string;
  nationality: string;
  major: string;
  college: string;
  gpa: string;
  className: string;
  mobile: string;
  advisorName: string;
  status: string;
}

export interface AdvisorProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  username: string;
}

export interface MyProfile {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  roles: string[];
  studentProfile?: StudentProfile | null;
  advisorProfile?: AdvisorProfile | null;
}

export interface UpdateMyProfilePayload {
  fullName?: string;
  phoneNumber?: string;
}

const unwrapProfile = (data: unknown): MyProfile => {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: MyProfile }).data;
  }

  return data as MyProfile;
};

export async function getMyProfile(): Promise<MyProfile> {
  const response = await apiClient.get("/api/Profiles/me");
  return unwrapProfile(response.data);
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
): Promise<MyProfile> {
  const response = await apiClient.put("/api/Profiles/me", payload);
  return unwrapProfile(response.data);
}
