import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    home: "Home",
    academics: "Academics",
    advising: "Advising",
    activities: "Activities",
    facilities: "Facilities",
    news: "News",
    events: "Events",
    links: "Links",
    contact_us: "Contact Us",
    sign_in: "Sign In",
    register: "Register",
    sign_out: "Sign Out",
    dashboard: "Dashboard",
    
    // Academics Submenu
    academic_staff: "Academic Staff",
    educational_programs: "Educational Programs",
    academic_calendar: "Academic Calendar",
    e_learning: "E-Learning",
    honor_list: "Honor List",
    admission: "Admission",
    
    // Advising Submenu
    advising_resources: "Advising Resources",
    announcement: "Announcement",
    students_data: "Students Data",
    statistical_reports: "Statistical Reports",
    
    // Activities Submenu
    cultural: "Cultural",
    sports: "Sports",
    art: "Art",
    student_clubs: "Student Clubs",
    
    // Facilities Submenu
    must_facilities: "MUST Facilities",
    international_handbook: "International Handbook",
    
    // Contact Us Submenu
    contact_sector_head: "Contact Sector Head",
    send_suggestion: "Send Suggestion or Complaint",

    // Study Plans / Programs
    study_plans: "Study Plans",
    undergraduate_studies: "Undergraduate Studies",
    postgraduate_programs: "Postgraduate Programs",
    go_back: "Go Back",
    back_to_programs: "Back to Programs",
    old_curriculum: "Old Curriculum",
    new_curriculum: "New Curriculum",
    computer_science: "Computer Science",
    information_systems: "Information Systems",
    artificial_intelligence: "Artificial Intelligence",
    general: "General",
    msc: "M.Sc.",
    phd: "Ph.D",
    professional_degrees: "Professional Degrees",
    
    // UI
    switch_to_dark: "Switch to Dark Mode",
    switch_to_light: "Switch to Light Mode",
    translate_to_ar: "Translate to Arabic",
    translate_to_en: "Translate to English",

    // Home Page
    about_the_sector: "About The Sector",
    our_purpose: "Our Purpose",
    mission: "Mission",
    our_future: "Our Future",
    vision: "Vision",
    sector_plan: "Sector Plan",
    open_plan_file: "Open Plan File",
    no_plan_file: "No plan file available yet.",
    loading_sections: "Loading home sections...",
    sector_head_name: "Asst. Lect. / Ayman S. Abdelaziz",
    sector_head_title: "Head of International Students Sector",
    no_image: "No Image",

    // Footer
    footer_links: "Links",
    footer_about_uni: "About University",
    footer_must_buzz: "MUST BUZZ",
    footer_contact_info: "Contact Info",
    footer_address: "Al-Motamayez District, 6th of October City, Giza, Egypt",
    footer_copyright: "© 2025 Misr University for Science and Technology. All Rights Reserved.",
    footer_policy: "Policy",
    apply_online: "Apply Online",
    faculties: "Faculties",
    president: "President",
    vice_presidents: "Vice Presidents",
    board_of_trustees: "Board of Trustees",
    vision_mission: "Vision & Mission",
    must_values: "MUST Values & Principles",
    history: "History",
  },
  ar: {
    // Header
    home: "الرئيسية",
    academics: "الأكاديميين",
    advising: "الإرشاد الأكاديمي",
    activities: "الأنشطة",
    facilities: "المرافق",
    news: "الأخبار",
    events: "الفعاليات",
    links: "الروابط",
    contact_us: "اتصل بنا",
    sign_in: "تسجيل الدخول",
    register: "تسجيل جديد",
    sign_out: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    
    // Academics Submenu
    academic_staff: "أعضاء هيئة التدريس",
    educational_programs: "البرامج التعليمية",
    academic_calendar: "التقويم الأكاديمي",
    e_learning: "التعلم الإلكتروني",
    honor_list: "لوحة الشرف",
    admission: "القبول والتسجيل",
    
    // Advising Submenu
    advising_resources: "مصادر الإرشاد",
    announcement: "الإعلانات",
    students_data: "بيانات الطلاب",
    statistical_reports: "التقارير الإحصائية",
    
    // Activities Submenu
    cultural: "ثقافي",
    sports: "رياضي",
    art: "فني",
    student_clubs: "الأندية الطلابية",
    
    // Facilities Submenu
    must_facilities: "مرافق جامعة مصر",
    international_handbook: "دليل الطالب الدولي",
    
    // Contact Us Submenu
    contact_sector_head: "اتصل برئيس القطاع",
    send_suggestion: "إرسال اقتراح أو شكوى",

    // Study Plans / Programs
    study_plans: "الخطط الدراسية",
    undergraduate_studies: "الدراسات الجامعية",
    postgraduate_programs: "برامج الدراسات العليا",
    go_back: "رجوع",
    back_to_programs: "العودة للبرامج",
    old_curriculum: "اللائحة القديمة",
    new_curriculum: "اللائحة الجديدة",
    computer_science: "علوم الحاسب",
    information_systems: "نظم المعلومات",
    artificial_intelligence: "الذكاء الاصطناعي",
    general: "عام",
    msc: "ماجستير",
    phd: "دكتوراه",
    professional_degrees: "الدرجات المهنية",

    // UI
    switch_to_dark: "التبديل للوضع الداكن",
    switch_to_light: "التبديل للوضع الفاتح",
    translate_to_ar: "الترجمة للعربية",
    translate_to_en: "Translate to English",

    // Home Page
    about_the_sector: "حول القطاع",
    our_purpose: "هدفنا",
    mission: "الرسالة",
    our_future: "مستقبلنا",
    vision: "الرؤية",
    sector_plan: "خطة القطاع",
    open_plan_file: "فتح ملف الخطة",
    no_plan_file: "لا يوجد ملف خطة متاح حالياً.",
    loading_sections: "جاري تحميل أقسام الصفحة...",
    sector_head_name: "م.م. / أيمن س. عبد العزيز",
    sector_head_title: "رئيس قطاع الطلاب الدوليين",
    no_image: "لا توجد صورة",

    // Footer
    footer_links: "روابط سريعة",
    footer_about_uni: "عن الجامعة",
    footer_must_buzz: "أخبار وفعاليات",
    footer_contact_info: "معلومات الاتصال",
    footer_address: "حي المتميز، مدينة 6 أكتوبر، الجيزة، مصر",
    footer_copyright: "© 2025 جامعة مصر للعلوم والتكنولوجيا. جميع الحقوق محفوظة.",
    footer_policy: "السياسات",
    apply_online: "قدم الآن",
    faculties: "الكليات",
    president: "رئيس الجامعة",
    vice_presidents: "نواب رئيس الجامعة",
    board_of_trustees: "مجلس الأمناء",
    vision_mission: "الرؤية والرسالة",
    must_values: "القيم والمبادئ",
    history: "تاريخ الجامعة",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
