"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Target,
  Calendar,
  FileText,
  GitCompareArrows,
  TrendingDown,
  DollarSign,
  Sparkles,
  Menu,
  X,
  Database,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  {
    titulo: "Dashboard",
    href: "/dashboard",
    icone: LayoutDashboard,
  },
  {
    titulo: "Financeiro",
    href: "/dashboard/financeiro",
    icone: DollarSign,
  },
  {
    titulo: "Contas Bancárias",
    href: "/dashboard/contas",
    icone: Wallet,
  },
  {
    titulo: "Cartões de Crédito",
    href: "/dashboard/cartoes",
    icone: CreditCard,
  },
  {
    titulo: "Empréstimos",
    href: "/dashboard/emprestimos",
    icone: TrendingDown,
  },
  {
    titulo: "Investimentos",
    href: "/dashboard/investimentos",
    icone: TrendingUp,
  },
  {
    titulo: "Orçamentos",
    href: "/dashboard/orcamentos",
    icone: PiggyBank,
  },
  {
    titulo: "Metas",
    href: "/dashboard/metas",
    icone: Target,
  },
  {
    titulo: "Calendário",
    href: "/dashboard/calendario",
    icone: Calendar,
  },
  {
    titulo: "Relatórios",
    href: "/dashboard/relatorios",
    icone: FileText,
  },
  {
    titulo: "Conciliação",
    href: "/dashboard/conciliacao",
    icone: GitCompareArrows,
  },
  {
    titulo: "Insights IA",
    href: "/dashboard/insights",
    icone: Sparkles,
  },
  {
    titulo: "Relatórios Avançados",
    href: "/dashboard/relatorios-avancados",
    icone: BarChart3,
  },
  {
    titulo: "Backup",
    href: "/dashboard/backup",
    icone: Database,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fechar menu ao clicar em um link (mobile)
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão Menu Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Overlay (mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
          "md:w-64 md:translate-x-0 md:static md:min-h-screen",
          "fixed top-0 left-0 z-40 w-72 h-screen",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <Link href="/dashboard" onClick={handleLinkClick}>
            <Logo size="md" showText={true} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.titulo}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
