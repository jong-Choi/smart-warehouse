import React from "react";
import { RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@stores/chatbotStore";

interface ChatbotStatusBarProps {
  currentScreen: string;
  isConnected: boolean;
  connectionFailed: boolean;
  onClearConversation: () => void;
  onRetryConnection: () => void;
}

export const ChatbotStatusBar: React.FC<ChatbotStatusBarProps> = React.memo(
  ({
    currentScreen,
    isConnected,
    connectionFailed,
    onClearConversation,
    onRetryConnection,
  }) => {
    const { useContext, setUseContext } = useChatbotStore([
      "useContext",
      "setUseContext",
    ]);
    const handleToggleContext = () => {
      setUseContext(!useContext);
    };
    return (
      <div className="px-4 py-2 border-t border-sidebar-border bg-sidebar-secondary/5">
        {/* 첫 번째 줄: 화면 기반 대화 체크박스 (연결된 경우에만 표시) */}
        {isConnected && (
          <div className="flex items-center gap-2 mb-2 border-b border-sidebar-border pb-2 justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/80">
              <Checkbox
                id="use-context"
                checked={useContext}
                onCheckedChange={handleToggleContext}
                className="h-3 w-3"
                iconClassName="text-green-700 -translate-y-0.5"
                iconStrokeWidth={4}
              />
              <label
                htmlFor="use-context"
                className={cn(
                  "cursor-pointer hover:text-sidebar-foreground",
                  useContext &&
                    "text-sidebar-foreground hover:text-muted-foreground"
                )}
              >
                화면 기반으로 대화하기
              </label>
            </div>
            <div
              className={cn("flex items-center", !useContext && "invisible")}
            >
              <span className="text-xs text-muted-foreground">
                {currentScreen}
              </span>
            </div>
          </div>
        )}

        {/* 두 번째 줄: 현재 화면 정보와 대화 초기화 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected
                  ? "bg-green-500"
                  : connectionFailed
                  ? "bg-red-500"
                  : "bg-yellow-500"
              )}
            ></div>
            <span className="text-xs font-medium text-sidebar-foreground/80 py-1 select-none">
              {connectionFailed
                ? "연결 실패"
                : !isConnected
                ? "연결중"
                : "연결됨"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {connectionFailed && (
              <Button
                onClick={onRetryConnection}
                variant="ghost"
                size="sm"
                className="h-6 px-2 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground text-xs"
                title="연결 재시도"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                재시도
              </Button>
            )}
            {isConnected && (
              <Button
                onClick={onClearConversation}
                variant="ghost"
                size="sm"
                className="h-6 px-2 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground text-xs"
                title="대화 기록 초기화"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                대화 초기화
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
