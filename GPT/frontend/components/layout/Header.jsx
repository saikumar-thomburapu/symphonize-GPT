'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  return (
    <header className="bg-[#021e35] border-b border-[#043850] sticky top-0 left-0 z-30 backdrop-blur-lg bg-opacity-80">
      <div className="max-w-screen-2xl">
        <div className="flex items-center justify-between h-16">
          {/* Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-[#032a42] transition-colors text-[#b3d4f7] hover:text-white"
              title="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo + Text */}
            <img 
              src="/images/symphonize_logo.jpg" 
              alt="Symphonize" 
              className="w-8 h-8 rounded"
            />
            <span className="text-lg font-semibold text-white">Symphonize AI</span>
          </div>

          {/* Right side - Empty (no user menu here) */}
          <div></div>
        </div>
      </div>
    </header>
  );
}











// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { User, LogOut, ChevronDown } from 'lucide-react';
// import { logout, getStoredUser } from '@/lib/api';

// export default function Header() {
//   const router = useRouter();
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [user, setUser] = useState(null);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     // Get user from localStorage
//     const storedUser = getStoredUser();
//     setUser(storedUser);
//   }, []);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowUserMenu(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//       // Force logout on frontend even if backend fails
//       router.push('/login');
//     }
//   };

//   const getUserInitial = () => {
//     if (!user?.email) return '?';
//     return user.email.charAt(0).toUpperCase();
//   };

//   const getUserEmail = () => {
//     if (!user?.email) return 'User';
//     return user.email;
//   };

//   return (
//     <header className="bg-[#021e35] border-b border-[#043850] sticky top-0 z-30 backdrop-blur-lg bg-opacity-80">
//       <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo + Symphonize AI */}
//           <div className="flex items-center gap-3">
//             <img 
//               src="/images/symphonize_logo.jpg" 
//               alt="Symphonize" 
//               className="w-8 h-8 rounded"
//             />
//             <span className="text-lg font-semibold text-white">Symphonize AI</span>
//           </div>

//           {/* User Profile Menu */}
//           <div className="relative" ref={menuRef}>
//             <button
//               onClick={() => setShowUserMenu(!showUserMenu)}
//               className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#032a42] transition-colors text-white"
//               title={getUserEmail()}
//             >
//               {/* User Avatar */}
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] flex items-center justify-center text-white text-sm font-semibold">
//                 {getUserInitial()}
//               </div>
              
//               {/* User Email (hidden on mobile) */}
//               <span className="hidden md:block text-sm text-[#b3d4f7] max-w-[150px] truncate">
//                 {getUserEmail()}
//               </span>
              
//               {/* Dropdown Icon */}
//               <ChevronDown className="w-4 h-4 text-[#7fa3d1]" />
//             </button>

//             {/* Dropdown Menu */}
//             {showUserMenu && (
//               <div className="absolute right-0 mt-2 w-56 bg-[#032a42] border border-[#043850] rounded-lg shadow-lg z-50">
//                 <div className="p-2">
//                   {/* User Info */}
//                   <div className="px-3 py-2 border-b border-[#043850]">
//                     <p className="text-xs text-[#7fa3d1] mb-1">Signed in as</p>
//                     <p className="text-sm text-white font-medium truncate">
//                       {getUserEmail()}
//                     </p>
//                   </div>

//                   {/* Logout Button */}
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-[#b3d4f7] hover:bg-[#043850] rounded transition-colors"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }







 