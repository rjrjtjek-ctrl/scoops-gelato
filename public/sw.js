const CACHE_NAME = "scoops-v4";
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
  // API 호출은 절대 캐싱하지 않음
  if (url.pathname.startsWith("/api/")) return;
  // 나머지는 네트워크 우선, 실패 시 오프라인 페이지
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// ============================================
// 푸시 알림 수신
// ============================================
self.addEventListener("push", (event) => {
  let data = { title: "스쿱스젤라또", body: "새로운 알림이 있습니다.", url: "/admin" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  const options = {
    body: data.body,
    icon: "/images/icon-192.png",
    badge: "/images/icon-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "scoops-notification",
    renotify: true,
    data: { url: data.url || "/admin" },
    actions: [{ action: "open", title: "확인하기" }],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 시 해당 페이지로 이동
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // 없으면 새 탭
      return clients.openWindow(url);
    })
  );
});
