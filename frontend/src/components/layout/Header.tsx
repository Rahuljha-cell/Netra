'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, Locale } from '@/i18n/config';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/map', label: t('map') },
    { href: '/report', label: t('report') },
    { href: '/nearby', label: t('nearby') },
    { href: '/guides', label: t('guides') },
  ];

  const switchLocale = (newLocale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    localStorage.setItem('netra-language-selected', newLocale);
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setLangDropdown(false);
  };

  return (
    <header className="sticky top-0 z-[9999] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Netra" width={36} height={36} />
            <span className="text-xl font-bold text-[#1A237E] tracking-wide">Netra</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === `/${locale}${link.href === '/' ? '' : link.href}`
                    ? 'text-[#1A237E] font-semibold'
                    : 'text-gray-600 hover:text-[#1A237E] hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors cursor-pointer"
              >
                <span>{localeNames[locale].english}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {langDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    {locales.map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLocale(l)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                          l === locale ? 'text-[#1A237E] font-semibold bg-[#1A237E]/5' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{localeNames[l].native}</span>
                        <span className="text-gray-400 ml-2 text-xs">{localeNames[l].english}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Report Button - like Kumamap's red "Report" */}
            <Link
              href="/report"
              className="hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white text-sm font-semibold transition-colors"
            >
              {t('report')}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-[#1A237E] hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 mt-2 text-center bg-[#E53935] hover:bg-[#D32F2F] text-white rounded-xl font-semibold transition-colors"
            >
              {t('report')}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
