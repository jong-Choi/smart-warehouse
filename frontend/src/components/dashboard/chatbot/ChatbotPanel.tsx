import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/hooks/useChatbot";
import { useChatbotStore } from "@/stores/chatbotStore";
import { getScreenName } from "@/utils/chatbot";
import {
  ChatbotHeader,
  ChatbotMessages,
  ChatbotStatusBar,
  ChatbotInput,
} from "@components/dashboard/chatbot/components";
import { useEffect } from "react";

export function ChatbotPanel() {
  const location = useLocation();
  const currentScreen = getScreenName(location.pathname);

  const { isOpen, setIsOpen } = useChatbotStore(["isOpen", "setIsOpen"]);
  const { isConnected, connectionFailed, clearConversation, retryConnection } =
    useChatbot();

  useEffect(() => {
    if (!isConnected) {
      clearConversation();
    }
  }, [clearConversation, isConnected]);

  return (
    <div className="flex flex-col h-full p-2">
      {/* 챗봇 패널 */}
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar/10 border border-sidebar-border rounded-lg transition-all duration-300 ease-in-out",
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
        <ChatbotHeader
          isOpen={isOpen}
          isConnected={isConnected}
          onToggle={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
        />

        {/* 메시지 영역 */}
        {isOpen && (
          <>
            <ChatbotMessages />

            {/* 현재 화면 정보 및 채팅 초기화 버튼 */}
            <ChatbotStatusBar
              currentScreen={currentScreen}
              isConnected={isConnected}
              connectionFailed={connectionFailed}
              onClearConversation={clearConversation}
              onRetryConnection={retryConnection}
            />

            {/* 입력 영역 */}
            <ChatbotInput />
          </>
        )}
      </div>
    </div>
  );
}
