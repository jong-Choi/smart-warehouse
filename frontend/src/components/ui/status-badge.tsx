import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeColorVariants = {
  // yellow:
  //   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  // blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  // green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  // red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  // gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  yellow: "bg-yellow-100 text-yellow-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-700",
} as const;

export type BadgeColor = keyof typeof badgeColorVariants;

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent rounded-full px-2.5 py-0.5",
      },
      color: badgeColorVariants,
    },
    defaultVariants: {
      variant: "default",
      color: "gray",
    },
  }
);

function StatusBadge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { StatusBadge };
