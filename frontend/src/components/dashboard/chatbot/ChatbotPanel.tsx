import React, { useState } from "react";
import { Send, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 물류 관리 시스템 챗봇입니다. 무엇을 도와드릴까요?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // 챗봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 아직 개발 중인 기능입니다. 곧 더 나은 서비스를 제공하겠습니다!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      {/* 챗봇 패널 */}
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar border border-sidebar-border rounded-lg transition-all duration-300 ease-in-out",
          isOpen ? "w-80" : "w-12 cursor-pointer"
        )}
        style={{
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        }}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
          }
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar-accent/50 rounded-t-lg min-h-[60px]">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sidebar-primary" />
                <h3 className="font-semibold text-sidebar-foreground text-sm">
                  챗봇
                </h3>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 w-full">
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
              >
                <Bot className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 메시지 영역 */}
        {isOpen && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sidebar/50 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[200px] px-3 py-2 rounded-lg shadow-sm",
                      message.isUser
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
                    )}
                  >
                    <p className="text-xs">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30 rounded-b-lg min-h-[60px]">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지..."
                  className="flex-1 border-sidebar-border focus:border-sidebar-primary text-xs h-8 bg-sidebar text-sidebar-foreground rounded-md"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-8 w-8 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-md"
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
