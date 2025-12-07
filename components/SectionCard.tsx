import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, User, Sparkles, Download } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex w-full gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {/* Avatar (Bot only) */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 mt-1">
          <Sparkles size={18} />
        </div>
      )}

      <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`relative px-5 py-4 rounded-2xl text-sm md:text-base leading-relaxed overflow-hidden ${
            isUser 
              ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700' 
              : 'bg-zinc-900/80 text-zinc-300 rounded-tl-none border border-zinc-800 shadow-xl'
          }`}
        >
          {/* Text Content */}
          {message.content && (
            <div className={`prose prose-invert max-w-none ${isUser ? 'prose-p:my-0' : 'prose-red'}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-6 mb-4 border-b border-zinc-700 pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-red-400 mt-8 mb-3 uppercase tracking-wide flex items-center gap-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-semibold text-white mt-4 mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1 marker:text-zinc-500" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                    code: ({node, ...props}) => <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-xs text-red-300 font-mono border border-zinc-800" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-red-500/50 pl-4 py-1 my-4 bg-zinc-950/50 rounded-r italic text-zinc-400" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Media Attachment */}
          {message.attachment && (
            <div className="mt-4 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950/50">
              
              {/* Image */}
              {message.attachment.type === 'image' && (
                <div className="relative group">
                  <img 
                    src={message.attachment.url} 
                    alt="Generated content" 
                    className="w-full h-auto object-cover max-h-[400px]"
                  />
                  <a 
                    href={message.attachment.url} 
                    download="generated-image.png"
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={16} />
                  </a>
                </div>
              )}

              {/* Video */}
              {message.attachment.type === 'video' && (
                <div className="relative">
                  <video 
                    controls 
                    className="w-full h-auto max-h-[400px]"
                    src={message.attachment.url}
                  />
                </div>
              )}

              {/* Audio */}
              {message.attachment.type === 'audio' && (
                <div className="p-4 flex items-center justify-center bg-zinc-900">
                  <audio 
                    controls 
                    className="w-full" 
                    src={message.attachment.url}
                  />
                </div>
              )}
            </div>
          )}

          {/* Copy Button (Bot only, text only) */}
          {!isUser && message.content && (
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 text-zinc-600 hover:text-white bg-transparent hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100"
              title="Copy Text"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
        
        {/* Timestamp/Label */}
        <span className="text-xs text-zinc-600 mt-1.5 px-1 select-none">
          {isUser ? 'You' : 'TubeArchitect AI'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Avatar (User only) */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 mt-1">
          <User size={18} />
        </div>
      )}
    </div>
  );
};
