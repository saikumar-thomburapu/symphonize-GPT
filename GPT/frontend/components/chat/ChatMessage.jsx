/**
 * Chat Message Component - Modern Chat Bubbles (Left/Right)
 * With Share & Export buttons ONLY for AI responses
 */

'use client';

import { useState, useEffect } from 'react';
import { User, Copy, Check, Share2, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { copyToClipboard, formatTime } from '@/lib/utils';
import { 
  exportToMarkdown, 
  exportToPDF, 
  exportToDOCX,
  shareConversation
} from '@/lib/api';
import AIAvatar from "@/components/ai-avathar"
// Code block component with copy button
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-[#021e35] border border-[#043850] rounded-t-lg px-4 py-2">
        <span className="text-xs text-[#b3d4f7] font-mono uppercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#b3d4f7] hover:text-white hover:bg-[#043850] rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        className="rounded-t-none rounded-b-lg border-x border-b border-[#043850] !mt-0"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          backgroundColor: '#021e35',
          fontSize: '12px',
          lineHeight: '1.4',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function ChatMessage({ message, isStreaming = false, allMessages = [] }) {
  const isUser = message.role === 'user';
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Get all messages up to this one
  const messagesUpToThis = allMessages.slice(0, allMessages.findIndex(m => m.id === message.id) + 1);

  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      await exportToMarkdown(null, messagesUpToThis, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await exportToPDF(null, messagesUpToThis, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setExporting(true);
      await exportToDOCX(null, messagesUpToThis, 'Conversation');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareConversation(null, messagesUpToThis, 'Conversation');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  
  return (
    <div className={`flex w-full px-4 py-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Avatar + Message */}
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div>
            {isUser ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <AIAvatar />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Sender name and time */}
            <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs font-semibold text-[#b3d4f7]">
                {isUser ? 'You' : ''}
              </span>
              {message.created_at && (
                <span className="text-xs text-[#7fa3d1]">
                  {formatTime(message.created_at)}
                </span>
              )}
            </div>
            
            {/* Message content bubble */}
            <div className={`rounded-2xl px-4 py-3 ${
              isUser 
                ? 'bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] text-white rounded-br-md shadow-lg'
                : 'bg-[#032a42] text-white border border-[#043850] rounded-bl-md'
            }`}>
              {isUser ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={codeString} />
                        ) : (
                          <code className="bg-[#021e35] text-[#66c5fb] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="text-[15px] leading-relaxed mb-2 last:mb-0">{children}</p>;
                      },
                      a({ node, children, ...props }) {
                        return <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#66c5fb] hover:text-[#3e78c2] underline">{children}</a>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                      },
                      h1({ children }) {
                        return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-lg font-bold mb-2 mt-2">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-base font-semibold mb-1 mt-2">{children}</h3>;
                      },
                      blockquote({ children }) {
                        return <blockquote className="border-l-4 border-[#3e78c2] pl-3 italic my-2 text-[#b3d4f7]">{children}</blockquote>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  
                  {/* Streaming cursor */}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-[#66c5fb] ml-1 animate-pulse"></span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - ONLY for AI responses (!isUser) */}
        {!isUser && (
          <div className={`flex items-center gap-1 px-1 mt-2 flex-row`}>
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded hover:bg-[#032a42] transition-colors text-[#7fa3d1] hover:text-[#b3d4f7]"
              title="Share"
            >
              {shareSuccess ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1.5 rounded hover:bg-[#032a42] transition-colors text-[#7fa3d1] hover:text-[#b3d4f7]"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Export Menu */}
              {showExportMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#032a42] border border-[#043850] rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] first:rounded-t-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FileText className="w-3 h-3" />
                    PDF
                  </button>
                  <button
                    onClick={handleExportDOCX}
                    disabled={exporting}
                    className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FileText className="w-3 h-3" />
                    DOCX
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    disabled={exporting}
                    className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] last:rounded-b-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FileText className="w-3 h-3" />
                    Markdown
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}











// /**
//  * Chat Message Component - Modern Chat Bubbles (Left/Right)
//  * With Share & Export buttons BELOW each message
//  */

// 'use client';

// import { useState, useEffect } from 'react';
// import { User, Copy, Check, Share2, Download, FileText } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// import { copyToClipboard, formatTime } from '@/lib/utils';
// import { 
//   exportToMarkdown, 
//   exportToPDF, 
//   exportToDOCX,
//   shareConversation
// } from '@/lib/api';

// // Code block component with copy button
// function CodeBlock({ language, value }) {
//   const [copied, setCopied] = useState(false);
  
//   const handleCopy = async () => {
//     const success = await copyToClipboard(value);
//     if (success) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };
  
//   return (
//     <div className="relative group my-3">
//       <div className="flex items-center justify-between bg-[#021e35] border border-[#043850] rounded-t-lg px-4 py-2">
//         <span className="text-xs text-[#b3d4f7] font-mono uppercase">
//           {language || 'code'}
//         </span>
//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#b3d4f7] hover:text-white hover:bg-[#043850] rounded transition-colors"
//         >
//           {copied ? (
//             <>
//               <Check className="w-3.5 h-3.5 text-green-400" />
//               <span className="text-green-400">Copied!</span>
//             </>
//           ) : (
//             <>
//               <Copy className="w-3.5 h-3.5" />
//               Copy
//             </>
//           )}
//         </button>
//       </div>
      
//       <SyntaxHighlighter
//         style={vscDarkPlus}
//         language={language || 'text'}
//         PreTag="div"
//         className="rounded-t-none rounded-b-lg border-x border-b border-[#043850] !mt-0"
//         customStyle={{
//           margin: 0,
//           borderTopLeftRadius: 0,
//           borderTopRightRadius: 0,
//           backgroundColor: '#021e35',
//           fontSize: '12px',
//           lineHeight: '1.4',
//           wordWrap: 'break-word',
//           whiteSpace: 'pre-wrap',
//         }}
//       >
//         {value}
//       </SyntaxHighlighter>
//     </div>
//   );
// }

// // AI Avatar with preloaded video
// function AIAvatar() {
//   const [videoReady, setVideoReady] = useState(false);

//   return (
//     <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#032a42] border border-[#043850] relative overflow-hidden">
//       <video 
//         autoPlay 
//         loop 
//         muted 
//         preload="auto"
//         onCanPlay={() => setVideoReady(true)}
//         className={`w-full h-full object-cover ${videoReady ? 'opacity-100' : 'opacity-0'}`}
//       >
//         <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
//       </video>

//       {!videoReady && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-2 h-2 bg-[#66c5fb] rounded-full animate-pulse"></div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function ChatMessage({ message, isStreaming = false, allMessages = [] }) {
//   const isUser = message.role === 'user';
//   const [showExportMenu, setShowExportMenu] = useState(false);
//   const [shareSuccess, setShareSuccess] = useState(false);
//   const [exporting, setExporting] = useState(false);

//   // Get all messages up to this one
//   const messagesUpToThis = allMessages.slice(0, allMessages.findIndex(m => m.id === message.id) + 1);

//   const handleExportMarkdown = async () => {
//     try {
//       setExporting(true);
//       await exportToMarkdown(null, messagesUpToThis, 'Conversation');
//       setShowExportMenu(false);
//     } catch (error) {
//       console.error('Export error:', error);
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleExportPDF = async () => {
//     try {
//       setExporting(true);
//       await exportToPDF(null, messagesUpToThis, 'Conversation');
//       setShowExportMenu(false);
//     } catch (error) {
//       console.error('Export error:', error);
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleExportDOCX = async () => {
//     try {
//       setExporting(true);
//       await exportToDOCX(null, messagesUpToThis, 'Conversation');
//       setShowExportMenu(false);
//     } catch (error) {
//       console.error('Export error:', error);
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await shareConversation(null, messagesUpToThis, 'Conversation');
//       setShareSuccess(true);
//       setTimeout(() => setShareSuccess(false), 2000);
//     } catch (error) {
//       console.error('Share error:', error);
//     }
//   };
  
//   return (
//     <div className={`flex w-full px-4 py-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
//       <div className={`flex gap-3 max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
//         {/* Avatar + Message */}
//         <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
//           {/* Avatar */}
//           <div>
//             {isUser ? (
//               <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] shadow-lg">
//                 <User className="w-4 h-4 text-white" />
//               </div>
//             ) : (
//               <AIAvatar />
//             )}
//           </div>

//           {/* Message Content */}
//           <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
//             {/* Sender name and time */}
//             <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
//               <span className="text-xs font-semibold text-[#b3d4f7]">
//                 {isUser ? 'You' : ''}
//               </span>
//               {message.created_at && (
//                 <span className="text-xs text-[#7fa3d1]">
//                   {formatTime(message.created_at)}
//                 </span>
//               )}
//             </div>
            
//             {/* Message content bubble */}
//             <div className={`rounded-2xl px-4 py-3 ${
//               isUser 
//                 ? 'bg-gradient-to-br from-[#3e78c2] to-[#66c5fb] text-white rounded-br-md shadow-lg'
//                 : 'bg-[#032a42] text-white border border-[#043850] rounded-bl-md'
//             }`}>
//               {isUser ? (
//                 <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
//                   {message.content}
//                 </p>
//               ) : (
//                 <div className="prose prose-invert max-w-none">
//                   <ReactMarkdown
//                     components={{
//                       code({ node, inline, className, children, ...props }) {
//                         const match = /language-(\w+)/.exec(className || '');
//                         const codeString = String(children).replace(/\n$/, '');
                        
//                         return !inline && match ? (
//                           <CodeBlock language={match[1]} value={codeString} />
//                         ) : (
//                           <code className="bg-[#021e35] text-[#66c5fb] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
//                             {children}
//                           </code>
//                         );
//                       },
//                       p({ children }) {
//                         return <p className="text-[15px] leading-relaxed mb-2 last:mb-0">{children}</p>;
//                       },
//                       a({ node, children, ...props }) {
//                         return <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#66c5fb] hover:text-[#3e78c2] underline">{children}</a>;
//                       },
//                       ul({ children }) {
//                         return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
//                       },
//                       ol({ children }) {
//                         return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
//                       },
//                       h1({ children }) {
//                         return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>;
//                       },
//                       h2({ children }) {
//                         return <h2 className="text-lg font-bold mb-2 mt-2">{children}</h2>;
//                       },
//                       h3({ children }) {
//                         return <h3 className="text-base font-semibold mb-1 mt-2">{children}</h3>;
//                       },
//                       blockquote({ children }) {
//                         return <blockquote className="border-l-4 border-[#3e78c2] pl-3 italic my-2 text-[#b3d4f7]">{children}</blockquote>;
//                       },
//                     }}
//                   >
//                     {message.content}
//                   </ReactMarkdown>
                  
//                   {/* Streaming cursor */}
//                   {isStreaming && (
//                     <span className="inline-block w-1.5 h-4 bg-[#66c5fb] ml-1 animate-pulse"></span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons - BELOW message */}
//         <div className={`flex items-center gap-1 px-1 mt-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
//           {/* Share Button */}
//           <button
//             onClick={handleShare}
//             className="p-1.5 rounded hover:bg-[#032a42] transition-colors text-[#7fa3d1] hover:text-[#b3d4f7]"
//             title="Share"
//           >
//             {shareSuccess ? (
//               <Check className="w-4 h-4 text-green-400" />
//             ) : (
//               <Share2 className="w-4 h-4" />
//             )}
//           </button>

//           {/* Export Dropdown Button */}
//           <div className="relative">
//             <button
//               onClick={() => setShowExportMenu(!showExportMenu)}
//               className="p-1.5 rounded hover:bg-[#032a42] transition-colors text-[#7fa3d1] hover:text-[#b3d4f7]"
//               title="Export"
//             >
//               <Download className="w-4 h-4" />
//             </button>

//             {/* Export Menu */}
//             {showExportMenu && (
//               <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#032a42] border border-[#043850] rounded-lg shadow-lg z-50">
//                 <button
//                   onClick={handleExportPDF}
//                   disabled={exporting}
//                   className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] first:rounded-t-lg transition-colors flex items-center gap-2 disabled:opacity-50"
//                 >
//                   <FileText className="w-3 h-3" />
//                   PDF
//                 </button>
//                 <button
//                   onClick={handleExportDOCX}
//                   disabled={exporting}
//                   className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] transition-colors flex items-center gap-2 disabled:opacity-50"
//                 >
//                   <FileText className="w-3 h-3" />
//                   DOCX
//                 </button>
//                 <button
//                   onClick={handleExportMarkdown}
//                   disabled={exporting}
//                   className="w-full text-left px-3 py-2 text-xs text-[#b3d4f7] hover:bg-[#043850] last:rounded-b-lg transition-colors flex items-center gap-2 disabled:opacity-50"
//                 >
//                   <FileText className="w-3 h-3" />
//                   Markdown
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











