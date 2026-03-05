'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';
import { isAuthenticated } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/chat');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#011628] px-4 py-12">

      {/* ── Animated background orbs (same as login) ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3e78c2 0%, transparent 70%)' }} />
        <div className="orb-1 absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(62,120,194,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2 absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,197,251,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-md animate-slide-in">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          {/* Animated logo video */}
          <div className="relative inline-block mb-5 animate-float">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(62,120,194,0.5)' }}>
              <video autoPlay loop muted playsInline preload="auto"
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => { e.target.currentTime = 1; }}>
                <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #3e78c2, transparent)' }} />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            Create your account
          </h1>
          <p className="text-[#7fa3d1] text-sm">
            Start chatting with{' '}
            <span className="font-semibold" style={{
              background: 'linear-gradient(90deg, #3e78c2, #66c5fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Symphonize AI</span>
          </p>
        </div>

        {/* Glass form card */}
        <div className="glass-card rounded-2xl p-8">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-xs text-[#2a4a6b]">
          © 2025 Symphonize. All rights reserved.
        </p>
      </div>
    </div>
  );
}
