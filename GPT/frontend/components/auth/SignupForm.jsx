/**
 * Signup Form Component - Dark Symphonize Theme
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signup } from '@/lib/api';
import { isValidEmail } from '@/lib/utils';

export default function SignupForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 72) {
      newErrors.password = 'Password cannot be longer than 72 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await signup(email, password);
      router.push('/chat');
    } catch (error) {
      console.error('Signup error:', error);
      setGeneralError(error.detail || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {generalError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {generalError}
        </div>
      )}
      
      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        disabled={loading}
      />
      
      {/* Password */}
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        disabled={loading}
      />
      
      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
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
        Create Account
      </Button>
      
      {/* Login link */}
      <p className="text-center text-sm text-dark-textSecondary">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

