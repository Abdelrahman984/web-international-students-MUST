import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { MustHeader } from "./components/MustHeader/MustHeader";
import { Footer } from "./components/Footer";
import { HeroSlider } from "./components/HeroSlider";
import { FloatingSocialBar } from "./components/FloatingSocialBar";

import VisitorChat from "./components/VisitorChat";
import { ProfileProvider } from "./contexts/ProfileContext";
import { RequestsProvider } from "./contexts/RequestsContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatStoreProvider } from "./context/ChatContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AutoScrollManager } from "./components/AutoScrollManager";

const Academics = lazy(() =>
  import("./pages/Accademics/Academics").then((m) => ({
    default: m.Academics,
  })),
);
const Undergraduate = lazy(
  () => import("./pages/Accademics/homepage/Undergraduate"),
);
const FormationOfCollegeCouncil = lazy(
  () => import("./pages/Accademics/homepage/FormationOfCollegeCouncil"),
);
const Postgraduate = lazy(
  () => import("./pages/Accademics/homepage/Postgraduate"),
);
const EducationalPrograms = lazy(
  () => import("./pages/Accademics/homepage/EducationalPrograms"),
);
const Admission = lazy(() => import("./pages/Accademics/homepage/Admission"));
const Registeration = lazy(
  () => import("./pages/Accademics/homepage/Registeration"),
);
const Schedules = lazy(() => import("./pages/Accademics/homepage/Schedules"));
const Calendar = lazy(() => import("./pages/Accademics/homepage/Calendar"));
const Advising = lazy(() => import("./pages/Accademics/homepage/Advising"));
const HowToApply = lazy(() => import("./pages/Accademics/homepage/HowToApply"));
const ELearning = lazy(() => import("./pages/Accademics/homepage/ELearning"));
const HonorList = lazy(() => import("./pages/Accademics/homepage/HonorList"));
const Questionnaires = lazy(() => import("./pages/Questionnaires"));
const Resources = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.Resources })),
);
const Facilities = lazy(() =>
  import("./pages/Facilities").then((m) => ({ default: m.Facilities })),
);
const Announcements = lazy(() =>
  import("./pages/Announcements").then((m) => ({ default: m.Announcements })),
);
const AnnouncementDetail = lazy(() =>
  import("./pages/AnnouncementDetail").then((m) => ({
    default: m.AnnouncementDetail,
  })),
);
const Notifications = lazy(() =>
  import("./pages/Notifications").then((m) => ({ default: m.Notifications })),
);
const ContactUs = lazy(() =>
  import("./pages/ContactUs").then((m) => ({ default: m.ContactUs })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
const SubmitRequest = lazy(() =>
  import("./pages/SubmitRequest").then((m) => ({ default: m.SubmitRequest })),
);
const MyRequests = lazy(() =>
  import("./pages/MyRequests").then((m) => ({ default: m.MyRequests })),
);
const HomePage = lazy(() => import("./pages/Home"));
const CmsPage = lazy(() =>
  import("./pages/CmsPage").then((m) => ({ default: m.CmsPage })),
);
const Playground = lazy(() => import("./pages/Playground"));
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const Login = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);
const Register = lazy(() =>
  import("./pages/Register").then((m) => ({ default: m.Register })),
);
const ActivitiesPage = lazy(() => import("./pages/Activities"));
const ActivityDetail = lazy(() => import("./pages/ActivityDetail"));
const AdvisingPage = lazy(() => import("./pages/Advising"));
const News = lazy(() => import("./pages/News"));
const Events = lazy(() => import("./pages/Events"));
const Links = lazy(() => import("./pages/links"));
const StudentChatDotnet = lazy(() => import("./pages/StudentChatDotnet"));
const MeetTheTeam = lazy(() => import("./pages/MeetTheTeam"));

export type PageType =
  | "academics"
  | "questionnaires"
  | "resources"
  | "announcements"
  | "notifications"
  | "contact-us"
  | "profile"
  | "settings"
  | "submit-request"
  | "my-requests";

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <div className="flex items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900/40 dark:border-t-emerald-400"
          role="status"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}

function AppContent() {
  const { language } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode !== darkMode) {
      setDarkMode(savedDarkMode);
      document.documentElement.classList.toggle("dark", savedDarkMode);
    }
  }, []);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "dark bg-comfortDark-bg text-comfortDark-text" : "bg-white text-gray-900"} ${language === "ar" ? "font-tajawal" : ""}`}
    >
      <MustHeader darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      {/* Show HeroSlider only on the home page */}
      {(location.pathname === "/" || location.pathname === "/home") && (
        <HeroSlider />
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait" key={location.pathname}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-fit flex flex-col"
          >
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />

                {/* --- CUSTOM COLLECTION ROUTES --- */}
                <Route path="/academics" element={<Academics />} />
                <Route
                  path="/educational-programs"
                  element={<EducationalPrograms />}
                />
                <Route path="/admission" element={<Admission />} />
                <Route path="/undergraduate" element={<Undergraduate />} />
                <Route
                  path="/formation-of-college-council"
                  element={<FormationOfCollegeCouncil />}
                />
                <Route path="/postgraduate" element={<Postgraduate />} />
                <Route path="/registeration" element={<Registeration />} />
                <Route path="/Registeration" element={<Registeration />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/academic-advising" element={<Advising />} />
                <Route path="/how-to-apply" element={<HowToApply />} />
                <Route path="/e-learning" element={<ELearning />} />
                <Route path="/honor-list" element={<HonorList />} />
                <Route path="/advising" element={<AdvisingPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/activities/:id" element={<ActivityDetail />} />
                <Route path="/cultural" element={<ActivitiesPage />} />
                <Route path="/sports" element={<ActivitiesPage />} />
                <Route path="/art" element={<ActivitiesPage />} />
                <Route path="/student-clubs" element={<ActivitiesPage />} />
                <Route path="/news" element={<News />} />
                <Route path="/events" element={<Events />} />
                <Route path="/links" element={<Links />} />
                <Route path="/meet-the-team" element={<MeetTheTeam />} />
                {/* Query-strings are not matched in route `path` — advising tabs are handled inside AdvisingPage */}
                {/* ------------------------------------- */}

                <Route path="/questionnaires" element={<Questionnaires />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route
                  path="/announcements/:id"
                  element={<AnnouncementDetail />}
                />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/submit-request" element={<SubmitRequest />} />
                <Route path="/my-requests" element={<MyRequests />} />
                <Route path="/playground" element={<Playground />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <StudentChatDotnet />
                    </ProtectedRoute>
                  }
                />

                <Route path="/:slug" element={<CmsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer darkMode={darkMode} />
      <FloatingSocialBar />
      {/* <VisitorChat /> */}
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ChatStoreProvider>
          <ProfileProvider>
            <RequestsProvider>
              <HelmetProvider>
                <BrowserRouter>
                  <AutoScrollManager />
                  <AppContent />
                </BrowserRouter>
              </HelmetProvider>
            </RequestsProvider>
          </ProfileProvider>
        </ChatStoreProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
