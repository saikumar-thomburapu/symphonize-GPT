/**
 * Model Selector Component
 * 
 * Dropdown to select AI model (Gemini, DeepSeek, Ollama).
 * Like ChatGPT's model selector.
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { getAvailableModels } from '@/lib/api';
import { formatModelName, getModelProvider } from '@/lib/utils';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState({
    gemini_models: [],
    deepseek_models: [],
    ollama_models: [],
  });
  const [loading, setLoading] = useState(true);
  
  // Load available models
  useEffect(() => {
    loadModels();
  }, []);
  
  const loadModels = async () => {
    try {
      const data = await getAvailableModels();
      setModels(data);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Combine all models into one array
  const allModels = [
    ...models.gemini_models,
    ...models.deepseek_models,
    ...models.ollama_models,
  ];
  
  const handleModelSelect = (model) => {
    onModelChange(model);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      {/* Selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-900">
          {formatModelName(selectedModel)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Loading models...
              </div>
            ) : (
              <>
                {/* Gemini Models */}
                {models.gemini_models.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Google Gemini
                    </div>
                    {models.gemini_models.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          selectedModel === model ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        {formatModelName(model)}
                        {selectedModel === model && (
                          <span className="ml-2 text-primary-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* DeepSeek Models */}
                {models.deepseek_models.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      DeepSeek
                    </div>
                    {models.deepseek_models.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          selectedModel === model ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        {formatModelName(model)}
                        {selectedModel === model && (
                          <span className="ml-2 text-primary-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Ollama Models */}
                {models.ollama_models.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Ollama (Local)
                    </div>
                    {models.ollama_models.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          selectedModel === model ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        {formatModelName(model)}
                        {selectedModel === model && (
                          <span className="ml-2 text-primary-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
