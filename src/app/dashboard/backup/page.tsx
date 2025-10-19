"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, Database, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Backup {
  id: string;
  nome: string;
  tamanho: number;
  data: string;
  tipo: 'manual' | 'automatico';
  status: 'completo' | 'erro';
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [criandoBackup, setCriandoBackup] = useState(false);

  useEffect(() => {
    carregarBackups();
  }, []);

  async function carregarBackups() {
    try {
      setLoading(true);
      const response = await fetch('/api/backup');
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      toast.error('Erro ao carregar lista de backups');
    } finally {
      setLoading(false);
    }
  }

  async function criarBackup() {
    try {
      setCriandoBackup(true);
      toast.loading('Criando backup...');
      
      const response = await fetch('/api/backup', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao criar backup');

      const data = await response.json();
      toast.success('Backup criado com sucesso!');
      carregarBackups();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setCriandoBackup(false);
    }
  }

  async function baixarBackup(backupId: string) {
    try {
      toast.loading('Preparando download...');
      
      const response = await fetch(`/api/backup/${backupId}`);
      if (!response.ok) throw new Error('Erro ao baixar backup');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backupId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Backup baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      toast.error('Erro ao baixar backup');
    }
  }

  async function restaurarBackup(backupId: string) {
    if (!confirm('Tem certeza? Esta ação irá substituir todos os dados atuais!')) {
      return;
    }

    try {
      toast.loading('Restaurando backup...');
      
      const response = await fetch(`/api/backup/${backupId}/restaurar`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao restaurar backup');

      toast.success('Backup restaurado com sucesso! Recarregando página...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
    }
  }

  async function excluirBackup(backupId: string) {
    if (!confirm('Tem certeza que deseja excluir este backup?')) {
      return;
    }

    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir backup');

      toast.success('Backup excluído com sucesso!');
      carregarBackups();
    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      toast.error('Erro ao excluir backup');
    }
  }

  function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup e Restauração</h1>
          <p className="text-gray-600 mt-1">
            Faça backup dos seus dados e restaure quando necessário
          </p>
        </div>
        <Button
          onClick={criarBackup}
          disabled={criandoBackup}
          size="lg"
        >
          <Database className="h-5 w-5 mr-2" />
          {criandoBackup ? 'Criando...' : 'Criar Backup Agora'}
        </Button>
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{backups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Último Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {backups.length > 0
                ? formatDistanceToNow(new Date(backups[0].data), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : 'Nenhum backup'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Espaço Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatarTamanho(
                backups.reduce((acc, b) => acc + b.tamanho, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponíveis</CardTitle>
          <CardDescription>
            Clique em um backup para baixar ou restaurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum backup encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Crie seu primeiro backup clicando no botão acima
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {backup.status === 'completo' ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">{backup.nome}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(backup.data), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        <span>•</span>
                        <span>{formatarTamanho(backup.tamanho)}</span>
                        <span>•</span>
                        <span className="capitalize">{backup.tipo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => baixarBackup(backup.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restaurarBackup(backup.id)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Restaurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => excluirBackup(backup.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Importantes */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Backups automáticos são criados diariamente às 3h da manhã</p>
          <p>• Backups manuais podem ser criados a qualquer momento</p>
          <p>• Ao restaurar um backup, todos os dados atuais serão substituídos</p>
          <p>• Recomendamos manter pelo menos 3 backups recentes</p>
          <p>• Backups são armazenados de forma segura e criptografada</p>
        </CardContent>
      </Card>
    </div>
  );
}
