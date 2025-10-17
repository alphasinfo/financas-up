"use client";

import Image from "next/image";
import { LOGO_CONFIG } from "@/config/logo-config";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface SystemLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  logoPath?: string; // Caminho personalizado da logo
}

export function SystemLogo({ 
  className = "", 
  showText = true, 
  textClassName = "",
  size = "md",
  logoPath = LOGO_CONFIG.SYSTEM_LOGO_PATH // Caminho padrão da logo
}: SystemLogoProps) {
  
  const [logoError, setLogoError] = useState(false);
  
  const tamanhos = {
    sm: { width: 24, height: 24, icon: "h-6 w-6" },
    md: { width: 32, height: 32, icon: "h-8 w-8" },
    lg: { width: 48, height: 48, icon: "h-12 w-12" },
  };

  const tamanho = tamanhos[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo - aparece ANTES do texto */}
      {!logoError ? (
        <Image
          src={logoPath}
          alt="Logo Finanças Up"
          width={tamanho.width}
          height={tamanho.height}
          className="object-contain"
          priority
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className={`${tamanho.icon} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm`}>
          <TrendingUp className="w-2/3 h-2/3" />
        </div>
      )}
      
      {/* Texto do sistema - aparece DEPOIS da logo */}
      {showText && (
        <div className={textClassName}>
          <h1 className="text-xl font-bold text-primary">Finanças Up</h1>
          <p className="text-xs text-gray-500">Controle simples</p>
        </div>
      )}
    </div>
  );
}

// Componente simplificado apenas com a logo (sem texto)
export function SystemLogoIcon({ 
  className = "",
  size = "md",
  logoPath = LOGO_CONFIG.SYSTEM_LOGO_PATH
}: Omit<SystemLogoProps, 'showText' | 'textClassName'>) {
  
  const [logoError, setLogoError] = useState(false);
  
  const tamanhos = {
    sm: { width: 24, height: 24, icon: "h-6 w-6" },
    md: { width: 32, height: 32, icon: "h-8 w-8" },
    lg: { width: 48, height: 48, icon: "h-12 w-12" },
  };

  const tamanho = tamanhos[size];

  return (
    <div className={className}>
      {!logoError ? (
        <Image
          src={logoPath}
          alt="Logo Finanças Up"
          width={tamanho.width}
          height={tamanho.height}
          className="object-contain"
          priority
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className={`${tamanho.icon} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm`}>
          <TrendingUp className="w-2/3 h-2/3" />
        </div>
      )}
    </div>
  );
}
