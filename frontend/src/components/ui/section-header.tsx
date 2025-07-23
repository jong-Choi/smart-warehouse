import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <h2
        className={cn(
          "text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-sm text-gray-600 dark:text-gray-400",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};
