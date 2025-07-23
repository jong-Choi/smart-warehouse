import React, { useState, useEffect, useMemo } from "react";
import {
  ControlPanel,
  SystemInfoContainer,
  SystemInfoRow,
} from "@components/ui";
import { createChannelInterface } from "@/utils";
import { type BroadcastMessage } from "@/types/broadcast";

interface MessageItem {
  id: string;
  message: React.ReactNode;
  timestamp: number;
  color: "green" | "red" | "blue" | undefined;
}

export const SystemInfoPanel: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("warehouse-events"), []);

  // 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = channel.subscribe((message: BroadcastMessage) => {
      const now = Date.now();

      // 메시지 타입에 따른 색상 결정
      let color: "green" | "red" | "blue" | undefined = undefined;
      let displayMessage: React.ReactNode = message.msg;

      if (message.msg === "작업자 처리") {
        color = "green";
        const workerId = (message.workerId as string) || "";
        displayMessage = (
          <>
            <span className="text-green-600">정상처리</span>
            <span className="text-gray-600"> ({workerId})</span>
          </>
        );
      } else if (message.msg === "작업자 고장") {
        color = "red";
        const workerId = (message.workerId as string) || "";
        displayMessage = (
          <>
            <span className="text-red-600">파손</span>
            <span className="text-gray-600"> ({workerId})</span>
          </>
        );
      } else if (message.msg === "하차된 물건") {
        displayMessage = `하차 (${String(message.waybillId).slice(-4)})`;
      } else if (message.msg === "작업중인 작업자") {
        const workerCount = (message.workerCount as number) || 0;
        displayMessage = `${workerCount}명 작업중`;
        color = "blue";
      } else if (message.msg === "작업 종료") {
        const workerId = (message.workerId as string) || "";
        displayMessage = (
          <>
            <span className="text-gray-600">작업 완료</span>
            <span className="text-gray-600"> ({workerId})</span>
          </>
        );
        color = "blue";
      }

      const newMessage: MessageItem = {
        id: `${message.msg}-${now}`,
        message: displayMessage,
        timestamp: now,
        color,
      };

      setMessages((prev) => {
        const updated = [newMessage, ...prev].slice(0, 5); // 최신 5개만 유지
        return updated;
      });
    });

    return unsubscribe;
  }, [channel]);

  return (
    <ControlPanel title="시스템 메시지">
      <div className="h-32 flex flex-col justify-between">
        <SystemInfoContainer>
          {Array.from({ length: 5 }, (_, index) => {
            const msg = messages[index];

            if (msg) {
              return (
                <SystemInfoRow
                  key={msg.id}
                  label={new Date(msg.timestamp).toLocaleTimeString()}
                  value={msg.message}
                  valueColor={msg.color}
                />
              );
            } else {
              return (
                <SystemInfoRow
                  key={`empty-${index}`}
                  label=""
                  value=""
                  className="opacity-0"
                />
              );
            }
          })}
        </SystemInfoContainer>
      </div>
    </ControlPanel>
  );
};
