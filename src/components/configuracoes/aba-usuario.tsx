"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Shield, Save, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";

interface AbaUsuarioProps {
  nome: string;
  setNome: (nome: string) => void;
  email: string;
  setEmail: (email: string) => void;
  senhaAtual: string;
  setSenhaAtual: (senha: string) => void;
  novaSenha: string;
  setNovaSenha: (senha: string) => void;
  confirmarSenha: string;
  setConfirmarSenha: (senha: string) => void;
  foto: string | null;
  fotoPreview: string | null;
  carregando: boolean;
  onSalvarPerfil: () => void;
  onAlterarSenha: () => void;
  onSelecionarFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSalvarFoto: () => void;
  onRemoverFoto: () => void;
}

export function AbaUsuario({
  nome,
  setNome,
  email,
  setEmail,
  senhaAtual,
  setSenhaAtual,
  novaSenha,
  setNovaSenha,
  confirmarSenha,
  setConfirmarSenha,
  foto,
  fotoPreview,
  carregando,
  onSalvarPerfil,
  onAlterarSenha,
  onSelecionarFoto,
  onSalvarFoto,
  onRemoverFoto,
}: AbaUsuarioProps) {
  return (
    <div className="space-y-6">
      {/* Foto do Usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <CardTitle>Foto do Perfil</CardTitle>
          </div>
          <CardDescription>
            Personalize sua foto que aparece no canto superior direito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Preview da Foto */}
            <div className="relative">
              {fotoPreview || foto ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={fotoPreview || foto || ""}
                    alt="Foto do usuário"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onSelecionarFoto}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Foto
                  </Button>
                </div>

                {fotoPreview && (
                  <>
                    <Button onClick={onSalvarFoto} disabled={carregando}>
                      {carregando ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Foto
                    </Button>
                    <Button variant="ghost" onClick={onRemoverFoto}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil do Usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Informações Pessoais</CardTitle>
          </div>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

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
          </div>

          <Button onClick={onSalvarPerfil} disabled={carregando}>
            {carregando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Segurança</CardTitle>
          </div>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha-atual">Senha Atual</Label>
              <Input
                id="senha-atual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Dica de Segurança:</strong> Use uma senha forte com no mínimo 8 caracteres,
              incluindo letras maiúsculas, minúsculas, números e símbolos.
            </p>
          </div>

          <Button onClick={onAlterarSenha} disabled={carregando}>
            {carregando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Alterar Senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
