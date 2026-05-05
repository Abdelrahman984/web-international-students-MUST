import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../services/api";
import { MessagesSquare, MessageCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

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
  const { t } = useLanguage();
  const [category, setCategory] = useState("suggestions");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !subject || !messageText) {
      setFeedback({ type: "error", text: "Please fill out all fields." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFeedback({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const submissionType = showCategorySelect
        ? category
        : "super_admin_message";
      const payload = {
        submission_type: submissionType,
        sender_name: `${firstName} ${lastName}`,
        sender_email: email,
        subject,
        message_text: messageText,
      };

      await apiClient.post("/api/contact_submissions", payload);
      setFeedback({
        type: "success",
        text: "Your message has been sent successfully!",
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("");
      setMessageText("");
      if (showCategorySelect) setCategory("suggestions");
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        text: "Failed to send message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <form
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        {feedback && (
          <div
            className={`md:col-span-2 p-4 rounded-xl text-sm font-semibold ${feedback.type === "success" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
          >
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
  const { t } = useLanguage();
  const activeTab = searchParams.get("tab") as "support" | "admissions" | null;

  const tabs: Array<{
    key: "support" | "admissions";
    label: string;
    description: string;
    submitLabel: string;
    icon: any;
    showCategorySelect?: boolean;
  }> = [
    {
      key: "support",
      label: "Contact Sector Head",
      description: "Direct communication with the university leadership.",
      submitLabel: "Send to Sector Head",
      icon: MessagesSquare,
    },
    {
      key: "admissions",
      label: t("send_suggestion") || "Send Suggestion or Complaint",
      description: "Help us improve or share your concerns with our team.",
      submitLabel: "Submit Suggestion or Complaint",
      icon: MessageCircle,
      showCategorySelect: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
        <header className="mb-10 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Get in touch with the university support and admissions teams.
          </p>
        </header>

        <section className="mx-auto w-full max-w-4xl">
          {!activeTab ? (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSearchParams({ tab: tab.key })}
                  className="group flex w-full flex-col items-center justify-center gap-5 rounded-2xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-900/20"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
                    <tab.icon
                      className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                      {tab.label}
                    </h2>
                    <p className="mt-3 max-w-md text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </button>
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
          )}
        </section>
      </div>
    </div>
  );
}
