'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SeverityBadge } from '@/components/ui/Badge';
import { CATEGORIES, MOCK_MAP_INCIDENTS, CategoryKey } from '@/lib/constants';
import { fetchFeed, fetchMapDots, incrementView } from '@/lib/api';

const MapContainer = dynamic(() => import('@/components/map/MapContainer'), { ssr: false });

type TabKey = 'all' | CategoryKey;

interface FeedIncident {
  _id: string;
  title: string;
  category: CategoryKey;
  subCategory?: string;
  specificType?: string;
  location: { type: string; coordinates: [number, number] };
  address?: { city?: string; state?: string; area?: string };
  severity: string;
  source: string;
  sourceName?: string;
  imageUrl?: string;
  imageThumbnail?: string;
  sourceUrl?: string;
  sourcePublishedAt?: string;
  viewCount?: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''}`;
}

export default function MapPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'all';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // API data state
  const [feedIncidents, setFeedIncidents] = useState<FeedIncident[]>([]);
  const [mapIncidents, setMapIncidents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // Fetch data from API with mock fallback
  const loadData = useCallback(async () => {
    setIsLoading(true);

    const params: Record<string, string> = {};
    if (activeTab !== 'all') params.category = activeTab;

    const [feedResult, dotsResult] = await Promise.all([
      fetchFeed({ ...params, limit: '30' }),
      fetchMapDots(params),
    ]);

    if (feedResult && feedResult.incidents?.length > 0) {
      setFeedIncidents(feedResult.incidents);
      setTotalCount(feedResult.total);
      setLastUpdated(feedResult.lastUpdated);
      setUsingMock(false);

      // Convert feed to map format
      if (dotsResult && dotsResult.dots?.length > 0) {
        setMapIncidents(dotsResult.dots.map((d: any) => ({
          id: d.id,
          title: '',
          category: d.category,
          subCategory: d.subCategory || '',
          severity: d.severity,
          location: ``,
          time: '',
          lat: d.lat,
          lng: d.lng,
        })));
      } else {
        // Use feed incidents for map
        setMapIncidents(feedResult.incidents.map((inc: FeedIncident) => ({
          id: inc._id,
          title: inc.title,
          category: inc.category,
          subCategory: inc.subCategory || '',
          severity: inc.severity,
          location: inc.address?.city || '',
          time: timeAgo(inc.createdAt),
          lat: inc.location.coordinates[1],
          lng: inc.location.coordinates[0],
        })));
      }
    } else {
      // Fallback to mock data
      setUsingMock(true);
      setMapIncidents(MOCK_MAP_INCIDENTS);
      setTotalCount(MOCK_MAP_INCIDENTS.length);
      setFeedIncidents([]);
    }

    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter mock data locally (API filtering is server-side)
  const displayedMapIncidents = usingMock
    ? mapIncidents.filter((inc) => {
        if (activeTab !== 'all' && inc.category !== activeTab) return false;
        if (searchQuery && !inc.location?.toLowerCase().includes(searchQuery.toLowerCase()) && !inc.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
    : mapIncidents;

  const sourceColors: Record<string, string> = {
    user: 'text-[#FF8F00]',
    community: 'text-[#FF8F00]',
    news: 'text-[#E53935]',
    government: 'text-[#1A237E]',
    official: 'text-[#1A237E]',
    gdelt: 'text-[#2E7D32]',
  };

  const sourceLabels: Record<string, string> = {
    user: 'Community',
    community: 'Community',
    news: 'News',
    government: 'Official',
    official: 'Official',
    gdelt: 'GDELT',
  };

  const tabs: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: 'all', label: t('map.all'), icon: '🛡️', color: '#1A237E' },
    { key: 'animal', label: t('categories.animalAttacks'), icon: '🐾', color: '#E53935' },
    { key: 'crime', label: t('categories.crime'), icon: '⚠️', color: '#7B1FA2' },
    { key: 'women_safety', label: t('categories.womenSafety'), icon: '👩', color: '#E91E63' },
    { key: 'personal_safety', label: t('categories.personalSafety'), icon: '🛡️', color: '#FF5722' },
    { key: 'accident', label: t('categories.roadAccidents'), icon: '🚗', color: '#1565C0' },
    { key: 'environmental', label: t('categories.environmental'), icon: '🌊', color: '#2E7D32' },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex-shrink-0">
        <div className="flex items-center gap-1 max-w-full overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={isActive ? { color: tab.color, borderColor: tab.color } : undefined}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Heatmap toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              showHeatmap ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.3"/><circle cx="12" cy="12" r="6" opacity="0.5"/><circle cx="12" cy="12" r="3"/></svg>
            {t('map.heatmap')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {/* Search bar overlay */}
          <div className="absolute top-4 left-4 z-[1000] w-80">
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5">
              <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('map.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>

          <MapContainer
            incidents={displayedMapIncidents}
            activeTab={activeTab}
            showHeatmap={showHeatmap}
          />
        </div>

        {/* Right Sidebar — Incident Bulletins with real images */}
        <div className="hidden lg:flex lg:flex-col w-96 bg-white border-l border-gray-100 flex-shrink-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-2xl font-bold text-gray-900">
              {totalCount} <span className="text-base font-normal text-gray-500">{t('map.inLast30Days')}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-[#E53935] rounded-full animate-pulse-dot" />
              <span className="text-sm text-gray-500">
                {t('map.lastUpdated')} {lastUpdated ? timeAgo(lastUpdated) + ' ago' : '2 hours ago'}
              </span>
            </div>
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Loading...
              </div>
            )}

            {/* API data with real images */}
            {!isLoading && feedIncidents.length > 0 && feedIncidents.map((incident) => {
              const catInfo = CATEGORIES[incident.category] || CATEGORIES.crime;
              const source = incident.source || 'news';
              return (
                <a
                  key={incident._id}
                  href={incident.sourceUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => incrementView(incident._id)}
                  className="flex gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Thumbnail — real image from backend */}
                  <img
                    src={incident.imageThumbnail || incident.imageUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=128&h=128&fit=crop'}
                    alt={incident.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {incident.address?.city}{incident.address?.state ? `, ${incident.address.state}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs font-semibold ${sourceColors[source] || 'text-gray-500'}`}>
                        {sourceLabels[source] || source}
                      </span>
                      <span className="text-xs text-gray-400">
                        ·{timeAgo(incident.sourcePublishedAt || incident.createdAt)} ago
                      </span>
                      {incident.viewCount ? (
                        <span className="text-xs text-gray-400">·{incident.viewCount} views</span>
                      ) : null}
                    </div>
                  </div>
                </a>
              );
            })}

            {/* Waiting for scraper */}
            {!isLoading && feedIncidents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400 text-sm px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
                <p className="font-medium text-gray-500">Scraping live incidents...</p>
                <p className="text-xs mt-1">Real news data will appear shortly</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
