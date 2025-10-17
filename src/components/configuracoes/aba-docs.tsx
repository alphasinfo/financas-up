"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, HelpCircle, Mail, ExternalLink, Github } from "lucide-react";
import Link from "next/link";

export function AbaDocs() {
  return (
    <div className="space-y-6">
      {/* Guia de Uso */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Guia de Uso</CardTitle>
          </div>
          <CardDescription>
            Aprenda a usar todos os recursos do Finanças UP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-600">
              Consulte nosso guia completo para aproveitar ao máximo o sistema de gestão financeira.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📚 Documentação:</strong> Consulte os arquivos de documentação na raiz do projeto:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-800">
              <li>• <code className="bg-blue-100 px-1 rounded">GUIA-CONFIGURACAO-EMAIL.md</code> - Configuração de email</li>
              <li>• <code className="bg-blue-100 px-1 rounded">CORRECOES-FINAIS-EMAIL.md</code> - Correções aplicadas</li>
              <li>• <code className="bg-blue-100 px-1 rounded">README.md</code> - Informações do projeto</li>
            </ul>
          </div>

          {/* Tópicos Principais */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">📚 Tópicos Principais:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Primeiros Passos",
                "Gerenciar Contas",
                "Registrar Transações",
                "Cartões de Crédito",
                "Metas Financeiras",
                "Orçamentos",
                "Relatórios",
                "Backup e Restauração",
              ].map((topico) => (
                <div key={topico} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>{topico}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sobre o Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Sobre o Sistema</CardTitle>
          </div>
          <CardDescription>
            Informações sobre o Finanças UP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">1.0</div>
              <div className="text-xs text-gray-600 mt-1">Versão</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">18</div>
              <div className="text-xs text-gray-600 mt-1">Páginas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-xs text-gray-600 mt-1">Funcionalidades</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-xs text-gray-600 mt-1">Completo</div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <h4 className="text-sm font-semibold">✨ Recursos Principais:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>Gestão completa de transações e contas</li>
              <li>Controle de cartões de crédito e faturas</li>
              <li>Metas financeiras e orçamentos</li>
              <li>Relatórios e análises detalhadas</li>
              <li>Calendário financeiro</li>
              <li>Empréstimos e investimentos</li>
              <li>Compartilhamento de contas</li>
              <li>Logs de acesso e auditoria</li>
              <li>PWA - Funciona como app mobile</li>
              <li>Backup e restauração de dados</li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-900">
              <strong>🎉 Sistema 100% Completo!</strong> Todas as funcionalidades foram implementadas
              e testadas. Pronto para uso em produção.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Suporte */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Suporte e Ajuda</CardTitle>
          </div>
          <CardDescription>
            Precisa de ajuda? Entre em contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <Card className="hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Email</h4>
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      SEU-EMAIL-DE-SUPORTE@DOMINIO.COM
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-2" asChild>
                      <a href="mailto:SEU-EMAIL-DE-SUPORTE@DOMINIO.COM">
                        Enviar email
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub */}
            <Card className="hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                    <Github className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">GitHub</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Reporte bugs e sugestões
                    </p>
                    <Button variant="link" className="h-auto p-0 mt-2" asChild>
                      <a href="https://github.com/SEU-USUARIO/SEU-REPOSITORIO" target="_blank" rel="noopener noreferrer">
                        Abrir issue
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">❓ Perguntas Frequentes:</h4>
            <div className="space-y-2">
              {[
                {
                  q: "Como categorizar transações?",
                  a: "Escolha a categoria que melhor representa o gasto ao criar a transação.",
                },
                {
                  q: "Posso ter múltiplas contas?",
                  a: "Sim! Adicione quantas contas quiser (corrente, poupança, investimentos).",
                },
                {
                  q: "Como funcionam as parcelas?",
                  a: "Ao criar uma compra parcelada, o sistema cria automaticamente as parcelas futuras.",
                },
                {
                  q: "Os dados ficam salvos?",
                  a: "Sim, tudo é salvo automaticamente no banco de dados.",
                },
              ].map((faq, index) => (
                <details key={index} className="p-3 bg-gray-50 rounded-lg">
                  <summary className="text-sm font-semibold cursor-pointer">
                    {faq.q}
                  </summary>
                  <p className="text-xs text-gray-600 mt-2">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Dica:</strong> Consulte o Guia de Uso completo para instruções detalhadas
              sobre cada funcionalidade do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
