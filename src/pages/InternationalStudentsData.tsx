import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDownIcon,
  SlidersHorizontalIcon,
  MailIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
  Pen,
  Trash2,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  uploadStudentsExcel,
  createStudent,
  listStudents,
  updateStudent,
  deleteStudent,
  studentMajors,
  studentStatuses,
  type StudentInput,
  type StudentRecord,
} from "../services/studentsService";

type SortBy = "name" | "id" | "gpa";
type SortDirection = "asc" | "desc";

interface InternationalStudentsDataProps {
  onNavigateToMessages?: () => void;
}

const DEFAULT_FORM_VALUES: StudentInput = {
  studentId: "",
  fullName: "",
  nationality: "",
  major: "cs",
  college: "",
  termCodeAdmit: "",
  className: "",
  mobile: "",
  email: "",
  advisorName: "",
  gpa: null,
  status: "active",
};

export function InternationalStudentsData({
  onNavigateToMessages,
}: InternationalStudentsDataProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null,
  );
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [formValues, setFormValues] =
    useState<StudentInput>(DEFAULT_FORM_VALUES);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(
    null,
  );
  const [isImporting, setIsImporting] = useState(false);
  const [statusSavingStudentId, setStatusSavingStudentId] = useState<
    string | null
  >(null);

  // Filters state
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filterNationality, setFilterNationality] = useState<string>("all");
  const [filterAdvisor, setFilterAdvisor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAgeMin, setFilterAgeMin] = useState<string>("");
  const [filterAgeMax, setFilterAgeMax] = useState<string>("");
  const [filterGpaMin, setFilterGpaMin] = useState<string>("");
  const [filterGpaMax, setFilterGpaMax] = useState<string>("4");

  // Temporary modal state (so Cancel doesn't immediately apply)
  const [tempFilterNationality, setTempFilterNationality] =
    useState<string>(filterNationality);
  const [tempFilterAdvisor, setTempFilterAdvisor] =
    useState<string>(filterAdvisor);
  const [tempFilterStatus, setTempFilterStatus] =
    useState<string>(filterStatus);
  const [tempFilterAgeMin, setTempFilterAgeMin] =
    useState<string>(filterAgeMin);
  const [tempFilterAgeMax, setTempFilterAgeMax] =
    useState<string>(filterAgeMax);
  const [tempFilterGpaMin, setTempFilterGpaMin] =
    useState<string>(filterGpaMin);
  const [tempFilterGpaMax, setTempFilterGpaMax] =
    useState<string>(filterGpaMax);
  const [tempSelectedMajor, setTempSelectedMajor] =
    useState<string>(selectedMajor);

  const nationalityOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.nationality) set.add(s.nationality);
    });
    return Array.from(set).sort((a, b) =>
      String(a || "").localeCompare(String(b || "")),
    );
  }, [students]);

  const advisorOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.advisorName && s.advisorName.trim() !== "") set.add(s.advisorName);
    });
    return Array.from(set).sort((a, b) =>
      String(a || "").localeCompare(String(b || "")),
    );
  }, [students]);

  const hasAge = useMemo(() => {
    return students.some(
      (s) => typeof (s as any).age === "number" || !!(s as any).age,
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = students.filter((student) => {
      const actualEmail = student.email?.toLowerCase() ?? "";
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (student.studentId || "").toLowerCase().includes(normalizedSearch) ||
        (student.name || "").toLowerCase().includes(normalizedSearch) ||
        actualEmail.includes(normalizedSearch);

      const matchesMajor =
        selectedMajor === "all" || student.major === selectedMajor;

      // Filters
      const matchesNationality =
        filterNationality === "all" ||
        (student.nationality ?? "").toLowerCase() ===
          filterNationality.toLowerCase();

      const matchesAdvisor =
        filterAdvisor === "all" ||
        (student.advisorName ?? "").toLowerCase() ===
          filterAdvisor.toLowerCase();

      const matchesStatus =
        filterStatus === "all" || student.status === filterStatus;

      const gpaMin = filterGpaMin.trim() === "" ? null : Number(filterGpaMin);
      const gpaMax = filterGpaMax.trim() === "" ? null : Number(filterGpaMax);
      const studentGpa = student.gpa != null ? Number(student.gpa) : null;
      const matchesGpa =
        (gpaMin == null && gpaMax == null) ||
        (studentGpa != null &&
          (gpaMin == null || studentGpa >= gpaMin) &&
          (gpaMax == null || studentGpa <= gpaMax));

      const ageMin = filterAgeMin.trim() === "" ? null : Number(filterAgeMin);
      const ageMax = filterAgeMax.trim() === "" ? null : Number(filterAgeMax);
      const studentAge =
        typeof (student as any).age === "number"
          ? (student as any).age
          : typeof (student as any).age === "string"
            ? Number((student as any).age)
            : null;
      const matchesAge =
        !hasAge || (ageMin == null && ageMax == null)
          ? true
          : studentAge != null &&
            (ageMin == null || studentAge >= ageMin) &&
            (ageMax == null || studentAge <= ageMax);

      return (
        matchesSearch &&
        matchesMajor &&
        matchesNationality &&
        matchesAdvisor &&
        matchesStatus &&
        matchesGpa &&
        matchesAge
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "id") {
        comparison = String(a.studentId || "").localeCompare(
          String(b.studentId || ""),
        );
      }

      if (sortBy === "gpa") {
        const gpaA = a.gpa != null ? Number(a.gpa) : Number.NEGATIVE_INFINITY;
        const gpaB = b.gpa != null ? Number(b.gpa) : Number.NEGATIVE_INFINITY;
        comparison = gpaA - gpaB;
      }

      return sortDirection === "asc" ? comparison : comparison * -1;
    });

    return filtered;
  }, [
    searchTerm,
    selectedMajor,
    sortBy,
    sortDirection,
    students,
    filterNationality,
    filterAdvisor,
    filterStatus,
    filterAgeMin,
    filterAgeMax,
    filterGpaMin,
    filterGpaMax,
    hasAge,
  ]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    setFeedbackError(null);

    try {
      const data = await listStudents();
      setStudents(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load students.";
      setFeedbackError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormFieldChange = (field: keyof StudentInput, value: string) => {
    if (field === "gpa") {
      const nextGpa = value.trim() === "" ? null : Number(value);
      setFormValues((previous) => ({
        ...previous,
        gpa: Number.isFinite(nextGpa) ? nextGpa : null,
      }));
      return;
    }

    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setIsSubmitting(true);

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formValues);
        setFeedbackSuccess("Student updated successfully.");
      } else {
        await createStudent(formValues);
        setFeedbackSuccess("Student created successfully.");
      }
      setFormValues(DEFAULT_FORM_VALUES);
      setShowAddForm(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create student.";
      setFeedbackError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportStudents = async () => {
    if (!selectedImportFile) {
      setFeedbackError("Please choose an Excel file first.");
      return;
    }

    setIsImporting(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      await uploadStudentsExcel(selectedImportFile);
      setSelectedImportFile(null);
      setFeedbackSuccess(
        "Successfully uploaded and imported students from the Excel file.",
      );
      await loadStudents();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import students.";
      setFeedbackError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditClick = (student: StudentRecord) => {
    setEditingStudent(student);
    setFormValues({
      studentId: student.studentId || "",
      fullName: student.name || "",
      nationality: student.nationality || "",
      major: student.major || "cs",
      college: student.college || "",
      termCodeAdmit: student.termCodeAdmit || "",
      className: student.className || "",
      mobile: student.mobile || "",
      email: student.email || "",
      advisorName: student.advisorName || "",
      gpa: student.gpa != null ? Number(student.gpa) : null,
      status: student.status || "active",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      await deleteStudent(studentToDelete.id);
      setFeedbackSuccess("Student deleted successfully.");
      await loadStudents();
    } catch (error: any) {
      setFeedbackError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete student.",
      );
    } finally {
      setStudentToDelete(null);
    }
  };

  const formatGpa = (gpa: unknown): string => {
    if (gpa == null || gpa === "") return "N/A";

    let num: number | null = null;

    if (typeof gpa === "number") {
      num = Number.isFinite(gpa) ? gpa : null;
    } else {
      const str = String(gpa).trim().replace(",", ".");
      const parsed = Number(str);
      num = Number.isFinite(parsed) ? parsed : null;
    }

    if (num == null) return "N/A";
    return num.toFixed(2);
  };

  const navigateToMessages = () => {
    onNavigateToMessages?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-must-text-primary">
            Student Data
          </h1>
          <p className="text-sm text-must-text-secondary mt-1 max-w-2xl">
            Manage the student roster and analytics table. Each Excel import
            clears existing records and loads only what is in the new sheet.
          </p>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-4">
          <form className="space-y-4" onSubmit={handleSaveStudent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Student ID"
                value={formValues.studentId}
                onChange={(event) =>
                  handleFormFieldChange("studentId", event.target.value)
                }
                placeholder="e.g. 2025001"
                required
              />

              <Input
                label="Full Name"
                value={formValues.fullName}
                onChange={(event) =>
                  handleFormFieldChange("fullName", event.target.value)
                }
                placeholder="e.g. Ahmed Mohamed"
                required
              />

              <Input
                label="Nationality"
                value={formValues.nationality}
                onChange={(event) =>
                  handleFormFieldChange("nationality", event.target.value)
                }
                placeholder="e.g. Egypt"
                required
              />

              <Input
                label="College"
                value={formValues.college ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("college", event.target.value)
                }
                placeholder="e.g. College of Information Technology"
              />

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Major
                </label>
                <select
                  value={formValues.major}
                  onChange={(event) =>
                    handleFormFieldChange("major", event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-must-surface text-sm focus:ring-2 focus:ring-must-green outline-none"
                >
                  {studentMajors.map((major) => (
                    <option key={major} value={major}>
                      {major.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Term Code Admit"
                value={formValues.termCodeAdmit ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("termCodeAdmit", event.target.value)
                }
                placeholder="e.g. 2024FA"
              />

              <Input
                label="Class"
                value={formValues.className ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("className", event.target.value)
                }
                placeholder="e.g. Class A"
              />

              <Input
                label="Mobile"
                value={formValues.mobile ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("mobile", event.target.value)
                }
                placeholder="e.g. 01000000000"
              />

              <Input
                label="Email"
                type="email"
                value={formValues.email ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("email", event.target.value)
                }
                placeholder="e.g. student@must.edu.eg"
              />

              <Input
                label="Advisor Name"
                value={formValues.advisorName ?? ""}
                onChange={(event) =>
                  handleFormFieldChange("advisorName", event.target.value)
                }
                placeholder="e.g. Dr. Ahmed Mohamed"
              />

              <Input
                label="Current GPA"
                type="number"
                min={0}
                max={4}
                step="0.01"
                value={formValues.gpa == null ? "" : String(formValues.gpa)}
                onChange={(event) =>
                  handleFormFieldChange("gpa", event.target.value)
                }
                placeholder="Leave empty if unavailable"
              />

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Status
                </label>
                <select
                  value={formValues.status ?? "active"}
                  onChange={(event) =>
                    handleFormFieldChange("status", event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-must-surface text-sm focus:ring-2 focus:ring-must-green outline-none"
                >
                  {studentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "discontinued" ? "Discontinued" : "Active"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingStudent
                    ? "Update Student"
                    : "Save Student"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {feedbackError && (
        <Card className="p-3 border border-red-300 text-red-700 dark:text-red-300">
          {feedbackError}
        </Card>
      )}

      {feedbackSuccess && (
        <Card className="p-3 border border-green-300 text-green-700 dark:text-green-300">
          {feedbackSuccess}
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by ID, Name, or Email..."
              icon={<SearchIcon className="w-4 h-4" />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            {/* Major & Level moved into the Filters panel */}
            <Button
              variant="outline"
              icon={<SlidersHorizontalIcon className="w-4 h-4" />}
              onClick={() => {
                setTempFilterNationality(filterNationality);
                setTempFilterAdvisor(filterAdvisor);
                setTempFilterStatus(filterStatus);
                setTempFilterAgeMin(filterAgeMin);
                setTempFilterAgeMax(filterAgeMax);
                setTempFilterGpaMin(filterGpaMin);
                setTempFilterGpaMax(filterGpaMax);
                setTempSelectedMajor(selectedMajor);
                setFiltersOpen(true);
              }}
            >
              Filters
            </Button>
            <div className="flex items-center gap-2 border border-must-border rounded-lg px-3 bg-must-surface min-w-[250px]">
              <ArrowUpDownIcon className="w-4 h-4 text-must-text-secondary" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                className="py-2 bg-transparent text-sm outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="id">Sort by ID</option>
                <option value="gpa">Sort by GPA</option>
              </select>
              <select
                value={sortDirection}
                onChange={(event) =>
                  setSortDirection(event.target.value as SortDirection)
                }
                className="py-2 bg-transparent text-sm outline-none"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {filtersOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-xl border border-must-border bg-white shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200 mt-20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-must-text-primary">
                  Filters
                </h3>
                <p className="text-sm text-must-text-secondary mt-1">
                  Narrow student results by selected criteria.
                </p>
              </div>
              <div>
                <button
                  className="text-sm text-must-text-secondary"
                  onClick={() => setFiltersOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Major
                </label>
                <select
                  value={tempSelectedMajor}
                  onChange={(e) => setTempSelectedMajor(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                >
                  <option value="all">All</option>
                  {studentMajors.map((major) => (
                    <option key={major} value={major}>
                      {major.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Nationality
                </label>
                <select
                  value={tempFilterNationality}
                  onChange={(e) => setTempFilterNationality(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                >
                  <option value="all">All</option>
                  {nationalityOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Advisor
                </label>
                <select
                  value={tempFilterAdvisor}
                  onChange={(e) => setTempFilterAdvisor(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                >
                  <option value="all">All</option>
                  {advisorOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Age (min)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={tempFilterAgeMin}
                  onChange={(e) => setTempFilterAgeMin(e.target.value)}
                  disabled={!hasAge}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Age (max)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={tempFilterAgeMax}
                  onChange={(e) => setTempFilterAgeMax(e.target.value)}
                  disabled={!hasAge}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  GPA (min)
                </label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  step="0.01"
                  value={tempFilterGpaMin}
                  onChange={(e) => setTempFilterGpaMin(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  GPA (max)
                </label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  step="0.01"
                  value={tempFilterGpaMax}
                  onChange={(e) => setTempFilterGpaMax(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-must-text-primary mb-1">
                  Status
                </label>
                <select
                  value={tempFilterStatus}
                  onChange={(e) => setTempFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-must-border bg-white text-sm outline-none"
                >
                  <option value="all">All</option>
                  {studentStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  // reset both temp and applied filters (including major/level)
                  setTempFilterNationality("all");
                  setTempFilterAdvisor("all");
                  setTempFilterStatus("all");
                  setTempFilterAgeMin("");
                  setTempFilterAgeMax("");
                  setTempFilterGpaMin("");
                  setTempFilterGpaMax("4");
                  setTempSelectedMajor("all");
                  setFilterNationality("all");
                  setFilterAdvisor("all");
                  setFilterStatus("all");
                  setFilterAgeMin("");
                  setFilterAgeMax("");
                  setFilterGpaMin("");
                  setFilterGpaMax("4");
                  setSelectedMajor("all");
                  setFiltersOpen(false);
                }}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => setFiltersOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setFilterNationality(tempFilterNationality);
                  setFilterAdvisor(tempFilterAdvisor);
                  setFilterStatus(tempFilterStatus);
                  setFilterAgeMin(tempFilterAgeMin);
                  setFilterAgeMax(tempFilterAgeMax);
                  setFilterGpaMin(tempFilterGpaMin);
                  setFilterGpaMax(tempFilterGpaMax);
                  setSelectedMajor(tempSelectedMajor);
                  setFiltersOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-must-border">
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Student ID
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Full Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  College
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Major
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Term Code Admit
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Class
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Mobile
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Advisor
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Nationality
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  GPA
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-must-text-secondary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-must-border">
              {!isLoading &&
                filteredStudents.map((student) => (
                  <tr
                    key={student.studentId || Math.random().toString()}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-must-text-primary">
                      {student.studentId && student.studentId.trim() !== ""
                        ? student.studentId
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-primary flex items-center gap-3">
                      {student.name && student.name.trim() !== ""
                        ? student.name
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.college && student.college.trim() !== ""
                        ? student.college
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.major && student.major.trim() !== ""
                        ? student.major.toUpperCase()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.termCodeAdmit &&
                      student.termCodeAdmit.trim() !== ""
                        ? student.termCodeAdmit
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.className && student.className.trim() !== ""
                        ? student.className
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.mobile && student.mobile.trim() !== ""
                        ? student.mobile
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.email && student.email.trim() !== ""
                        ? student.email
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.advisorName && student.advisorName.trim() !== ""
                        ? student.advisorName
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {student.nationality && student.nationality.trim() !== ""
                        ? student.nationality
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-must-text-secondary">
                      {formatGpa(student.gpa)}
                    </td>
                    <td className="px-6 py-4 text-sm">{student.status}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        className="p-1.5 text-slate-400 hover:text-must-green transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit Student"
                        onClick={() => handleEditClick(student)}
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Delete Student"
                        onClick={() => setStudentToDelete(student)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-must-green transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Open Messages"
                        onClick={navigateToMessages}
                      >
                        <MessageSquareIcon className="w-4 h-4" />
                      </button>
                      <a
                        className={`inline-flex p-1.5 transition-colors rounded-md ${student.email ? "text-slate-400 hover:text-must-navy hover:bg-slate-100 dark:hover:bg-slate-700" : "text-slate-300 opacity-50 cursor-not-allowed"}`}
                        title={
                          student.email ? "Send Email" : "No Email Available"
                        }
                        href={
                          student.email ? `mailto:${student.email}` : undefined
                        }
                        onClick={(e) => {
                          if (!student.email) e.preventDefault();
                        }}
                      >
                        <MailIcon className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              {!isLoading && filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={15}
                    className="px-6 py-8 text-center text-sm text-must-text-secondary"
                  >
                    No students found.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td
                    colSpan={15}
                    className="px-6 py-8 text-center text-sm text-must-text-secondary"
                  >
                    Loading students...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-must-border flex items-center justify-between">
          <span className="text-sm text-must-text-secondary">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
      </Card>

      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setStudentToDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-must-border bg-white shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-must-text-primary">
                  Delete Student
                </h3>
                <p className="text-sm text-must-text-secondary mt-1">
                  Are you sure you want to delete{" "}
                  <strong>
                    {studentToDelete.name && studentToDelete.name.trim() !== ""
                      ? studentToDelete.name
                      : "this student"}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setStudentToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
