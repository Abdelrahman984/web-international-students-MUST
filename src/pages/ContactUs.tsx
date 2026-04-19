interface ContactCardProps {
  title: string;
  lines: string[];
}

function ContactCard({ title, lines }: ContactCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
        {lines.map((line, index) => (
          <p key={`${title}-${index}`}>{line}</p>
        ))}
      </div>
    </article>
  );
}

interface ContactFormProps {
  title: string;
  submitLabel: string;
}

function ContactForm({ title, submitLabel }: ContactFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          placeholder="First name"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <input
          type="text"
          placeholder="Last name"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <input
          type="text"
          placeholder="Subject"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        />
        <textarea
          placeholder="Your message"
          rows={6}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        />
        <button
          type="submit"
          className="md:col-span-2 inline-flex justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export function ContactUs() {
  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Contact Us</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Get in touch with the university support and admissions teams.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ContactCard
            title="Main Campus"
            lines={[
              '6th of October City, Giza, Egypt',
              'Landline: +20 2 3824 7455',
              'Fax: +20 2 3824 7456',
            ]}
          />
          <ContactCard
            title="Admissions"
            lines={[
              'Email: admissions@must.edu.eg',
              'Phone: +20 100 000 0000',
              'Sun - Thu: 9:00 AM - 4:00 PM',
            ]}
          />
          <ContactCard
            title="Student Support"
            lines={[
              'Email: support@must.edu.eg',
              'Phone: +20 101 111 1111',
              'Sun - Thu: 9:00 AM - 5:00 PM',
            ]}
          />
        </section>

        <section className="mx-auto mt-8 w-full max-w-4xl space-y-4">
          <ContactForm title="Contact Sector Head" submitLabel="Send to Sector Head" />
          <ContactForm title="Send Complaint" submitLabel="Submit Complaint" />
        </section>
      </div>
    </div>
  );
}

