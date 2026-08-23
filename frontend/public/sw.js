// Service Worker for Variety Store
// Provides offline caching and performance optimization

const CACHE_NAME = 'variety-store-v1'
const STATIC_CACHE = 'variety-store-static-v1'
const DYNAMIC_CACHE = 'variety-store-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/products',
  '/categories',
  '/contact',
  '/favicon.svg',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests (API, fonts, etc.)
  if (url.origin !== location.origin) {
    // Allow font requests
    if (request.destination === 'font') return
    return
  }

  // HTML pages - network first, cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }

  // Static assets - cache first, network fallback
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                try {
                  const responseClone = response.clone()
                  caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone))
                } catch (e) {
                  console.warn('Failed to cache response:', e)
                }
              }
              return response
            })
            .catch((err) => {
              console.warn('Fetch failed:', err)
              return caches.match(request)
            })
        })
    )
    return
  }

  // Default - network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart())
  }
})

async function syncCart() {
  // Implement cart sync logic here if needed
  console.log('Syncing cart...')
}

// Push notification handling (optional)
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})