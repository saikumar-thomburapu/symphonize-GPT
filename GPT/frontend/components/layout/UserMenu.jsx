/**
 * User Menu Component - Dark Theme
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { logout, getStoredUser } from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  if (!user) return null;
  
  return (
    <div className="relative" ref={menuRef}>
      {/* Menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-bgTertiary transition-colors border border-transparent hover:border-dark-border"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-glow">
          {getInitials(user.email)}
        </div>
        
        {/* Email (hidden on mobile) */}
        <span className="hidden sm:block text-sm text-dark-text max-w-[150px] truncate font-medium">
          {user.email}
        </span>
        
        {/* Dropdown icon */}
        <ChevronDown
          className={`w-4 h-4 text-dark-textSecondary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-dark-bgSecondary rounded-xl shadow-2xl border border-dark-border py-2 animate-fade-in">
          {/* User info */}
          <div className="px-4 py-3 border-b border-dark-border">
            <p className="text-sm font-medium text-dark-text">Signed in as</p>
            <p className="text-sm text-dark-textSecondary truncate mt-1">{user.email}</p>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            {/* Profile */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile if you create one
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-text hover:bg-dark-bgTertiary transition-colors"
            >
              <User className="w-4 h-4 text-dark-textSecondary" />
              Profile
            </button>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

