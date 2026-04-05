'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CATEGORIES, CategoryKey } from '@/lib/constants';

type Step = 1 | 2 | 3 | 4 | 5;

export default function ReportPage() {
  const t = useTranslations();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { num: 1, label: t('report.step1') },
    { num: 2, label: t('report.step2') },
    { num: 3, label: t('report.step3') },
    { num: 4, label: t('report.step4') },
    { num: 5, label: t('report.step5') },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#1A237E] mb-2">{t('report.title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('report.noAccountNote')}</p>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? 'bg-[#1A237E] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-[#1A237E]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('report.selectCategory')}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                const cat = CATEGORIES[key];
                return (
                  <Card
                    key={key}
                    className={`p-5 cursor-pointer border-2 transition-all ${
                      category === key ? `border-[${cat.color}] shadow-md` : 'border-transparent'
                    }`}
                    onClick={() => { setCategory(key); setSubCategory(null); }}
                    style={category === key ? { borderColor: cat.color } : {}}
                  >
                    <span className="text-3xl mb-2 block">{cat.icon}</span>
                    <span className="font-semibold text-gray-900">{t(`categories.${key === 'animal' ? 'animalAttacks' : key === 'accident' ? 'roadAccidents' : key}`)}</span>
                  </Card>
                );
              })}
            </div>

            {category && (
              <div>
                <h2 className="text-lg font-semibold mb-4">{t('report.selectSubcategory')}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {CATEGORIES[category].subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSubCategory(sub)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        subCategory === sub
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={subCategory === sub ? { backgroundColor: CATEGORIES[category].color } : {}}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => step < 5 && setStep(2)} disabled={!category || !subCategory}>
              {t('common.next')}
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('report.pinLocation')}</h2>
            <Card className="h-64 mb-4 flex items-center justify-center bg-gray-100" hover={false}>
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Click on the map to pin the location</p>
                <p className="text-xs mt-1">(Interactive map loads here)</p>
              </div>
            </Card>
            <Button variant="outline" className="mb-4 w-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {t('report.useMyLocation')}
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>{t('common.back')}</Button>
              <Button onClick={() => setStep(3)}>{t('common.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('report.step3')}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('report.incidentTitle')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all"
                  placeholder="Brief title of the incident..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('report.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all resize-none"
                  placeholder="Describe what happened..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('report.selectSeverity')}</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        severity === sev
                          ? 'bg-[#1A237E] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t(`severity.${sev}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>{t('common.back')}</Button>
              <Button onClick={() => setStep(4)}>{t('common.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 4: Media */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('report.uploadMedia')}</h2>
            <Card className="p-8 mb-6 border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-[#1A237E] transition-colors" hover={false}>
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm mb-1">Click or drag to upload photos/videos</p>
              <p className="text-gray-400 text-xs">{t('report.uploadHint')}</p>
            </Card>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>{t('common.back')}</Button>
              <Button onClick={() => setStep(5)}>{t('common.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('report.reviewSubmit')}</h2>
            <Card className="p-6 mb-6" hover={false}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium">{category && CATEGORIES[category].icon} {category} / {subCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Severity</span>
                  <span className="text-sm font-medium capitalize">{severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Title</span>
                  <span className="text-sm font-medium">{title || '(not provided)'}</span>
                </div>
                {description && (
                  <div>
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="text-sm mt-1">{description}</p>
                  </div>
                )}
              </div>
            </Card>

            {submitted && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                {t('report.success')}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(4)}>{t('common.back')}</Button>
              <Button variant="secondary" onClick={handleSubmit}>{t('common.submit')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
