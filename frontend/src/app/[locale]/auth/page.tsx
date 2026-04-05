'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Image from 'next/image';

export default function AuthPage() {
  const t = useTranslations();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A237E] to-[#0D47A1] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8" hover={false}>
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Netra" width={56} height={56} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1A237E]">{t('nav.login')}</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your phone number to continue</p>
        </div>

        {!otpSent ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 bg-gray-100 rounded-xl text-sm text-gray-600">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none transition-all"
                  maxLength={10}
                />
              </div>
            </div>
            <Button className="w-full" onClick={() => setOtpSent(true)} disabled={phone.length < 10}>
              Send OTP
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 outline-none text-center text-lg tracking-widest transition-all"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">OTP sent to +91 {phone}</p>
            </div>
            <Button className="w-full" disabled={otp.length < 6}>
              Verify & Login
            </Button>
            <button
              onClick={() => setOtpSent(false)}
              className="w-full mt-3 text-sm text-[#1A237E] hover:underline cursor-pointer"
            >
              Change phone number
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
