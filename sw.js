const C='budget-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json','./app.js','./ui.js','./form.js'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const k=res.clone();
caches.open(C).then(c=>c.put(e.request,k)).catch(()=>{});return res;}).catch(()=>caches.match('./index.html'))));});
