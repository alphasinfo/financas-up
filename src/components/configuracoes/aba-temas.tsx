"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon, Smartphone, Download, Check } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface AbaTemasProps {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
}

export function AbaTemas({
  isInstalled,
  isStandalone,
  canInstall,
}: AbaTemasProps) {
  const { theme, setTheme } = useTheme();
  const handleInstalarPWA = () => {
    // Disparar evento de instalação do PWA
    window.dispatchEvent(new Event('pwa-install'));
  };

  return (
    <div className="space-y-6">
      {/* Aparência */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Aparência</CardTitle>
          </div>
          <CardDescription>
            Personalize a aparência do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tema Claro */}
            <button
              onClick={() => setTheme("light")}
              className={`relative p-6 border-2 rounded-lg transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Sun className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Tema Claro</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Interface clara e vibrante
                  </p>
                </div>
                {theme === "light" && (
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Tema Escuro */}
            <button
              onClick={() => setTheme("dark")}
              className={`relative p-6 border-2 rounded-lg transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                  <Moon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Tema Escuro</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Interface escura e elegante
                  </p>
                </div>
                {theme === "dark" && (
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>✅ Funcional:</strong> O tema {theme === "light" ? "claro" : "escuro"} está ativo. 
              Clique nos botões acima para alternar entre os temas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aplicativo Mobile (PWA) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Aplicativo Mobile (PWA)</CardTitle>
          </div>
          <CardDescription>
            Instale o Finanças Up como aplicativo no seu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-3">
            {isInstalled || isStandalone ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Aplicativo Instalado!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      O Finanças Up está instalado e funcionando como aplicativo.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">Instale como Aplicativo</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Instale o Finanças Up na tela inicial para acesso rápido e recursos offline.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Instalação */}
          {canInstall && !isInstalled && !isStandalone && (
            <Button onClick={handleInstalarPWA} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar Aplicativo
            </Button>
          )}

          {/* Instruções */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">📱 Como Instalar:</h4>
            
            <div className="space-y-4">
              {/* Android */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-sm mb-2">Android (Chrome)</h5>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Toque no menu (⋮) no canto superior direito</li>
                  <li>Selecione "Adicionar à tela inicial"</li>
                  <li>Toque em "Adicionar"</li>
                  <li>O ícone aparecerá na tela inicial</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-sm mb-2">iOS (Safari)</h5>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Toque no botão de compartilhar (□↑)</li>
                  <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                  <li>Toque em "Adicionar"</li>
                  <li>O ícone aparecerá na tela inicial</li>
                </ol>
              </div>

              {/* Desktop */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-sm mb-2">Desktop (Chrome/Edge)</h5>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Clique no ícone de instalação (⊕) na barra de endereço</li>
                  <li>Clique em "Instalar"</li>
                  <li>O app abrirá em janela própria</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Vantagens */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">✨ Vantagens do PWA:</h4>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Funciona Offline:</strong> Acesse suas finanças sem internet</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Notificações Push:</strong> Receba alertas importantes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Mais Rápido:</strong> Carregamento instantâneo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Parece Nativo:</strong> Experiência de app real</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Sem Loja:</strong> Não precisa baixar da Play Store/App Store</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
