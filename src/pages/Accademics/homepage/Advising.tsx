import { PdfResourceCard } from '../../../components/PdfResourceCard';

const ACADEMIC_ADVISING_PDFS = [
  { title: 'Academic Advising Guide (English)', url: '/Academic%20Advising%20Guide%20EN.pdf' },
  { title: 'Academic Advising Guide (Arabic)', url: '/Academic%20Advising%20Guide%20AR.pdf' },
];

export default function Advising() {
  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Academic Advising</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Download or open the official academic advising guides.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ACADEMIC_ADVISING_PDFS.map((item) => (
            <PdfResourceCard key={item.url} title={item.title} url={item.url} />
          ))}
        </div>
      </div>
    </section>
  );
}
