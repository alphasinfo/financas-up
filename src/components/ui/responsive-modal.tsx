"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ResponsiveModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div
          className={cn(
            "bg-white w-full md:rounded-lg shadow-xl transform transition-all",
            "max-h-[90vh] md:max-h-[85vh] flex flex-col",
            "rounded-t-2xl md:rounded-lg",
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate pr-4">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Componente de exemplo de uso
export function ResponsiveModalExample() {
  return (
    <ResponsiveModal
      isOpen={true}
      onClose={() => {}}
      title="Título do Modal"
      footer={
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:justify-end">
          <Button variant="outline" className="w-full md:w-auto">
            Cancelar
          </Button>
          <Button className="w-full md:w-auto">
            Confirmar
          </Button>
        </div>
      }
    >
      <p>Conteúdo do modal aqui...</p>
    </ResponsiveModal>
  );
}
