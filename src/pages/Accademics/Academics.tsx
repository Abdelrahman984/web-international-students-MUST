import { useEffect, useState } from 'react';
import AcademicStaffProfileCard, { AcademicStaffProfileCardProps } from '../../components/AcademicStaffProfileCard';
import StaffAccordion from '../../components/StaffAccordion';
import { getAcademicStaffList } from '../../services/cmsApi';

export function Academics() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const rows = await getAcademicStaffList();

        if (rows.length > 0) {
          const formattedStaff = rows.map((member): AcademicStaffProfileCardProps => ({
            title: member.title,
            firstName: member.firstName,
            lastName: member.lastName,
            position: member.position,
            name: member.name,
            role: member.role,
            specialty: member.specialty || '',
            department: member.department || member.role || '',
            email: member.email || '',
            bio: member.bio || '',
            cvLabel: member.cvLabel || 'Download CV (PDF)',
            googleScholarLink: member.googleScholarLink,
            imageUrl: member.avatarUrl === '#' ? '/accademics/image-not-hero.png' : member.avatarUrl,
            cvUrl: member.cvUrl,
          }));
          setStaffList(formattedStaff);
        } else {
          setStatus('Connected to Supabase, but no staff profiles were found.');
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        setStatus('Network error: Could not connect to Supabase.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStaff();
  }, []);

  const groupByRole = (list: AcademicStaffProfileCardProps[]): Record<string, AcademicStaffProfileCardProps[]> => {
    return list.reduce((acc, member) => {
      const r = [member.role, member.title, member.name].filter(Boolean).join(' ').toLowerCase();
      let roleGroup = 'Academic Staff';

      if (r.includes('assistant lecturer')) {
        roleGroup = 'Assistant Lecturers';
      } else if (r.includes('lecturer')) {
        roleGroup = 'Lecturers';
      } else if (r.includes('asst') && r.includes('prof')) {
        roleGroup = 'Assistant Professors';
      } else if (r.includes('prof')) {
        roleGroup = 'Professors';
      } else if (r.includes('teaching assistant')) {
        roleGroup = 'Teaching Assistants';
      } else if (r.includes('demonstrator')) {
        roleGroup = 'Demonstrators';
      } else if (member.role) {
        roleGroup = member.role;
      }

      if (!acc[roleGroup]) acc[roleGroup] = [];
      acc[roleGroup].push(member);
      return acc;
    }, {} as Record<string, AcademicStaffProfileCardProps[]>);
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1400px] px-4 py-16 pt-32">
      <h1 className="mb-12 text-center text-4xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-left">
        Academic Staff
      </h1>

      {isLoading ? (
        <div className="animate-pulse p-12 text-center text-xl font-bold text-emerald-600 dark:text-emerald-400">
          Loading staff from Supabase...
        </div>
      ) : status ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-xl font-bold text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
          {status}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groupByRole(staffList)).map(([roleName, members], index) => (
            <StaffAccordion
              key={roleName}
              roleName={roleName}
              staffList={members}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
