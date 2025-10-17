import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface EnviarEmailParams {
  para: string;
  assunto: string;
  html: string;
  usuarioId?: string; // Para buscar config SMTP do usuário
}

interface ConfigSMTP {
  provider: string;
  email: string;
  password: string;
  host: string;
  port: number;
  nome: string;
}

// Descriptografar senha
function decryptPassword(encrypted: string): string {
  // Por simplicidade, vamos usar base64
  // Em produção, use crypto com chave secreta
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  } catch {
    return encrypted;
  }
}

// Buscar configuração SMTP do usuário
async function buscarConfigSMTP(usuarioId: string): Promise<ConfigSMTP | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        smtpProvider: true,
        smtpEmail: true,
        smtpPassword: true,
        smtpHost: true,
        smtpPort: true,
        smtpNome: true,
      },
    });

    if (!usuario?.smtpProvider || !usuario.smtpPassword || !usuario.smtpEmail) {
      return null;
    }

    // Determinar host padrão baseado no provider
    let defaultHost = 'smtp.gmail.com';
    if (usuario.smtpProvider === 'OUTLOOK' || usuario.smtpProvider === 'HOTMAIL') {
      defaultHost = 'smtp-mail.outlook.com';
    } else if (usuario.smtpProvider === 'YAHOO') {
      defaultHost = 'smtp.mail.yahoo.com';
    }

    return {
      provider: usuario.smtpProvider,
      email: usuario.smtpEmail,
      password: decryptPassword(usuario.smtpPassword),
      host: usuario.smtpHost || defaultHost,
      port: usuario.smtpPort || 587,
      nome: usuario.smtpNome || 'Finanças UP',
    };
  } catch (error) {
    console.error('Erro ao buscar config SMTP:', error);
    return null;
  }
}

// Enviar com Nodemailer (Gmail/Outlook/Yahoo)
async function enviarComSMTP(config: ConfigSMTP, para: string, assunto: string, html: string) {
  try {
    console.log(`📧 Configurando SMTP: ${config.provider} (${config.host}:${config.port})`);
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });

    console.log(`📤 Enviando email de ${config.email} para ${para}`);

    const info = await transporter.sendMail({
      from: `${config.nome} <${config.email}>`,
      to: para,
      subject: assunto,
      html: html,
    });

    console.log(`✅ Email enviado via ${config.provider}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ Erro ao enviar via ${config.provider}:`, error.message || error);
    return { success: false, error: error.message || error };
  }
}


// Função principal de envio
export async function enviarEmail({ para, assunto, html, usuarioId }: EnviarEmailParams) {
  try {
    // Tentar usar configuração do usuário (Gmail/Outlook/Outro)
    if (usuarioId) {
      const configSMTP = await buscarConfigSMTP(usuarioId);
      if (configSMTP) {
        console.log(`Enviando email via ${configSMTP.provider.toUpperCase()}...`);
        return await enviarComSMTP(configSMTP, para, assunto, html);
      }
    }

    // Nenhum método configurado
    console.warn('⚠️ Nenhuma configuração de email encontrada');
    throw new Error('Configure seu email em: Configurações → Email');

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
}

export function gerarRelatorioHTML(dados: {
  periodo: string;
  receitas: number;
  despesas: number;
  saldo: number;
  transacoes: number;
  nomeUsuario: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Financeiro</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .summary {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .summary h2 {
          margin: 0 0 15px;
          font-size: 20px;
          color: #1f2937;
        }
        .metric {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .metric:last-child {
          border-bottom: none;
        }
        .metric-label {
          font-weight: 500;
          color: #6b7280;
        }
        .metric-value {
          font-weight: 600;
          font-size: 18px;
        }
        .metric-value.positive {
          color: #10b981;
        }
        .metric-value.negative {
          color: #ef4444;
        }
        .metric-value.neutral {
          color: #3b82f6;
        }
        .cta {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background 0.3s;
        }
        .button:hover {
          background: #2563eb;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Relatório Financeiro</h1>
          <p>${dados.periodo}</p>
        </div>
        
        <div class="content">
          <p class="greeting">Olá, <strong>${dados.nomeUsuario}</strong>!</p>
          
          <p>Aqui está o resumo das suas finanças do período:</p>
          
          <div class="summary">
            <h2>💰 Resumo Financeiro</h2>
            
            <div class="metric">
              <span class="metric-label">Receitas</span>
              <span class="metric-value positive">R$ ${dados.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Despesas</span>
              <span class="metric-value negative">R$ ${dados.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="metric">
              <span class="metric-label">Saldo do Período</span>
              <span class="metric-value ${dados.saldo >= 0 ? 'positive' : 'negative'}">
                R$ ${dados.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Total de Transações</span>
              <span class="metric-value neutral">${dados.transacoes}</span>
            </div>
          </div>
          
          <div class="cta">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">
              Ver Detalhes no Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Este é um relatório automático gerado pelo sistema Finanças UP. 
            Continue acompanhando suas finanças para alcançar seus objetivos!
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Finanças UP</strong></p>
          <p>Gestão Financeira Pessoal</p>
          <p style="margin-top: 10px; font-size: 12px;">
            Você está recebendo este email porque ativou o relatório mensal automático.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function gerarEmailNotificacao(dados: {
  titulo: string;
  mensagem: string;
  nomeUsuario: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
}) {
  const cores = {
    info: { bg: '#3b82f6', icon: 'ℹ️' },
    warning: { bg: '#f59e0b', icon: '⚠️' },
    success: { bg: '#10b981', icon: '✅' },
    error: { bg: '#ef4444', icon: '❌' },
  };

  const cor = cores[dados.tipo];

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${dados.titulo}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: ${cor.bg};
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .footer {
          background: #f9fafb;
          padding: 15px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${cor.icon} ${dados.titulo}</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${dados.nomeUsuario}</strong>!</p>
          <p>${dados.mensagem}</p>
        </div>
        <div class="footer">
          <p><strong>Finanças UP</strong> - Gestão Financeira Pessoal</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
