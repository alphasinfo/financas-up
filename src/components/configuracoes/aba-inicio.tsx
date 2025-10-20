"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Mail, Database, FileText, ArrowRight, Users, UserPlus, Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface AbaInicioProps {
  onMudarAba: (aba: string) => void;
}

export function AbaInicio({ onMudarAba }: AbaInicioProps) {
  const cards = [
    {
      icon: User,
      titulo: "Usuário",
      descricao: "Gerencie seu perfil, foto e segurança",
      cor: "blue",
      aba: "usuario",
    },
    {
      icon: Mail,
      titulo: "Email",
      descricao: "Configure notificações e relatórios automáticos",
      cor: "purple",
      aba: "email",
    },
    {
      icon: Database,
      titulo: "Backup",
      descricao: "Proteja seus dados com backup regular",
      cor: "green",
      aba: "backup",
    },
    {
      icon: FileText,
      titulo: "Documentação",
      descricao: "Aprenda a usar todos os recursos",
      cor: "orange",
      aba: "docs",
    },
    {
      icon: Users,
      titulo: "Compartilhamento",
      descricao: "Compartilhe sua conta com outras pessoas",
      cor: "purple",
      aba: "compartilhamento",
    },
    {
      icon: UserPlus,
      titulo: "Convites",
      descricao: "Gerencie convites recebidos",
      cor: "cyan",
      aba: "convites",
    },
    {
      icon: Shield,
      titulo: "Log de Acesso",
      descricao: "Monitore acessos à sua conta",
      cor: "indigo",
      aba: "log-acesso",
    },
  ];

  const cores = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    cyan: "from-cyan-500 to-cyan-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Bem-vindo às Configurações</CardTitle>
              <CardDescription className="text-blue-700">
                Personalize sua experiência no Finanças UP
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700">
              Aqui você pode gerenciar todas as configurações do sistema, desde informações pessoais
              até preferências de aparência e backup de dados. Explore as abas acima para acessar
              cada seção.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card Destaque - Segurança 2FA */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                Autenticação de Dois Fatores (2FA)
                <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-bold">NOVO</span>
              </h3>
              <p className="text-sm text-green-700 mt-2">
                Proteja sua conta com uma camada extra de segurança. Ative o 2FA e use seu aplicativo
                autenticador (Google Authenticator, Authy, etc.) para fazer login.
              </p>
              <Link href="/dashboard/configuracoes/seguranca">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Configurar 2FA
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.aba}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onMudarAba(card.aba)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cores[card.cor as keyof typeof cores]} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center justify-between">
                      {card.titulo}
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{card.descricao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dicas Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">🎯 Primeiros Passos:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Adicione uma foto de perfil em <strong>Usuário</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Configure notificações em <strong>Email</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Faça backup dos seus dados em <strong>Backup</strong></span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">🚀 Recursos Avançados:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Instale como app mobile (PWA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Receba relatórios mensais por email</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Exporte seus dados regularmente</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  <span>Consulte a documentação completa</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sobre o Sistema */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Sistema Finanças UP</h3>
              <p className="text-sm text-green-700 mt-2">
                Gestão financeira pessoal completa com controle de transações, cartões de crédito,
                metas, orçamentos, relatórios e muito mais. Desenvolvido para ser intuitivo,
                rápido e seguro.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-green-700">
                  Versão 1.0
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-green-700">
                  100% Completo
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-green-700">
                  18 Páginas
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-green-700">
                  100+ Funcionalidades
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
