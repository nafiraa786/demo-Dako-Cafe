const CACHE_NAME = 'dako-cafe-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './images/about.png',
    './images/favicon.png',
    './images/gallery-coffee.png',
    './images/gallery-food.png',
    './images/gallery-juice.png',
    './images/hero-bg.png',
    './images/menu-breakfast.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        })
    );
});
