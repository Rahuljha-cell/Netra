'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { locales, localeNames, Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Locale | null>(null);
  const router = useRouter();
  const t = useTranslations('languageSelector');

  useEffect(() => {
    const hasVisited = localStorage.getItem('netra-language-selected');
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (locale: Locale) => {
    setSelected(locale);
  };

  const handleConfirm = () => {
    if (selected) {
      localStorage.setItem('netra-language-selected', selected);
      document.cookie = `NEXT_LOCALE=${selected};path=/;max-age=31536000`;
      setIsOpen(false);
      router.push(`/${selected}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-[#1A237E] via-[#283593] to-[#0D47A1] p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF8F00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF8F00]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.svg" alt="Netra" width={80} height={80} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-white/70 text-lg">{t('subtitle')}</p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {locales.map((locale) => {
            const info = localeNames[locale];
            const isSelected = selected === locale;
            return (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#1A237E] shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-102'
                }`}
              >
                <span className="text-xl font-bold">{info.native}</span>
                <span className={`text-xs ${isSelected ? 'text-gray-500' : 'text-white/50'}`}>
                  {info.english}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`px-12 py-4 rounded-2xl text-lg font-bold transition-all duration-200 ${
              selected
                ? 'bg-[#FF8F00] hover:bg-[#F57C00] text-white shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
