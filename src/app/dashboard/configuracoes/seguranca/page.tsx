'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldCheck, ShieldOff, Key, Download, Copy, Check, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesCount: number;
}

interface SetupResponse {
  success: boolean;
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function SegurancaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStatus();
    }
  }, [status, router]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status');
      const data = await response.json();
      
      if (response.ok) {
        setTwoFactorStatus(data);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSetupData(data);
        setStep('setup');
      } else {
        setError(data.error || 'Erro ao configurar 2FA');
      }
    } catch (error) {
      setError('Erro ao configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('2FA ativado com sucesso!');
        setStep('verify');
        setTimeout(() => {
          setStep('status');
          setSetupData(null);
          setVerificationToken('');
          fetchStatus();
        }, 2000);
      } else {
        setError(data.error || 'Token inválido');
      }
    } catch (error) {
      setError('Erro ao verificar token');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: disablePassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('2FA desativado com sucesso');
        setDisablePassword('');
        setTimeout(() => {
          fetchStatus();
        }, 1500);
      } else {
        setError(data.error || 'Erro ao desativar 2FA');
      }
    } catch (error) {
      setError('Erro ao desativar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    
    const content = `Finanças UP - Códigos de Backup 2FA
    
Guarde estes códigos em local seguro!
Cada código pode ser usado apenas uma vez.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas-up-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !setupData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Segurança da Conta
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure a autenticação de dois fatores para proteger sua conta
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 text-green-900">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Status do 2FA */}
      {step === 'status' && twoFactorStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {twoFactorStatus.enabled ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Autenticação de Dois Fatores Ativada
                </>
              ) : (
                <>
                  <ShieldOff className="h-5 w-5 text-gray-400" />
                  Autenticação de Dois Fatores Desativada
                </>
              )}
            </CardTitle>
            <CardDescription>
              {twoFactorStatus.enabled
                ? 'Sua conta está protegida com autenticação de dois fatores'
                : 'Adicione uma camada extra de segurança à sua conta'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {twoFactorStatus.enabled ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Proteção Ativa</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Você precisará inserir um código do seu aplicativo autenticador sempre que fizer login.
                      </p>
                      {twoFactorStatus.backupCodesCount > 0 && (
                        <p className="text-sm text-green-700 mt-2">
                          <strong>Códigos de backup restantes:</strong> {twoFactorStatus.backupCodesCount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="disable-password">Senha (para desativar 2FA)</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDisable}
                    disabled={loading || !disablePassword}
                  >
                    {loading ? 'Desativando...' : 'Desativar 2FA'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Por que ativar 2FA?</h3>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Protege sua conta mesmo se sua senha for comprometida</li>
                        <li>Compatível com Google Authenticator, Authy, Microsoft Authenticator</li>
                        <li>Códigos de backup para emergências</li>
                        <li>Padrão da indústria para segurança</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSetup} disabled={loading} className="w-full">
                  {loading ? 'Configurando...' : 'Ativar Autenticação de Dois Fatores'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Setup - QR Code */}
      {step === 'setup' && setupData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Passo 1: Escaneie o QR Code</CardTitle>
              <CardDescription>
                Use seu aplicativo autenticador para escanear este código
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <Image
                    src={setupData.qrCode}
                    alt="QR Code 2FA"
                    width={300}
                    height={300}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Ou digite o código manualmente:</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                    {setupData.secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  >
                    {copiedCode === 'secret' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Aplicativos recomendados:</strong> Google Authenticator, Authy, Microsoft Authenticator, 1Password
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passo 2: Códigos de Backup</CardTitle>
              <CardDescription>
                Guarde estes códigos em local seguro. Você pode usá-los se perder acesso ao seu aplicativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code, code)}
                    >
                      {copiedCode === code ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Códigos de Backup
              </Button>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Cada código pode ser usado apenas uma vez. Guarde-os em local seguro!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passo 3: Verificar</CardTitle>
              <CardDescription>
                Digite o código de 6 dígitos do seu aplicativo autenticador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-token">Código de Verificação</Label>
                <Input
                  id="verification-token"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('status');
                    setSetupData(null);
                    setVerificationToken('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={loading || verificationToken.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verificando...' : 'Ativar 2FA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
