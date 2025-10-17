"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterLogado, setManterLogado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resultado = await signIn("credentials", {
        email,
        senha,
        manterLogado: manterLogado ? "true" : "false",
        redirect: false,
      });

      if (resultado?.error) {
        setErro("Email ou senha inválidos");
      } else {
        // Salvar preferência de manter logado no localStorage
        if (manterLogado) {
          localStorage.setItem("manterLogado", "true");
        } else {
          localStorage.removeItem("manterLogado");
        }
        
        router.push("/dashboard");
        router.refresh();
      }
    } catch (_error) {
      setErro("Erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Logo size="lg" showText={false} />
            <span className="text-3xl font-bold text-primary">Finanças Up</span>
          </div>
          <p className="text-gray-600">Controle simples, futuro grande</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={carregando}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manterLogado"
                  checked={manterLogado}
                  onChange={(e) => setManterLogado(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={carregando}
                />
                <Label htmlFor="manterLogado" className="text-sm font-normal cursor-pointer">
                  Manter conectado
                </Label>
              </div>

              {erro && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {erro}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
