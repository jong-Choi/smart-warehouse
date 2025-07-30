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
    connectionFailed,
    addMessage,
    updateLastMessage,
    setInputValue,
    setIsConnected,
    setIsLoading,
    setConnectionFailed,
    clearMessages,
    removeLastMessage,
    systemContext,
    setIsCollecting,
    useContext,
    isMessagePending,
    setIsMessagePending,
    isCollecting,
  } = useChatbotStore([
    "messages",
    "inputValue",
    "isConnected",
    "isLoading",
    "connectionFailed",
    "addMessage",
    "updateLastMessage",
    "setInputValue",
    "setIsConnected",
    "setIsLoading",
    "setConnectionFailed",
    "clearMessages",
    "removeLastMessage",
    "systemContext",
    "setIsCollecting",
    "useContext",
    "isMessagePending",
    "setIsMessagePending",
    "isCollecting",
  ]);

  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>(generateUserId());
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setIsCollecting(false); // 컨텍스트 수집 종료
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
  }, [processNextChunk, setIsLoading, setIsCollecting, updateLastMessage]);

  // 웹소켓 연결 함수
  const connectSocket = useCallback(() => {
    // 기존 연결 정리
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // 연결 실패 상태 초기화
    setConnectionFailed(false);
    setIsConnected(false);

    const socket = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3050",
      {
        transports: ["websocket", "polling"],
        timeout: 5000, // 5초 타임아웃
      }
    );

    socketRef.current = socket;

    // 5초 후 연결되지 않으면 실패로 처리
    connectionTimeoutRef.current = setTimeout(() => {
      if (!socket.connected) {
        setConnectionFailed(true);
        setIsConnected(false);
      }
    }, 5000);

    socket.on("connect", () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      clearMessages();
      setIsConnected(true);
      setConnectionFailed(false);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setConnectionFailed(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 웹소켓 연결 에러:", error);
      setConnectionFailed(true);
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
      addChunkToQueue(data.chunk);
    });

    // 스트리밍 응답 완료
    socket.on("bot_response_end", () => {
      finishStreaming();
    });

    // 에러 응답
    socket.on("bot_response_error", (data: SocketErrorData) => {
      setIsLoading(false);
      // 마지막 스트리밍 메시지만 제거
      removeLastMessage();
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
  }, [
    addChunkToQueue,
    addMessage,
    clearMessages,
    finishStreaming,
    removeLastMessage,
    setConnectionFailed,
    setIsConnected,
    setIsLoading,
  ]);

  // 재시도 함수
  const retryConnection = useCallback(() => {
    connectSocket();
  }, [connectSocket]);

  // 웹소켓 연결 설정
  useEffect(() => {
    connectSocket();

    return () => {
      // 컴포넌트 언마운트 시 타이머 정리
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connectSocket]);

  const sendMessage = useCallback(() => {
    if (
      !inputValue.trim() ||
      !socketRef.current ||
      isLoading ||
      isMessagePending
    ) {
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(newMessage);

    if (useContext) {
      setIsMessagePending(true);
      setIsCollecting(true);
    } else {
      socketRef.current.emit("chat_message", {
        message: inputValue,
        userId: userIdRef.current,
        systemContext: "",
      });
      setInputValue("");
    }
  }, [
    inputValue,
    isLoading,
    isMessagePending,
    addMessage,
    useContext,
    setIsMessagePending,
    setIsCollecting,
    setInputValue,
  ]);

  useEffect(() => {
    if (isCollecting && !isMessagePending) {
      const timeout = setTimeout(() => {
        socketRef.current?.emit("chat_message", {
          message: inputValue,
          userId: userIdRef.current,
          systemContext: systemContext,
        });
        setIsCollecting(false);
        setInputValue("");
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [
    inputValue,
    isCollecting,
    isMessagePending,
    setInputValue,
    setIsCollecting,
    systemContext,
  ]);

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
    connectionFailed,
    setInputValue,
    sendMessage,
    clearConversation,
    retryConnection,
  };
};
