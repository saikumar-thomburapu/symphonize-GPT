/**
 * Conversation Item Component - Dark Theme
 */

'use client';

import { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { updateConversation } from '@/lib/api';
import { truncate, formatDate } from '@/lib/utils';

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleSave = async () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      try {
        await updateConversation(conversation.id, editTitle.trim());
        onUpdate();
      } catch (error) {
        console.error('Error updating title:', error);
      }
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };
  
  return (
    <div
      className={`group relative rounded-xl transition-all duration-200 ${
        isActive
          ? 'shadow-sm'
          : 'hover:bg-[#032a42]/60'
      }`}
      style={isActive ? {
        background: 'rgba(62,120,194,0.1)',
        border: '1px solid rgba(62,120,194,0.25)',
        boxShadow: '0 0 16px rgba(62,120,194,0.1)'
      } : { border: '1px solid transparent' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Active left accent bar */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: 'linear-gradient(180deg, #3e78c2, #66c5fb)', boxShadow: '0 0 8px rgba(62,120,194,0.8)' }} />
      )}

      {isEditing ? (
        <div className="p-3 flex items-center gap-2 pl-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-[#011628] border border-[#3e78c2]/40 rounded-lg text-white focus:outline-none focus:border-[#3e78c2]"
            autoFocus
          />
          <button onClick={handleSave} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={onSelect} className="w-full p-3 pl-4 flex items-start gap-3 text-left">
          <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-colors ${
            isActive ? 'text-[#66c5fb]' : 'text-[#2a4a6b] group-hover:text-[#4a7a9b]'
          }`} />

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate transition-colors ${
              isActive ? 'text-white' : 'text-[#7fa3d1] group-hover:text-[#b3d4f7]'
            }`}>
              {conversation.title}
            </p>
            <p className="text-[10px] text-[#1a3a52] mt-0.5">
              {formatDate(conversation.created_at)}
            </p>
          </div>

          {/* Action buttons */}
          {(isHovered || isActive) && (
            <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[#2a4a6b] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this conversation?')) onDelete();
                }}
                className="p-1.5 text-[#2a4a6b] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </button>
      )}
    </div>
  );
}










// /**
//  * Conversation Item Component
//  * 
//  * Single conversation in the sidebar with edit/delete actions.
//  */

// 'use client';

// import { useState } from 'react';
// import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
// import { updateConversation } from '@/lib/api';
// import { truncate, formatDate } from '@/lib/utils';

// export default function ConversationItem({
//   conversation,
//   isActive,
//   onSelect,
//   onDelete,
//   onUpdate,
// }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTitle, setEditTitle] = useState(conversation.title);
//   const [isHovered, setIsHovered] = useState(false);
  
//   // Save edited title
//   const handleSave = async () => {
//     if (editTitle.trim() && editTitle !== conversation.title) {
//       try {
//         await updateConversation(conversation.id, editTitle.trim());
//         onUpdate();
//       } catch (error) {
//         console.error('Error updating title:', error);
//       }
//     }
//     setIsEditing(false);
//   };
  
//   // Cancel editing
//   const handleCancel = () => {
//     setEditTitle(conversation.title);
//     setIsEditing(false);
//   };
  
//   return (
//     <div
//       className={`group relative rounded-lg transition-all ${
//         isActive
//           ? 'bg-primary-100 border border-primary-300'
//           : 'hover:bg-gray-100 border border-transparent'
//       }`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {isEditing ? (
//         // Edit mode
//         <div className="p-2 flex items-center gap-2">
//           <input
//             type="text"
//             value={editTitle}
//             onChange={(e) => setEditTitle(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') handleSave();
//               if (e.key === 'Escape') handleCancel();
//             }}
//             className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
//             autoFocus
//           />
//           <button
//             onClick={handleSave}
//             className="p-1 text-green-600 hover:bg-green-50 rounded"
//           >
//             <Check className="w-4 h-4" />
//           </button>
//           <button
//             onClick={handleCancel}
//             className="p-1 text-red-600 hover:bg-red-50 rounded"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       ) : (
//         // Display mode
//         <button
//           onClick={onSelect}
//           className="w-full p-3 flex items-start gap-3 text-left"
//         >
//           {/* Icon */}
//           <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
//             isActive ? 'text-primary-600' : 'text-gray-500'
//           }`} />
          
//           {/* Content */}
//           <div className="flex-1 min-w-0">
//             <p className={`text-sm font-medium truncate ${
//               isActive ? 'text-primary-900' : 'text-gray-900'
//             }`}>
//               {conversation.title}
//             </p>
//             <p className="text-xs text-gray-500 mt-0.5">
//               {formatDate(conversation.created_at)}
//             </p>
//           </div>
          
//           {/* Actions (show on hover) */}
//           {(isHovered || isActive) && (
//             <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="p-1 text-gray-500 hover:text-primary-600 hover:bg-white rounded"
//                 title="Rename"
//               >
//                 <Edit2 className="w-3.5 h-3.5" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (confirm('Delete this conversation?')) {
//                     onDelete();
//                   }
//                 }}
//                 className="p-1 text-gray-500 hover:text-red-600 hover:bg-white rounded"
//                 title="Delete"
//               >
//                 <Trash2 className="w-3.5 h-3.5" />
//               </button>
//             </div>
//           )}
//         </button>
//       )}
//     </div>
//   );
// }
