"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugLoginPage() {
  const [email, setEmail] = useState("fox.gts@gmail.com");
  const [senha, setSenha] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const testar = async () => {
    setCarregando(true);
    setResultado(null);

    try {
      const response = await fetch('/api/debug-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();
      setResultado({ status: response.status, data });
    } catch (error) {
      setResultado({ 
        status: 'error', 
        data: { erro: 'Erro de rede', detalhes: error instanceof Error ? error.message : 'Erro desconhecido' }
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug de Login</CardTitle>
            <CardDescription>
              Teste suas credenciais e veja exatamente onde está o problema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button 
              onClick={testar} 
              disabled={carregando || !email || !senha}
              className="w-full"
            >
              {carregando ? "Testando..." : "Testar Credenciais"}
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>
                {resultado.data.sucesso ? "✅ Sucesso!" : "❌ Erro"}
              </CardTitle>
              <CardDescription>
                Status HTTP: {resultado.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(resultado.data, null, 2)}
              </pre>

              {resultado.data.sucesso && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">
                    ✅ Credenciais Válidas!
                  </h3>
                  <p className="text-green-800 mb-2">
                    O problema NÃO está nas credenciais. Possíveis causas:
                  </p>
                  <ul className="list-disc list-inside text-green-800 space-y-1">
                    {resultado.data.diagnostico?.possiveisProblemas?.map((problema: string, i: number) => (
                      <li key={i}>{problema}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.data.erro === 'Usuário não encontrado' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-900 mb-2">
                    ⚠️ Usuário Não Encontrado
                  </h3>
                  <p className="text-yellow-800 mb-2">
                    Usuários disponíveis no banco:
                  </p>
                  <ul className="list-disc list-inside text-yellow-800">
                    {resultado.data.usuariosDisponiveis?.map((email: string, i: number) => (
                      <li key={i}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p><strong>1.</strong> Digite seu email e senha</p>
            <p><strong>2.</strong> Clique em "Testar Credenciais"</p>
            <p><strong>3.</strong> Veja o resultado detalhado</p>
            <p className="mt-4 text-sm">
              Esta página testa a conexão diretamente com o banco, 
              sem passar pelo NextAuth. Se funcionar aqui mas não no login, 
              o problema está na configuração do NextAuth.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
