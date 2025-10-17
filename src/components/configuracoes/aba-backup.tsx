"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, Loader2, AlertCircle, Shield } from "lucide-react";

interface AbaBackupProps {
  exportando: boolean;
  importando: boolean;
  onExportar: () => void;
  onImportar: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AbaBackup({
  exportando,
  importando,
  onExportar,
  onImportar,
}: AbaBackupProps) {
  return (
    <div className="space-y-6">
      {/* Exportar/Importar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Backup e Restauração</CardTitle>
          </div>
          <CardDescription>
            Proteja seus dados fazendo backup regular
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exportar */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Exportar Dados</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Baixe todos os seus dados em formato JSON. Inclui transações, contas, cartões,
                  metas, orçamentos e todas as suas informações financeiras.
                </p>
              </div>
            </div>
            
            <Button onClick={onExportar} disabled={exportando} variant="outline" className="w-full">
              {exportando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {exportando ? "Exportando..." : "Exportar Dados"}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Importar */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Importar Dados</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Restaure dados de um backup anterior. Selecione o arquivo JSON exportado
                    anteriormente.
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportar}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importando}
                />
                <Button variant="outline" disabled={importando} className="w-full">
                  {importando ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {importando ? "Importando..." : "Importar Dados"}
                </Button>
              </div>
            </div>
          </div>

          {/* Avisos */}
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Dica:</strong> Faça backup regularmente, especialmente antes de fazer
                alterações importantes ou atualizar o sistema.
              </p>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">
                  <strong>⚠️ Atenção:</strong> A importação irá <strong>adicionar</strong> os dados
                  importados aos existentes, não substitui. Se quiser começar do zero, exclua os
                  dados atuais primeiro.
                </p>
              </div>
            </div>
          </div>

          {/* O que é incluído */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">📦 O que é incluído no backup:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Transações</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Contas Bancárias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Cartões de Crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Faturas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Empréstimos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Investimentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Metas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Orçamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Categorias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Configurações</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Dados e Privacidade</CardTitle>
          </div>
          <CardDescription>
            Como seus dados são armazenados e protegidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h4 className="text-sm font-semibold">🔒 Segurança dos Dados</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>
                <strong>Armazenamento Local:</strong> Seus dados são armazenados de forma segura
                no banco de dados do sistema.
              </li>
              <li>
                <strong>Criptografia:</strong> Senhas são criptografadas usando bcrypt.
              </li>
              <li>
                <strong>Privacidade:</strong> Apenas você tem acesso aos seus dados financeiros.
              </li>
              <li>
                <strong>Sem Compartilhamento:</strong> Seus dados nunca são compartilhados com
                terceiros sem sua permissão.
              </li>
            </ul>

            <h4 className="text-sm font-semibold mt-4">📊 Controle dos Dados</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>
                <strong>Exportação:</strong> Você pode exportar todos os seus dados a qualquer momento.
              </li>
              <li>
                <strong>Portabilidade:</strong> Os dados exportados estão em formato JSON padrão.
              </li>
              <li>
                <strong>Exclusão:</strong> Você pode excluir sua conta e todos os dados associados.
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>💡 Recomendação:</strong> Guarde seus backups em local seguro, como um serviço
              de armazenamento em nuvem criptografado (Google Drive, Dropbox, etc) ou um disco externo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
