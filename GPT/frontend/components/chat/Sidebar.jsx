'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Search, LogOut, ChevronDown, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConversationItem from '@/components/chat/ConversationItem';
import { getConversations, createConversation, deleteConversation, logout, getStoredUser } from '@/lib/api';
import APIKeyModal from '@/components/ui/APIKeyModal';

export default function Sidebar({ 
  currentConversationId, 
  onConversationSelect, 
  onNewChat, 
  isOpen,
  onClose,
  isFixed = true
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    loadConversations();
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data || []);
      console.log(`📋 Loaded ${data?.length || 0} conversations`);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation('New Conversation');
      setConversations([newConv, ...conversations]);
      onNewChat(newConv.id);
      onClose?.();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDelete = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      setConversations(conversations.filter(c => c.id !== conversationId));

      if (conversationId === currentConversationId && conversations.length > 1) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        onConversationSelect(remaining[0].id);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const getUserInitial = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserEmail = () => {
    if (!user?.email) return 'User';
    return user.email;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <>
      {/* New Chat Button */}
      <div className="p-3 border-b border-[#043850]">
        <button
          onClick={handleNewChat}
          className="w-full px-3 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #3e78c2, #66c5fb)', boxShadow: '0 0 20px rgba(62,120,194,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 35px rgba(62,120,194,0.55)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(62,120,194,0.3)'}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search Chats */}
      <div className="p-3 border-b border-[#043850]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7fa3d1]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#032a42] border border-[#043850] rounded-lg text-white text-sm placeholder:text-[#7fa3d1] focus:outline-none focus:ring-2 focus:ring-[#3e78c2]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto py-3">
        {loading ? (
          <div className="px-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#032a42] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-[#7fa3d1]">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">
              {searchQuery ? 'No chats found' : 'No conversations'}
            </p>
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onSelect={() => {
                  onConversationSelect(conversation.id);
                  onClose?.();
                }}
                onDelete={() => handleDelete(conversation.id)}
                onUpdate={loadConversations}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Menu at Bottom */}
      <div className="border-t border-[#043850] p-3">
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#032a42] transition-colors text-white"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {getUserInitial()}
            </div>

            {/* User Email */}
            <span className="text-sm text-[#b3d4f7] flex-1 truncate text-left">
              {getUserEmail()}
            </span>

            {/* Dropdown Icon */}
            <ChevronDown className="w-4 h-4 text-[#7fa3d1] flex-shrink-0" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in"
              style={{ background: 'rgba(2,30,53,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="p-2">
                {/* User Info */}
                <div className="px-3 py-2.5 mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#2a4a6b] font-semibold mb-1">Signed in as</p>
                  <p className="text-sm text-white font-medium truncate">{getUserEmail()}</p>
                </div>

                <div className="h-px bg-white/[0.05] mx-2 mb-1" />

                {/* API Keys */}
                <button
                  onClick={() => { setShowUserMenu(false); setShowApiKeyModal(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#7fa3d1] hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                >
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span>API Keys</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </>
  );

  // For fixed sidebar (original behavior)
  if (isFixed) {
    return (
      <>
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-72 bg-[#021e35] border-r border-[#043850] flex flex-col z-50 transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-2xl`}
        >
          {sidebarContent}
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </>
    );
  }

  // For sliding sidebar (new behavior - pushes content)
  return (
    <div className="h-full bg-[#021e35] border-r border-[#043850] flex flex-col">
      {sidebarContent}
    </div>
  );
}












// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Plus, MessageSquare, Trash2 } from 'lucide-react';
// import Button from '@/components/ui/Button';
// import ConversationItem from '@/components/chat/ConversationItem';
// import { getConversations, createConversation, deleteConversation } from '@/lib/api';

// export default function Sidebar({ currentConversationId, onConversationSelect, onNewChat }) {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const sidebarRef = useRef(null);
//   const hoverAreaRef = useRef(null);
  
//   useEffect(() => {
//     loadConversations();
//   }, []);

//   // Auto-hide on mouse leave
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleMouseLeave = (e) => {
//       const sidebar = sidebarRef.current;
//       if (sidebar && !sidebar.contains(e.relatedTarget)) {
//         setIsOpen(false);
//       }
//     };

//     if (sidebarRef.current) {
//       sidebarRef.current.addEventListener('mouseleave', handleMouseLeave);
//     }

//     return () => {
//       if (sidebarRef.current) {
//         sidebarRef.current.removeEventListener('mouseleave', handleMouseLeave);
//       }
//     };
//   }, [isOpen]);

//   // Click outside to close
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const sidebar = sidebarRef.current;
      
//       if (sidebar && !sidebar.contains(e.target) && isOpen) {
//         setIsOpen(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen]);
  
//   const loadConversations = async () => {
//     try {
//       setLoading(true);
//       const data = await getConversations();
//       setConversations(data || []); // Ensure empty array if null
//       console.log(`📋 Loaded ${data?.length || 0} conversations`);
//     } catch (error) {
//       console.error('Error loading conversations:', error);
//       setConversations([]); // Set empty array on error
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleNewChat = async () => {
//     try {
//       const newConv = await createConversation('New Conversation');
//       setConversations([newConv, ...conversations]);
//       onNewChat(newConv.id);
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Error creating conversation:', error);
//     }
//   };
  
//   const handleDelete = async (conversationId) => {
//     try {
//       await deleteConversation(conversationId);
//       setConversations(conversations.filter(c => c.id !== conversationId));
      
//       if (conversationId === currentConversationId && conversations.length > 1) {
//         const remaining = conversations.filter(c => c.id !== conversationId);
//         onConversationSelect(remaining[0].id);
//       }
//     } catch (error) {
//       console.error('Error deleting conversation:', error);
//     }
//   };
  
//   const refreshConversations = () => {
//     loadConversations();
//   };
  
//   return (
//     <>
//       {/* Hover trigger area (left edge) */}
//       <div
//         ref={hoverAreaRef}
//         className="fixed left-0 top-16 w-4 h-[calc(100vh-64px)] z-40"
//         onMouseEnter={() => setIsOpen(true)}
//       />
      
//       {/* Sidebar - Below logo only */}
//       <div
//         ref={sidebarRef}
//         className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-72 bg-[#021e35] border-r border-[#043850] flex flex-col z-50 transform transition-transform duration-200 ease-out ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } shadow-2xl`}
//       >
//         {/* Header with New Chat button - SMALLER */}
//         <div className="p-3 border-b border-[#043850]">
//           <button
//             onClick={handleNewChat}
//             className="w-full px-3 py-2 bg-gradient-to-r from-[#3e78c2] to-[#66c5fb] rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
//           >
//             <Plus className="w-4 h-4" />
//             New Chat
//           </button>
//         </div>
        
//         {/* Conversations List */}
//         <div className="flex-1 overflow-y-auto py-3">
//           {loading ? (
//             <div className="px-3 space-y-2">
//               {[1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="h-12 bg-[#032a42] rounded-lg animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : conversations.length === 0 ? (
//             <div className="px-3 py-8 text-center text-[#7fa3d1]">
//               <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
//               <p className="text-xs">No conversations</p>
//             </div>
//           ) : (
//             <div className="px-2 space-y-1">
//               {conversations.map((conversation) => (
//                 <ConversationItem
//                   key={conversation.id}
//                   conversation={conversation}
//                   isActive={conversation.id === currentConversationId}
//                   onSelect={() => {
//                     onConversationSelect(conversation.id);
//                     setIsOpen(false);
//                   }}
//                   onDelete={() => handleDelete(conversation.id)}
//                   onUpdate={refreshConversations}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* Footer */}
//         <div className="p-3 border-t border-[#043850]">
//           <p className="text-xs text-[#7fa3d1] text-center">
//             <span className="text-[#66c5fb] font-semibold">Symphonize</span>
//           </p>
//         </div>
//       </div>
      
//       {/* Backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
//           onClick={() => setIsOpen(false)}
//         />
//       )}
//     </>
//   );
// }













 