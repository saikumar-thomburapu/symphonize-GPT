'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { isAuthenticated } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/chat');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#011628]">

      {/* ── Animated background orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3e78c2 0%, transparent 70%)' }} />
        {/* Orb 1 */}
        <div className="orb-1 absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(62,120,194,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Orb 2 */}
        <div className="orb-2 absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(102,197,251,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-md mx-4 animate-slide-in">

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
            Welcome back
          </h1>
          <p className="text-[#7fa3d1] text-sm">
            Sign in to{' '}
            <span className="font-semibold" style={{
              background: 'linear-gradient(90deg, #3e78c2, #66c5fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Symphonize AI</span>
          </p>
        </div>

        {/* Glass form card */}
        <div className="glass-card rounded-2xl p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-[#2a4a6b]">
          © 2025 Symphonize. All rights reserved.
        </p>
      </div>
    </div>
  );
}
