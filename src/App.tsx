// useState는 아래에서만 import
import "./App.css";
import Warehouse2D from "./Warehouse2D";
import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// 가상 WebSocket Context (브라우저 내 pub/sub)
type MessageHandler = (data: unknown) => void;
interface FakeWebSocket {
  send: (data: unknown) => void;
  subscribe: (handler: MessageHandler) => () => void;
}
const WebSocketContext = createContext<FakeWebSocket | null>(null);

function useWebSocket() {
  return useContext(WebSocketContext) as FakeWebSocket;
}
export { useWebSocket };

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const handlers = useRef<MessageHandler[]>([]);
  const ws = useRef<FakeWebSocket>();
  if (!ws.current) {
    ws.current = {
      send: (data) => {
        handlers.current.forEach((h) => h(data));
      },
      subscribe: (handler) => {
        handlers.current.push(handler);
        return () => {
          handlers.current = handlers.current.filter((h) => h !== handler);
        };
      },
    };
  }
  return (
    <WebSocketContext.Provider value={ws.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

function DashboardMain() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontSize: 28,
        color: "#1976d2",
        fontWeight: 700,
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        margin: "20px",
        backdropFilter: "blur(10px)",
      }}
    >
      대시보드 메인
    </div>
  );
}
// DashboardToday에서 실시간 데이터 수신 예시
function DashboardToday() {
  const [messages, setMessages] = useState<unknown[]>([]);
  const ws = useWebSocket();
  useEffect(() => {
    const unsub = ws.subscribe((data) => {
      setMessages((prev) => [data, ...prev.slice(0, 19)]);
    });
    return unsub;
  }, [ws]);
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontSize: 20,
        color: "#388e3c",
        fontWeight: 700,
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        margin: "20px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div>오늘 현황 (실시간 데이터)</div>
      <div
        style={{
          marginTop: 24,
          textAlign: "left",
          maxWidth: 600,
          marginInline: "auto",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#888" }}>아직 데이터 없음</div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              fontSize: 16,
              marginBottom: 8,
              background: "#e8f5e9",
              borderRadius: 8,
              padding: 8,
            }}
          >
            {typeof msg === "string" ? msg : JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
}
function DashboardWorkers() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontSize: 28,
        color: "#b26a00",
        fontWeight: 700,
      }}
    >
      작업자 현황
    </div>
  );
}

function DashboardRoutes() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 18,
            color: "#1976d2",
            padding: "8px 20px",
            borderRadius: 8,
            border: "2px solid #1976d2",
          }}
        >
          메인
        </Link>
        <Link
          to="/today"
          style={{
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 18,
            color: "#388e3c",
            padding: "8px 20px",
            borderRadius: 8,
            border: "2px solid #388e3c",
          }}
        >
          오늘 현황
        </Link>
        <Link
          to="/workers"
          style={{
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 18,
            color: "#b26a00",
            padding: "8px 20px",
            borderRadius: 8,
            border: "2px solid #b26a00",
          }}
        >
          작업자 현황
        </Link>
      </div>
      <Routes>
        <Route path="/" element={<DashboardMain />} />
        <Route path="/today" element={<DashboardToday />} />
        <Route path="/workers" element={<DashboardWorkers />} />
      </Routes>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<"factory" | "dashboard">("factory");
  // Warehouse2D는 항상 렌더링, 대시보드에서도 동작 유지

  return (
    <WebSocketProvider>
      <BrowserRouter>
        <div
          style={{
            backgroundImage: "url('/background-full.svg')",
            backgroundSize: "auto",
            backgroundPosition: "calc(50% + 20px) calc(50% - 70px)",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
            position: "relative",
          }}
        >
          {/* 상단 토글 버튼 */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
              margin: "32px 0 24px 0",
            }}
          >
            <button
              onClick={() => setTab("factory")}
              style={{
                padding: "10px 32px",
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 8,
                border:
                  tab === "factory" ? "2px solid #1976d2" : "2px solid #bbb",
                background: tab === "factory" ? "#1976d2" : "#fff",
                color: tab === "factory" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              공장 상황
            </button>
            <button
              onClick={() => setTab("dashboard")}
              style={{
                padding: "10px 32px",
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 8,
                border:
                  tab === "dashboard" ? "2px solid #1976d2" : "2px solid #bbb",
                background: tab === "dashboard" ? "#1976d2" : "#fff",
                color: tab === "dashboard" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              대시보드
            </button>
          </div>
          {/* 실제 화면 */}
          <div>
            {/* Warehouse2D는 항상 렌더링, 대시보드에서는 숨김만 */}
            <div style={{ display: tab === "factory" ? "block" : "none" }}>
              <Warehouse2DWithWS />
            </div>
            <div style={{ display: tab === "dashboard" ? "block" : "none" }}>
              <DashboardRoutes />
            </div>
          </div>
        </div>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

// Warehouse2D에서 WebSocket으로 데이터 송출 예시 (1초마다)
function Warehouse2DWithWS() {
  return <Warehouse2D />;
}

export default App;
