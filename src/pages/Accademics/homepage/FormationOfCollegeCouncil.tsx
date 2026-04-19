import { Link } from 'react-router-dom';

function Connector() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-8 w-0.5 bg-slate-700 dark:bg-slate-400">
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] leading-none text-slate-700 dark:text-slate-400">
          ▼
        </span>
      </div>
    </div>
  );
}

function CouncilNode({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-[80px] min-w-[140px] flex-col items-center justify-center border-2 border-[#4a7c44] bg-white p-3 text-center text-sm text-slate-800 dark:border-emerald-600 dark:bg-comfortDark-card dark:text-comfortDark-text">
      <strong className="mb-1 block font-semibold">{title}</strong>
      {subtitle ? <span className="text-xs text-slate-600 dark:text-slate-300">{subtitle}</span> : null}
    </div>
  );
}

const memberRoles: { title: string; subtitle: string }[] = [
  { title: 'Vice Dean for Postgraduate Studies and Research', subtitle: '(Member)' },
  { title: 'Vice Dean for Education and Student Affairs', subtitle: '(Member)' },
  { title: 'Vice Dean for Community Service and Environmental Development', subtitle: '(Member)' },
  { title: 'Manager of Quality Assurance and Accreditation Unit', subtitle: '(Member)' },
  { title: 'Heads of Scientific Department', subtitle: '(Member)' },
  { title: 'Most Senior Professor', subtitle: '(Member)' },
  { title: 'Most Senior Associate Professor', subtitle: '(Member)' },
  { title: 'Most Senior Lecturer', subtitle: '(Member)' },
  { title: 'Teaching Assistants', subtitle: '(Member)' },
  { title: 'One or Two of stakeholders', subtitle: '(Member)' },
  { title: 'One Undergraduate Student', subtitle: '(Member)' },
];

export default function FormationOfCollegeCouncil() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] py-24 dark:bg-[#070d19]">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <p className="mb-6 text-sm">
          <Link
            to="/undergraduate"
            className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            ← Undergraduate Studies
          </Link>
        </p>

        <div className="bg-white p-6 shadow-md dark:bg-comfortDark-card sm:p-10">
          <header className="mb-8 flex flex-col gap-4 border-b-4 border-[#0d47a1] pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="text-left text-sm text-slate-800 dark:text-comfortDark-text">
              <strong className="block">MISR UNIVERSITY</strong>
              <small className="block text-slate-600 dark:text-slate-300">FOR SCIENCE & TECHNOLOGY</small>
              <small className="block text-slate-500 dark:text-slate-400">International Ranking Office</small>
            </div>
            <div className="flex-1 text-center text-sm text-slate-800 dark:text-comfortDark-text">
              <strong className="block">Misr University for Science and Technology</strong>
              <span className="mt-1 block text-[#2e7d32] dark:text-emerald-400">Formation of College Council</span>
            </div>
            <div className="text-right text-sm text-slate-800 dark:text-comfortDark-text" dir="rtl">
              <strong className="block">جامعة مصر</strong>
              <small className="block text-slate-600 dark:text-slate-300">للعلوم والتكنولوجيا</small>
              <small className="block text-slate-500 dark:text-slate-400">مكتب التصنيف الدولي</small>
            </div>
          </header>

          <div className="flex flex-col items-center">
            <CouncilNode title="College Council Members" />
            <Connector />
            <CouncilNode title="College Dean" subtitle="Head" />
            <Connector />

            <div className="mt-2 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memberRoles.map((role) => (
                <CouncilNode key={role.title} title={role.title} subtitle={role.subtitle} />
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-slate-800 underline dark:text-comfortDark-text">
            Council&apos;s Secretary must be selected from the teaching staff members.
          </p>
        </div>
      </div>
    </div>
  );
}
