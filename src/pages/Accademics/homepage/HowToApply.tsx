import { Link } from "react-router-dom";
import { PdfResourceCard } from '../../../components/PdfResourceCard';

const HOW_TO_APPLY_PDF_URL = '/How%20to%20Apply.pdf';

export default function HowToApply() {
  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <div className="sticky top-28 z-[1000] mb-10 flex justify-start">
          <Link
            to="/admission"
            className="inline-flex items-center gap-3 rounded-xl bg-[#11203d] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1a305e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#11203d]/30 no-underline"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
            Back to Admission
          </Link>
        </div>
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
