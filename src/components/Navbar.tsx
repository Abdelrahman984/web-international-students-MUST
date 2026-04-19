import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';

import type { Language } from '../App';

interface NavbarProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  language,
  onToggleLanguage,
  darkMode,
  onToggleDarkMode
}: NavbarProps) {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    {
      id: 'university',
      label: 'The University',
      dropdown: [
        'About MUST',
        'Sectors',
        'Reports',
        'Policies',
        'Contact Us'
      ]
    },
    {
      id: 'academics',
      label: 'Academics',
      dropdown: [
        'Undergraduate Studies',
        'Postgraduate Studies',
        'Academic Calendar'
      ]
    },
    {
      id: 'admission',
      label: 'Admission',
      dropdown: []
    },

    {
      id: 'buzz',
      label: 'MUST Buzz',
      dropdown: ['News', 'Events', 'Blogs']
    },
    {
      id: 'centers',
      label: 'Centers',
      dropdown: ['Research Centers', 'Units']
    },
    {
      id: 'life',
      label: 'Life At MUST',
      dropdown: ['Campus Life', 'Clubs', 'Facilities']
    },

    {
      id: 'sdgs',
      label: 'SDGs',
      dropdown: []
    }
  ];

  const handleNavClick = (id: string) => {
    navigate(`/${id}`);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1C306E] text-white shadow-xl">

      <div className="w-full flex items-center justify-between h-16 md:h-20 px-3 md:px-6">

        {/* LOGO */}
        <div className="flex items-center flex-shrink-0 ml-0">
          <img src="/must_logo.png" className="w-10 h-10 object-contain" />
        </div>

        {/* NAV */}
        <nav className="hidden lg:flex items-center gap-5 relative">

          {navItems.map((item) => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => item.dropdown.length && setActiveDropdown(item.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => handleNavClick(item.id)}
                className="px-3 py-2 hover:text-[#00AC5C] whitespace-nowrap"
              >
                {item.label}
              </button>

              {/* DROPDOWN ONLY IF EXISTS */}
              {activeDropdown === item.id && item.dropdown.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white text-black rounded-lg shadow-lg min-w-[220px] z-[9999]">
                  {item.dropdown.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavClick(item.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#00AC5C]"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-10">

          {/* DARK MODE */}
          <button onClick={onToggleDarkMode}>
            {darkMode ? <Sun /> : <Moon />}
          </button>

          {/* LANGUAGE */}
          <button
            onClick={() => onToggleLanguage(language === 'en' ? 'ar' : 'en')}
            className="text-lg font-bold hover:text-[#00AC5C]"
          >
            ع
          </button>

          {/* PROFILE (RESTORED) */}
          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                className="w-8 h-8 rounded-full"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg w-48 z-[9999]">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU */}
          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#1C306E] text-white px-4 py-3 space-y-2">

          {navItems.map((item) => (
            <div key={item.id}>
              <button
                className="w-full text-left py-2 hover:text-[#00AC5C]"
                onClick={() =>
                  setActiveDropdown(activeDropdown === item.id ? null : item.id)
                }
              >
                {item.label}
              </button>

              {activeDropdown === item.id && item.dropdown.length > 0 && (
                <div className="pl-4 space-y-1 text-sm">
                  {item.dropdown.map((d, i) => (
                    <button
                      key={i}
                      className="block w-full text-left py-1 hover:text-[#00AC5C]"
                      onClick={() => handleNavClick(item.id)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      )}

    </header>
  );
}