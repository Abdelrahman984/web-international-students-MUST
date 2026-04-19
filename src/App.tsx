import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MustHeader } from './components/MustHeader/MustHeader';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { FloatingSocialBar } from './components/FloatingSocialBar';
import { ChatPanel } from './components/Chat/ChatPanel';

// Pages
import { Academics } from "./pages/Accademics/Academics";
import Undergraduate from "./pages/Accademics/homepage/Undergraduate";
import FormationOfCollegeCouncil from "./pages/Accademics/homepage/FormationOfCollegeCouncil";
import Postgraduate from "./pages/Accademics/homepage/Postgraduate";
import Registeration from "./pages/Accademics/homepage/Registeration";
import Schedules from "./pages/Accademics/homepage/Schedules";
import Calendar from "./pages/Accademics/homepage/Calendar";
import Advising from './pages/Accademics/homepage/Advising';
import HowToApply from './pages/Accademics/homepage/HowToApply';
import ELearning from './pages/Accademics/homepage/ELearning';
import HonorList from './pages/Accademics/homepage/HonorList';
import Questionnaires from './pages/Questionnaires';
import { Resources } from './pages/Resources';
import { Facilities } from './pages/Facilities';
import { Announcements } from './pages/Announcements';
import { Notifications } from './pages/Notifications';
import { ContactUs } from './pages/ContactUs';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { SubmitRequest } from './pages/SubmitRequest';
import { MyRequests } from './pages/MyRequests';
import HomePage from './pages/Home';
import { CmsPage } from './pages/CmsPage';
import Playground from './pages/Playground';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import ActivitiesPage from './pages/Activities';
import AdvisingPage from './pages/Advising';

// Custom Collection Pages
import News from './pages/News'; 
import Events from './pages/Events'; 

import { ProfileProvider } from './contexts/ProfileContext';
import { RequestsProvider } from './contexts/RequestsContext';
import { AuthProvider } from './context/AuthContext';
import { ChatStoreProvider } from './context/ChatContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export type PageType = 'academics' | 'questionnaires' | 'resources' | 'announcements' | 'notifications' | 'contact-us' | 'profile' | 'settings' | 'submit-request' | 'my-requests';

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode !== darkMode) {
      setDarkMode(savedDarkMode);
      document.documentElement.classList.toggle('dark', savedDarkMode);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-comfortDark-bg text-comfortDark-text' : 'bg-white text-gray-900'}`}>
      <MustHeader darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <HeroSlider />
      <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
        <AnimatePresence mode="wait" key={location.pathname}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-140px)]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              
              {/* --- CUSTOM COLLECTION ROUTES --- */}
              <Route path="/academics" element={<Academics />} />
              <Route path="/undergraduate" element={<Undergraduate />} />
              <Route path="/formation-of-college-council" element={<FormationOfCollegeCouncil />} />
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
              <Route path="/cultural" element={<ActivitiesPage />} />
              <Route path="/sports" element={<ActivitiesPage />} />
              <Route path="/art" element={<ActivitiesPage />} />
              <Route path="/student-clubs" element={<ActivitiesPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/events" element={<Events />} />
              {/* ------------------------------------- */}

              <Route path="/questionnaires" element={<Questionnaires />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/submit-request" element={<SubmitRequest />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/playground" element={<Playground />} />
              
              <Route path="/:slug" element={<CmsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </motion.div>
        </AnimatePresence>
      </main>
      <Footer darkMode={darkMode} />
      <FloatingSocialBar />
      <ChatPanel />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ChatStoreProvider>
        <ProfileProvider>
          <RequestsProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </RequestsProvider>
        </ProfileProvider>
      </ChatStoreProvider>
    </AuthProvider>
  );
}