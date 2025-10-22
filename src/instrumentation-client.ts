// This file configures the initialization of Sentry on the client using the instrumentation approach for Next.js 13+
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/instrumentation

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ajustar sample rate baseado no ambiente
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capturar erros de replay de sessão
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Configurações de ambiente
  environment: process.env.NODE_ENV,

  // Ignorar erros conhecidos
  ignoreErrors: [
    // Erros de rede
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    // Erros de navegação
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    // Erros de extensões do navegador
    'chrome-extension://',
    'moz-extension://',
  ],

  // Filtrar dados sensíveis
  beforeSend(event, hint) {
    // Remover dados sensíveis de URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/senha=[^&]*/gi, 'senha=***');
      event.request.url = event.request.url.replace(/password=[^&]*/gi, 'password=***');
      event.request.url = event.request.url.replace(/token=[^&]*/gi, 'token=***');
    }

    // Remover dados sensíveis de breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          const sanitized = { ...breadcrumb.data };
          ['senha', 'password', 'token', 'secret'].forEach(key => {
            if (sanitized[key]) {
              sanitized[key] = '***';
            }
          });
          return { ...breadcrumb, data: sanitized };
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Integração com performance monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;