'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { 
  sendMessageStream, 
  getConversationHistory, 
  getAvailableModels,
  exportToMarkdown,
  exportToPDF,
  exportToDOCX,
  shareConversation
} from '@/lib/api';

export default function ChatInterface({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('mistral:latest');
  const [availableModels, setAvailableModels] = useState([]);
  // const [showExportMenu, setShowExportMenu] = useState(false);
  // const [exporting, setExporting] = useState(false);
  // const [shareSuccess, setShareSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadModels();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getConversationHistory(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const data = await getAvailableModels();
      setAvailableModels(data.models || []);
      setSelectedModel(data.default || 'mistral:latest');
    } catch (error) {
      console.error('Error loading models:', error);
      setAvailableModels([
        { id: 'mistral:latest', name: 'Mistral 7.2B' },
        { id: 'llama2:latest', name: 'Llama2 7B' },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText, attachedFiles = []) => {
    if (!conversationId || !messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsStreaming(true);
    setStreamingMessage('');

    let fullResponse = '';

    try {
      console.log('📨 Sending with model:', selectedModel);
      
      await sendMessageStream(
        conversationId,
        messageText,
        selectedModel,
        attachedFiles,
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        },
        () => {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullResponse,
            model: selectedModel,
            created_at: new Date().toISOString(),
          };

          setMessages(prev => [...prev, aiMessage]);
          setStreamingMessage('');
          setIsStreaming(false);
        },
        (error) => {
          console.error('Streaming error:', error);
          setStreamingMessage('');
          setIsStreaming(false);
          alert('Error generating response. Please try again.');
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      await exportToMarkdown(conversationId, messages, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      alert('Error exporting as Markdown');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await exportToPDF(conversationId, messages, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      alert('Error exporting as PDF. Make sure jsPDF is installed: npm install jspdf html2canvas');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setExporting(true);
      await exportToDOCX(conversationId, messages, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      alert('Error exporting as DOCX. Make sure docx is installed: npm install docx');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareConversation(conversationId, messages, 'Conversation');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex flex-col h-full bg-[#011628]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-[#011628]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[#3e78c2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#b3d4f7]">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <video 
                autoPlay 
                loop 
                muted 
                className="w-20 h-20 mx-auto mb-6 opacity-60 rounded-full"
              >
                <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
              </video>
              <h3 className="text-2xl font-bold text-white mb-3">Start Your Conversation</h3>
              <p className="text-[#b3d4f7] text-lg mb-2">
                {availableModels.find(m => m.id === selectedModel)?.name || 'AI'}
              </p>
              <p className="text-[#7fa3d1] text-sm">
                Ask questions, upload files, and get intelligent responses.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                allMessages={messages}
              />
            ))}

            {isStreaming && streamingMessage && (
              <ChatMessage
                message={{
                  role: 'assistant',
                  content: streamingMessage,
                  model: selectedModel,
                }}
                isStreaming={true}
                allMessages={[...messages, { id: 'streaming', role: 'assistant', content: streamingMessage }]}
              />
            )}
            {isStreaming && !streamingMessage && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder="Type your message..."
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelChange={setSelectedModel}
      />
    </div>
  );
}












// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import ChatMessage from '@/components/chat/ChatMessage';
// import ChatInput from '@/components/chat/ChatInput';
// import TypingIndicator from '@/components/chat/TypingIndicator';
// import { sendMessageStream, getConversationHistory, getAvailableModels } from '@/lib/api';

// export default function ChatInterface({ conversationId }) {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamingMessage, setStreamingMessage] = useState('');
//   const [selectedModel, setSelectedModel] = useState('mistral:latest');
//   const [availableModels, setAvailableModels] = useState([]);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (conversationId) {
//       loadMessages();
//       loadModels();
//     }
//   }, [conversationId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, streamingMessage]);

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       const data = await getConversationHistory(conversationId);
//       setMessages(data.messages || []);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadModels = async () => {
//     try {
//       const data = await getAvailableModels();
//       setAvailableModels(data.models || []);
//       setSelectedModel(data.default || 'mistral:latest');
//     } catch (error) {
//       console.error('Error loading models:', error);
//       setAvailableModels([
//         { id: 'mistral:latest', name: 'Mistral 7.2B' },
//         { id: 'llama2:latest', name: 'Llama2 7B' },
//       ]);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSend = async (messageText, attachedFiles = []) => {
//     if (!conversationId || !messageText.trim()) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: messageText,
//       created_at: new Date().toISOString(),
//     };
//     setMessages(prev => [...prev, userMessage]);

//     setIsStreaming(true);
//     setStreamingMessage('');

//     let fullResponse = '';

//     try {
//       console.log('📨 Sending with model:', selectedModel);
      
//       await sendMessageStream(
//         conversationId,
//         messageText,
//         selectedModel,
//         attachedFiles,
//         (chunk) => {
//           fullResponse += chunk;
//           setStreamingMessage(fullResponse);
//         },
//         () => {
//           const aiMessage = {
//             id: (Date.now() + 1).toString(),
//             role: 'assistant',
//             content: fullResponse,
//             model: selectedModel,
//             created_at: new Date().toISOString(),
//           };

//           setMessages(prev => [...prev, aiMessage]);
//           setStreamingMessage('');
//           setIsStreaming(false);
//         },
//         (error) => {
//           console.error('Streaming error:', error);
//           setStreamingMessage('');
//           setIsStreaming(false);
//           alert('Error generating response. Please try again.');
//         }
//       );
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setIsStreaming(false);
//       setStreamingMessage('');
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-[#011628]">
//       {/* Messages Container */}
//       <div className="flex-1 overflow-y-auto bg-[#011628]">
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="text-center">
//               <div className="w-10 h-10 border-4 border-[#3e78c2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//               <p className="text-[#b3d4f7]">Loading messages...</p>
//             </div>
//           </div>
//         ) : messages.length === 0 && !isStreaming ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="text-center max-w-md px-4">
//               {/* CHANGED: Static image → Animated video */}
//               <video 
//                 autoPlay 
//                 loop 
//                 muted 
//                 className="w-20 h-20 mx-auto mb-6 opacity-60 rounded-full"
//               >
//                 <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
//               </video>
//               <h3 className="text-2xl font-bold text-white mb-3">Start Your Conversation</h3>
//               <p className="text-[#b3d4f7] text-lg mb-2">
//                 {availableModels.find(m => m.id === selectedModel)?.name || 'AI'}
//               </p>
//               <p className="text-[#7fa3d1] text-sm">
//                 Ask questions, upload files, and get intelligent responses.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="py-6">
//             {messages.map((message) => (
//               <ChatMessage key={message.id} message={message} />
//             ))}

//             {isStreaming && streamingMessage && (
//               <ChatMessage
//                 message={{
//                   role: 'assistant',
//                   content: streamingMessage,
//                   model: selectedModel,
//                 }}
//                 isStreaming={true}
//               />
//             )}

//             {isStreaming && !streamingMessage && <TypingIndicator />}

//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Input Area with Model Selector */}
//       <ChatInput
//         onSend={handleSend}
//         disabled={isStreaming}
//         placeholder="Type your message..."
//         selectedModel={selectedModel}
//         availableModels={availableModels}
//         onModelChange={setSelectedModel}
//       />
//     </div>
//   );
// }










 