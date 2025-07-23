import { useChatbotStore } from "@stores/chatbotStore";
import { useEffect, useState } from "react";

export function useDailySalesMessage(
  currentYear: number,
  currentMonth: number
) {
  const [tableMessage, setTableMessage] = useState("");

  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  useEffect(() => {
    if (isCollecting && tableMessage) {
      const monthNames = [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ];

      const context = `현재 페이지: 일별 매출 현황 (/dashboard/sales/daily)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 조회 기간:
- ${currentYear}년 ${monthNames[currentMonth - 1]}

⦁ 일별 매출 테이블:
${tableMessage}

⦁ 사용자가 현재 보고 있는 정보:
- ${currentYear}년 ${monthNames[currentMonth - 1]}의 일별 매출 현황
- 일별 하차물량, 총 운송가액, 평균 운송가액, 정상처리건수, 처리가액, 사고건수, 사고가액 확인 가능
- 하차물량 클릭 시 해당 날짜의 운송장 목록으로 이동 가능
- 월별 이동 버튼으로 다른 달의 데이터 조회 가능`;
      setSystemContext(context);
      setIsMessagePending(false);
      setTableMessage("");
    }
  }, [
    currentYear,
    currentMonth,
    isCollecting,
    setIsMessagePending,
    setSystemContext,
    tableMessage,
  ]);

  return { setTableMessage, isCollecting };
}

