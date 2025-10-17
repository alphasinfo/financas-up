"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Check, AlertCircle, Eye, EyeOff, ExternalLink } from "lucide-react";

export function ConfigResend() {
  const [apiKey, setApiKey] = useState("");
  const [mostrarKey, setMostrarKey] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [keyConfigurada, setKeyConfigurada] = useState(false);

  useEffect(() => {
    verificarConfiguracao();
  }, []);

  const verificarConfiguracao = async () => {
    try {
      const resposta = await fetch("/api/configuracoes/resend");
      if (resposta.ok) {
        const dados = await resposta.json();
        setKeyConfigurada(dados.configurado);
      }
    } catch (error) {
      console.error("Erro ao verificar configuração:", error);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setSucesso(false);

    try {
      const resposta = await fetch("/api/configuracoes/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (resposta.ok) {
        setSucesso(true);
        setKeyConfigurada(true);
        setApiKey("");
        setTimeout(() => setSucesso(false), 3000);
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao salvar API Key");
      }
    } catch (error) {
      setErro("Erro ao salvar API Key");
    } finally {
      setCarregando(false);
    }
  };

  const handleTestar = async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/configuracoes/resend/testar", {
        method: "POST",
      });

      if (resposta.ok) {
        alert("✅ Email de teste enviado com sucesso! Verifique sua caixa de entrada.");
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao enviar email de teste");
      }
    } catch (error) {
      setErro("Erro ao enviar email de teste");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle>Configuração Resend</CardTitle>
          </div>
          {keyConfigurada && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span>Configurado</span>
            </div>
          )}
        </div>
        <CardDescription>
          Configure sua API Key do Resend para envio de emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações sobre Resend */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
            <Send className="h-4 w-4" />
            O que é Resend?
          </h4>
          <p className="text-xs text-blue-800 mb-3">
            Resend é um serviço moderno de envio de emails para desenvolvedores. 
            Oferece API simples, alta entregabilidade e plano gratuito generoso.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
            >
              Criar conta no Resend
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-blue-400">•</span>
            <a
              href="https://resend.com/docs/dashboard/api-keys/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
            >
              Como obter API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key do Resend</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={mostrarKey ? "text" : "password"}
                placeholder="re_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                disabled={carregando}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarKey(!mostrarKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              A API Key será salva no arquivo .env como RESEND_API_KEY
            </p>
          </div>

          {/* Passo a Passo */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">📋 Como Configurar:</h4>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Acesse <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a> e crie uma conta</li>
              <li>Vá em "API Keys" no dashboard</li>
              <li>Clique em "Create API Key"</li>
              <li>Dê um nome (ex: "Finanças UP")</li>
              <li>Copie a API Key gerada</li>
              <li>Cole aqui e clique em "Salvar"</li>
            </ol>
          </div>

          {sucesso && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
              <Check className="h-4 w-4" />
              API Key salva com sucesso no arquivo .env!
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {erro}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={carregando || !apiKey} className="flex-1">
              {carregando ? "Salvando..." : "Salvar API Key"}
            </Button>
            {keyConfigurada && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestar}
                disabled={carregando}
              >
                <Send className="h-4 w-4 mr-2" />
                Testar
              </Button>
            )}
          </div>
        </form>

        {/* Benefícios */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-green-900 mb-2">✨ Benefícios do Resend:</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• <strong>Plano Gratuito:</strong> 3.000 emails/mês grátis</li>
            <li>• <strong>Alta Entregabilidade:</strong> Emails chegam na caixa de entrada</li>
            <li>• <strong>Fácil Configuração:</strong> Apenas uma API Key</li>
            <li>• <strong>Domínio Personalizado:</strong> Envie com seu próprio domínio</li>
            <li>• <strong>Analytics:</strong> Acompanhe aberturas e cliques</li>
          </ul>
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-yellow-900 mb-1">🔒 Segurança</h4>
              <p className="text-xs text-yellow-800">
                A API Key é salva de forma segura no arquivo .env do servidor. 
                Nunca compartilhe sua API Key publicamente.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
