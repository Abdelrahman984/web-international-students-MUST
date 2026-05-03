import { useEffect, useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import { AcademicStaffProfileCardProps } from "../../../components/AcademicStaffProfileCard";
import StaffAccordion from "../../../components/StaffAccordion";
import { getAcademicStaffList } from "../../../services/cmsApi";

export default function AcademicStaff() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const rows = await getAcademicStaffList();

        if (rows.length > 0) {
          const formattedStaff = rows.map(
            (member): AcademicStaffProfileCardProps => {
              return {
                title: member.title,
                firstName: member.firstName,
                lastName: member.lastName,
                position: member.position,
                name: member.name,
                role: member.role,
                specialty: member.specialty || "",
                department: member.department || member.role || "",
                email: member.email || "",
                bio: member.bio || "",
                cvLabel: member.cvLabel || "Download CV (PDF)",
                googleScholarLink: member.googleScholarLink,
                imageUrl:
                  member.avatarUrl === "#"
                    ? "/accademics/image-not-hero.png"
                    : member.avatarUrl,
                cvUrl: member.cvUrl,
              };
            },
          );
          setStaffList(formattedStaff);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        setStatus("Network error: Could not load academic staff.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStaff();
  }, []);

  const groupAcademicStaffByTitle = (
    list: AcademicStaffProfileCardProps[],
  ): [string, AcademicStaffProfileCardProps[]][] => {
    const titleOrder = [
      "Professor",
      "Assistant Professor",
      "Lecturer",
      "Assistant Lecturer",
      "Teaching Assistant",
    ];

    const groupedStaff = list.reduce(
      (acc, member) => {
        const title = member.title?.trim() || "Other Staff";

        if (!acc[title]) {
          acc[title] = [];
        }

        acc[title].push(member);
        return acc;
      },
      {} as Record<string, AcademicStaffProfileCardProps[]>,
    );

    const orderedEntries: [string, AcademicStaffProfileCardProps[]][] = [];

    titleOrder.forEach((title) => {
      const members = groupedStaff[title];
      if (members?.length) {
        orderedEntries.push([title, members]);
      }
    });

    Object.entries(groupedStaff).forEach(([title, members]) => {
      if (!titleOrder.includes(title)) {
        orderedEntries.push([title, members]);
      }
    });

    return orderedEntries;
  };

  return (
    <section className="mx-auto w-full max-w-[1024px] px-4 py-24 pt-32 sm:px-8">
      <div className="mb-12 text-center md:text-left">
        <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Academic Staff
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Meet our dedicated team of professors, lecturers, and teaching
          assistants committed to academic excellence.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : status ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="font-medium">{status}</p>
        </div>
      ) : staffList.length > 0 ? (
        <div className="flex flex-col gap-6">
          {(() => {
            const groupedStaff = groupAcademicStaffByTitle(staffList);

            return groupedStaff.map(([roleName, members], index) => (
              <StaffAccordion
                key={roleName}
                roleName={roleName}
                staffList={members}
                defaultOpen={index === 0}
              />
            ));
          })()}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No staff profiles found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We couldn't find any academic staff profiles at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
