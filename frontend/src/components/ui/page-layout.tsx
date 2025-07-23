import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("container mx-auto px-6 space-y-6", className)}>
      {children}
    </div>
  );
};
