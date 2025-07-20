import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useChatbotStore } from "@/stores/chatbotStore";
import { generateUserId } from "@/utils/chatbot";
import { type SocketChunkData, type SocketErrorData } from "@/types/chatbot";

export const useChatbot = () => {
  const {
    messages,
    inputValue,
    isConnected,
    isLoading,
    addMessage,
    updateLastMessage,
    setInputValue,
    setIsConnected,
    setIsLoading,
    clearMessages,
  } = useChatbotStore();

  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>(generateUserId());

  // 청크 처리 관련 refs
  const chunkQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        updateLastMessage((message) => ({
          ...message,
          text: message.text + chunk,
        }));
      }

      processingTimeoutRef.current = setTimeout(
        () => processNextChunk({ onDone, delay }),
        delay
      );
    },
    [updateLastMessage]
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
      updateLastMessage((message) => ({
        ...message,
        isStreaming: false,
      }));
    };

    // 이미 드레인 중이면 콜백만 붙여 준다
    if (isProcessingRef.current) {
      processNextChunk({ onDone: wrapUp, delay: 30 });
    } else {
      // 드레인 중이 아니면 지금부터 시작해서 끝나면 wrapUp
      isProcessingRef.current = true;
      processNextChunk({ onDone: wrapUp, delay: 30 });
    }
  }, [processNextChunk, setIsLoading, updateLastMessage]);

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
      const streamingMessage = {
        id: Date.now().toString(),
        text: "",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };
      addMessage(streamingMessage);
    });

    // 스트리밍 청크 수신
    socket.on("bot_response_chunk", (data: SocketChunkData) => {
      console.log("📦 청크 수신:", data.chunk);
      addChunkToQueue(data.chunk);
    });

    // 스트리밍 응답 완료
    socket.on("bot_response_end", () => {
      console.log("✅ 스트리밍 완료");
      finishStreaming();
    });

    // 에러 응답
    socket.on("bot_response_error", (data: SocketErrorData) => {
      setIsLoading(false);
      const errorMessage = {
        id: Date.now().toString(),
        text: `오류: ${data.error}`,
        isUser: false,
        timestamp: new Date(data.timestamp),
      };
      addMessage(errorMessage);
    });

    // 대화 기록 초기화 완료
    socket.on("conversation_cleared", () => {
      clearMessages();
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
  }, [
    addChunkToQueue,
    finishStreaming,
    addMessage,
    setIsConnected,
    setIsLoading,
    clearMessages,
  ]);

  const sendMessage = useCallback(() => {
    if (!inputValue.trim() || !socketRef.current || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(newMessage);

    // 웹소켓으로 메시지 전송
    socketRef.current.emit("chat_message", {
      message: inputValue,
      userId: userIdRef.current,
    });

    setInputValue("");
  }, [inputValue, isLoading, addMessage, setInputValue]);

  const clearConversation = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("clear_conversation", {
      userId: userIdRef.current,
    });
  }, []);

  return {
    messages,
    inputValue,
    isConnected,
    isLoading,
    setInputValue,
    sendMessage,
    clearConversation,
  };
};
