// useState는 아래에서만 import
import "./App.css";
import Warehouse2D from "./Warehouse2D";
import React, { useState } from "react";

function Dashboard() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontSize: 28,
        color: "#1976d2",
        fontWeight: 700,
      }}
    >
      대시보드 (임시)
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<"factory" | "dashboard">("factory");
  // Warehouse2D는 항상 렌더링, 대시보드에서도 동작 유지

  return (
    <div>
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
            border: tab === "factory" ? "2px solid #1976d2" : "2px solid #bbb",
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
          <Warehouse2D />
        </div>
        <div style={{ display: tab === "dashboard" ? "block" : "none" }}>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
