import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

interface LinksBarProps {
  className?: string;
}

type MenuItem = {
  label: string;
  to: string;
  children?: Array<{ label: string; to: string }>;
};

export const STATIC_MENU_ITEMS: MenuItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'Academics',
    to: '/academics',
    children: [
      { label: 'Academic Staff', to: '/academics' },
      { label: 'Undergraduate Programs', to: '/undergraduate' },
      { label: 'Postgraduate Programs', to: '/postgraduate' },
      { label: 'Honor List', to: '/honor-list' },
      { label: 'Academic Advising', to: '/academic-advising' },
      { label: 'Registeration', to: '/Registeration' },
      { label: 'Schedules', to: '/schedules' },
      { label: 'Calendar', to: '/calendar' },
      { label: 'E-Learning', to: '/e-learning' },
      { label: 'How To Apply', to: '/how-to-apply' },
    ],
  },
  { label: 'Advising', to: '/advising' },
  {
    label: 'Activities',
    to: '/activities',
    children: [
      { label: 'Cultural', to: '/cultural' },
      { label: 'Sports', to: '/sports' },
      { label: 'Art', to: '/art' },
      { label: 'Student Clubs', to: '/student-clubs' },
    ],
  },
  { label: 'Facilities', to: '/facilities' },
  { label: 'News', to: '/news' },
  { label: 'Events', to: '/events' },
  { label: 'Contact Us', to: '/contact-us' },
];

export function LinksBar({ className = '' }: LinksBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className={`flex items-center gap-6 ${className}`} onMouseLeave={() => setOpenMenu(null)}>
      {STATIC_MENU_ITEMS.map((item) => {
        const hasDropdown = !!item.children?.length;
        const isOpen = openMenu === item.label;

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => hasDropdown && setOpenMenu(item.label)}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `text-white text-base font-bold transition-colors duration-300 px-3 py-2 no-underline ${
                  isActive ? 'text-green-400' : 'hover:text-green-400'
                }`
              }
            >
              {item.label}
            </NavLink>

            {hasDropdown && isOpen && (
              <div className="absolute left-0 top-full z-40 mt-2 min-w-[250px] rounded-xl border border-white/20 bg-[#1f3769]/95 p-2 shadow-xl backdrop-blur">
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    to={child.to}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/10 hover:text-green-400"
                    onClick={() => setOpenMenu(null)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
