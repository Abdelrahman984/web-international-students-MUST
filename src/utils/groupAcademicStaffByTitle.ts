import type { AcademicStaffProfileCardProps } from "../components/AcademicStaffProfileCard";

const TITLE_ORDER = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Assistant Lecturer",
  "Teaching Assistant",
  "Demonstrator",
];

function normalizeTitle(title?: string) {
  const trimmedTitle = title?.trim();
  return trimmedTitle && trimmedTitle.length > 0 ? trimmedTitle : "Other Staff";
}

export function groupAcademicStaffByTitle(
  list: AcademicStaffProfileCardProps[],
): [string, AcademicStaffProfileCardProps[]][] {
  const groupedStaff = list.reduce(
    (acc, member) => {
      const title = normalizeTitle(member.title);

      if (!acc[title]) {
        acc[title] = [];
      }

      acc[title].push(member);
      return acc;
    },
    {} as Record<string, AcademicStaffProfileCardProps[]>,
  );

  const orderedEntries: [string, AcademicStaffProfileCardProps[]][] = [];

  TITLE_ORDER.forEach((title) => {
    const members = groupedStaff[title];

    if (members?.length) {
      orderedEntries.push([title, members]);
    }
  });

  Object.entries(groupedStaff).forEach(([title, members]) => {
    if (!TITLE_ORDER.includes(title)) {
      orderedEntries.push([title, members]);
    }
  });

  return orderedEntries;
}
