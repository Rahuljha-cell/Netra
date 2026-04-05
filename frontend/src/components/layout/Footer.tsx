'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="Netra" width={36} height={36} />
              <span className="text-xl font-bold text-[#1A237E]">Netra</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Track safety incidents across India. Stay safe outdoors.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Discover</h4>
            <ul className="space-y-2.5">
              <li><Link href="/map" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">Map</Link></li>
              <li><Link href="/nearby" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">Nearby Alerts</Link></li>
              <li><Link href="/report" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">Report Incident</Link></li>
              <li><Link href="/guides" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">Safety Guides</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">{t('about')}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">{t('contact')}</a></li>
              <li><Link href="/report" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">Report</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">{t('privacy')}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#1A237E] text-sm transition-colors">{t('terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} {t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
