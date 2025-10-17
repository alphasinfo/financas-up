"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Mail, Shield, Calendar } from "lucide-react";

export default function ConvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [convite, setConvite] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarConvite();
  }, [token]);

  const carregarConvite = async () => {
    try {
      const resposta = await fetch(`/api/convites/validar/${token}`);
      
      if (resposta.ok) {
        const dados = await resposta.json();
        setConvite(dados);
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Convite inválido ou expirado");
      }
    } catch (error) {
      setErro("Erro ao carregar convite");
    } finally {
      setCarregando(false);
    }
  };

  const handleAceitar = async () => {
    setProcessando(true);
    setErro("");

    try {
      const resposta = await fetch(`/api/convites/aceitar/${token}`, {
        method: "POST",
      });

      if (resposta.ok) {
        setSucesso(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao aceitar convite");
      }
    } catch (error) {
      setErro("Erro ao aceitar convite");
    } finally {
      setProcessando(false);
    }
  };

  const handleRecusar = () => {
    router.push("/");
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Convite Aceito!</h2>
            <p className="text-gray-600 mb-4">
              Você aceitou o convite com sucesso. Redirecionando para o login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
            <p className="text-gray-600 mb-6">{erro}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Voltar para o Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="text-center text-2xl">
            🎉 Você foi convidado!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                <strong>{convite?.criador?.nome}</strong> convidou você para acessar o{" "}
                <strong>Finanças Up</strong>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{convite?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Permissão</p>
                  <p className="font-medium">
                    {convite?.permissao === "VISUALIZAR"
                      ? "👁️ Visualizar"
                      : convite?.permissao === "EDITAR"
                      ? "✏️ Editar"
                      : "🛡️ Admin"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Válido até</p>
                  <p className="font-medium">
                    {new Date(convite?.expiraEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAceitar}
                disabled={processando}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {processando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Aceitar Convite
                  </>
                )}
              </Button>

              <Button
                onClick={handleRecusar}
                disabled={processando}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Recusar
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Ao aceitar, você terá acesso ao sistema com as permissões definidas pelo
              administrador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
