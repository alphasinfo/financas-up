"use client";

import { useSession } from "next-auth/react";
import { Notificacoes } from "@/components/notificacoes";
import { UserMenu } from "@/components/user-menu";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="ml-14 md:ml-0 min-w-0 flex-1">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            Bem-vindo, {session?.user?.name?.split(" ")[0] || "Usuário"}!
          </h2>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Notificacoes />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
