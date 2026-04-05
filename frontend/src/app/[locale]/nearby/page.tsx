'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SeverityBadge } from '@/components/ui/Badge';
import { CATEGORIES, MOCK_RECENT_INCIDENTS } from '@/lib/constants';

const RADIUS_OPTIONS = [1, 5, 10, 25];

export default function NearbyPage() {
  const t = useTranslations();
  const [radius, setRadius] = useState(5);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#1A237E] mb-2">{t('nearby.title')}</h1>

        {/* Radius selector */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-gray-600">{t('nearby.radius')}:</span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                radius === r ? 'bg-[#1A237E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Alerts toggle */}
        <Card className="p-4 mb-6 flex items-center justify-between" hover={false}>
          <div>
            <h3 className="font-semibold text-gray-900">{t('nearby.enableAlerts')}</h3>
            <p className="text-sm text-gray-500">{t('nearby.alertsDesc')}</p>
          </div>
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
              alertsEnabled ? 'bg-[#FF8F00]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              alertsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </Card>

        {/* Nearby incidents */}
        <div className="space-y-3">
          {MOCK_RECENT_INCIDENTS.map((incident) => (
            <Card key={incident.id} className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: CATEGORIES[incident.category].color + '15' }}
                >
                  {CATEGORIES[incident.category].icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {incident.location}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <SeverityBadge severity={incident.severity} label={t(`severity.${incident.severity}`)} />
                    <span className="text-xs text-gray-400">{incident.time} ago</span>
                    <span className="text-xs text-gray-400">~2.3 km away</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
