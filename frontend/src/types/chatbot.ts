export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatbotState {
  isOpen: boolean;
  messages: Message[];
  inputValue: string;
  isConnected: boolean;
  isLoading: boolean;
  connectionFailed: boolean;
  isCollecting: boolean;
  systemContext: string;
  useContext: boolean;
  isMessagePending: boolean;
}

export interface SocketChunkData {
  chunk: string;
  timestamp: string;
  type: string;
}

export interface SocketErrorData {
  error: string;
  timestamp: string;
  type: string;
}

export interface ChatMessage {
  message: string;
  userId: string;
}

export interface ClearConversationRequest {
  userId: string;
}

export interface WelcomeMessageRequest {
  userId: string;
}
