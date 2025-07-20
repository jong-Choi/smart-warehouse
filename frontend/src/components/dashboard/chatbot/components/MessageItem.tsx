import React from "react";
import { cn } from "@/lib/utils";
import { type Message } from "@/types/chatbot";

interface MessageItemProps {
  message: Message;
}

// 성능 최적화를 위한 메시지 컴포넌트
export const MessageItem = React.memo<MessageItemProps>(({ message }) => {
  return (
    <div
      data-message-id={message.id}
      className={cn("flex", message.isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[200px] px-3 py-2 rounded-lg shadow-sm",
          message.isUser
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
        )}
      >
        <p className="text-xs whitespace-pre-wrap">
          {message.text}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
          )}
        </p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
