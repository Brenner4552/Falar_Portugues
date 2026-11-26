const CACHE="falar-portugues-v26";
const ASSETS=["./","./index.html","./manifest.webmanifest"];

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      )
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;

  // HTML immer zuerst vom Server holen. So bleiben neue App-Versionen
  // nicht an einer alten Service-Worker-HTML-Version hängen.
  if(e.request.mode==="navigate" || e.request.url.endsWith("/index.html")){
    e.respondWith(
      fetch(e.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return response;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached=>cached||fetch(e.request))
  );
});
