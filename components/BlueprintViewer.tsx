import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './SectionCard'; // Actually MessageBubble
import { Message } from '../types';
import { Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto min-h-0 space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {isLoading && (
        <div className="flex w-full justify-start gap-4 animate-fade-in">
           <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 mt-1">
              <Sparkles size={18} className="animate-pulse" />
           </div>
           <div className="bg-zinc-900/80 px-5 py-4 rounded-2xl rounded-tl-none border border-zinc-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
           </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};