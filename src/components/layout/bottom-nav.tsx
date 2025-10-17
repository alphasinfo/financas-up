"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  Wallet,
  CreditCard,
  BarChart3,
} from "lucide-react";

const navItems = [
  {
    label: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
  },
  {
    label: "Contas",
    href: "/dashboard/contas",
    icon: Wallet,
  },
  {
    label: "Cartões",
    href: "/dashboard/cartoes",
    icon: CreditCard,
  },
  {
    label: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart3,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
