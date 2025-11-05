/**
 * Login Form Component - Dark Symphonize Theme
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { login } from '@/lib/api';
import { isValidEmail } from '@/lib/utils';

export default function LoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await login(email, password);
      router.push('/chat');
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError(error.detail || 'Invalid email or password');
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
      
      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
      
      {/* Signup link */}
      <p className="text-center text-sm text-dark-textSecondary">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}

