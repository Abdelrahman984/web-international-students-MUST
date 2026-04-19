import { useEffect, useState } from 'react';
import AcademicStaffProfileCard, { AcademicStaffProfileCardProps } from '../../../components/AcademicStaffProfileCard';
import StaffAccordion from '../../../components/StaffAccordion';
import { getAcademicStaffList } from '../../../services/cmsApi';

export default function AcademicStaff() {
  const [staffList, setStaffList] = useState<AcademicStaffProfileCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const rows = await getAcademicStaffList();

        if (rows.length > 0) {
          const formattedStaff = rows.map((member): AcademicStaffProfileCardProps => {
            return {
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
            };
          });
          setStaffList(formattedStaff);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStaff();
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-8 lg:px-10">
      <h2 className="mb-8 text-center text-3xl font-bold text-slate-900 sm:text-left">Academic Staff</h2>
      {isLoading ? (
        <div className="animate-pulse text-emerald-600">Loading Staff...</div>
      ) : staffList.length > 0 ? (
        <div className="flex flex-col gap-4">
          {Object.entries(
            staffList.reduce((acc, member) => {
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
            }, {} as Record<string, AcademicStaffProfileCardProps[]>)
          ).map(([roleName, members], index) => (
            <StaffAccordion
              key={roleName}
              roleName={roleName}
              staffList={members}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-slate-500">No staff profiles found.</div>
      )}
    </section>
  );
}