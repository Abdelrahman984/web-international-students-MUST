import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-indigo-950 pt-20 pb-10 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
        <div className="flex-[2]">
          <div className="bg-emerald-600 text-white font-bold px-4 py-2 rounded inline-block mb-6">
            MUST
          </div>
          <p className="text-indigo-200 text-sm max-w-sm mb-6 leading-relaxed">
            Misr University for Science and Technology (MUST) is a leading educational institution in Egypt, dedicated to academic excellence and preparing students for the global marketplace.
          </p>
          <div className="flex space-x-4">
            {/* Social Icons Placeholder */}
            {[1, 2, 3, 4].map((i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white hover:bg-emerald-600 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect width="24" height="24" opacity="0"/></svg>
              </a>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-6">Academics</h4>
          <ul className="space-y-4 text-indigo-300 text-sm">
            <li><a href="#" className="hover:text-white transition">Faculties</a></li>
            <li><a href="#" className="hover:text-white transition">Study Plans</a></li>
            <li><a href="#" className="hover:text-white transition">Academic Calendar</a></li>
            <li><a href="#" className="hover:text-white transition">E-Learning</a></li>
            <li><a href="#" className="hover:text-white transition">Library</a></li>
          </ul>
        </div>

        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-6">Admissions</h4>
          <ul className="space-y-4 text-indigo-300 text-sm">
            <li><a href="#" className="hover:text-white transition">How to Apply</a></li>
            <li><a href="#" className="hover:text-white transition">Requirements</a></li>
            <li><a href="#" className="hover:text-white transition">Tuition Fees</a></li>
            <li><a href="#" className="hover:text-white transition">Scholarships</a></li>
            <li><a href="#" className="hover:text-white transition">International Students</a></li>
          </ul>
        </div>

        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
          <ul className="space-y-4 text-indigo-300 text-sm">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Al-Motamayez District, 6th of October City, Egypt
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              16878
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              info@must.edu.eg
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-indigo-900 flex flex-col md:flex-row items-center justify-between">
        <p className="text-indigo-400 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} MUST. All rights reserved.
        </p>
        <div className="flex space-x-6 text-sm text-indigo-400">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
