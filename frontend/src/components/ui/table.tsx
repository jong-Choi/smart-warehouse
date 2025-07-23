import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm bg-white divide-y divide-gray-200",
          className
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-gray-50", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("bg-white divide-y divide-gray-200", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-gray-50 cursor-pointer transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-left font-medium",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

interface SortableHeaderProps {
  columnId: string;
  children: React.ReactNode;
  sorting: Array<{ id: string; desc: boolean }>;
  onSort: (columnId: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  columnId,
  children,
  sorting,
  onSort,
  className = "",
}) => {
  const isSorted = sorting.some((sort) => sort.id === columnId);
  const currentSort = sorting.find((sort) => sort.id === columnId);

  const handleSort = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    onSort(columnId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleSort(e);
    }
  };

  const icon = !currentSort ? (
    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
  ) : currentSort.desc ? (
    <ChevronDown className="h-4 w-4 text-primary" />
  ) : (
    <ChevronUp className="h-4 w-4 text-primary" />
  );

  return (
    <TableHead
      className={cn(
        "select-none cursor-pointer group transition-colors",
        isSorted ? "text-primary" : "text-gray-500 hover:text-primary",
        className
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSorted}
      aria-label="정렬"
      onClick={handleSort}
      onKeyDown={handleKeyDown}
    >
      <span className="inline-flex items-center gap-1">
        <span>{children}</span>
        {icon}
      </span>
    </TableHead>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
