import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Mic, Settings } from 'lucide-react';
import { VOICE_OPTIONS, ASPECT_RATIOS } from '../constants';

interface MediaModalProps {
  type: 'image' | 'video' | 'audio' | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, options: any) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ type, isOpen, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [voice, setVoice] = useState('Kore');

  // Reset defaults when opening
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setAspectRatio('16:9');
      setVoice('Kore');
    }
  }, [isOpen, type]);

  if (!isOpen || !type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, { aspectRatio, voice });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon size={24} className="text-blue-500" />;
      case 'video': return <Video size={24} className="text-purple-500" />;
      case 'audio': return <Mic size={24} className="text-green-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'image': return 'Generate Image';
      case 'video': return 'Generate Video';
      case 'audio': return 'Generate Voiceover';
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'image': return 'Describe the image scene, lighting, and style...';
      case 'video': return 'Describe the video action, setting, and camera movement... (Note: Generation takes ~1 min)';
      case 'audio': return 'Enter the text you want the AI to speak...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-white">{getTitle()}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {type === 'audio' ? 'Script Text' : 'Prompt Description'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 resize-none"
              autoFocus
            />
          </div>

          {/* Configuration Options */}
          <div className="mb-6 grid grid-cols-1 gap-4">
             {/* Aspect Ratio Selector for Image/Video */}
             {(type === 'image' || type === 'video') && (
               <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5 flex items-center gap-1">
                    <Settings size={12} /> Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-zinc-600"
                  >
                    {(type === 'image' ? ASPECT_RATIOS.IMAGE : ASPECT_RATIOS.VIDEO).map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
               </div>
             )}

             {/* Voice Selector for Audio */}
             {type === 'audio' && (
               <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5 flex items-center gap-1">
                    <Settings size={12} /> Voice Style
                  </label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-zinc-600"
                  >
                    {VOICE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
               </div>
             )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};