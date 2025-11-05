/**
 * Typing Indicator Component - Dark Theme
 */

'use client';

import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 p-6 bg-dark-bgSecondary/50 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-dark-bgTertiary border border-dark-border flex items-center justify-center overflow-hidden">
        <img
          src="/images/symphonize_logo.jpg"
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typing animation */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-dark-text">
            Symphonize AI
          </span>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
