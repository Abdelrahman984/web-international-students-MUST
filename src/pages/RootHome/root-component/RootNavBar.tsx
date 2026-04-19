import React, { useEffect, useState } from 'react';
import {
    GlobeIcon,
    SearchIcon,
    MenuIcon,
    XIcon,
    SunIcon,
    MoonIcon } from
        'lucide-react';
interface NavbarProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
    language: 'en' | 'ar';
    toggleLanguage: () => void;
    activeSection: string;
}
const navLinks = [
    {
        name: 'Home',
        href: '#home'
    },
    {
        name: 'The University',
        href: '#university'
    },
    {
        name: 'Academics',
        href: '#academics'
    },
    {
        name: 'Admission',
        href: '#admission'
    },
    {
        name: 'MUST Buzz',
        href: '#buzz'
    },
    {
        name: 'Life at MUST',
        href: '#life'
    },
    {
        name: 'International Students',
        href: '#international'
    },
    {
        name: 'FAQ',
        href: '#faq'
    }];

export function RootNavbar({
                           darkMode,
                           toggleDarkMode,
                           language,
                           toggleLanguage,
                           activeSection
                       }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToSection = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string) =>
    {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            const offsetTop =
                element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        setMobileMenuOpen(false);
    };
    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-navy-600/95 backdrop-blur-md shadow-lg py-3' : 'bg-navy-600 py-5'}`}>

            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-navy-600 text-xs shadow-md">
                        MUST
                    </div>
                    <div className="hidden lg:block text-white font-bold text-sm leading-tight max-w-[180px]">
                        MISR UNIVERSITY FOR SCIENCE & TECHNOLOGY
                    </div>
                </div>

                {/* Desktop Nav */}
                <div className="hidden xl:flex items-center gap-6">
                    {navLinks.map((link) =>
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.href)}
                            className={`text-sm font-medium transition-colors relative py-2 ${activeSection === link.href.substring(1) ? 'text-accent' : 'text-gray-300 hover:text-white'}`}>

                            {link.name}
                            {activeSection === link.href.substring(1) &&
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />
                            }
                        </a>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                        aria-label="Toggle Language">

                        <GlobeIcon className="w-5 h-5" />
                        <span className="text-xs font-medium uppercase">{language}</span>
                    </button>

                    <button
                        className="text-gray-300 hover:text-white transition-colors"
                        aria-label="Search">

                        <SearchIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleDarkMode}
                        className="text-gray-300 hover:text-white transition-colors"
                        aria-label="Toggle Dark Mode">

                        {darkMode ?
                            <SunIcon className="w-5 h-5" /> :

                            <MoonIcon className="w-5 h-5" />
                        }
                    </button>

                    <button
                        className="xl:hidden text-gray-300 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu">

                        {mobileMenuOpen ?
                            <XIcon className="w-6 h-6" /> :

                            <MenuIcon className="w-6 h-6" />
                        }
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen &&
                <div className="xl:hidden absolute top-full left-0 right-0 bg-navy-600 border-t border-navy-500 shadow-xl">
                    <div className="flex flex-col px-4 py-4 space-y-2">
                        {navLinks.map((link) =>
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium ${activeSection === link.href.substring(1) ? 'bg-navy-500 text-accent' : 'text-gray-300 hover:bg-navy-500 hover:text-white'}`}>

                                {link.name}
                            </a>
                        )}
                    </div>
                </div>
            }
        </nav>);

}