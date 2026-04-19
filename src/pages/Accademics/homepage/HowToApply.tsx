
import { PdfResourceCard } from '../../../components/PdfResourceCard';

const HOW_TO_APPLY_PDF_URL = '/How%20to%20Apply.pdf';

export default function HowToApply() {
  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">How To Apply</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Download or open the official How To Apply guide.
        </p>

        <div className="mt-8 max-w-3xl">
          <PdfResourceCard title="How To Apply" url={HOW_TO_APPLY_PDF_URL} />
        </div>
      </div>
    </section>
  );
}
