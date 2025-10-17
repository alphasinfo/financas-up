"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Save, Loader2, Check, AlertCircle, Trash2 } from "lucide-react";

export function ConfigSMTPSimples() {
  const [provider, setProvider] = useState<"gmail" | "outlook" | "outro" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("Finanças UP");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [configured, setConfigured] = useState(false);
  const [testando, setTestando] = useState(false);
  const [testeResultado, setTesteResultado] = useState<{tipo: 'sucesso' | 'erro', mensagem: string} | null>(null);

  useEffect(() => {
    carregarConfig();
  }, []);

  // Limpar campos ao trocar de provedor
  useEffect(() => {
    if (provider && !configured) {
      setEmail("");
      setPassword("");
      setHost("");
      setPort("587");
      setNome("Finanças UP");
    }
  }, [provider]);

  const carregarConfig = async () => {
    try {
      const res = await fetch("/api/usuario/smtp-config");
      if (res.ok) {
        const data = await res.json();
        if (data.configured) {
          const prov = data.provider?.toLowerCase();
          setProvider(prov as any);
          setEmail(data.email || "");
          setHost(data.host || "");
          setPort(String(data.port || 587));
          setNome(data.nome || "Finanças UP");
          setConfigured(true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar config:", error);
    }
  };

  const handleSalvar = async () => {
    // Validação baseada no provider
    if (!provider) {
      setErro("Selecione um provedor");
      return;
    }

    if (provider === "outro") {
      if (!email || !password || !host || !port) {
        setErro("Preencha todos os campos");
        return;
      }
    } else {
      if (!email || !password) {
        setErro("Preencha email e senha");
        return;
      }
    }

    setCarregando(true);
    setErro("");
    setSucesso(false);

    try {
      const res = await fetch("/api/usuario/smtp-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider, 
          email, 
          password, 
          nome,
          host: provider === "outro" ? host : undefined,
          port: provider === "outro" ? Number(port) : undefined,
        }),
      });

      if (res.ok) {
        setSucesso(true);
        setConfigured(true);
        setPassword("");
        setTimeout(() => setSucesso(false), 3000);
      } else {
        const data = await res.json();
        setErro(data.erro || "Erro ao salvar");
      }
    } catch (error) {
      setErro("Erro ao salvar configurações");
    } finally {
      setCarregando(false);
    }
  };

  const handleRemover = async () => {
    if (!confirm("Deseja remover as configurações de email?")) return;

    setCarregando(true);
    try {
      const res = await fetch("/api/usuario/smtp-config", {
        method: "DELETE",
      });

      if (res.ok) {
        setProvider(null);
        setEmail("");
        setPassword("");
        setNome("Finanças UP");
        setHost("");
        setPort("587");
        setConfigured(false);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }
    } catch (error) {
      setErro("Erro ao remover configurações");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <CardTitle>Configuração de Email</CardTitle>
          </div>
          {configured && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemover}
              disabled={carregando}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Configuração
            </Button>
          )}
        </div>
        <CardDescription>
          Configure Gmail, Outlook ou outro provedor SMTP para enviar emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mensagens */}
        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{erro}</span>
          </div>
        )}

        {/* Seleção de Provedor */}
        <div className="space-y-2">
          <Label>Escolha seu provedor de email</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              type="button"
              variant={provider === "gmail" ? "default" : "outline"}
              className="w-full"
              onClick={() => setProvider("gmail")}
              disabled={carregando}
            >
              <Mail className="h-4 w-4 mr-2" />
              Gmail
            </Button>
            <Button
              type="button"
              variant={provider === "outlook" ? "default" : "outline"}
              className="w-full"
              onClick={() => setProvider("outlook")}
              disabled={carregando}
            >
              <Mail className="h-4 w-4 mr-2" />
              Outlook
            </Button>
            <Button
              type="button"
              variant={provider === "outro" ? "default" : "outline"}
              className="w-full"
              onClick={() => setProvider("outro")}
              disabled={carregando}
            >
              <Mail className="h-4 w-4 mr-2" />
              Outros
            </Button>
          </div>
        </div>

        {provider && (
          <>
            {/* Instruções */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                📧 Como configurar {provider === "gmail" ? "Gmail" : provider === "outlook" ? "Outlook" : "Seu Provedor"}
              </h4>
              <div className="text-xs text-blue-800 space-y-2">
                {provider === "gmail" && (
                  <>
                    <p><strong>1.</strong> Ative a verificação em 2 etapas em: <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline font-semibold">myaccount.google.com/security</a></p>
                    <p><strong>2.</strong> Crie uma "Senha de app":</p>
                    <p className="ml-4">• Procure por "Senhas de app"<br/>• Selecione "Email" → "Outro"<br/>• Digite "Finanças UP"<br/>• Copie a senha (16 caracteres)</p>
                    <p><strong>3.</strong> Cole a senha no campo abaixo</p>
                  </>
                )}
                {provider === "outlook" && (
                  <>
                    <p><strong>1.</strong> Use sua senha normal do Outlook/Hotmail</p>
                    <p><strong>2.</strong> Se não funcionar, ative o acesso em: <a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer" className="underline font-semibold">account.microsoft.com/security</a></p>
                  </>
                )}
                {provider === "outro" && (
                  <>
                    <p><strong>1.</strong> Consulte seu provedor de email para obter:</p>
                    <ul className="ml-4 list-disc">
                      <li>Servidor SMTP (ex: smtp.seudominio.com)</li>
                      <li>Porta (geralmente 587 ou 465)</li>
                      <li>Email e senha</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Campos */}
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Seu Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    provider === "gmail" ? "seu-email@gmail.com" : 
                    provider === "outlook" ? "seu-email@outlook.com" : 
                    "seu-email@provedor.com"
                  }
                  disabled={carregando}
                />
              </div>

              {/* Senha / API Key */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {provider === "gmail" ? "Senha de App (16 caracteres)" : "Senha"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  {provider === "gmail" ? "Use a senha de app gerada (sem espaços)" : 
                   provider === "outlook" ? "Use sua senha normal do Outlook" :
                   "Use a senha do seu provedor de email"}
                </p>
              </div>

              {/* Campos extras para "Outro" */}
              {provider === "outro" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Servidor SMTP</Label>
                      <Input
                        id="host"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="smtp.seudominio.com"
                        disabled={carregando}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Porta</Label>
                      <Input
                        id="port"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="587"
                        disabled={carregando}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Nome do Remetente */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Remetente</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Finanças UP"
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <Button 
              onClick={handleSalvar} 
              disabled={carregando}
              className="w-full"
            >
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>

            {/* Status de Configuração */}
            {configured && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="text-sm text-green-900">
                    <strong>✅ {provider?.toUpperCase()} Configurado</strong>
                    <p className="text-xs text-green-700 mt-1">
                      Email: {email} - Pronto para enviar emails.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
