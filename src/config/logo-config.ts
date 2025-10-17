/**
 * CONFIGURAÇÃO DA LOGO DO SISTEMA
 * 
 * Para alterar a logo do sistema:
 * 1. Adicione sua imagem em: public/images/
 * 2. Altere o caminho abaixo para o nome do seu arquivo
 * 3. Reinicie o servidor (npm run dev)
 * 
 * Formatos suportados: PNG, JPG, SVG, WEBP
 * Tamanho recomendado: 64x64px ou maior
 */

export const LOGO_CONFIG = {
  // Caminho da logo principal do sistema
  SYSTEM_LOGO_PATH: "/images/logo-financeiro.png",
  
  // Caminho alternativo (fallback)
  FALLBACK_LOGO_PATH: "/images/logo-financeiro.png",
  
  // Configurações de tamanho padrão
  DEFAULT_SIZES: {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
  },
  
  // Texto que aparece ao lado da logo
  SYSTEM_NAME: "Finanças Up",
  SYSTEM_TAGLINE: "Controle simples",
} as const;

/**
 * INSTRUÇÕES PARA ALTERAR A LOGO:
 * 
 * 1. MÉTODO SIMPLES (Recomendado):
 *    - Adicione sua imagem em: public/images/
 *    - Renomeie para: logo-financeiro.png
 *    - Reinicie o servidor
 * 
 * 2. MÉTODO PERSONALIZADO:
 *    - Adicione sua imagem em: public/images/
 *    - Altere SYSTEM_LOGO_PATH acima para o nome do seu arquivo
 *    - Reinicie o servidor
 * 
 * 3. MÉTODO POR CÓDIGO:
 *    - Importe LOGO_CONFIG em qualquer componente
 *    - Use: <SystemLogo logoPath={LOGO_CONFIG.SYSTEM_LOGO_PATH} />
 */
