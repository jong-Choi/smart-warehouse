import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { type Message } from "@/types/chatbot";
import { useChatbotStore } from "@/stores/chatbotStore";
import { Button } from "@components/ui/button";
import { RotateCcw } from "lucide-react";
import { Remark } from "react-remark";

interface MessageItemProps {
  message: Message;
  onClearConversation?: () => void;
}

const LOADING_MESSAGES = [
  "화면을 살펴보는 중",
  "생각하는 중",
  "응답을 생성하는 중",
  "준비중",
];

// 성능 최적화를 위한 메시지 컴포넌트
export const MessageItem = React.memo<MessageItemProps>(
  ({ message, onClearConversation }) => {
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [systemContextIndex, setSystemContextIndex] = useState(0);
    const { isLoading, systemContext } = useChatbotStore([
      "isLoading",
      "systemContext",
    ]);

    // 로딩 메시지 표시 여부 결정
    const shouldShowLoading =
      message.isContext && !message.text && !message.isUser && isLoading;

    // systemContext를 한 줄씩 표시할지 결정
    const shouldShowSystemContext = shouldShowLoading && systemContext;

    // systemContext 줄들을 분리
    const systemContextLines = systemContext
      ? systemContext.split("\n").filter((line) => line.trim())
      : [];

    // 로딩 메시지 순환
    useEffect(() => {
      if (message.isContext && !message.text && !message.isUser && isLoading) {
        const interval = setInterval(() => {
          setLoadingMessageIndex(
            (prev) => (prev + 1) % LOADING_MESSAGES.length
          );
        }, 2000);

        return () => clearInterval(interval);
      }
    }, [message.isContext, message.text, message.isUser, isLoading]);

    // systemContext 순환
    useEffect(() => {
      if (shouldShowSystemContext && systemContextLines.length > 0) {
        const interval = setInterval(() => {
          setSystemContextIndex(
            (prev) => (prev + 1) % systemContextLines.length
          );
        }, 1000); // systemContext는 1.5초 간격

        return () => clearInterval(interval);
      }
    }, [shouldShowSystemContext, systemContextLines.length]);

    const displayText = shouldShowLoading
      ? LOADING_MESSAGES[loadingMessageIndex]
      : message.text;

    return (
      <div
        data-message-id={message.id}
        className={cn("flex", message.isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[200px] px-3 py-2 rounded-lg shadow-sm",
            message.isUser
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "bg-white/90 text-sidebar-foreground"
          )}
        >
          <div className="text-xs whitespace-pre-wrap">
            <div>
              <Remark>{message.text}</Remark>
            </div>
            {message.isStreaming && !message.text && (
              <span className="inline-block ml-1">
                <svg
                  className="w-4 h-4 animate-spin opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            )}
            {shouldShowSystemContext && systemContextLines.length > 0 && (
              <div className="inline-block ml-1 text-xs text-sidebar-muted-foreground/80 animate-pulse w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                {systemContextLines[systemContextIndex]}
              </div>
            )}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
        {shouldShowLoading && (
          <span className="inline-block ml-1 text-xs mt-auto text-sidebar-muted-foreground/60 animate-pulse">
            {displayText}
          </span>
        )}
        {/* 에러 메시지일 때 대화 초기화 버튼 표시 */}
        {!message.isUser &&
          message.text.startsWith("오류:") &&
          onClearConversation && (
            <Button
              onClick={onClearConversation}
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground text-xs ml-2 self-center whitespace-pre"
              title="대화 기록 초기화"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              대화 초기화
            </Button>
          )}
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";
