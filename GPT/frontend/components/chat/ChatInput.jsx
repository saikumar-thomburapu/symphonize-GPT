'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon, File, Mic, ChevronDown } from 'lucide-react';
import { transcribeAudio } from '@/lib/api';

export default function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message...",
  selectedModel = 'mistral:latest',
  availableModels = [],
  onModelChange = () => {}
}) {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [justTranscribed, setJustTranscribed] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    }
  }, [message]);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setShowModelMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-3 h-3" />;
    if (file.type === 'application/pdf') return <FileText className="w-3 h-3" />;
    return <File className="w-3 h-3" />;
  };

  // Stop recording and cleanup
  const stopRecording = () => {
    console.log('Stopping recording...');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsRecording(false);
    setTranscriptionStatus('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If still recording, just stop
    if (isRecording) {
      stopRecording();
      return;
    }
    
    // If message or files exist, send them
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      await onSend(message.trim(), attachedFiles);
      
      // Clear everything after sending
      setMessage('');
      setAttachedFiles([]);
      setJustTranscribed(false);
      setTranscriptionStatus('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // If still recording, stop it
      if (isRecording) {
        stopRecording();
        return;
      }
      
      // If just transcribed OR message exists, send it (NOT toggle mic)
      if (justTranscribed || message.trim() || attachedFiles.length > 0) {
        console.log('📨 Sending message via Enter...');
        setJustTranscribed(false);
        handleSubmit(e);
        return;
      }
    }
  };

  const getCurrentModelName = () => {
    const model = availableModels.find(m => m.id === selectedModel);
    return model ? model.name.split(' ')[0] : 'Model';
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting speech recognition...');
      setTranscriptionStatus('🎤 Listening...');
      setJustTranscribed(false);
      
      // Start speech recognition
      recognitionRef.current = transcribeAudio(
        null,
        // onTranscribe
        (transcript) => {
          console.log('📝 Transcribed:', transcript);
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setTranscriptionStatus('✓ Transcribed - Press Enter to send');
          setJustTranscribed(true);
          setIsRecording(false);
        },
        // onError
        (error) => {
          console.error('❌ Error:', error);
          setTranscriptionStatus(`❌ ${error}`);
          setIsRecording(false);
          setJustTranscribed(false);
          setTimeout(() => setTranscriptionStatus(''), 3000);
        }
      );
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice:', error);
      setTranscriptionStatus(`❌ ${error.message}`);
      setIsRecording(false);
      setJustTranscribed(false);
      setTimeout(() => setTranscriptionStatus(''), 3000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-[#043850] bg-[#021e35] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-[#032a42] border border-[#043850] rounded-lg px-2 py-1 text-xs"
              >
                <div className="text-[#66c5fb]">
                  {getFileIcon(file)}
                </div>
                <span className="text-white max-w-[150px] truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-[#7fa3d1] hover:text-red-400 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Transcription Status */}
        {transcriptionStatus && (
          <div className="mb-2 text-xs text-[#66c5fb] text-center">
            {transcriptionStatus}
          </div>
        )}
        
        {/* Input Area */}
        <div className="flex items-end gap-2">
          {/* Search Bar with Buttons INSIDE */}
          <div className="flex-1 relative flex items-center bg-[#032a42] border border-[#043850] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#3e78c2] focus-within:border-[#3e78c2] transition-all">
            
            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isRecording}
              rows={1}
              className="flex-1 bg-transparent border-none resize-none text-white placeholder:text-[#7fa3d1] focus:outline-none disabled:bg-transparent disabled:cursor-not-allowed"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />

            {/* RIGHT SIDE BUTTONS - INSIDE SEARCH BAR */}
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              
              {/* Model Selector */}
              <div className="relative" ref={modelMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="px-2.5 py-1.5 bg-[#043850] border border-[#0a5080] rounded-lg text-white text-xs font-medium hover:bg-[#0a5080] transition-colors flex items-center gap-1"
                  title="Select AI Model"
                >
                  {getCurrentModelName()}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Model Menu - Professional Dropdown */}
                {showModelMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#032a42] border border-[#043850] rounded-lg shadow-lg z-50">
                    <div className="p-1.5">
                      {availableModels && availableModels.length > 0 ? (
                        availableModels.map(model => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              console.log('Model changed to:', model.id);
                              onModelChange(model.id);
                              setShowModelMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors rounded ${
                              selectedModel === model.id
                                ? 'bg-[#3e78c2] text-white font-medium'
                                : 'text-[#b3d4f7] hover:bg-[#043850]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{model.name}</span>
                              {selectedModel === model.id && (
                                <span>✓</span>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-[#7fa3d1] text-xs p-2">No models available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-[#043850]"></div>

              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isRecording}
                className="p-1.5 text-[#b3d4f7] hover:text-[#66c5fb] hover:bg-[#043850] rounded transition-colors disabled:opacity-50"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Voice Button - WITH TOGGLE */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleVoiceToggle();
                }}
                disabled={disabled}
                className={`p-1.5 rounded transition-all disabled:opacity-50 ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
                    : 'text-[#b3d4f7] hover:text-[#66c5fb] hover:bg-[#043850]'
                }`}
                title={isRecording ? 'Stop recording (or press Enter)' : 'Start voice recording'}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Send Button - OUTSIDE */}
          <button
            type="submit"
            disabled={disabled || (!message.trim() && attachedFiles.length === 0) || isRecording}
            className="w-10 h-10 rounded-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            style={{
              background: isRecording 
                ? 'linear-gradient(135deg, #666 0%, #888 100%)'
                : 'linear-gradient(135deg, #3e78c2 0%, #66c5fb 100%)',
              boxShadow: isRecording ? 'none' : '0 0 15px rgba(62, 120, 194, 0.4)',
            }}
            title={isRecording ? 'Stop recording first' : 'Send message (Enter)'}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Helper Text */}
        <p className="mt-2 text-xs text-[#7fa3d1] text-center">
          Press <kbd className="px-1 py-0.5 bg-[#032a42] border border-[#043850] rounded text-xs mx-1">Enter</kbd> to send • 
          Click <Mic className="w-3 h-3 inline" /> to {isRecording ? 'stop' : 'start'} recording
        </p>
      </div>
    </form>
  );
}













 
 