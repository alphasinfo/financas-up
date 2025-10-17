"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className={cn("min-w-full divide-y divide-gray-300", className)}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className }: ResponsiveTableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      {children}
    </thead>
  );
}

interface ResponsiveTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableBody({ children, className }: ResponsiveTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-gray-200 bg-white", className)}>
      {children}
    </tbody>
  );
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveTableRow({ children, className, onClick }: ResponsiveTableRowProps) {
  return (
    <tr 
      className={cn(
        onClick && "cursor-pointer hover:bg-gray-50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function ResponsiveTableCell({ children, className, header }: ResponsiveTableCellProps) {
  const Component = header ? "th" : "td";
  
  return (
    <Component
      className={cn(
        "whitespace-nowrap px-3 py-3 md:px-4 md:py-4 text-sm",
        header 
          ? "font-semibold text-gray-900 text-left" 
          : "text-gray-700",
        className
      )}
    >
      {children}
    </Component>
  );
}
