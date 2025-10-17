"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useUserPhoto } from "@/contexts/logo-context";

interface UserAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  name?: string;
}

export function UserAvatar({ 
  className = "",
  size = "md",
  showName = false,
  name = ""
}: UserAvatarProps) {
  const { fotoUrl, carregando } = useUserPhoto();

  const tamanhos = {
    sm: { width: 24, height: 24, icon: "h-6 w-6" },
    md: { width: 32, height: 32, icon: "h-8 w-8" },
    lg: { width: 40, height: 40, icon: "h-10 w-10" },
  };

  const tamanho = tamanhos[size];

  if (carregando) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${tamanho.icon} bg-gray-200 rounded-full animate-pulse`} />
        {showName && (
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${tamanho.icon} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt="Foto do usuário"
            width={tamanho.width}
            height={tamanho.height}
            className="object-cover"
            priority
          />
        ) : (
          <User className={`${tamanho.icon} text-gray-500`} />
        )}
      </div>
      
      {showName && name && (
        <span className="text-sm font-medium text-gray-700">
          {name}
        </span>
      )}
    </div>
  );
}
