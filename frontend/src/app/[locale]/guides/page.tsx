'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import { CATEGORIES, CategoryKey } from '@/lib/constants';

const MOCK_GUIDES = [
  { id: '1', title: 'Snake Safety Guide', region: 'Kerala', category: 'animal' as CategoryKey, incidents: 342 },
  { id: '2', title: 'Road Safety Tips', region: 'Mumbai', category: 'accident' as CategoryKey, incidents: 891 },
  { id: '3', title: 'Monsoon Flood Preparedness', region: 'Assam', category: 'environmental' as CategoryKey, incidents: 234 },
  { id: '4', title: 'Street Crime Prevention', region: 'Delhi NCR', category: 'crime' as CategoryKey, incidents: 567 },
  { id: '5', title: 'Elephant Encounter Safety', region: 'Karnataka', category: 'animal' as CategoryKey, incidents: 123 },
  { id: '6', title: 'Cyclone Safety Protocol', region: 'Odisha', category: 'environmental' as CategoryKey, incidents: 89 },
  { id: '7', title: 'Highway Driving Safety', region: 'Tamil Nadu', category: 'accident' as CategoryKey, incidents: 456 },
  { id: '8', title: 'Monkey Deterrent Guide', region: 'Shimla', category: 'animal' as CategoryKey, incidents: 234 },
];

export default function GuidesPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#1A237E] mb-2">Safety Guides</h1>
        <p className="text-gray-500 mb-8">Region-specific safety guides powered by real incident data</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_GUIDES.map((guide) => {
            const cat = CATEGORIES[guide.category];
            return (
              <Card key={guide.id} className="p-6 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: cat.color + '15' }}
                  >
                    {cat.icon}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.lightBg} ${cat.textColor}`}>
                    {guide.region}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-500">Based on {guide.incidents} reported incidents</p>
                <div className="mt-4 flex items-center text-[#FF8F00] text-sm font-medium">
                  Read Guide
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
