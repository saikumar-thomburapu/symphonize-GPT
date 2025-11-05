/**
 * Logo Component - Official Symphonize Logo
 */

'use client';

import Image from 'next/image';

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { width: 32, height: 32, text: 'text-lg' },
    md: { width: 40, height: 40, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-2xl' },
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Symphonize Logo */}
      <div className="relative" style={{ width: currentSize.width, height: currentSize.height }}>
        <Image
          src="/images/symphonize_logo.jpg"  // ← Update this filename
          alt="Symphonize"
          width={currentSize.width}
          height={currentSize.height}
          className="object-contain"
          priority
        />
      </div>
      
      {/* Logo Text (optional - can remove if logo has text) */}
      {showText && (
        <span className={`font-bold ${currentSize.text}`}>
          <span style={{ color: '#FFFFFF' }}>Symphonize</span>{' '}
          <span style={{ color: '#66c5fb' }}>AI</span>
        </span>
      )}
    </div>
  );
}



