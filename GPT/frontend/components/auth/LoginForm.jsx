/**
 * Login Form Component - Dark Symphonize Theme
 * Updated with Forgot Password feature
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
  
  // ✅ FORGOT PASSWORD STATES
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotGeneralError, setForgotGeneralError] = useState('');
  
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

  // ✅ FORGOT PASSWORD VALIDATION
  const validateForgot = () => {
    const newErrors = {};
    
    if (!forgotEmail) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(forgotEmail)) {
      newErrors.email = 'Invalid email format';
    }
    
    setForgotErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Send email as query parameter, not body
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotGeneralError('');
    
    if (!validateForgot()) return;
    
    setForgotLoading(true);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL === 'auto' 
        ? 'http://localhost:8000' 
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
      
      // ✅ CORRECT: Send email as query parameter
      const response = await fetch(`${backendUrl}/auth/forgot-password?email=${encodeURIComponent(forgotEmail)}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setForgotSuccess(true);
        
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotEmail('');
          setForgotSuccess(false);
          setForgotErrors({});
        }, 3000);
      } else {
        const error = await response.json();
        setForgotGeneralError(error.detail || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotGeneralError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };


  // ✅ FORGOT PASSWORD FORM
  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotEmail('');
            setForgotErrors({});
            setForgotGeneralError('');
            setForgotSuccess(false);
          }}
          className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          ← Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-dark-text mb-2">Reset Password</h2>
          <p className="text-sm text-dark-textSecondary">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Success Message */}
        {forgotSuccess && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
            ✅ Check your email for password reset link!
          </div>
        )}

        {/* Error Message */}
        {forgotGeneralError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {forgotGeneralError}
          </div>
        )}

        {/* Email Input */}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          error={forgotErrors.email}
          required
          disabled={forgotLoading || forgotSuccess}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={forgotLoading}
          disabled={forgotLoading || forgotSuccess}
          onClick={handleForgotPassword}
        >
          Send Reset Link
        </Button>
      </div>
    );
  }

  // ✅ MAIN LOGIN FORM
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
      
      {/* Password with Forgot Link */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-dark-text">
            Password
            <span className="text-red-400 ml-1">*</span>
          </label>
          {/* ✅ FORGOT PASSWORD LINK */}
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          disabled={loading}
          className="mt-0"
        />
      </div>
      
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













// /**
//  * Login Form Component - Dark Symphonize Theme
//  */

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';
// import { login } from '@/lib/api';
// import { isValidEmail } from '@/lib/utils';

// export default function LoginForm() {
//   const router = useRouter();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [generalError, setGeneralError] = useState('');
  
//   const validate = () => {
//     const newErrors = {};
    
//     if (!email) {
//       newErrors.email = 'Email is required';
//     } else if (!isValidEmail(email)) {
//       newErrors.email = 'Invalid email format';
//     }
    
//     if (!password) {
//       newErrors.password = 'Password is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setGeneralError('');
    
//     if (!validate()) return;
    
//     setLoading(true);
    
//     try {
//       await login(email, password);
//       router.push('/chat');
//     } catch (error) {
//       console.error('Login error:', error);
//       setGeneralError(error.detail || 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Error message */}
//       {generalError && (
//         <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
//           {generalError}
//         </div>
//       )}
      
//       {/* Email */}
//       <Input
//         label="Email"
//         type="email"
//         placeholder="you@example.com"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         error={errors.email}
//         required
//         disabled={loading}
//       />
      
//       {/* Password */}
//       <Input
//         label="Password"
//         type="password"
//         placeholder="••••••••"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         error={errors.password}
//         required
//         disabled={loading}
//       />
      
//       {/* Submit */}
//       <Button
//         type="submit"
//         variant="primary"
//         className="w-full"
//         loading={loading}
//         disabled={loading}
//       >
//         Sign In
//       </Button>
      
//       {/* Signup link */}
//       <p className="text-center text-sm text-dark-textSecondary">
//         Don't have an account?{' '}
//         <a
//           href="/signup"
//           className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
//         >
//           Sign up
//         </a>
//       </p>
//     </form>
//   );
// }

