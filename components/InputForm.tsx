import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Image as ImageIcon, Video, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onReset: () => void;
  onGenerateMedia: (type: 'image' | 'video' | 'audio') => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onReset, onGenerateMedia, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      {/* Media Toolbar */}
      <div className="flex gap-2 mb-3 px-1">
        <button
          onClick={() => onGenerateMedia('image')}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 text-xs md:text-sm rounded-lg transition-all disabled:opacity-50"
        >
          <ImageIcon size={16} />
          <span>Image</span>
        </button>
        <button
          onClick={() => onGenerateMedia('video')}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 text-zinc-400 hover:text-purple-400 text-xs md:text-sm rounded-lg transition-all disabled:opacity-50"
        >
          <Video size={16} />
          <span>Video</span>
        </button>
        <button
          onClick={() => onGenerateMedia('audio')}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 text-xs md:text-sm rounded-lg transition-all disabled:opacity-50"
        >
          <Mic size={16} />
          <span>Audio</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-2xl shadow-black/50 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
        <button
          type="button"
          onClick={onReset}
          className="p-3 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-xl transition-colors"
          title="Reset Chat"
          disabled={isLoading}
        >
          <RefreshCw size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your channel idea..."
          className="flex-1 max-h-[200px] bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 resize-none py-3 text-base"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
            input.trim() && !isLoading
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      <div className="text-center mt-3 text-xs text-zinc-600">
        TubeArchitect AI can make mistakes. Review generated scripts and strategies.
      </div>
    </div>
  );
};
