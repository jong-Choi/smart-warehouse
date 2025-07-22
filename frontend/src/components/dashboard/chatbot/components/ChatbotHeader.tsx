import React from "react";
import { Bot, X, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatbotHeaderProps {
  isOpen: boolean;
  isConnected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  isOpen,
  isConnected,
  onToggle,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar-accent/20 rounded-t-lg min-h-[60px]">
      {isOpen ? (
        <>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sidebar-primary" />
            <h3 className="font-semibold text-sidebar-foreground text-sm">
              챗봇
            </h3>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 w-full">
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
          >
            <Bot className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-2 w-2 text-green-500" />
            ) : (
              <WifiOff className="h-2 w-2 text-red-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
