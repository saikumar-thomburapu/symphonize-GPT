/**
 * Login Page - Dark Symphonize Theme
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
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
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} className="mb-6 justify-center" />
          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Welcome back
          </h1>
          <p className="text-dark-textSecondary">
            Sign in to continue to Symphonize AI
          </p>
        </div>
        
        {/* Login form card */}
        <div className="bg-dark-bgSecondary rounded-2xl shadow-2xl p-8 border border-dark-border">
          <LoginForm />
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-sm text-dark-textMuted">
          © 2025 Symphonize. All rights reserved.
        </p>
      </div>
    </div>
  );
}

