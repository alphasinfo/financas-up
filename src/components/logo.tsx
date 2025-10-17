"use client";

import { SystemLogo } from "./system-logo";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ 
  className = "", 
  showText = true, 
  textClassName = "",
  size = "md" 
}: LogoProps) {
  // Usar sempre a logo do sistema (fixa)
  return (
    <SystemLogo 
      className={className}
      showText={showText}
      textClassName={textClassName}
      size={size}
    />
  );
}
