/**
 * Input Component - Dark Theme
 */

import { cn } from '@/lib/utils';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-text mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 bg-dark-bgTertiary border rounded-lg transition-all duration-200',
          'text-dark-text placeholder:text-dark-textMuted',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-dark-border hover:border-dark-borderLight',
          disabled && 'bg-dark-bgSecondary cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

