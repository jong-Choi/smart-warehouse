import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  value: string | number;
  variant?:
    | "default"
    | "blue"
    | "green"
    | "purple"
    | "red"
    | "orange"
    | "yellow"
    | "indigo"
    | "pink";
  helpMessage?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      icon: Icon,
      title,
      value,
      variant = "default",
      helpMessage,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "bg-gray-100 text-gray-700",
      blue: "bg-blue-50 text-blue-700",
      green: "bg-green-50 text-green-700",
      purple: "bg-purple-50 text-purple-700",
      red: "bg-red-50 text-red-700",
      orange: "bg-orange-50 text-orange-700",
      yellow: "bg-yellow-50 text-yellow-700",
      indigo: "bg-indigo-50 text-indigo-700",
      pink: "bg-pink-50 text-pink-700",
    };

    const iconStyles = {
      default: "text-gray-600",
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      red: "text-red-600",
      orange: "text-orange-600",
      yellow: "text-yellow-600",
      indigo: "text-indigo-600",
      pink: "text-pink-600",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={cn("h-5 w-5", iconStyles[variant])} />}
          <span className="font-medium text-card-foreground">{title}</span>
          {helpMessage && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-sm text-gray-600">{helpMessage}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        <span className={cn("text-xl font-bold", variantStyles[variant])}>
          {value}
        </span>
        {children}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
