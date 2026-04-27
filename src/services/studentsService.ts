import { api } from "../lib/axios";
import { getStoredAuthToken } from "../utils/storageUtils";

export const studentMajors = ["cs", "is", "ai", "general"] as const;
export type StudentMajor = (typeof studentMajors)[number];
export const studentStatuses = ["active", "discontinued"] as const;
export type StudentStatus = (typeof studentStatuses)[number];

export interface StudentInput {
  studentId: string;
  fullName: string;
  nationality: string;
  major: StudentMajor;
  college: string;
  termCodeAdmit: string;
  className: string;
  mobile: string;
  email: string;
  advisorName: string;
  gpa: number | null;
  status: StudentStatus;
}

export interface StudentRecord {
  id: number;
  serial?: string | null;
  studentId: string;
  name: string;
  nationality: string;
  college: string | null;
  major: StudentMajor;
  termCodeAdmit: string | null;
  className: string | null;
  mobile: string | null;
  email: string | null;
  advisorName: string | null;
  gpa: number | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
  student_id?: string;
  full_name?: string;
  class_name?: string;
  advisor_name?: string;
}

type StudentApiPayload = {
  id: number;
  serial: string;
  studentId: string;
  name: string;
  college: string;
  major: string;
  termCodeAdmit: string;
  gpa: string;
  className: string;
  mobile: string;
  email: string;
  advisorName: string;
  nationality: string;
  status: string;
};

type StudentPutApiPayload = StudentApiPayload;

function toGpaString(value: number | null): string | null {
  if (value == null) return null;
  if (!Number.isFinite(value)) return null;
  return String(value);
}

function normalizedText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function toStudentPayload(input: StudentInput): StudentApiPayload {
  return {
    id: 0,
    serial: "",
    studentId: normalizedText(input.studentId),
    name: normalizedText(input.fullName),
    college: normalizedText(input.college),
    major: normalizedText(input.major),
    termCodeAdmit: normalizedText(input.termCodeAdmit),
    gpa: toGpaString(input.gpa) ?? "",
    className: normalizedText(input.className),
    mobile: normalizedText(input.mobile),
    email: normalizedText(input.email),
    advisorName: normalizedText(input.advisorName),
    nationality: normalizedText(input.nationality),
    status: normalizedText(input.status),
  };
}

function toStudentPutPayload(
  id: string | number,
  input: StudentInput,
): StudentPutApiPayload {
  const base = toStudentPayload(input);
  const parsedId = Number.parseInt(String(id), 10);

  return {
    id: Number.isFinite(parsedId) ? parsedId : 0,
    serial: base.serial,
    studentId: base.studentId,
    name: base.name,
    college: base.college,
    major: base.major,
    termCodeAdmit: base.termCodeAdmit,
    gpa: base.gpa,
    className: base.className,
    mobile: base.mobile,
    email: base.email,
    advisorName: base.advisorName,
    nationality: base.nationality,
    status: base.status,
  };
}

function hasItemValidationError(error: any): boolean {
  const itemErrors = error?.response?.data?.errors?.item;
  return Array.isArray(itemErrors) && itemErrors.length > 0;
}

function getApiErrorMessage(error: any, fallback: string): string {
  const responseData = error?.response?.data;
  const responseMessage =
    responseData?.message || responseData?.title || error?.message;
  return responseMessage ? `${fallback}: ${responseMessage}` : fallback;
}

function normalizeMajor(value: unknown): StudentMajor {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["cs", "computer science", "computer sciences"].includes(normalized)) {
    return "cs";
  }
  if (
    ["is", "information systems", "information system"].includes(normalized)
  ) {
    return "is";
  }
  if (["ai", "artificial intelligence"].includes(normalized)) {
    return "ai";
  }
  if (["general", "general track", "general major"].includes(normalized)) {
    return "general";
  }

  return "general";
}

function normalizeStatus(value: unknown): StudentStatus {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized === "discontinued" ? "discontinued" : "active";
}

function normalizeGpa(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function mapStudentRecord(raw: any): StudentRecord {
  const id = Number(raw?.id);
  const nowIso = new Date().toISOString();

  return {
    id: Number.isFinite(id) ? id : 0,
    serial: raw?.serial ?? null,
    studentId: String(raw?.studentId ?? raw?.student_id ?? "").trim(),
    name: String(raw?.name ?? raw?.full_name ?? "").trim(),
    nationality: String(raw?.nationality ?? "").trim(),
    college: raw?.college == null ? null : String(raw.college).trim(),
    major: normalizeMajor(raw?.major),
    termCodeAdmit:
      raw?.termCodeAdmit == null
        ? raw?.amit == null
          ? null
          : String(raw.amit).trim()
        : String(raw.termCodeAdmit).trim(),
    className:
      raw?.className == null
        ? raw?.class_name == null
          ? null
          : String(raw.class_name).trim()
        : String(raw.className).trim(),
    mobile: raw?.mobile == null ? null : String(raw.mobile).trim(),
    email: raw?.email == null ? null : String(raw.email).trim(),
    advisorName:
      raw?.advisorName == null
        ? raw?.advisor_name == null
          ? null
          : String(raw.advisor_name).trim()
        : String(raw.advisorName).trim(),
    gpa: normalizeGpa(raw?.gpa),
    status: normalizeStatus(raw?.status),
    created_at: String(raw?.created_at ?? nowIso),
    updated_at: String(raw?.updated_at ?? nowIso),
    student_id:
      raw?.student_id == null
        ? String(raw?.studentId ?? "").trim() || undefined
        : String(raw.student_id).trim(),
    full_name:
      raw?.full_name == null
        ? String(raw?.name ?? "").trim() || undefined
        : String(raw.full_name).trim(),
    class_name:
      raw?.class_name == null
        ? raw?.className == null
          ? undefined
          : String(raw.className).trim()
        : String(raw.class_name).trim(),
    advisor_name:
      raw?.advisor_name == null
        ? raw?.advisorName == null
          ? undefined
          : String(raw.advisorName).trim()
        : String(raw.advisor_name).trim(),
  };
}

async function findStudentById(
  studentIdOrId: string | number,
): Promise<StudentRecord | null> {
  const response = await api.get("/PreApprovedStudents");
  const responseData = response.data;

  const items: any[] = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData?.items)
        ? responseData.items
        : [];

  const target = String(studentIdOrId);
  const match = items.find((item) => {
    const byId = item?.id != null && String(item.id) === target;
    const byStudentId =
      item?.studentId != null && String(item.studentId) === target;
    const byStudentIdSnake =
      item?.student_id != null && String(item.student_id) === target;

    return byId || byStudentId || byStudentIdSnake;
  });

  return (match as StudentRecord) ?? null;
}

