"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Bell, Send, Save, Loader2, AlertCircle } from "lucide-react";
import { ConfigSMTPSimples } from "./config-smtp-simples";

interface AbaEmailProps {
  // SMTP
  provedorEmail: "gmail" | "outlook" | "outro";
  smtpHost: string;
  smtpPort: string;
  smtpEmail: string;
  smtpSenha: string;
  smtpNome: string;
  onMudarProvedor: (provedor: "gmail" | "outlook" | "outro") => void;
  setSmtpHost: (host: string) => void;
  setSmtpPort: (port: string) => void;
  setSmtpEmail: (email: string) => void;
  setSmtpSenha: (senha: string) => void;
  setSmtpNome: (nome: string) => void;
  
  // Notificações
  notificacaoEmail: boolean;
  notificacaoVencimento: boolean;
  notificacaoOrcamento: boolean;
  setNotificacaoEmail: (value: boolean) => void;
  setNotificacaoVencimento: (value: boolean) => void;
  setNotificacaoOrcamento: (value: boolean) => void;
  
  // Relatório
  enviarRelatorioEmail: boolean;
  diaEnvioRelatorio: number;
  setEnviarRelatorioEmail: (value: boolean) => void;
  setDiaEnvioRelatorio: (dia: number) => void;
  
  carregando: boolean;
  onSalvarRelatorio: () => void;
  onEnviarAgora: () => void;
}

export function AbaEmail({
  provedorEmail,
  smtpHost,
  smtpPort,
  smtpEmail,
  smtpSenha,
  smtpNome,
  onMudarProvedor,
  setSmtpHost,
  setSmtpPort,
  setSmtpEmail,
  setSmtpSenha,
  setSmtpNome,
  notificacaoEmail,
  notificacaoVencimento,
  notificacaoOrcamento,
  setNotificacaoEmail,
  setNotificacaoVencimento,
  setNotificacaoOrcamento,
  enviarRelatorioEmail,
  diaEnvioRelatorio,
  setEnviarRelatorioEmail,
  setDiaEnvioRelatorio,
  carregando,
  onSalvarRelatorio,
  onEnviarAgora,
}: AbaEmailProps) {
  return (
    <div className="space-y-6">
      {/* Configuração de Email */}
      <ConfigSMTPSimples />

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notificações por Email</CardTitle>
          </div>
          <CardDescription>
            Configure quais notificações deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notif-email">Notificações por Email</Label>
                <p className="text-xs text-gray-500">Receba notificações importantes</p>
              </div>
              <input
                type="checkbox"
                id="notif-email"
                checked={notificacaoEmail}
                onChange={(e) => setNotificacaoEmail(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notif-vencimento">Alertas de Vencimento</Label>
                <p className="text-xs text-gray-500">Lembre-se de pagar suas contas</p>
              </div>
              <input
                type="checkbox"
                id="notif-vencimento"
                checked={notificacaoVencimento}
                onChange={(e) => setNotificacaoVencimento(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notif-orcamento">Alertas de Orçamento</Label>
                <p className="text-xs text-gray-500">Quando ultrapassar o limite</p>
              </div>
              <input
                type="checkbox"
                id="notif-orcamento"
                checked={notificacaoOrcamento}
                onChange={(e) => setNotificacaoOrcamento(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Mensal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle>Relatório Mensal por Email</CardTitle>
          </div>
          <CardDescription>
            Receba automaticamente um resumo completo das suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="relatorio-email">Enviar relatório mensal</Label>
              <p className="text-xs text-gray-500">Receba um resumo completo de todas as transações do mês</p>
            </div>
            <input
              type="checkbox"
              id="relatorio-email"
              checked={enviarRelatorioEmail}
              onChange={(e) => setEnviarRelatorioEmail(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          {enviarRelatorioEmail && (
            <div className="space-y-2">
              <Label htmlFor="dia-envio">Dia do mês para envio</Label>
              <select
                id="dia-envio"
                value={diaEnvioRelatorio}
                onChange={(e) => setDiaEnvioRelatorio(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                O relatório será enviado automaticamente todo dia {diaEnvioRelatorio} do mês
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onSalvarRelatorio} disabled={carregando}>
              {carregando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>

            <Button variant="outline" onClick={onEnviarAgora} disabled={carregando}>
              {carregando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Agora
            </Button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> O relatório incluirá todas as transações, contas, cartões e resumo financeiro do mês.
              Para que o envio funcione, configure primeiro o servidor SMTP acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
