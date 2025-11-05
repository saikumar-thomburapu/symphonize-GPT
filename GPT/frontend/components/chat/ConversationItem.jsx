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
      className={`group relative rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-dark-bgTertiary border border-primary-500/30 shadow-glow'
          : 'hover:bg-dark-bgTertiary border border-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        // Edit mode
        <div className="p-3 flex items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-dark-bg border border-dark-border rounded text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Display mode
        <button
          onClick={onSelect}
          className="w-full p-3 flex items-start gap-3 text-left"
        >
          <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            isActive ? 'text-primary-400' : 'text-dark-textSecondary'
          }`} />
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              isActive ? 'text-dark-text' : 'text-dark-textSecondary'
            }`}>
              {conversation.title}
            </p>
            <p className="text-xs text-dark-textMuted mt-0.5">
              {formatDate(conversation.created_at)}
            </p>
          </div>
          
          {/* Actions */}
          {(isHovered || isActive) && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-dark-textSecondary hover:text-primary-400 hover:bg-dark-bgHover rounded transition-colors"
                title="Rename"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this conversation?')) {
                    onDelete();
                  }
                }}
                className="p-1.5 text-dark-textSecondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
