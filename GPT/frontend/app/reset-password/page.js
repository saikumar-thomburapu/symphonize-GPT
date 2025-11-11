/**
 * Reset Password Page - Dark Symphonize Theme
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setGeneralError('Invalid or missing reset token');
    }
  }, [token]);

  const validate = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // ✅ This is already there - Enter key WORKS!
    setGeneralError('');

    if (!validate()) return;
    if (!token) {
      setGeneralError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      // ✅ Smart URL detection (same as forgot password)
      let backendUrl;
      
      if (typeof window !== 'undefined') {
        const currentHost = window.location.hostname;
        
        if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          backendUrl = `http://${currentHost}:8000`;
        } else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          backendUrl = 'http://localhost:8000';
        } else {
          backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        }
      } else {
        backendUrl = 'http://localhost:8000';
      }

      const response = await fetch(`${backendUrl}/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSuccess(true);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const error = await response.json();
        setGeneralError(error.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setGeneralError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
        <div className="max-w-md w-full text-center">
          <Logo size="lg" showText={true} className="mb-6 justify-center" />
          
          <div className="bg-dark-bgSecondary rounded-2xl shadow-2xl p-8 border border-dark-border">
            <div className="mb-6">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-dark-text mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-dark-textSecondary">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
        <div className="max-w-md w-full text-center">
          <Logo size="lg" showText={true} className="mb-6 justify-center" />
          
          <div className="bg-dark-bgSecondary rounded-2xl shadow-2xl p-8 border border-dark-border">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Invalid Reset Link</h2>
            <p className="text-dark-textSecondary mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} className="mb-6 justify-center" />
          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Create New Password
          </h1>
          <p className="text-dark-textSecondary">
            Enter your new password below
          </p>
        </div>
        
        {/* Reset password form card */}
        <div className="bg-dark-bgSecondary rounded-2xl shadow-2xl p-8 border border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {generalError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {generalError}
              </div>
            )}
            
            {/* New Password */}
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              required
              disabled={loading}
            />
            
            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
              disabled={loading}
            />
            
            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
            
            {/* Back to login link */}
            <p className="text-center text-sm text-dark-textSecondary">
              Remember your password?{' '}
              <a
                href="/login"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Back to login
              </a>
            </p>
          </form>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-sm text-dark-textMuted">
          © 2025 Symphonize. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-bg"><div className="text-dark-text">Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
