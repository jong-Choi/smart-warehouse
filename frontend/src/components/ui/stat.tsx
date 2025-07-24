import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card";
import { HelpCircle } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  value: string | number | React.ReactNode;
  variant?:
    | "default"
    | "blue"
    | "green"
    | "purple"
    | "red"
    | "orange"
    | "yellow"
    | "indigo"
    | "pink"
    | "summary";
  helpMessage?: string;
}

export interface StatGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6;
}

const StatContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 rounded-lg border bg-sidebar-primary-foreground/20 text-card-foreground shadow-sm shadow-sidebar-primary/15 @container",
      className
    )}
    {...props}
  />
));
StatContainer.displayName = "StatContainer";

const StatHead = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold mb-6", className)}
    {...props}
  >
    {children}
  </h3>
));
StatHead.displayName = "StatHead";

const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(
  ({ className, cols = 4, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 xl:grid-cols-2",
      3: "grid-cols-1 xl:grid-cols-3",
      4: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    };

    return (
      <div
        ref={ref}
        className={cn("grid gap-4", gridCols[cols], className)}
        {...props}
      />
    );
  }
);
StatGrid.displayName = "StatGrid";

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
    if (variant === "summary") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-between p-4 rounded-lg bg-gray-50",
            className
          )}
          {...props}
        >
          <span className="font-semibold text-lg">{title}</span>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
      );
    }
    const variantStyles = {
      default: "bg-gray-50 text-gray-700",
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
          "flex items-center justify-between p-3 rounded-lg border border-slate-300/50",
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

const Stat = Object.assign(StatContainer, {
  Container: StatContainer,
  Head: StatHead,
  Card: StatCard,
  Grid: StatGrid,
});

export { Stat, StatContainer, StatHead, StatGrid, StatCard };

export default Stat;
