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
  clearMessages: () => void;
  reset: () => void;
}

const initialState: ChatbotState = {
  isOpen: true,
  messages: [],
  inputValue: "",
  isConnected: false,
  isLoading: false,
  connectionFailed: false,
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

  clearMessages: () => set({ messages: [] }),

  reset: () => set(initialState),
}));
