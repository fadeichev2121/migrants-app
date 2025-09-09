const CACHE_NAME = 'migrant-monitor-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/auth/signin',
  '/employees/new',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('[SW] Skip waiting')
        return self.skipWaiting()
      })
  )
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients')
        return self.clients.claim()
      })
  )
})

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Пропускаем внешние запросы
  if (url.origin !== self.location.origin) {
    return
  }

  // Пропускаем API запросы в онлайне
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // В офлайне возвращаем заглушку для API
        return new Response(
          JSON.stringify({ error: 'Офлайн режим' }), 
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    return
  }

  // Стратегия Cache First для статических ресурсов
  if (STATIC_CACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
              return response
            })
        })
        .catch(() => {
          // Fallback для офлайна
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
        })
    )
    return
  }

  // Стратегия Network First для динамических страниц
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Кешируем успешные ответы
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone)
            })
        }
        return response
      })
      .catch(() => {
        // Пытаемся взять из кеша
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Fallback для навигации
            if (request.mode === 'navigate') {
              return caches.match('/')
            }
            throw new Error('Нет кешированного ответа')
          })
      })
  )
})

// Обработка сообщений
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})