/**
 * API Client for Backend Communication
 * Auto-detects backend URL based on current server
 */

import axios from 'axios';

// Smart backend URL detection
function getBackendURL() {
  // If NEXT_PUBLIC_API_URL is set to 'auto', detect it
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl && envUrl !== 'auto') {
    return envUrl;
  }
  
  // Auto-detect based on current browser location
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // Detect if on 154 or 161
  if (hostname.includes('154') || hostname === 'localhost') {
    // Development (154)
    return `http://${hostname}:8000`;
  } else if (hostname.includes('161')) {
    // Production (161)
    return `http://${hostname}:8000`;
  }
  
  // Fallback
  return 'http://localhost:8000';
}

// Get backend API URL
const API_BASE_URL = getBackendURL();

console.log('🔧 Backend API URL:', API_BASE_URL);

// Rest of your api.js code stays the same...
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

 


// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== HELPER ====================

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// ==================== AUTH API ====================

export const signup = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/signup', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== CONVERSATIONS API ====================

export const createConversation = async (title = null) => {
  try {
    const response = await apiClient.post('/conversations/', { title });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConversations = async () => {
  try {
    const response = await apiClient.get('/conversations/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConversation = async (conversationId) => {
  try {
    const response = await apiClient.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateConversation = async (conversationId, title) => {
  try {
    const response = await apiClient.patch(`/conversations/${conversationId}`, { title });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    await apiClient.delete(`/conversations/${conversationId}`);
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== CHAT API ====================

export const sendMessage = async (conversationId, message, model) => {
  try {
    const response = await apiClient.post('/chat/message', {
      conversation_id: conversationId,
      message,
      model,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get available models from backend
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get models error:', error);
    // Return default models if API fails
    return {
      models: [
        { id: 'deepseek-v2:16b', name: 'DeepSeek v2 16B' },
        { id: 'qwen3-vl:8b', name: 'Qwen 3 VL 8B' },
      ],
      default: 'deepseek-v2:16b',
    };
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/history/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get history error:', error);
    throw error;
  }
}


/**
 * Send message with streaming response + FILE UPLOAD
 * Now sends FormData instead of JSON to support files
 */
export async function sendMessageStream(
  conversationId,
  message,
  model = 'deepseek-v2:16b',
  files = [],
  onChunk,
  onComplete,
  onError
) {
  try {
    console.log('🚀 Sending message:', { conversationId, message, model, filesCount: files.length });
    
    // Use FormData to send files + text
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('message', message);
    formData.append('model', model);
    
    // Append each file
    if (files && files.length > 0) {
      console.log(`📁 Attaching ${files.length} file(s)...`);
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        console.log(`   ├─ ${files[i].name} (${(files[i].size / 1024).toFixed(1)}KB)`);
      }
    }

    console.log('📤 Sending FormData to /chat/stream');

    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        // DON'T set Content-Type: multipart/form-data
        // Browser will set it automatically with boundary
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    console.log('✓ Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    // Handle streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              console.error('❌ Stream error:', data.error);
              onError(data.error);
            } else if (data.content) {
              console.log('📨 Chunk received:', data.content.substring(0, 30));
              onChunk(data.content);
            }

            if (data.done) {
              console.log('✓ Stream complete');
              onComplete();
              return;
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Stream error:', error);
    onError(error.message);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
}


/**
 * Get stored user from localStorage
 */
export function getStoredUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// ==================== SPEECH-TO-TEXT API ====================

/**
 * Transcribe audio blob to text using Web Speech API
 */
export async function transcribeAudio(audioBlob, onTranscribe, onError) {
  try {
    console.log('🎤 Starting speech recognition...');
    
    // Use browser's Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser');
    }

    const recognition = new SpeechRecognition();
    
    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = 'en-US'; // Can be changed to other languages
    
    let transcript = '';
    
    recognition.onstart = () => {
      console.log('🎤 Listening...');
    };
    
    recognition.onresult = (event) => {
      transcript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
        
        if (event.results[i].isFinal) {
          console.log('✓ Final: ' + transcriptSegment);
        } else {
          console.log('~ Interim: ' + transcriptSegment);
        }
      }
      
      if (event.results[event.results.length - 1].isFinal) {
        onTranscribe(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      onError(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
    };
    
    // Start recognition
    recognition.start();
    
    return recognition;
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    onError(error.message);
    return null;
  }
}

/**
 * Convert audio blob to WAV for backend processing (optional future use)
 */
export async function sendAudioToBackend(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    
    const response = await fetch(`${API_BASE_URL}/chat/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Audio upload error:', error);
    throw error;
  }
}





// ==================== EXPORT & SHARE API ====================

/**
 * Format messages for export
 */
function formatMessagesForExport(messages) {
  return messages.map(msg => {
    const sender = msg.role === 'user' ? 'You' : 'AI Assistant';
    const time = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';
    return `${sender} (${time}):\n${msg.content}\n`;
  }).join('\n---\n\n');
}

/**
 * Export conversation as Markdown
 */
export async function exportToMarkdown(conversationId, messages, title = 'Conversation') {
  try {
    const content = `# ${title}\n\n${formatMessagesForExport(messages)}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    downloadFile(blob, `${title}.md`);
    return true;
  } catch (error) {
    console.error('❌ Markdown export error:', error);
    throw error;
  }
}

/**
 * Export conversation as PDF
 */
/**
 * Export conversation as PDF - IMPROVED with better formatting
 */
export async function exportToPDF(conversationId, messages, title = 'Conversation') {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create a temporary div with better formatting
    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '30px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#000000';
    tempDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    tempDiv.style.lineHeight = '1.8';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-10000px';
    tempDiv.style.width = '800px';

    // Add title
    const titleEl = document.createElement('h1');
    titleEl.textContent = title;
    titleEl.style.fontSize = '24px';
    titleEl.style.fontWeight = '700';
    titleEl.style.marginBottom = '30px';
    titleEl.style.borderBottom = '2px solid #3e78c2';
    titleEl.style.paddingBottom = '10px';
    tempDiv.appendChild(titleEl);

    // Add messages with proper formatting
    messages.forEach((msg, index) => {
      const msgEl = document.createElement('div');
      msgEl.style.marginBottom = '20px';
      msgEl.style.padding = '15px';
      msgEl.style.borderLeft = msg.role === 'user' ? '5px solid #3e78c2' : '5px solid #666666';
      msgEl.style.backgroundColor = msg.role === 'user' ? '#f0f4f8' : '#fafafa';
      msgEl.style.borderRadius = '4px';
      msgEl.style.pageBreakInside = 'avoid';

      // Sender info
      const senderEl = document.createElement('div');
      senderEl.style.fontWeight = '700';
      senderEl.style.fontSize = '13px';
      senderEl.style.color = msg.role === 'user' ? '#3e78c2' : '#333333';
      senderEl.style.marginBottom = '8px';
      
      const sender = msg.role === 'user' ? 'You' : 'AI Assistant';
      const time = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';
      senderEl.textContent = `${sender} (${time})`;
      msgEl.appendChild(senderEl);

      // Message content with better text wrapping
      const contentEl = document.createElement('pre');
      contentEl.textContent = msg.content;
      contentEl.style.margin = '0';
      contentEl.style.fontSize = '12px';
      contentEl.style.fontFamily = 'Consolas, Monaco, monospace';
      contentEl.style.whiteSpace = 'pre-wrap';
      contentEl.style.wordWrap = 'break-word';
      contentEl.style.overflow = 'hidden';
      contentEl.style.color = '#000000';
      contentEl.style.lineHeight = '1.6';
      msgEl.appendChild(contentEl);

      tempDiv.appendChild(msgEl);

      // Add separator
      if (index < messages.length - 1) {
        const separator = document.createElement('hr');
        separator.style.margin = '20px 0';
        separator.style.border = 'none';
        separator.style.borderTop = '1px solid #e0e0e0';
        tempDiv.appendChild(separator);
      }
    });

    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '1px solid #e0e0e0';
    footer.style.fontSize = '11px';
    footer.style.color = '#999999';
    footer.textContent = `Generated from Symphonize AI • ${new Date().toLocaleString()}`;
    tempDiv.appendChild(footer);

    document.body.appendChild(tempDiv);

    // Convert to canvas with better settings
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Create PDF with A4 dimensions
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 10;

    // Add first page
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(`${title}.pdf`);
    document.body.removeChild(tempDiv);
    return true;
  } catch (error) {
    console.error('❌ PDF export error:', error);
    throw error;
  }
}


/**
 * Export conversation as DOCX
 */
export async function exportToDOCX(conversationId, messages, title = 'Conversation') {
  try {
    const { Document, Packer, Paragraph, TextRun, BorderStyle, UnderlineType } = await import('docx');

    const paragraphs = [
      new Paragraph({
        text: title,
        heading: 'Heading1',
      }),
      new Paragraph({ text: '' }),
    ];

    messages.forEach(msg => {
      const sender = msg.role === 'user' ? 'You' : 'AI Assistant';
      const time = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';

      paragraphs.push(
        new Paragraph({
          text: `${sender} (${time})`,
          bold: true,
        }),
        new Paragraph({
          text: msg.content,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: '─'.repeat(50),
          spacing: { after: 400 },
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadFile(blob, `${title}.docx`);
    return true;
  } catch (error) {
    console.error('❌ DOCX export error:', error);
    throw error;
  }
}

/**
 * Helper function to download file
 */
function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Share conversation
 */
export async function shareConversation(conversationId, messages, title = 'Conversation') {
  try {
    const text = formatMessagesForExport(messages);
    
    if (navigator.share) {
      await navigator.share({
        title,
        text: text.substring(0, 500) + '...',
      });
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(text);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Share error:', error);
    throw error;
  }
}

/**
 * Copy conversation to clipboard
 */
export async function copyConversationText(messages) {
  try {
    const text = formatMessagesForExport(messages);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('❌ Copy error:', error);
    throw error;
  }
}
