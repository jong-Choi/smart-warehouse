import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export const setupChatbotSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        process.env.CORS_ORIGIN || "http://localhost:3000",
        "http://localhost:5173", // Vite 개발 서버
        "http://localhost:4173", // Vite 프리뷰 서버
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 클라이언트 연결됨: ${socket.id}`);

    // 사용자 메시지 수신 및 에코 응답
    socket.on("chat_message", (data: { message: string; userId?: string }) => {
      console.log(
        `📨 메시지 수신: ${data.message} (사용자: ${data.userId || "unknown"})`
      );

      // 메시지를 그대로 따라하는 에코 응답
      const response = {
        message: data.message,
        timestamp: new Date().toISOString(),
        type: "bot_response",
      };

      // 응답 전송
      socket.emit("bot_response", response);
      console.log(`🤖 봇 응답 전송: ${response.message}`);
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`🔌 클라이언트 연결 해제: ${socket.id}`);
    });

    // 연결 상태 확인
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });
  });

  return io;
};
