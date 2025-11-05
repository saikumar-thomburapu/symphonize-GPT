/**
 * Home Page - Dark Theme
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';
import Logo from '@/components/ui/Logo';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <Logo size="lg" showText={true} className="mb-6 justify-center" />
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}



