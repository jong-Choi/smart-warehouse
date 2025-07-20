import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatbotStatusBarProps {
  currentScreen: string;
  isConnected: boolean;
  onClearConversation: () => void;
}

export const ChatbotStatusBar: React.FC<ChatbotStatusBarProps> = ({
  currentScreen,
  isConnected,
  onClearConversation,
}) => {
  return (
    <div className="px-4 py-2 border-t border-sidebar-border bg-sidebar-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          ></div>
          <span className="text-xs font-medium text-sidebar-foreground/80">
            {currentScreen}
          </span>
        </div>
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
      </div>
    </div>
  );
};
