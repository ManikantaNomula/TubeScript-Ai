import React, { useState, useEffect } from 'react';
import { ChatInput } from './components/InputForm';
import { ChatContainer } from './components/BlueprintViewer';
import { MediaModal } from './components/MediaModal';
import { initializeChat, sendMessage, resetSession, generateImage, generateVideo, generateSpeech } from './services/geminiService';
import { ChatState, Message, Attachment } from './types';
import { FIRST_MESSAGE } from './constants';
import { Youtube } from 'lucide-react';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Media Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);

  // Initialize chat and add greeting on mount
  useEffect(() => {
    initializeChat();
    addMessage({
      id: 'init-greeting',
      role: 'model',
      content: FIRST_MESSAGE,
      timestamp: Date.now()
    });
  }, []);

  const addMessage = (message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  // --- Text Chat Handler ---
  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    addMessage(userMsg);
    
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const responseText = await sendMessage(text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      addMessage(botMsg);
    } catch (error: any) {
      setChatState(prev => ({ 
        ...prev, 
        error: "Failed to get response. Please try again." 
      }));
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "⚠️ I encountered an error processing your request. Please check your connection or API key and try again.",
        timestamp: Date.now()
      });
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // --- Media Generation Handler ---
  const handleOpenMediaModal = (type: 'image' | 'video' | 'audio') => {
    setMediaType(type);
    setMediaModalOpen(true);
  };

  const handleMediaSubmit = async (prompt: string, options: any) => {
    setMediaModalOpen(false);
    
    // 1. Show User Request
    const typeLabel = mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Audio';
    
    let details = "";
    if (mediaType === 'image' || mediaType === 'video') {
        details = ` (${options.aspectRatio})`;
    } else if (mediaType === 'audio') {
        details = ` (Voice: ${options.voice})`;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Create ${typeLabel}${details}: ${prompt}`,
      timestamp: Date.now()
    };
    addMessage(userMsg);

    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let attachment: Attachment | undefined;
      let textContent = `Here is your generated ${typeLabel.toLowerCase()}.`;

      if (mediaType === 'image') {
        const url = await generateImage(prompt, options.aspectRatio);
        attachment = { type: 'image', url };
      } else if (mediaType === 'video') {
        const url = await generateVideo(prompt, options.aspectRatio);
        attachment = { type: 'video', url };
      } else if (mediaType === 'audio') {
        const url = await generateSpeech(prompt, options.voice);
        attachment = { type: 'audio', url };
      }

      if (attachment) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: textContent,
          timestamp: Date.now(),
          attachment: attachment
        });
      }

    } catch (error: any) {
      console.error(error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `⚠️ Failed to generate ${mediaType}. ${error.message || 'Please try again.'}`,
        timestamp: Date.now()
      });
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // --- Reset Handler ---
  const handleReset = () => {
    resetSession();
    setChatState({
      messages: [{
        id: Date.now().toString(),
        role: 'model',
        content: FIRST_MESSAGE,
        timestamp: Date.now()
      }],
      isLoading: false,
      error: null
    });
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="flex-shrink-0 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-center relative z-10">
        <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-lg">
                <Youtube size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
                TubeArchitect <span className="text-red-500">AI</span>
            </h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-zinc-950/0 to-zinc-950 pointer-events-none" />
        
        <ChatContainer 
          messages={chatState.messages} 
          isLoading={chatState.isLoading} 
        />
        
        <ChatInput 
          onSend={handleSend} 
          onReset={handleReset} 
          onGenerateMedia={handleOpenMediaModal}
          isLoading={chatState.isLoading} 
        />
      </main>

      {/* Media Modal */}
      <MediaModal 
        type={mediaType}
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSubmit={handleMediaSubmit}
      />
    </div>
  );
}

export default App;