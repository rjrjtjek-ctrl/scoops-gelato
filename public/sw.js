const CACHE_NAME = "scoops-order-v1";
const OFFLINE_URL = "/offline.html";

// 설치 시 오프라인 페이지 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 요청 처리
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API 호출은 절대 캐싱하지 않음 (항상 네트워크)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 나머지는 네트워크 우선, 실패 시 오프라인 페이지
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
