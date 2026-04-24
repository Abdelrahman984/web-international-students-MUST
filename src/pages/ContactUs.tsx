import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";

interface ContactCardProps {
  title: string;
  lines: string[];
}

function ContactCard({ title, lines }: ContactCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
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
  showCategorySelect?: boolean;
}

function ContactForm({
  title,
  submitLabel,
  showCategorySelect = false,
}: ContactFormProps) {
  const [category, setCategory] = useState("suggestions");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !subject || !messageText) {
      setFeedback({ type: "error", text: "Please fill out all fields." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFeedback({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const submissionType = showCategorySelect ? category : "super_admin_message";
      const payload = {
        submission_type: submissionType,
        sender_name: `${firstName} ${lastName}`,
        sender_email: email,
        subject,
        message_text: messageText,
      };

      await apiClient.post("/api/contact_submissions", payload);
      setFeedback({ type: "success", text: "Your message has been sent successfully!" });
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("");
      setMessageText("");
      if (showCategorySelect) setCategory("suggestions");
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <form
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        {feedback && (
          <div className={`md:col-span-2 p-4 rounded-xl text-sm font-semibold ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {feedback.text}
          </div>
        )}
        {showCategorySelect && (
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
          >
            <option value="suggestions">Suggestion</option>
            <option value="complaints">Complaint</option>
          </select>
        )}
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        />
        <textarea
          placeholder="Your message"
          rows={6}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 md:col-span-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="md:col-span-2 inline-flex justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : submitLabel}
        </button>
      </form>
    </section>
  );
}

export function ContactUs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "support") as
    | "support"
    | "admissions";

  const tabs: Array<{
    key: "support" | "admissions";
    label: string;
    submitLabel: string;
    showCategorySelect?: boolean;
  }> = [
    {
      key: "support",
      label: "Contact Sector Head",
      submitLabel: "Send to Sector Head",
    },
    {
      key: "admissions",
      label: "Send Suggestion or Complaint",
      submitLabel: "Submit Suggestion or Complaint",
      showCategorySelect: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Get in touch with the university support and admissions teams.
          </p>
        </header>

        {/* <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ContactCard
            title="Main Campus"
            lines={[
              "6th of October City, Giza, Egypt",
              "Landline: +20 2 3824 7455",
              "Fax: +20 2 3824 7456",
            ]}
          />
          <ContactCard
            title="Admissions"
            lines={[
              "Email: admissions@must.edu.eg",
              "Phone: +20 100 000 0000",
              "Sun - Thu: 9:00 AM - 4:00 PM",
            ]}
          />
          <ContactCard
            title="Student Support"
            lines={[
              "Email: support@must.edu.eg",
              "Phone: +20 101 111 1111",
              "Sun - Thu: 9:00 AM - 5:00 PM",
            ]}
          />
        </section> */}

        <section className="mx-auto mt-8 w-full max-w-4xl">
          {/* <div className="mb-4 flex items-center gap-2 rounded-xl bg-transparent p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setSearchParams({ tab: t.key })}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none ${
                  activeTab === t.key
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div> */}

          <div>
            {tabs.map(
              (t) =>
                activeTab === t.key && (
                  <ContactForm
                    key={t.key}
                    title={t.label}
                    submitLabel={t.submitLabel}
                    showCategorySelect={t.showCategorySelect}
                  />
                ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
