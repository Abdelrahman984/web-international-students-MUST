import { LinkResourceCard } from '../../../components/LinkResourceCard';

const E_LEARNING_URL = 'https://smartlearning.must.edu.eg/';

export default function ELearning() {
  return (
    <section className="min-h-screen bg-slate-50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">E-Learning</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
          Access the university Smart Learning portal.
        </p>

        <div className="mt-8 max-w-3xl">
          <LinkResourceCard title="E-Learning" href={E_LEARNING_URL} />
        </div>
      </div>
    </section>
  );
}