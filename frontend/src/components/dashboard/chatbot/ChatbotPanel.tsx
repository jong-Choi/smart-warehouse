import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, X, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

// 성능 최적화를 위한 메시지 컴포넌트
const MessageItem = React.memo(({ message }: { message: Message }) => {
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

export function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef<string>(
    `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // 청크 처리 관련 refs
  const chunkQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStreamingMessageIdRef = useRef<string | null>(null);

  // 청크를 순차적으로 처리하는 함수 (0.1초 간격)
  const processNextChunk = useCallback(
    ({ onDone, delay = 100 }: { onDone?: () => void; delay?: number } = {}) => {
      if (chunkQueueRef.current.length === 0) {
        isProcessingRef.current = false;
        onDone?.(); // 큐가 비었으면 정리
        return;
      }

      const chunk = chunkQueueRef.current.shift();
      if (chunk) {
        setMessages((prev) => {
          const m = [...prev];
          const last = m[m.length - 1];
          if (last?.isStreaming) {
            m[m.length - 1] = { ...last, text: last.text + chunk };
          }
          return m;
        });
      }

      processingTimeoutRef.current = setTimeout(
        () => processNextChunk({ onDone, delay }),
        delay
      );
    },
    []
  );

  // 청크를 큐에 추가하고 처리 시작
  const addChunkToQueue = useCallback(
    (chunk: string) => {
      chunkQueueRef.current.push(chunk);
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        processNextChunk(); // 아직 끝내기 콜백은 필요 없음
      }
    },
    [processNextChunk]
  );

  // 스트리밍 완료 처리
  const finishStreaming = useCallback(() => {
    // 타이머 초기화(겹치기 방지)
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    const wrapUp = () => {
      setIsLoading(false);
      setMessages((prev) => {
        const m = [...prev];
        const last = m[m.length - 1];
        if (last?.isStreaming) {
          m[m.length - 1] = { ...last, isStreaming: false };
        }
        return m;
      });
      currentStreamingMessageIdRef.current = null;
    };

    // 이미 드레인 중이면 콜백만 붙여 준다
    if (isProcessingRef.current) {
      processNextChunk({ onDone: wrapUp, delay: 30 });
    } else {
      // 드레인 중이 아니면 지금부터 시작해서 끝나면 wrapUp
      isProcessingRef.current = true;
      processNextChunk({ onDone: wrapUp, delay: 30 });
    }
  }, [processNextChunk]);

  // 웹소켓 연결 설정
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 웹소켓 연결됨");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 웹소켓 연결 해제됨");
      setIsConnected(false);
    });

    // 스트리밍 응답 시작
    socket.on("bot_response_start", () => {
      setIsLoading(true);
      const streamingMessageId = Date.now().toString();
      currentStreamingMessageIdRef.current = streamingMessageId;

      const streamingMessage: Message = {
        id: streamingMessageId,
        text: "",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, streamingMessage]);
    });

    // 스트리밍 청크 수신
    socket.on(
      "bot_response_chunk",
      (data: { chunk: string; timestamp: string; type: string }) => {
        console.log("📦 청크 수신:", data.chunk);
        addChunkToQueue(data.chunk);
      }
    );

    // 스트리밍 응답 완료
    socket.on("bot_response_end", () => {
      console.log("✅ 스트리밍 완료");
      finishStreaming();
    });

    // 에러 응답
    socket.on(
      "bot_response_error",
      (data: { error: string; timestamp: string; type: string }) => {
        setIsLoading(false);
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `오류: ${data.error}`,
          isUser: false,
          timestamp: new Date(data.timestamp),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    );

    // 대화 기록 초기화 완료
    socket.on("conversation_cleared", () => {
      setMessages([]);
      // 초기화 후 새로운 인사 메시지 요청
      socket.emit("request_welcome_message", {
        userId: userIdRef.current,
      });
    });

    return () => {
      // 컴포넌트 언마운트 시 타이머 정리
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [addChunkToQueue, finishStreaming]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socketRef.current || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // 웹소켓으로 메시지 전송
    socketRef.current.emit("chat_message", {
      message: inputValue,
      userId: userIdRef.current,
    });

    setInputValue("");
  };

  const handleClearConversation = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("clear_conversation", {
      userId: userIdRef.current,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={handleClearConversation}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-foreground"
                  title="대화 기록 초기화"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
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
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="h-2 w-2 text-green-500" />
                ) : (
                  <WifiOff className="h-2 w-2 text-red-500" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 메시지 영역 */}
        {isOpen && (
          <>
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
                  disabled={!inputValue.trim() || isLoading}
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
