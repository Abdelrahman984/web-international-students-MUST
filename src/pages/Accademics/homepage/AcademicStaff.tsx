import { useEffect, useState } from "react";
import { AcademicStaffProfileCardProps } from "../../../components/AcademicStaffProfileCard";
import StaffAccordion from "../../../components/StaffAccordion";
import { getAcademicStaffList } from "../../../services/cmsApi";

export default function AcademicStaff() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

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
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-8 lg:px-10">
      <h2 className="mb-8 text-center text-3xl font-bold text-slate-900 sm:text-left">
        Academic Staff
      </h2>
      {isLoading ? (
        <div className="animate-pulse text-emerald-600">Loading Staff...</div>
      ) : staffList.length > 0 ? (
        <div className="flex flex-col gap-4">
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
        <div className="text-slate-500">No staff profiles found.</div>
      )}
    </section>
  );
}
