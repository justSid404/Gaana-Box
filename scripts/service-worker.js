let assets = [
  "/",
  "/index.html",
  "/images/default-cover-art.png",
  "/scripts/music-player.js",
  "/styles/default-theme.css"
]

self.addEventListener("install", function(installEvent) {
  installEvent.waitUntil(
    caches.open("gaana-box").then(function(cache) {
      cache.addAll(assets);
    })
  )
});

self.addEventListener("fetch", function(fetchEvent) {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(function(res) {
      return res || fetch(fetchEvent.request);
    })
  )
});