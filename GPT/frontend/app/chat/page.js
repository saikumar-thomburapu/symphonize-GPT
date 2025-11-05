'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/chat/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { isAuthenticated, getConversations, createConversation } from '@/lib/api';

export default function ChatPage() {
  const router = useRouter();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    initializeChat();
  }, [isClient, router]);

  const initializeChat = async () => {
    try {
      setIsInitializing(true);
      console.log('🔍 Checking for existing conversations...');

      const conversations = await getConversations();

      if (conversations && conversations.length > 0) {
        console.log(`✓ Found ${conversations.length} conversation(s)`);
        setCurrentConversationId(conversations[0].id);
      } else {
        console.log('📝 No conversations found. Creating first conversation...');
        const newConv = await createConversation('New Conversation');
        console.log('✓ First conversation created:', newConv.id);
        setCurrentConversationId(newConv.id);
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConversationSelect = (conversationId) => {
    setCurrentConversationId(conversationId);
  };

  const handleNewChat = (conversationId) => {
    setCurrentConversationId(conversationId);
  };

  if (!isClient || !isAuthenticated()) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#011628] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-72 bg-[#021e35] border-r border-[#043850] flex-shrink-0 overflow-hidden transition-all duration-300">
            <Sidebar
              currentConversationId={currentConversationId}
              onConversationSelect={handleConversationSelect}
              onNewChat={handleNewChat}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isFixed={false}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden items-center justify-center">
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-[#3e78c2] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#b3d4f7]">Setting up your chat...</p>
            </div>
          ) : currentConversationId ? (
            <div className="w-full h-full flex justify-center items-center bg-dark-bgPrimary">
              <div className="w-full max-w-5xl h-full flex flex-col">
                <ChatInterface conversationId={currentConversationId} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <video
                autoPlay
                loop
                muted
                className="w-20 h-20 mb-6 opacity-60 rounded-full"
              >
                <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
              </video>
              <p className="text-[#b3d4f7]">Select a conversation or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}














// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/layout/Header';
// import Sidebar from '@/components/chat/Sidebar';
// import ChatInterface from '@/components/chat/ChatInterface';
// import { isAuthenticated, getConversations, createConversation } from '@/lib/api';

// export default function ChatPage() {
//   const router = useRouter();
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [isClient, setIsClient] = useState(false);
//   const [isInitializing, setIsInitializing] = useState(true);
  
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     if (!isClient) return;
    
//     if (!isAuthenticated()) {
//       router.push('/login');
//       return;
//     }
    
//     // Auto-create first conversation if user has none
//     initializeChat();
//   }, [isClient, router]);
  
//   const initializeChat = async () => {
//     try {
//       setIsInitializing(true);
//       console.log('🔍 Checking for existing conversations...');
      
//       const conversations = await getConversations();
      
//       if (conversations && conversations.length > 0) {
//         // User has conversations - select the most recent one
//         console.log(`✓ Found ${conversations.length} conversation(s)`);
//         setCurrentConversationId(conversations[0].id);
//       } else {
//         // User has no conversations - create first one automatically
//         console.log('📝 No conversations found. Creating first conversation...');
//         const newConv = await createConversation('New Conversation');
//         console.log('✓ First conversation created:', newConv.id);
//         setCurrentConversationId(newConv.id);
//       }
//     } catch (error) {
//       console.error('❌ Error initializing chat:', error);
//     } finally {
//       setIsInitializing(false);
//     }
//   };
  
//   const handleConversationSelect = (conversationId) => {
//     setCurrentConversationId(conversationId);
//   };
  
//   const handleNewChat = (conversationId) => {
//     setCurrentConversationId(conversationId);
//   };
  
//   if (!isClient) {
//     return null;
//   }
  
//   if (!isAuthenticated()) {
//     return null;
//   }
  
//   return (
//     <div className="h-screen flex flex-col bg-[#011628]">
//       {/* Header with Logo */}
//       <Header />
      
//       <div className="flex-1 flex overflow-hidden relative">
//         <Sidebar
//           currentConversationId={currentConversationId}
//           onConversationSelect={handleConversationSelect}
//           onNewChat={handleNewChat}
//         />
        
//         <div className="flex-1 overflow-hidden">
//           {isInitializing ? (
//             <div className="h-full flex items-center justify-center">
//               <div className="text-center">
//                 <div className="w-10 h-10 border-4 border-[#3e78c2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                 <p className="text-[#b3d4f7]">Setting up your chat...</p>
//               </div>
//             </div>
//           ) : currentConversationId ? (
//             <ChatInterface conversationId={currentConversationId} />
//           ) : (
//             <div className="h-full flex items-center justify-center">
//               <div className="text-center">
//                 <img src="/images/symphonize-logo.png" alt="Symphonize" className="w-20 h-20 mx-auto mb-6 opacity-70" />
//                 <p className="text-[#b3d4f7]">Select a conversation or create a new one</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }










 