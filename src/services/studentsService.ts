import { api } from "../lib/axios";

export const studentMajors = ["cs", "is", "ai", "general"] as const;
export type StudentMajor = (typeof studentMajors)[number];
export const studentStatuses = ["active", "discontinued"] as const;
export type StudentStatus = (typeof studentStatuses)[number];

export interface StudentInput {
  studentId: string;
  fullName: string;
  nationality: string;
  major: StudentMajor;
  level: string;
  college: string;
  teamCode: string;
  amit: string;
  className: string;
  mobile: string;
  email: string;
  advisorName: string;
  gpa: number | null;
  status: StudentStatus;
}

export interface StudentRecord {
  student_id: string;
  full_name: string;
  nationality: string;
  college: string | null;
  major: StudentMajor;
  team_code: string | null;
  amit: string | null;
  level: string;
  class_name: string | null;
  mobile: string | null;
  email: string | null;
  advisor_name: string | null;
  gpa: number | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

type StudentApiPayload = {
  student_id: string;
  full_name: string;
  nationality: string;
  major: StudentMajor;
  level: string;
  college: string | null;
  team_code: string | null;
  amit: string | null;
  class_name: string | null;
  mobile: string | null;
  email: string | null;
  advisor_name: string | null;
  gpa: number | null;
  status: StudentStatus;
};

function nullableTrimmed(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toStudentPayload(input: StudentInput): StudentApiPayload {
  return {
    student_id: input.studentId.trim(),
    full_name: input.fullName.trim(),
    nationality: input.nationality.trim(),
    major: input.major,
    level: input.level.trim(),
    college: nullableTrimmed(input.college),
    team_code: nullableTrimmed(input.teamCode),
    amit: nullableTrimmed(input.amit),
    class_name: nullableTrimmed(input.className),
    mobile: nullableTrimmed(input.mobile),
    email: nullableTrimmed(input.email),
    advisor_name: nullableTrimmed(input.advisorName),
    gpa: input.gpa,
    status: input.status,
  };
}

async function findStudentById(
  studentId: string,
): Promise<StudentRecord | null> {
  const response = await api.get<StudentRecord[]>("/students", {
    params: { student_id: studentId },
  });

  return response.data?.[0] ?? null;
}

export async function listStudents(): Promise<StudentRecord[]> {
  try {
    const response = await api.get("/PreApprovedStudents");
    const responseData = response.data;

    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    if (responseData && Array.isArray(responseData.items)) {
      return responseData.items;
    }
    if (Array.isArray(responseData)) {
      return responseData;
    }

    return [];
  } catch (error: any) {
    throw new Error("Failed to list students: " + error.message);
  }
}

export async function createStudent(input: any): Promise<void> {
  try {
    await api.post("/students", toStudentPayload(input as StudentInput));
  } catch (error: any) {
    throw new Error("Failed to create student: " + error.message);
  }
}

export async function updateStudent(id: string, input: any): Promise<void> {
  try {
    await api.put("/students/" + id, toStudentPayload(input as StudentInput));
  } catch (error: any) {
    throw new Error("Failed to update student: " + error.message);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    await api.delete("/students/" + id);
  } catch (error: any) {
    throw new Error("Failed to delete student: " + error.message);
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
    await api.put("/students/replace", {
      students: students.map((student) => toStudentPayload(student)),
    });
  } catch {
    const existing = await listStudents();
    await Promise.all(
      existing.map((student) => deleteStudent(student.student_id)),
    );
    await Promise.all(students.map((student) => createStudent(student)));
  }
}

export async function updateStudentStatus(
  studentId: string,
  status: StudentStatus,
): Promise<void> {
  try {
    await api.patch(`/students/${studentId}`, { status });
    return;
  } catch {
    const existing = await findStudentById(studentId);
    if (!existing) {
      throw new Error("Failed to update student status: student not found.");
    }

    await api.put(`/students/${studentId}`, {
      ...existing,
      status,
    });
  }
}

export async function uploadStudentsExcel(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    await api.post("/Admin/upload-students", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    throw new Error(
      "Failed to upload students file: " +
        (error.response?.data?.message || error.message),
    );
  }
}
