export default function Navbar() {
  const links = [
    'The university',
    'Academics',
    'Admission',
    'MUST BUZZ',
    'Centers',
    'Life at MUST',
    'SDGs',
  ];

  return (
    <nav className="w-full bg-indigo-900 px-4 py-4 flex items-center justify-between z-50 relative">
      <div className="flex items-center space-x-4">
        {/* Logo Placeholder */}
        <div className="bg-emerald-600 text-white font-bold px-4 py-2 rounded">
          MUST
        </div>
      </div>
      
      <div className="hidden lg:flex items-center space-x-6">
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-white text-sm font-bold capitalize hover:text-emerald-400 transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-white hover:text-emerald-400 focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="text-white hover:text-emerald-400 focus:outline-none flex items-center space-x-1">
          <span className="text-sm font-bold">AR</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
