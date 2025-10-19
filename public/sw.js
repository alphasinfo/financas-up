// Service Worker Otimizado para PWA
const CACHE_VERSION = '6';
const CACHE_NAME = `financas-up-v${CACHE_VERSION}`;
const CACHE_STATIC = `static-v${CACHE_VERSION}`;
const CACHE_DYNAMIC = `dynamic-v${CACHE_VERSION}`;
const CACHE_API = `api-v${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/login',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-32x32.png'
];

// Tempo máximo de cache para diferentes tipos de recursos
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 dias
  dynamic: 24 * 60 * 60 * 1000,     // 1 dia
  api: 5 * 60 * 1000,                // 5 minutos
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        // Adicionar URLs uma por uma para evitar erro se alguma falhar
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.warn(`[SW] Falha ao cachear ${url}:`, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
  );
});

// Determinar estratégia de cache baseada no tipo de recurso
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // APIs: Network-First (sempre buscar dados frescos)
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }
  
  // Assets estáticos: Cache-First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
    return 'cache-first';
  }
  
  // Páginas HTML: Network-First com fallback
  return 'network-first';
}

// Estratégia Cache-First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE_STATIC);
    cache.put(request, response.clone());
  }
  return response;
}

// Estratégia Network-First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cacheName = request.url.includes('/api/') ? CACHE_API : CACHE_DYNAMIC;
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições POST, PUT, DELETE (apenas cachear GET)
  if (event.request.method !== 'GET') {
    return;
  }

  const strategy = getCacheStrategy(event.request);
  
  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

// Atualizar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
