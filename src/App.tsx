// useState는 아래에서만 import
import "./App.css";
import Warehouse2D from "./Warehouse2D";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function DashboardMain() {
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
      대시보드 메인
    </div>
  );
}
function DashboardToday() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontSize: 28,
        color: "#388e3c",
        fontWeight: 700,
      }}
    >
      오늘 현황
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
    <BrowserRouter>
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
            <Warehouse2D />
          </div>
          <div style={{ display: tab === "dashboard" ? "block" : "none" }}>
            <DashboardRoutes />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
