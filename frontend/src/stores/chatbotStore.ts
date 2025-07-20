import { create } from "zustand";
import { type Message, type ChatbotState } from "@/types/chatbot";

interface ChatbotStore extends ChatbotState {
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (updater: (message: Message) => Message) => void;
  setInputValue: (inputValue: string) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setConnectionFailed: (failed: boolean) => void;
  setIsCollecting: (isCollecting: boolean) => void;
  setSystemContext: (context: string) => void;
  setUseContext: (useContext: boolean) => void;
  setIsMessagePending: (isMessagePending: boolean) => void;
  clearMessages: () => void;
  removeLastMessage: () => void;
  reset: () => void;
}

const initialState: ChatbotState = {
  isOpen: true,
  messages: [],
  inputValue: "",
  isConnected: false,
  isLoading: false,
  connectionFailed: false,
  isCollecting: false,
  systemContext: "",
  useContext: true, // 기본값은 컨텍스트 활용
  isMessagePending: false,
};

export const useChatbotStore = create<ChatbotStore>((set) => ({
  ...initialState,

  setIsOpen: (isOpen) => set({ isOpen }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (updater) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        const lastIndex = messages.length - 1;
        messages[lastIndex] = updater(messages[lastIndex]);
      }
      return { messages };
    }),

  setInputValue: (inputValue) => set({ inputValue }),

  setIsConnected: (isConnected) => set({ isConnected }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setConnectionFailed: (connectionFailed) => set({ connectionFailed }),

  setIsCollecting: (isCollecting) => set({ isCollecting }),

  setSystemContext: (systemContext) => set({ systemContext }),

  setUseContext: (useContext) => set({ useContext }),

  setIsMessagePending: (isMessagePending) => set({ isMessagePending }),

  clearMessages: () => set({ messages: [] }),

  removeLastMessage: () =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages.pop(); // 마지막 메시지 제거
      }
      return { messages };
    }),

  reset: () => set(initialState),
}));
