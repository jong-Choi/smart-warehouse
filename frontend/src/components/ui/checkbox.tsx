import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "src/lib/utils";

interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  iconSize?: number;
  iconClassName?: string;
  iconStrokeWidth?: number;
}

function Checkbox({
  className,
  iconSize = 3.5,
  iconClassName,
  iconStrokeWidth = 1.5,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input data-[state=checked]:bg-green-100  data-[state=checked]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon
          className={`size-${iconSize} ${iconClassName}`}
          strokeWidth={iconStrokeWidth}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
