'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CategoryBadge, SeverityBadge } from '@/components/ui/Badge';
import { CATEGORIES, MOCK_STATS, MOCK_RECENT_INCIDENTS, MOCK_RISK_AREAS, CategoryKey } from '@/lib/constants';
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchFeed } from '@/lib/api';

const HeroMap = dynamic(() => import('@/components/home/HeroMap'), { ssr: false, loading: () => <div className="w-full min-h-[400px] rounded-2xl bg-gray-100 animate-pulse" /> });

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-[#1A237E]">
        {count.toLocaleString()}+
      </div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
}

function RecentActivityList() {
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ts = useTranslations('severity');

  useEffect(() => {
    fetchFeed({ limit: '8' }).then((data) => {
      if (data && data.incidents?.length > 0) {
        setLiveIncidents(data.incidents);
      }
      setLoaded(true);
    });
  }, []);

  const sourceLabels: Record<string, string> = { user: 'Community', news: 'News', government: 'Official', gdelt: 'GDELT' };
  const sourceBadgeColors: Record<string, string> = {
    user: 'bg-[#FF8F00] text-white', news: 'bg-[#E53935] text-white',
    government: 'bg-[#1A237E] text-white', gdelt: 'bg-[#2E7D32] text-white',
  };

  // Show API data if available
  if (liveIncidents.length > 0) {
    return (
      <div className="space-y-3">
        {liveIncidents.map((inc: any) => {
          const catInfo = CATEGORIES[inc.category as CategoryKey] || CATEGORIES.crime;
          const diffMs = Date.now() - new Date(inc.createdAt).getTime();
          const mins = Math.floor(diffMs / 60000);
          const hrs = Math.floor(mins / 60);
          const days = Math.floor(hrs / 24);
          const months = Math.floor(days / 30);
          const timeStr = mins < 60 ? `${mins} min` : hrs < 24 ? `${hrs} hr` : days < 30 ? `${days} days` : `${months} month${months > 1 ? 's' : ''}`;
          return (
            <a key={inc._id} href={inc.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <img
                src={inc.imageThumbnail || inc.imageUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=80&h=80&fit=crop'}
                alt=""
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{inc.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sourceBadgeColors[inc.source] || sourceBadgeColors.news}`}>
                    {sourceLabels[inc.source] || 'News'}
                  </span>
                  <span className="text-xs text-gray-400 truncate">{inc.address?.city || ''}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <SeverityBadge severity={inc.severity} label={ts(inc.severity)} />
                <span className="text-xs text-gray-400">{timeStr}</span>
              </div>
            </Card>
            </a>
          );
        })}
      </div>
    );
  }

  // Fallback to mock data
  return (
    <div className="space-y-3">
      {MOCK_RECENT_INCIDENTS.map((incident, idx) => {
        const mockSources = ['Community', 'News', 'Official'];
        const mockColors: Record<string, string> = { Community: 'bg-[#FF8F00] text-white', News: 'bg-[#E53935] text-white', Official: 'bg-[#1A237E] text-white' };
        const source = mockSources[idx % 3];
        return (
          <Card key={incident.id} className="p-4 flex items-center gap-4">
            <img
              src={`https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=80&h=80&fit=crop`}
              alt=""
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{incident.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mockColors[source]}`}>{source}</span>
                <span className="text-xs text-gray-400 truncate">{incident.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <SeverityBadge severity={incident.severity} label={ts(incident.severity)} />
              <span className="text-xs text-gray-400">{incident.time}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('categories');
  const ts = useTranslations('severity');

  const categories: { key: CategoryKey; name: string; desc: string; count: number }[] = [
    { key: 'animal', name: tc('animalAttacks'), desc: 'Dogs, snakes, monkeys, elephants, leopards and more', count: 18432 },
    { key: 'crime', name: tc('crime'), desc: 'Theft, robbery, assault and other criminal activities', count: 15891 },
    { key: 'accident', name: tc('roadAccidents'), desc: 'Vehicle collisions, hit & run, road hazards', count: 12340 },
    { key: 'environmental', name: tc('environmental'), desc: 'Floods, landslides, fires, cyclones and natural disasters', count: 6184 },
  ];

  const dataSources = [
    { label: t('sourceOfficial'), desc: t('sourceOfficialDesc'), color: 'bg-[#1A237E]' },
    { label: t('sourceNews'), desc: t('sourceNewsDesc'), color: 'bg-[#E53935]' },
    { label: t('sourceCommunity'), desc: t('sourceCommunityDesc'), color: 'bg-[#FF8F00]' },
  ];

  const exploreAreas = [
    { name: 'Mumbai', incidents: 4521, views: 8234, risk: 'high' as const, image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=250&fit=crop' },
    { name: 'Delhi NCR', incidents: 5832, views: 12450, risk: 'critical' as const, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=250&fit=crop' },
    { name: 'Bangalore', incidents: 2847, views: 5120, risk: 'medium' as const, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=250&fit=crop' },
    { name: 'Chennai', incidents: 1923, views: 3890, risk: 'medium' as const, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=250&fit=crop' },
    { name: 'Kolkata', incidents: 2156, views: 4560, risk: 'high' as const, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=250&fit=crop' },
    { name: 'Hyderabad', incidents: 1847, views: 3210, risk: 'medium' as const, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=250&fit=crop' },
    { name: 'Jaipur', incidents: 1234, views: 6780, risk: 'medium' as const, image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=250&fit=crop' },
    { name: 'Kerala', incidents: 987, views: 5430, risk: 'high' as const, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — Split layout like Kumamap */}
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left — Text */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-tight mb-6 whitespace-pre-line">
                {t('heroHeading')}
              </h1>
              <p className="text-lg text-gray-600 mb-3 leading-relaxed">
                {t('heroDesc')} — <span className="font-semibold text-gray-900">{MOCK_STATS.totalIncidents.toLocaleString()} {t('incidentsTracked')}</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <span className="w-2 h-2 bg-[#E53935] rounded-full animate-pulse-dot" />
                {t('lastUpdatedText')}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/map">
                  <Button variant="primary" size="lg" className="!rounded-xl !bg-[#1A237E]">
                    {t('viewMapBtn')}
                  </Button>
                </Link>
                <Link href="/report">
                  <Button variant="danger" size="lg" className="!rounded-xl">
                    {t('reportBtn')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Real India Map with incident dots */}
            <Link href="/map" className="block">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow h-[500px] z-0">
                <HeroMap />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Data Sources + Stats — like Kumamap's "Most Complete Data" section */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            {t('dataTitle')}
          </h2>
          <p className="text-center text-gray-500 mb-10">{t('dataSubtitle')}</p>

          {/* Data source pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {dataSources.map((src) => (
              <div key={src.label} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className={`w-3 h-3 rounded-full ${src.color}`} />
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{src.label}</span>
                  <span className="text-gray-400 text-xs ml-2">{src.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <AnimatedCounter target={MOCK_STATS.totalIncidents} label={t('totalIncidents')} />
            <AnimatedCounter target={MOCK_STATS.citiesCovered} label={t('citiesCovered')} />
            <AnimatedCounter target={MOCK_STATS.activeAlerts} label={t('activeAlerts')} />
            <AnimatedCounter target={28} label={t('statesCovered')} />
          </div>
        </div>
      </section>

      {/* Incident Categories */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">{t('categoriesTitle')}</h2>
          <p className="text-center text-gray-500 mb-10">Track and report safety incidents across four major categories</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const catInfo = CATEGORIES[cat.key];
              return (
                <Link key={cat.key} href={`/map?tab=${cat.key}`}>
                  <Card className="p-6 border-t-4 cursor-pointer h-full" style={{ borderTopColor: catInfo.color }}>
                    <div className="text-4xl mb-4">{catInfo.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cat.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${catInfo.textColor}`}>{cat.count.toLocaleString()}</span>
                      <span className="text-[#1A237E] text-sm font-medium flex items-center gap-1">
                        View Map
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore Areas — like Kumamap's area exploration */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('exploreTitle')}</h2>
            <p className="text-gray-500">{t('exploreSubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {exploreAreas.map((area) => (
              <Link key={area.name} href="/map">
                <Card className="cursor-pointer h-full overflow-hidden !p-0">
                  {/* Picture */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={area.image}
                      alt={area.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2">
                      <SeverityBadge severity={area.risk} label={ts(area.risk)} />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{area.name}</h3>
                    <p className="text-sm text-gray-500">{area.incidents.toLocaleString()} incidents</p>
                    <p className="text-xs text-gray-400">{area.views.toLocaleString()} views</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Risk legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
              <SeverityBadge key={level} severity={level} label={ts(level)} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/map">
              <Button variant="ghost" size="md">{t('seeAllAreas')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Activity — like Kumamap's recent incidents with source badges */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Incidents */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('recentTitle')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('recentSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-dot" />
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>

              <RecentActivityList />

              <div className="mt-6 text-center">
                <Link href="/map">
                  <Button variant="ghost" size="md">{t('viewAll')}</Button>
                </Link>
              </div>
            </div>

            {/* Risk Spotlight */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('riskSpotlightTitle')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('riskSpotlightSubtitle')}</p>

              <div className="space-y-3">
                {MOCK_RISK_AREAS.map((area, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{area.name}</h3>
                      <SeverityBadge severity={area.risk} label={ts(area.risk)} />
                    </div>
                    <div className="flex items-center gap-3">
                      <CategoryBadge category={area.category} />
                      <span className="text-xs text-gray-500">{area.incidents} incidents this week</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guides */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('guidesTitle')}</h2>
            <p className="text-gray-500">{t('guidesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tag: 'Overview', title: 'Safety in Indian Cities: What You Need to Know', desc: 'India has recorded 52,000+ safety incidents. Learn which areas are safe and how activity is changing.' },
              { tag: 'Travel', title: 'Safe Travel Tips for India: Data-Driven Guide', desc: 'Which cities have the most incidents? Data-driven safety guide with real counts for 500+ areas.' },
              { tag: 'Wildlife', title: 'Animal Safety Across India', desc: '18,000+ animal incidents tracked. Know what to do when encountering stray dogs, snakes, or monkeys.' },
              { tag: 'Seasonal', title: 'When Are Incidents Most Common? Monthly Breakdown', desc: 'Monthly activity breakdown from 52,000+ incidents. Peak months and safest periods for travel.' },
            ].map((guide) => (
              <Link key={guide.title} href="/guides">
                <Card className="cursor-pointer h-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#1A237E] to-[#283593]" />
                  <div className="p-5">
                    <span className="text-xs font-semibold text-[#FF8F00] uppercase tracking-wider">{guide.tag}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-2 text-sm leading-snug">{guide.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{guide.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/guides">
              <Button variant="ghost" size="md">{t('viewAllGuides')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">{t('howItWorksTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: '🔍', title: t('step1Title'), desc: t('step1Desc') },
              { step: '2', icon: '🗺️', title: t('step2Title'), desc: t('step2Desc') },
              { step: '3', icon: '📢', title: t('step3Title'), desc: t('step3Desc') },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A237E] flex items-center justify-center text-2xl shadow-lg">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E53935] text-white font-bold text-xs mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1A237E]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-lg text-white/70 mb-8">{t('ctaSubtitle')}</p>
          <Link href="/report">
            <Button variant="danger" size="lg" className="!shadow-xl !rounded-xl">
              {t('ctaButton')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
