import { useEffect, useState } from "react";
import {
  WaybillStats,
  WorkerStats,
  DashboardStats,
} from "@/components/dashboard/home/stats";
import { useChatbotStore } from "@/stores/chatbotStore";

function DashboardHomePage() {
  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  const [dashaboardStatsMessage, setDashaboardStatsMessage] = useState("");
  const [waybillStatsMessage, setWaybillStatsMessage] = useState("");
  const [workerStatsMessage, setWorkerStatsMessage] = useState("");
  const [workerTableMessage, setWorkerTableMessage] = useState("");
  const isContextMessages =
    dashaboardStatsMessage &&
    waybillStatsMessage &&
    workerStatsMessage &&
    workerTableMessage;
  const resetContextMessages = () => {
    setDashaboardStatsMessage("");
    setWaybillStatsMessage("");
    setWorkerStatsMessage("");
    setWorkerTableMessage("");
  };

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    console.log("lsd");
    // isCollecting이 true일 때만 systemContext 업데이트
    if (isCollecting && isContextMessages) {
      const context = `현재 페이지: 실시간 개요 (/dashboard/realtime/overview)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 전체 현황:
${dashaboardStatsMessage}

⦁ 운송장 상태별 분포:
${waybillStatsMessage}

⦁ 작업자 현황:
${workerStatsMessage}

⦁ 작업자 상세 현황 테이블:
${workerTableMessage}

⦁ 사용자가 현재 보고 있는 정보:
- 물류센터의 실시간 현황과 핵심 지표를 한눈에 확인할 수 있는 대시보드
- 작업 진척도, 처리율, 누적 매출, 사고 금액 등 주요 지표 확인 가능
- 운송장 상태별 분포와 작업자별 성과 지표 확인 가능
- 실시간으로 업데이트되는 통계 정보와 차트`;
      setSystemContext(context);
      setIsMessagePending(false);
      resetContextMessages();
    }
  }, [
    dashaboardStatsMessage,
    isCollecting,
    isContextMessages,
    setIsMessagePending,
    setSystemContext,
    waybillStatsMessage,
    workerStatsMessage,
    workerTableMessage,
  ]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">실시간 개요</h1>
          <p className="text-muted-foreground">
            물류센터의 실시간 현황과 핵심 지표를 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 대시보드 통계 카드들 */}
      <DashboardStats
        isCollecting={isCollecting}
        setDashaboardStatsMessage={setDashaboardStatsMessage}
      />

      {/* 통계 섹션 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 운송장 현황 통계 */}
        <WaybillStats
          isCollecting={isCollecting}
          setWaybillStatsMessage={setWaybillStatsMessage}
        />
        {/* 작업자 현황 통계 */}
        <WorkerStats
          isCollecting={isCollecting}
          setWorkerStatsMessage={setWorkerStatsMessage}
          setWorkerTableMessage={setWorkerTableMessage}
        />
      </div>
    </div>
  );
}

export default DashboardHomePage;
