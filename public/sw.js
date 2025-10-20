/**
 * Service Worker para Finanças UP
 * 
 * Implementa cache offline, sincronização em background e notificações push
 */

const CACHE_NAME = 'financas-up-v1';
const STATIC_CACHE = 'financas-up-static-v1';
const DYNAMIC_CACHE = 'financas-up-dynamic-v1';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Arquivos para cache dinâmico (APIs e dados)
const DYNAMIC_PATTERNS = [
  /^\/api\/transacoes/,
  /^\/api\/contas/,
  /^\/api\/categorias/,
  /^\/api\/orcamentos/,
  /^\/api\/relatorios/,
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia Cache First para arquivos estáticos
  if (STATIC_FILES.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estratégia Network First para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estratégia Stale While Revalidate para páginas
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Estratégia padrão: Network First
  event.respondWith(networkFirst(request));
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First error:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache apenas respostas de sucesso para APIs GET
      if (request.method === 'GET' && request.url.includes('/api/')) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar resposta offline para APIs
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'Dados não disponíveis offline',
          offline: true,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Retornar página offline para navegação
    return new Response('Aplicação offline', { status: 503 });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sincronizar transações offline
async function syncTransactions() {
  try {
    console.log('[SW] Syncing offline transactions');
    
    // Obter transações pendentes do IndexedDB
    const pendingTransactions = await getOfflineTransactions();
    
    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch('/api/transacoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction.data),
        });
        
        if (response.ok) {
          await removeOfflineTransaction(transaction.id);
          console.log('[SW] Transaction synced:', transaction.id);
        }
      } catch (error) {
        console.error('[SW] Error syncing transaction:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error in syncTransactions:', error);
  }
}

// Sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data');
    
    // Atualizar cache com dados mais recentes
    const apiEndpoints = [
      '/api/transacoes',
      '/api/contas',
      '/api/categorias',
      '/api/orcamentos',
    ];
    
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.error('[SW] Error syncing endpoint:', endpoint, error);
      }
    }
  } catch (error) {
    console.error('[SW] Error in syncOfflineData:', error);
  }
}

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: 'Você tem novas atualizações financeiras',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png',
      },
    ],
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Finanças UP', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique na notificação (não em ação)
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Funções auxiliares para IndexedDB (simuladas)
async function getOfflineTransactions() {
  // TODO: Implementar IndexedDB para armazenar transações offline
  return [];
}

async function removeOfflineTransaction(id) {
  // TODO: Implementar remoção de transação do IndexedDB
  console.log('[SW] Removing offline transaction:', id);
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded');