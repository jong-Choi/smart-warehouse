import React, { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { MessageItem } from "@/components/dashboard/chatbot/components/MessageItem";
import { type Message } from "@/types/chatbot";

interface ChatbotMessagesProps {
  messages: Message[];
}

export const ChatbotMessages: React.FC<ChatbotMessagesProps> = ({
  messages,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sidebar/50 min-h-0">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-sidebar-foreground/60">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">챗봇에 연결 중...</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
