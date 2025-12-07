export interface Attachment {
  type: 'image' | 'video' | 'audio';
  url: string; // Data URI (image/audio) or Blob URL (video)
  mimeType?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: Attachment;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