export async function listStudents(): Promise<StudentRecord[]> {
  try {
    const response = await api.get("/PreApprovedStudents");
    const responseData = response.data;

    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data.map((student: unknown) =>
        mapStudentRecord(student),
      );
    }
    if (responseData && Array.isArray(responseData.items)) {
      return responseData.items.map((student: unknown) =>
        mapStudentRecord(student),
      );
    }
    if (Array.isArray(responseData)) {
      return responseData.map((student: unknown) => mapStudentRecord(student));
    }

    return [];
  } catch (error: any) {
    throw new Error("Failed to list students: " + error.message);
  }
}

export async function createStudent(input: any): Promise<void> {
  try {
    await api.post(
      "/preapprovedstudents",
      toStudentPayload(input as StudentInput),
    );
  } catch (error: any) {
    throw new Error(getApiErrorMessage(error, "Failed to create student"));
  }
}

export async function updateStudent(
  id: string | number,
  input: any,
): Promise<void> {
  const payload = toStudentPutPayload(id, input as StudentInput);

  try {
    await api.put("/preapprovedstudents/" + id, payload);
  } catch (error: any) {
    if (hasItemValidationError(error)) {
      try {
        await api.put("/preapprovedstudents/" + id, { item: payload });
        return;
      } catch (wrappedError: any) {
        throw new Error(
          getApiErrorMessage(wrappedError, "Failed to update student"),
        );
      }
    }

    throw new Error(getApiErrorMessage(error, "Failed to update student"));
  }
}

export async function deleteStudent(id: string | number): Promise<void> {
  try {
    await api.delete("/preapprovedstudents/" + id);
  } catch (error: any) {
    throw new Error(getApiErrorMessage(error, "Failed to delete student"));
  }
}

export async function bulkImportStudents(students: any[]): Promise<void> {
  for (const s of students) {
    try {
      await createStudent(s as StudentInput);
    } catch {
      console.warn("Failed to import one student, continuing...");
    }
  }
}

export async function replaceAllStudents(
  students: StudentInput[],
): Promise<void> {
  try {
    await api.put("/preapprovedstudents/replace", {
      students: students.map((student) => toStudentPayload(student)),
    });
  } catch {
    const existing = await listStudents();
    await Promise.all(existing.map((student) => deleteStudent(student.id)));
    await Promise.all(students.map((student) => createStudent(student)));
  }
}

export async function updateStudentStatus(
  studentId: string | number,
  status?: StudentStatus,
): Promise<void> {
  const studentIdStr = String(studentId);
  try {
    const nextStatus = status ?? "active";
    await api.patch(`/preapprovedstudents/${studentIdStr}`, {
      status: nextStatus,
    });
    return;
  } catch {
    const existing = await findStudentById(studentIdStr);
    if (!existing) {
      throw new Error("Failed to update student status: student not found.");
    }

    const derivedCurrentStatus: StudentStatus =
      existing.status === "discontinued" ? "discontinued" : "active";
    const toggledStatus: StudentStatus =
      derivedCurrentStatus === "active" ? "discontinued" : "active";
    const finalStatus = status ?? toggledStatus;

    await api.put(
      `/preapprovedstudents/${studentIdStr}`,
      toStudentPutPayload(studentIdStr, {
        studentId: existing.studentId ?? existing.student_id ?? "",
        fullName: existing.name ?? existing.full_name ?? "",
        nationality: existing.nationality ?? "",
        major: existing.major ?? "cs",
        college: existing.college ?? "",
        termCodeAdmit: existing.termCodeAdmit ?? "",
        className: existing.className ?? existing.class_name ?? "",
        mobile: existing.mobile ?? "",
        email: existing.email ?? "",
        advisorName: existing.advisorName ?? existing.advisor_name ?? "",
        gpa: existing.gpa,
        status: finalStatus,
      }),
    );
  }
}

export async function uploadStudentsExcel(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const token = getStoredAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await api.post("/Admin/upload-students", formData, { headers });
  } catch (error: any) {
    throw new Error(
      "Failed to upload students file: " +
        (error.response?.data?.message || error.message),
    );
  }
}
