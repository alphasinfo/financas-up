"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    window.location.href = "/api/auth/signout";
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {session?.user?.name}
          </p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          aria-label="Menu do usuário"
          title="Abrir menu do usuário"
        >
          <UserAvatar size="lg" />
        </button>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          aria-label="Menu do usuário"
          title="Abrir menu do usuário"
        >
          <UserAvatar size="sm" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Mobile: Mostrar info do usuário */}
          <div className="md:hidden px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>

          {/* Configurações */}
          <Link
            href="/dashboard/configuracoes"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
