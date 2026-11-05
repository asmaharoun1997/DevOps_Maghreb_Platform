// =====================================================================
//  Maghreb Platform — frontend (JavaScript sans framework, aucune étape de build)
//  Deux sources de données interchangeables, même interface :
//    - httpStore : l'API Spring Boot (/api/...)
//    - demoStore : données en mémoire si l'API est injoignable (aperçu, plan B hors ligne)
// =====================================================================
(() => {
  'use strict';

  // ---------- Utilitaires ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => Number(v ?? 0);
  const eur = (v) => { const n = num(v); return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 }); };
  const plural = (n, w, ws = w + 's') => `${n} ${n > 1 ? ws : w}`;
  const norm = (s) => String(s ?? '').toLocaleLowerCase('fr').normalize('NFD').replace(/\p{M}+/gu, '');
  const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k` : String(n));
  const ago = (iso) => {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    if (m < 1440) return `il y a ${Math.round(m / 60)} h`;
    if (m < 43200) return `il y a ${Math.round(m / 1440)} j`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
  };
  const TAG_RE = /#([\p{L}\p{N}_]{2,40})/gu;

  // ---------- Pays et drapeaux ----------
  const COUNTRIES = {
    DZ: { name: 'Algérie', ar: 'الجزائر' },
    MA: { name: 'Maroc', ar: 'المغرب' },
    TN: { name: 'Tunisie', ar: 'تونس' },
  };
  const star = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  $('#star-dz').setAttribute('points', star(17.6, 10, 2.4, 1));
  $('#star-ma').setAttribute('points', [0, 4, 8, 2, 6].map((k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5; return `${(15 + 5 * Math.cos(a)).toFixed(2)},${(10.4 + 5 * Math.sin(a)).toFixed(2)}`; }).join(' '));
  $('#star-tn').setAttribute('points', star(16.4, 10, 2.2, .9));
  const flag = (c) => (COUNTRIES[c] ? `<svg class="flag" role="img" aria-label="${COUNTRIES[c].name}"><use href="#flag-${c}" /></svg>` : '');

  // ---------- Illustrations produits (SVG dessinés, utilisées quand une boutique n’a pas de photo) ----------
  const ART = {
    caftan: (p) => `<path d="M88 22 L112 22 L120 34 L142 44 L136 74 L126 68 L138 138 L62 138 L74 68 L64 74 L58 44 L80 34 Z" fill="${p.a}"/>
      <path d="M90 22 L100 36 L110 22" fill="none" stroke="${p.b}" stroke-width="2.5"/><path d="M100 36 V138" stroke="${p.b}" stroke-width="3"/>
      <rect x="76" y="70" width="48" height="9" rx="2" fill="${p.b}"/>${[44, 52, 60, 90, 100, 110, 120].map((y) => `<circle cx="100" cy="${y}" r="2" fill="${p.c}"/>`).join('')}`,
    bottle: (p) => `<rect x="92" y="12" width="16" height="14" rx="2" fill="#7a4e24"/>
      <path d="M90 26 h20 v14 q22 10 22 32 v56 q0 10 -10 10 h-44 q-10 0 -10 -10 v-56 q0 -22 22 -32 z" fill="${p.c}" fill-opacity=".55" stroke="${p.c}" stroke-width="2"/>
      <path d="M68 82 h64 v46 q0 10 -10 10 h-44 q-10 0 -10 -10 z" fill="${p.a}"/>
      <rect x="77" y="90" width="46" height="28" rx="3" fill="#fbf6ea"/><rect x="83" y="98" width="34" height="3" fill="${p.b}"/><rect x="83" y="106" width="24" height="3" fill="${p.b}" opacity=".6"/>`,
    pastry: (p) => `<ellipse cx="100" cy="116" rx="76" ry="18" fill="${p.c}"/><ellipse cx="100" cy="112" rx="66" ry="13" fill="none" stroke="${p.b}" stroke-width="2" stroke-dasharray="3 5"/>
      ${[[66, 102], [100, 98], [134, 102], [83, 84], [117, 84], [100, 68]].map(([x, y]) => `<polygon points="${x - 17},${y} ${x},${y - 11} ${x + 17},${y} ${x},${y + 11}" fill="${p.a}"/><path d="M${x - 9} ${y} H${x + 9}" stroke="${p.b}" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
    jar: (p) => `<rect x="74" y="24" width="52" height="16" rx="4" fill="${p.c}"/>
      <path d="M72 40 h56 q9 0 9 10 v70 q0 14 -14 14 h-46 q-14 0 -14 -14 v-70 q0 -10 9 -10z" fill="${p.a}"/>
      <rect x="80" y="70" width="40" height="32" rx="4" fill="#fbf6ea"/><path d="M92 92 q6 -16 18 -14 q-4 2 -6 6 q-6 12 -12 8z" fill="${p.a}"/><path d="M110 78 q2 -6 6 -6" stroke="${p.b}" stroke-width="2" fill="none"/>`,
    plate: (p) => `<circle cx="100" cy="75" r="60" fill="${p.c}"/><circle cx="100" cy="75" r="52" fill="none" stroke="${p.a}" stroke-width="3"/>
      <circle cx="100" cy="75" r="57" fill="none" stroke="${p.b}" stroke-width="2" stroke-dasharray="2 4"/>
      ${Array.from({ length: 8 }, (_, k) => `<ellipse cx="100" cy="45" rx="8" ry="20" fill="${p.a}" transform="rotate(${k * 45} 100 75)"/>`).join('')}
      ${Array.from({ length: 8 }, (_, k) => `<circle cx="100" cy="30" r="3.5" fill="${p.b}" transform="rotate(${k * 45 + 22.5} 100 75)"/>`).join('')}<circle cx="100" cy="75" r="11" fill="${p.b}"/>`,
    chechia: (p) => `<ellipse cx="100" cy="124" rx="44" ry="8" fill="rgba(0,0,0,.18)"/>
      <path d="M62 118 L70 50 Q100 38 130 50 L138 118 Q100 130 62 118Z" fill="${p.a}"/><ellipse cx="100" cy="50" rx="30" ry="8" fill="${p.b}"/>
      <path d="M100 48 V40 Q118 38 124 74" fill="none" stroke="#1b1b22" stroke-width="3"/>${[-6, -3, 0, 3, 6].map((d) => `<path d="M124 72 l${d} 16" stroke="#1b1b22" stroke-width="1.6"/>`).join('')}`,
    rug: (p) => `<rect x="42" y="16" width="116" height="116" rx="2" fill="${p.c}"/>
      <path d="M42 16 L158 132 M158 16 L42 132 M42 74 L100 16 L158 74 L100 132 Z" fill="none" stroke="${p.a}" stroke-width="3"/>
      <path d="M71 45 L100 16 L129 45 L100 74 Z M71 103 L100 74 L129 103 L100 132 Z" fill="none" stroke="${p.a}" stroke-width="1.5"/>
      ${Array.from({ length: 12 }, (_, k) => `<path d="M${46 + k * 10} 132 v8 M${46 + k * 10} 16 v-8" stroke="${p.c}" stroke-width="2"/>`).join('')}`,
    jewel: (p) => `<circle cx="100" cy="58" r="36" fill="#cfd3dc" stroke="${p.b}" stroke-width="2"/>
      ${Array.from({ length: 6 }, (_, k) => `<circle cx="100" cy="34" r="6" fill="${[p.a, '#2a8f5a', '#e2b33b'][k % 3]}" transform="rotate(${k * 60} 100 58)"/>`).join('')}
      <circle cx="100" cy="58" r="10" fill="${p.a}"/><circle cx="100" cy="58" r="4" fill="#e2b33b"/>
      ${[76, 100, 124].map((x) => `<path d="M${x} 90 v10" stroke="#cfd3dc" stroke-width="2"/><polygon points="${x - 8},100 ${x + 8},100 ${x},120" fill="#cfd3dc"/><circle cx="${x}" cy="124" r="4" fill="${p.a}"/>`).join('')}`,
    dates: (p) => `<path d="M40 30 Q100 6 160 34" fill="none" stroke="#6b4a1f" stroke-width="5" stroke-linecap="round"/>
      ${Array.from({ length: 9 }, (_, k) => `<path d="M${62 + k * 9} 22 L${70 + k * 7} 60" stroke="#c9a15a" stroke-width="1.5"/>`).join('')}
      ${[[70, 64], [86, 70], [102, 66], [118, 72], [134, 64], [78, 88], [96, 92], [114, 94], [130, 86], [90, 112], [108, 116], [122, 108]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="12" fill="${k % 2 ? p.a : p.b}" transform="rotate(${(k * 17) % 30 - 15} ${x} ${y})"/>`).join('')}`,
    tagine: (p) => `<ellipse cx="100" cy="118" rx="72" ry="13" fill="${p.b}"/><ellipse cx="100" cy="112" rx="62" ry="10" fill="${p.a}"/>
      <path d="M48 112 Q60 104 72 88 Q92 44 100 26 Q108 44 128 88 Q140 104 152 112 Z" fill="${p.a}"/>
      <path d="M62 102 Q100 92 138 102" fill="none" stroke="${p.c}" stroke-width="3"/><path d="M76 82 Q100 74 124 82" fill="none" stroke="${p.c}" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="100" cy="24" r="7" fill="${p.b}"/>`,
    lantern: (p) => `<path d="M100 6 V20" stroke="${p.b}" stroke-width="2"/><path d="M84 32 L100 18 L116 32 Z" fill="${p.b}"/>
      <path d="M80 34 L120 34 L134 72 L120 122 L80 122 L66 72 Z" fill="${p.a}"/>
      ${Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<circle cx="${82 + c * 9}" cy="${48 + r * 16}" r="2.4" fill="${p.c}"/>`).join('')).join('')}
      <rect x="78" y="122" width="44" height="8" rx="2" fill="${p.b}"/>`,
  };
  const KIND_LABEL = { caftan: 'Tenue', bottle: 'Huile', pastry: 'Pâtisserie', jar: 'Conserve', plate: 'Céramique', chechia: 'Chéchia', rug: 'Tapis', jewel: 'Bijou', dates: 'Dattes', tagine: 'Tajine', lantern: 'Lanterne' };
  const PALETTES = {
    caftan: { bg: '#2f2a6b', a: '#b8324f', b: '#e8b84a', c: '#f6e7b8' },
    bottle: { bg: '#3a6b4f', a: '#d99a2b', b: '#7a4e24', c: '#f2d27a' },
    pastry: { bg: '#7b3b2a', a: '#d4913c', b: '#5a2a16', c: '#f4e6cf' },
    jar: { bg: '#24526b', a: '#c62f2a', b: '#2f7d3a', c: '#3a3a42' },
    plate: { bg: '#1d3f8a', a: '#2a63c9', b: '#e8b33a', c: '#f6f1e4' },
    chechia: { bg: '#2c5560', a: '#b81f2d', b: '#8d1622', c: '#000' },
    rug: { bg: '#5c4636', a: '#2a2522', b: '#000', c: '#efe6d4' },
    jewel: { bg: '#1f5f57', a: '#c0392b', b: '#9aa1b0', c: '#000' },
    dates: { bg: '#a5642b', a: '#5d2f14', b: '#8a4a20', c: '#000' },
    tagine: { bg: '#3d4f8f', a: '#b9542f', b: '#7e3a20', c: '#f2c66b' },
    lantern: { bg: '#21284f', a: '#c08a2e', b: '#7a5418', c: '#fff3c4' },
  };
  function art(kind, { w = 200, h = 150, square = false, bg } = {}) {
    const p = PALETTES[kind];
    const vb = square ? '25 0 150 150' : `0 0 ${w} ${h}`;
    return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="-50" y="-50" width="300" height="250" fill="${bg || p.bg}"/><rect x="-50" y="-50" width="300" height="250" fill="url(#pat-khatam)"/>
      <ellipse cx="100" cy="138" rx="70" ry="9" fill="rgba(0,0,0,.18)"/>${ART[kind](p)}</svg>`;
  }
  const cover = (color) => `<svg viewBox="0 0 600 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="150" fill="${color}"/><rect width="600" height="150" fill="url(#pat-khatam)"/></svg>`;


  const media = (post, cls = '') => (post.imageUrl
    ? `<img class="${cls}" src="${esc(post.imageUrl)}" alt="${esc(post.productName)}" loading="lazy">`
    : art(post.visualKind || 'plate', cls === 'square' ? { square: true } : {}));
  const avatar = (s) => `<span class="avatar" style="background:${esc(s.color)}" aria-hidden="true">${esc(s.initials)}</span>`;

  // =====================================================================
  //  Source 1 : l'API Spring Boot
  // =====================================================================
  const TOKEN_KEY = 'maghreb-token';
  const httpStore = {
    demo: false,
    async req(method, path, body, isForm = false) {
      const headers = {};
      const token = store.get(TOKEN_KEY);
      if (token) headers.Authorization = `Bearer ${token}`;
      let payload;
      if (isForm) payload = body;
      else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
      const res = await fetch('/api' + path, { method, headers, body: payload });
      if (res.status === 401 && token) { store.set(TOKEN_KEY, null); onSessionExpired(); }
      const data = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) {
        const e = new Error(data?.error || `Erreur ${res.status}`);
        e.status = res.status; e.fields = data?.fields;
        throw e;
      }
      return data;
    },
    async probe() { const r = await fetch('/api/trends'); if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error('API absente'); },
    hasSession: () => !!store.get(TOKEN_KEY),
    async login(email, password) { const r = await this.req('POST', '/auth/login', { email, password }); store.set(TOKEN_KEY, r.token); },
    async register(email, password, displayName) { const r = await this.req('POST', '/auth/register', { email, password, displayName }); store.set(TOKEN_KEY, r.token); },
    logout() { store.set(TOKEN_KEY, null); },
    me() { return this.req('GET', '/me'); },
    feed({ tab, country, tag, q, page }) {
      const p = new URLSearchParams({ tab, page });
      if (country) p.set('country', country);
      if (tag) p.set('tag', tag);
      if (q) p.set('q', q);
      return this.req('GET', `/feed?${p}`);
    },
    trends() { return this.req('GET', '/trends'); },
    shops(country) { return this.req('GET', '/shops' + (country ? `?country=${country}` : '')); },
    shop(slug) { return this.req('GET', `/shops/${encodeURIComponent(slug)}`); },
    shopPosts(slug) { return this.req('GET', `/shops/${encodeURIComponent(slug)}/posts`); },
    follow(slug, on) { return this.req(on ? 'PUT' : 'DELETE', `/shops/${encodeURIComponent(slug)}/follow`); },
    like(id, on) { return this.req(on ? 'PUT' : 'DELETE', `/posts/${id}/like`); },
    save(id, on) { return this.req(on ? 'PUT' : 'DELETE', `/posts/${id}/save`); },
    comments(id) { return this.req('GET', `/posts/${id}/comments`); },
    comment(id, body) { return this.req('POST', `/posts/${id}/comments`, { body }); },
    upload(file) { const f = new FormData(); f.append('file', file); return this.req('POST', '/media', f, true); },
    publish(post) { return this.req('POST', '/posts', post); },
    createShop(shop) { return this.req('POST', '/me/shop', shop); },
    updateShop(shop) { return this.req('PUT', '/me/shop', shop); },
    saved() { return this.req('GET', '/me/saved'); },
    myOrders() { return this.req('GET', '/me/orders'); },
    shopOrders() { return this.req('GET', '/me/shop/orders'); },
    answer(id, status, reply) { return this.req('PATCH', `/me/shop/orders/${id}`, { status, reply }); },
    order(postId, body) { return this.req('POST', `/posts/${postId}/orders`, body); },
  };

  // =====================================================================
  //  Source 2 : démonstration en mémoire (mêmes réponses que l'API)
  // =====================================================================
  function makeDemoStore() {
    const KEY = 'maghreb-demo-v2';
    const seed = window.MAGHREB_DEMO;
    const fail = (status, msg) => { const e = new Error(msg); e.status = status; throw e; };
    const initials = (name) => name.split(/[\s'’-]+/).filter((w) => w && !['de', 'du', 'des', 'la', 'le', 'les', 'et', 'd', 'l', '&'].includes(w.toLowerCase())).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    const tagsOf = (t) => [...new Set([...String(t || '').matchAll(TAG_RE)].map((m) => norm(m[1])))];
    const now = Date.now();

    let db = null;
    try { db = JSON.parse(store.get(KEY) || 'null'); } catch { db = null; }
    if (!db) {
      const users = {};
      const addUser = (email, displayName, shop = null) => { users[email] = { id: Object.keys(users).length + 1, email, displayName, password: 'demo1234', shop }; };
      seed.shops.forEach((s) => addUser(`${s.slug}@demo.example`, s.name, s.slug));
      addUser('client@demo.example', 'Client démo');
      let nextComment = 1;
      db = {
        users,
        shops: Object.fromEntries(seed.shops.map((s) => [s.slug, { ...s, owner: `${s.slug}@demo.example` }])),
        posts: seed.posts.map((p, i) => ({
          id: i + 1, shop: p.shop, productName: p.productName, price: p.price, description: p.description,
          imageUrl: null, visualKind: p.visualKind, likeCount: p.likeCount,
          createdAt: new Date(now - p.minutesAgo * 60000).toISOString(),
          comments: p.comments.map((c, k) => {
            const shop = seed.shops.find((s) => s.name === c.author);
            return { id: nextComment++, author: c.author, body: c.body, fromShop: !!shop, createdAt: new Date(now - (p.minutesAgo - 5 * (k + 1)) * 60000).toISOString() };
          }),
        })),
        likes: {}, saves: {}, follows: { 'client@demo.example': ['douceurs-oran', 'dar-caftan', 'cap-bon'] },
        orders: [], session: null, nextId: 1000,
      };
    }
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota : les photos lourdes ne sont pas conservées */ } };
    const me = () => (db.session ? db.users[db.session] : null);
    const requireMe = () => me() || fail(401, 'Connectez-vous');
    const set = (bag, email) => (bag[email] ||= []);
    const shopOfUser = (u) => (u && u.shop ? db.shops[u.shop] : null);

    const summary = (s) => {
      const u = me();
      return { slug: s.slug, name: s.name, country: s.country, city: s.city, color: s.color, initials: s.initials || initials(s.name),
        deliveryFee: s.deliveryFee ?? null, following: !!u && set(db.follows, u.email).includes(s.slug), mine: !!u && u.shop === s.slug };
    };
    const shopView = (s) => ({ ...summary(s), shipsFrom: s.shipsFrom, bio: s.bio, followerCount: s.followerCount + 0,
      postCount: db.posts.filter((p) => p.shop === s.slug).length });
    const postView = (p) => {
      const u = me();
      return { id: p.id, shop: summary(db.shops[p.shop]), productName: p.productName, price: p.price, description: p.description,
        imageUrl: p.imageUrl, visualKind: p.visualKind, likeCount: p.likeCount, commentCount: p.comments.length, createdAt: p.createdAt,
        liked: !!u && set(db.likes, u.email).includes(p.id), saved: !!u && set(db.saves, u.email).includes(p.id),
        latestComments: p.comments.slice(-2) };
    };
    const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt);
    const findPost = (id) => db.posts.find((p) => p.id === Number(id)) || fail(404, 'Publication introuvable');
    const orderView = (o) => {
      const p = db.posts.find((x) => x.id === o.postId);
      return { ...o, imageUrl: p?.imageUrl ?? null, visualKind: p?.visualKind ?? 'plate', shop: summary(db.shops[o.shop]),
        total: o.unitPrice * o.quantity + o.deliveryFee };
    };

    return {
      demo: true,
      hasSession: () => !!db.session,
      async login(email, password) {
        const u = db.users[String(email).trim().toLowerCase()];
        if (!u || u.password !== password) fail(401, 'E-mail ou mot de passe incorrect');
        db.session = u.email; persist();
      },
      async register(email, password, displayName) {
        const e = String(email).trim().toLowerCase();
        if (db.users[e]) fail(409, 'Un compte existe déjà avec cet e-mail');
        db.users[e] = { id: Object.keys(db.users).length + 1, email: e, displayName, password, shop: null };
        db.session = e; persist();
      },
      logout() { db.session = null; persist(); },
      async me() {
        const u = requireMe(); const s = shopOfUser(u);
        return { id: u.id, email: u.email, displayName: u.displayName, shop: s ? shopView(s) : null,
          pendingOrders: s ? db.orders.filter((o) => o.shop === s.slug && o.status === 'PENDING').length : 0 };
      },
      async feed({ tab, country, tag, q, page }) {
        const u = me();
        let list = [...db.posts].sort(byNewest);
        if (tab === 'following') {
          const ids = new Set(u ? [...set(db.follows, u.email), u.shop].filter(Boolean) : []);
          list = list.filter((p) => ids.has(p.shop));
        }
        if (country) list = list.filter((p) => db.shops[p.shop].country === country);
        if (tag) list = list.filter((p) => tagsOf(p.description).includes(norm(tag)));
        if (q) { const n = norm(q); list = list.filter((p) => [p.productName, p.description, db.shops[p.shop].name, db.shops[p.shop].city].some((f) => norm(f).includes(n))); }
        const items = list.slice(page * 10, page * 10 + 10).map(postView);
        return { items, page, hasMore: list.length > page * 10 + 10 };
      },
      async trends() {
        const score = {}, label = {};
        db.posts.forEach((p) => [...String(p.description).matchAll(TAG_RE)].forEach((m) => {
          const t = norm(m[1]); score[t] = (score[t] || 0) + 1 + p.likeCount; label[t] ||= m[1];
        }));
        return Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag, s]) => ({ tag, label: label[tag], score: s }));
      },
      async shops(country) { return Object.values(db.shops).filter((s) => !country || s.country === country).sort((a, b) => b.followerCount - a.followerCount).map(shopView); },
      async shop(slug) { return shopView(db.shops[slug] || fail(404, 'Boutique introuvable')); },
      async shopPosts(slug) { return db.posts.filter((p) => p.shop === slug).sort(byNewest).map(postView); },
      async follow(slug, on) {
        const u = requireMe(); const s = db.shops[slug]; const f = set(db.follows, u.email);
        if (u.shop === slug) fail(400, 'Vous ne pouvez pas suivre votre propre boutique');
        if (on && !f.includes(slug)) { f.push(slug); s.followerCount += 1; }
        if (!on && f.includes(slug)) { f.splice(f.indexOf(slug), 1); s.followerCount -= 1; }
        persist(); return shopView(s);
      },
      async like(id, on) {
        const u = requireMe(); const p = findPost(id); const l = set(db.likes, u.email);
        if (on && !l.includes(p.id)) { l.push(p.id); p.likeCount += 1; }
        if (!on && l.includes(p.id)) { l.splice(l.indexOf(p.id), 1); p.likeCount -= 1; }
        persist(); return postView(p);
      },
      async save(id, on) {
        const u = requireMe(); const p = findPost(id); const s = set(db.saves, u.email);
        if (on && !s.includes(p.id)) s.unshift(p.id);
        if (!on && s.includes(p.id)) s.splice(s.indexOf(p.id), 1);
        persist(); return postView(p);
      },
      async comments(id) { return findPost(id).comments; },
      async comment(id, body) {
        const u = requireMe(); const p = findPost(id);
        const fromShop = u.shop === p.shop;
        const c = { id: db.nextId++, author: fromShop ? db.shops[p.shop].name : u.displayName, body, fromShop, createdAt: new Date().toISOString() };
        p.comments.push(c); persist(); return c;
      },
      async upload(file) {
        const url = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
        return { key: url, url };
      },
      async publish(req) {
        const u = requireMe(); const s = shopOfUser(u) || fail(403, "Créez d'abord votre boutique pour publier");
        const p = { id: db.nextId++, shop: s.slug, productName: req.productName, price: Number(req.price), description: req.description || '',
          imageUrl: req.imageKey || null, visualKind: req.imageKey ? null : req.visualKind, likeCount: 0, createdAt: new Date().toISOString(), comments: [] };
        db.posts.push(p); persist(); return postView(p);
      },
      async createShop(req) {
        const u = requireMe();
        if (u.shop) fail(409, 'Vous avez déjà une boutique');
        let slug = norm(req.name).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'boutique';
        for (let i = 2; db.shops[slug]; i++) slug = `${slug.replace(/-\d+$/, '')}-${i}`;
        db.shops[slug] = { slug, ...req, initials: initials(req.name), followerCount: 0, owner: u.email };
        u.shop = slug; persist(); return shopView(db.shops[slug]);
      },
      async updateShop(req) {
        const u = requireMe(); const s = shopOfUser(u) || fail(404, 'Boutique introuvable');
        Object.assign(s, req, { initials: initials(req.name) }); persist(); return shopView(s);
      },
      async saved() { const u = requireMe(); return set(db.saves, u.email).map((id) => db.posts.find((p) => p.id === id)).filter(Boolean).map(postView); },
      async myOrders() { const u = requireMe(); return db.orders.filter((o) => o.customer === u.email).sort(byNewest).map(orderView); },
      async shopOrders() { const u = requireMe(); return db.orders.filter((o) => o.shop === u.shop).sort(byNewest).map(orderView); },
      async answer(id, status, reply) {
        const u = requireMe(); const o = db.orders.find((x) => x.id === id && x.shop === u.shop) || fail(404, 'Demande introuvable');
        if (o.status !== 'PENDING') fail(409, 'Cette demande a déjà reçu une réponse');
        Object.assign(o, { status, shopReply: reply || null, updatedAt: new Date().toISOString() }); persist(); return orderView(o);
      },
      async order(postId, body) {
        const u = requireMe(); const p = findPost(postId); const s = db.shops[p.shop];
        if (u.shop === p.shop) fail(400, 'Vous ne pouvez pas commander dans votre propre boutique');
        const fee = body.delivery === 'DELIVERY' ? (s.deliveryFee ?? fail(400, 'Cette boutique ne livre pas : choisissez le retrait')) : 0;
        const o = { id: db.nextId++, postId: p.id, productName: p.productName, unitPrice: p.price, quantity: body.quantity, delivery: body.delivery,
          deliveryFee: fee, message: body.message || null, shopReply: null, status: 'PENDING', shop: s.slug, customer: u.email,
          customerName: u.displayName, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        db.orders.push(o); persist(); return orderView(o);
      },
    };
  }

  // =====================================================================
  //  État de l'interface
  // =====================================================================
  const state = {
    api: null,
    me: null,
    shopsCache: [],
    feed: { items: [], page: 0, hasMore: false, loading: false },
    ui: { tab: 'all', country: '', tag: '', q: '', openComments: new Set(), shopTab: 'orders' },
    posts: new Map(),   // id -> PostView affiché (pour mettre à jour une carte sans tout recharger)
  };

  // =====================================================================
  //  Composants
  // =====================================================================
  function postHTML(p) {
    state.posts.set(p.id, p);
    const s = p.shop;
    const open = state.ui.openComments.has(p.id);
    const comments = open && p.allComments ? p.allComments : p.latestComments;
    const follow = !s.mine && !s.following
      ? `<button type="button" class="btn btn-ghost btn-sm btn-follow" data-follow="${esc(s.slug)}" aria-pressed="false">Suivre</button>` : '';
    return `<article class="panel post" data-post="${p.id}">
      <header class="post-head">
        ${avatar(s)}
        <div class="post-who">
          <button type="button" class="shop-link" data-shop="${esc(s.slug)}">${esc(s.name)}</button>
          <div class="post-meta">${flag(s.country)}<span>${COUNTRIES[s.country]?.name ?? ''} · ${esc(s.city)}</span><span aria-hidden="true">·</span><span>${ago(p.createdAt)}</span></div>
        </div>
        ${follow}
      </header>
      ${p.description ? `<p class="post-text">${linkify(p.description)}</p>` : ''}
      <button type="button" class="media" data-order="${p.id}" aria-label="${s.mine ? 'Votre produit' : 'Commander'} ${esc(p.productName)}">
        ${media(p)}
        <span class="price-tag"><strong>${eur(p.price)}</strong><span>${esc(p.productName)}</span></span>
      </button>
      <div class="post-actions">
        <button type="button" class="act like" data-like="${p.id}" aria-pressed="${p.liked}" aria-label="J'aime">
          <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>${fmtK(p.likeCount)}
        </button>
        <button type="button" class="act" data-comment="${p.id}" aria-label="Commenter">
          <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z"/></svg>${p.commentCount}
        </button>
        <button type="button" class="act save" data-save="${p.id}" aria-pressed="${p.saved}" aria-label="Enregistrer">
          <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg><span class="lbl">${p.saved ? 'Enregistré' : 'Enregistrer'}</span>
        </button>
        ${s.mine ? '<span class="btn btn-ghost btn-sm" aria-hidden="true">Votre produit</span>' : `<button type="button" class="btn btn-saffron btn-sm" data-order="${p.id}">Commander</button>`}
      </div>
      <div class="comments">
        ${p.commentCount > comments.length ? `<button type="button" class="more-comments" data-more="${p.id}">Voir les ${p.commentCount} commentaires</button>` : ''}
        ${comments.map((c) => `<p class="comment"><b>${esc(c.author)}</b>${esc(c.body)}</p>`).join('')}
        <form class="comment-form" data-comment-form="${p.id}">
          <label class="sr-only" for="c-${p.id}">Ajouter un commentaire</label>
          <input id="c-${p.id}" placeholder="Ajouter un commentaire…" maxlength="300" autocomplete="off">
          <button type="submit" class="btn btn-ghost btn-sm">Publier</button>
        </form>
      </div>
    </article>`;
  }

  function linkify(t) {
    return esc(t).replace(/#([\p{L}\p{N}_]{2,40})/gu, (m, w) => `<button type="button" class="hashtag" data-tag="${esc(norm(w))}">#${w}</button>`);
  }

  /** Remplace une publication déjà affichée (après un j'aime, un commentaire…) sans recharger la page. */
  function updatePost(view) {
    const prev = state.posts.get(view.id);
    if (prev?.allComments && !view.allComments) view.allComments = prev.allComments;
    state.feed.items = state.feed.items.map((p) => (p.id === view.id ? view : p));
    document.querySelectorAll(`[data-post="${view.id}"]`).forEach((el) => { el.outerHTML = postHTML(view); });
  }

  function countryStripHTML() {
    return `<div class="country-strip" role="group" aria-label="Filtrer par pays">${Object.entries(COUNTRIES).map(([c, v]) =>
      `<button type="button" class="filter-pill" data-country="${c}" aria-pressed="${state.ui.country === c}">${flag(c)} ${v.name}</button>`).join('')}</div>`;
  }

  function filtersHTML() {
    const { country, tag, q } = state.ui;
    const pills = [];
    if (country) pills.push(`<button type="button" class="filter-pill" data-clear="country">${flag(country)} ${COUNTRIES[country].name} <b>×</b></button>`);
    if (tag) pills.push(`<button type="button" class="filter-pill" data-clear="tag">#${esc(tag)} <b>×</b></button>`);
    if (q) pills.push(`<button type="button" class="filter-pill" data-clear="q">« ${esc(q)} » <b>×</b></button>`);
    return pills.length ? `<div class="active-filters" aria-label="Filtres actifs">${pills.join('')}</div>` : '';
  }

  const emptyHTML = (title, text, action = '') => `<div class="panel empty"><h3>${title}</h3><p>${text}</p>${action}</div>`;
  const loginButton = (reason) => `<button type="button" class="btn btn-primary" data-login="${esc(reason)}">Se connecter</button>`;
  const errorHTML = (e) => emptyHTML('Chargement impossible', esc(e.message || 'Le serveur ne répond pas.'), '<button type="button" class="btn btn-ghost" data-retry>Réessayer</button>');

  function statusChip(st) {
    return `<span class="status ${st}">${{ PENDING: 'En attente', ACCEPTED: 'Acceptée', DECLINED: 'Refusée' }[st]}</span>`;
  }

  function orderCard(o, forShop) {
    const when = ago(o.createdAt);
    const who = forShop ? `Demande de <strong>${esc(o.customerName)}</strong>` : `${flag(o.shop.country)} <button type="button" class="shop-link" data-shop="${esc(o.shop.slug)}">${esc(o.shop.name)}</button>`;
    const mode = o.delivery === 'DELIVERY' ? `livraison ${num(o.deliveryFee) ? eur(o.deliveryFee) : 'offerte'}` : 'retrait / remise en main propre';
    return `<article class="panel order-card" data-order-card="${o.id}">
      <div class="order-top">
        ${media({ ...o, productName: o.productName }, 'square')}
        <div style="min-width:0">
          <h3>${esc(o.productName)}</h3>
          <p>${who} · ${when}</p>
          <p>${o.quantity} × ${eur(o.unitPrice)} · ${mode}</p>
        </div>
        <div class="order-total">${eur(o.total)}<div>${statusChip(o.status)}</div></div>
      </div>
      ${o.message ? `<p class="quote"><small>Message ${forShop ? 'du client' : 'envoyé'}</small>${esc(o.message)}</p>` : ''}
      ${o.shopReply ? `<p class="quote"><small>Réponse de la boutique</small>${esc(o.shopReply)}</p>` : ''}
      ${forShop && o.status === 'PENDING' ? `<form class="answer" data-answer="${o.id}">
        <label class="sr-only" for="reply-${o.id}">Réponse au client</label>
        <textarea id="reply-${o.id}" rows="2" maxlength="500" placeholder="Votre réponse : délai, moyen de paiement (virement, espèces au retrait…)"></textarea>
        <div class="actions">
          <button type="submit" class="btn btn-primary btn-sm" value="ACCEPTED">Accepter</button>
          <button type="submit" class="btn btn-ghost btn-sm" value="DECLINED">Refuser</button>
        </div>
      </form>` : ''}
    </article>`;
  }

  function shopCardHTML(s) {
    return `<article class="panel shop-card">
      <div class="cover">${cover(s.color)}</div>
      <div class="body">
        ${avatar(s)}
        <div class="row"><button type="button" class="shop-link" data-shop="${esc(s.slug)}">${esc(s.name)}</button>${followButton(s)}</div>
        <div class="post-meta">${flag(s.country)}<span>${COUNTRIES[s.country].name} · ${esc(s.city)}</span></div>
        <p>${esc(s.bio || '')}</p>
        <span class="stat-line">${fmtK(s.followerCount)} ${s.followerCount > 1 ? 'abonnés' : 'abonné'} · ${plural(s.postCount, 'produit')}</span>
      </div>
    </article>`;
  }

  function followButton(s) {
    if (s.mine) return '<span class="btn btn-ghost btn-sm" aria-hidden="true">Votre boutique</span>';
    return `<button type="button" class="btn btn-sm btn-follow ${s.following ? '' : 'btn-primary'}" data-follow="${esc(s.slug)}" aria-pressed="${s.following}">${s.following ? 'Abonné' : 'Suivre'}</button>`;
  }

  function profileHeaderHTML(s) {
    const delivery = s.deliveryFee == null ? 'Retrait uniquement' : num(s.deliveryFee) ? `Livraison ${eur(s.deliveryFee)}` : 'Livraison offerte';
    return `<article class="panel">
      <div class="profile-cover">${cover(s.color)}</div>
      <div class="profile-body">
        <div class="profile-top">${avatar(s)}<div class="btns">${s.mine ? '<button type="button" class="btn btn-primary" data-open-composer>Publier un produit</button>' : followButton(s)}</div></div>
        <h1>${esc(s.name)}</h1>
        <div class="post-meta">${flag(s.country)}<span>${COUNTRIES[s.country].name} · ${esc(s.city)}${s.shipsFrom ? ' · ' + esc(s.shipsFrom) : ''} · ${delivery}</span></div>
        ${s.bio ? `<p class="bio">${esc(s.bio)}</p>` : ''}
        <div class="profile-stats">
          <span><strong>${s.postCount}</strong> ${s.postCount > 1 ? 'produits' : 'produit'}</span>
          <span><strong>${fmtK(s.followerCount)}</strong> ${s.followerCount > 1 ? 'abonnés' : 'abonné'}</span>
        </div>
      </div>
    </article>`;
  }

  function productGridHTML(posts) {
    return `<section class="panel" style="padding:14px"><div class="product-grid">
      ${posts.map((p) => `<button type="button" class="product-tile" data-order="${p.id}">${media(p, 'square')}<span class="name">${esc(p.productName)}</span><span class="price">${eur(p.price)}</span></button>`).join('')}
    </div></section>`;
  }

  const PALETTE = ['#8a2c45', '#3a6b4f', '#2f2a6b', '#7b3b2a', '#9c2a24', '#1d3f8a', '#2c5560', '#5c4636', '#1f5f57', '#a5642b'];
  function shopFormHTML(s) {
    const v = s || { name: '', country: 'DZ', city: '', shipsFrom: '', bio: '', color: PALETTE[0], deliveryFee: 6.9 };
    const delivers = v.deliveryFee != null;
    return `<form class="panel form-card" id="shop-form" novalidate>
      <h2>${s ? 'Modifier ma boutique' : 'Créer ma boutique'}</h2>
      ${s ? '' : '<p class="hint">Présentez votre activité : les clients vous suivront et vous enverront leurs demandes de commande.</p>'}
      <div class="field"><label for="s-name">Nom de la boutique</label><input id="s-name" name="name" required maxlength="80" value="${esc(v.name)}"></div>
      <div class="field"><span class="lbl">Pays d'origine</span><div class="seg">
        ${Object.entries(COUNTRIES).map(([c, x]) => `<label><input type="radio" name="country" value="${c}" ${v.country === c ? 'checked' : ''}> ${flag(c)} ${x.name}</label>`).join('')}
      </div></div>
      <div class="field-row">
        <div class="field"><label for="s-city">Ville</label><input id="s-city" name="city" required maxlength="80" value="${esc(v.city)}" placeholder="Ex. Oran, Fès, Sfax, Lyon"></div>
        <div class="field"><label for="s-ships">Expédition</label><input id="s-ships" name="shipsFrom" maxlength="120" value="${esc(v.shipsFrom || '')}" placeholder="Ex. Expédie depuis Paris"></div>
      </div>
      <div class="field"><label for="s-bio">Présentation</label><textarea id="s-bio" name="bio" rows="3" maxlength="600">${esc(v.bio || '')}</textarea></div>
      <div class="field">
        <label class="check"><input type="checkbox" id="s-delivers" ${delivers ? 'checked' : ''}> Je livre en France</label>
        <div class="field" id="fee-field" ${delivers ? '' : 'hidden'}><label for="s-fee">Frais de livraison (€, 0 = offerte)</label><input id="s-fee" name="deliveryFee" type="number" min="0" max="200" step="0.1" value="${delivers ? esc(v.deliveryFee) : '6.9'}"></div>
      </div>
      <div class="field"><span class="lbl">Couleur de la boutique</span><div class="swatches">
        ${PALETTE.map((c) => `<label style="background:${c}" title="${c}"><input type="radio" name="color" value="${c}" ${v.color === c ? 'checked' : ''} aria-label="Couleur ${c}"></label>`).join('')}
      </div></div>
      <p class="form-error" id="shop-error" role="alert"></p>
      <div class="actions">${s ? '<button type="button" class="btn btn-ghost" data-shop-tab="orders">Annuler</button>' : ''}<button type="submit" class="btn btn-primary">${s ? 'Enregistrer' : 'Créer ma boutique'}</button></div>
    </form>`;
  }

  // =====================================================================
  //  Vues (routage par #)
  // =====================================================================
  const main = $('#main');
  const skeleton = '<div class="skeleton"></div><div class="skeleton"></div>';

  function route() {
    const h = location.hash.slice(1);
    if (h.startsWith('b-')) return { view: 'shop', slug: h.slice(2), nav: '' };
    if (['boutiques', 'enregistres', 'commandes', 'ma-boutique'].includes(h)) return { view: h, nav: h };
    return { view: 'fil', nav: 'fil' };
  }

  async function render() {
    const r = route();
    document.querySelectorAll('[data-nav]').forEach((a) => (a.dataset.nav === r.nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    renderCountries();
    try {
      if (r.view === 'fil') return await renderFeed(true);
      main.innerHTML = skeleton;
      if (r.view === 'boutiques') return await renderShops();
      if (r.view === 'shop') return await renderShop(r.slug);
      if (r.view === 'enregistres') return await renderSaved();
      if (r.view === 'commandes') return await renderMyOrders();
      if (r.view === 'ma-boutique') return await renderMyShop();
    } catch (e) {
      main.innerHTML = errorHTML(e);
    }
  }

  async function renderFeed(reset) {
    const f = state.feed;
    if (reset) {
      main.innerHTML = feedHeaderHTML() + skeleton;
      Object.assign(f, { items: [], page: 0, hasMore: false });
    }
    f.loading = true;
    const { tab, country, tag, q } = state.ui;
    const data = await state.api.feed({ tab, country, tag, q, page: f.page });
    f.items = reset ? data.items : f.items.concat(data.items);
    f.hasMore = data.hasMore; f.loading = false;
    const list = f.items.length ? f.items.map(postHTML).join('')
      : tab === 'following' && !state.me
        ? emptyHTML('Suivez vos boutiques préférées', 'Connectez-vous pour voir ici les nouveautés des boutiques que vous suivez.', loginButton('Connectez-vous pour suivre des boutiques.'))
        : emptyHTML('Rien pour ces filtres', 'Essayez un autre pays ou retirez un filtre.', '<button type="button" class="btn btn-ghost" data-clear="all">Tout afficher</button>');
    main.innerHTML = feedHeaderHTML() + list + (f.hasMore ? '<button type="button" class="btn btn-ghost load-more" data-more-feed>Voir plus de produits</button>' : '');
  }

  function feedHeaderHTML() {
    const shops = state.shopsCache.slice(0, 12);
    const meName = state.me?.shop ? state.me.shop : { color: '#b37708', initials: state.me ? state.me.displayName.slice(0, 2).toUpperCase() : '+' };
    return `
      ${shops.length ? `<section class="panel stories" aria-label="Boutiques">
        ${shops.map((s) => `<button type="button" class="story" data-shop="${esc(s.slug)}"><span class="ring">${avatar(s)}</span><span>${esc(s.name)}</span></button>`).join('')}
      </section>` : ''}
      <section class="panel composer">
        ${avatar(meName)}
        <button type="button" class="fake-input" data-open-composer><span class="ar" lang="ar">مرحبا</span> Marhba ! ${state.me?.shop ? 'Quoi de neuf dans votre boutique ?' : 'Vous vendez ? Ouvrez votre boutique.'}</button>
      </section>
      ${countryStripHTML()}
      <div class="feed-head">
        <div class="tabs" role="tablist" aria-label="Fil">
          <button type="button" class="tab" role="tab" data-tab="all" aria-selected="${state.ui.tab === 'all'}">Pour vous</button>
          <button type="button" class="tab" role="tab" data-tab="following" aria-selected="${state.ui.tab === 'following'}">Abonnements</button>
        </div>
        ${filtersHTML()}
      </div>`;
  }

  async function renderShops() {
    const shops = await state.api.shops(state.ui.country);
    main.innerHTML = `
      <header class="page-head"><h1>Boutiques</h1><p>${plural(shops.length, 'boutique')} de créateurs et commerçants d'Algérie, du Maroc et de Tunisie.</p></header>
      ${countryStripHTML()}${filtersHTML()}
      ${shops.length ? `<div class="shop-grid">${shops.map(shopCardHTML).join('')}</div>` : emptyHTML('Aucune boutique', 'Aucune boutique pour ce pays pour le moment.')}`;
  }

  async function renderShop(slug) {
    const [s, posts] = await Promise.all([state.api.shop(slug), state.api.shopPosts(slug)]);
    main.innerHTML = `<button type="button" class="back" data-back><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Retour</button>
      ${profileHeaderHTML(s)}
      ${posts.length ? productGridHTML(posts) + posts.map(postHTML).join('') : emptyHTML('Aucun produit pour l’instant', s.mine ? 'Publiez votre premier produit.' : 'Revenez bientôt !')}`;
  }

  async function renderSaved() {
    if (!state.me) { main.innerHTML = emptyHTML('Vos produits enregistrés', 'Connectez-vous pour garder des produits de côté.', loginButton('Connectez-vous pour enregistrer des produits.')); return; }
    const list = await state.api.saved();
    main.innerHTML = `<header class="page-head"><h1>Enregistrés</h1><p>Les produits que vous gardez de côté.</p></header>
      ${list.length ? list.map(postHTML).join('') : emptyHTML('Rien d’enregistré', 'Touchez « Enregistrer » sous un produit pour le retrouver ici.')}`;
  }

  async function renderMyOrders() {
    if (!state.me) { main.innerHTML = emptyHTML('Vos demandes de commande', 'Connectez-vous pour suivre vos demandes.', loginButton('Connectez-vous pour suivre vos commandes.')); return; }
    const list = await state.api.myOrders();
    main.innerHTML = `<header class="page-head"><h1>Mes commandes</h1><p>Chaque boutique confirme votre demande et vous indique comment la régler.</p></header>
      ${list.length ? `<div class="orders">${list.map((o) => orderCard(o, false)).join('')}</div>` : emptyHTML('Aucune demande', 'Touchez « Commander » sous un produit pour envoyer votre première demande.', '<a class="btn btn-primary" href="#fil">Voir le fil</a>')}`;
  }

  async function renderMyShop() {
    if (!state.me) { main.innerHTML = emptyHTML('Vous vendez des produits du Maghreb ?', 'Créez un compte puis ouvrez votre boutique en deux minutes.', loginButton('Connectez-vous pour ouvrir votre boutique.')); return; }
    if (!state.me.shop) { main.innerHTML = shopFormHTML(null); return; }
    const s = state.me.shop;
    const tab = state.ui.shopTab;
    let body = '';
    if (tab === 'orders') {
      const orders = await state.api.shopOrders();
      body = orders.length ? `<div class="orders">${orders.map((o) => orderCard(o, true)).join('')}</div>` : emptyHTML('Aucune demande reçue', 'Les demandes de vos clients apparaîtront ici.');
    } else if (tab === 'products') {
      const posts = await state.api.shopPosts(s.slug);
      body = posts.length ? productGridHTML(posts) : emptyHTML('Aucun produit', 'Publiez votre premier produit.', '<button type="button" class="btn btn-primary" data-open-composer>Publier un produit</button>');
    } else {
      body = shopFormHTML(s);
    }
    const pending = state.me.pendingOrders;
    main.innerHTML = `${profileHeaderHTML(s)}
      <div class="section-tabs" role="tablist">
        <button type="button" role="tab" data-shop-tab="orders" aria-selected="${tab === 'orders'}">Demandes reçues${pending ? `<span class="badge-count">${pending}</span>` : ''}</button>
        <button type="button" role="tab" data-shop-tab="products" aria-selected="${tab === 'products'}">Produits</button>
        <button type="button" role="tab" data-shop-tab="edit" aria-selected="${tab === 'edit'}">Modifier</button>
      </div>
      ${body}`;
  }

  // ---------- Colonnes latérales ----------
  function renderCountries() {
    $('#country-list').innerHTML = Object.entries(COUNTRIES).map(([c, v]) => `
      <button type="button" class="country-btn" data-country="${c}" aria-pressed="${state.ui.country === c}">${flag(c)}<span>${v.name}</span><span class="ar" lang="ar">${v.ar}</span></button>`).join('');
  }

  async function renderAside() {
    try {
      const [shops, trends] = await Promise.all([state.api.shops(), state.api.trends()]);
      state.shopsCache = shops;
      const sugg = shops.filter((s) => !s.following && !s.mine).slice(0, 4);
      $('#suggest').innerHTML = sugg.length ? sugg.map((s) => `
        <div class="suggest-row">${avatar(s)}<div class="who"><button type="button" class="shop-link" data-shop="${esc(s.slug)}">${esc(s.name)}</button><small>${flag(s.country)} ${esc(s.city)} · ${fmtK(s.followerCount)} abonnés</small></div>
        <button type="button" class="btn btn-primary btn-sm btn-follow" data-follow="${esc(s.slug)}" aria-pressed="false">Suivre</button></div>`).join('')
        : '<p class="hint" style="padding:6px 14px">Vous suivez toutes les boutiques.</p>';
      $('#trends').innerHTML = trends.map((t) => `<button type="button" class="tag-chip" data-tag="${esc(t.tag)}">#${esc(t.label)}</button>`).join('');
    } catch { /* la colonne de droite est secondaire */ }
  }

  function renderAccount() {
    const me = state.me;
    $('#account').innerHTML = me
      ? `<button type="button" class="account-btn" id="account-btn" aria-haspopup="menu" aria-expanded="false" aria-label="Mon compte"><span class="me">${esc(me.displayName.slice(0, 2).toUpperCase())}</span></button>
         <div class="menu" id="account-menu" role="menu" hidden>
           <div class="who"><strong>${esc(me.displayName)}</strong>${esc(me.email)}</div>
           <a href="#ma-boutique" role="menuitem">${me.shop ? 'Ma boutique' : 'Ouvrir ma boutique'}</a>
           <a href="#commandes" role="menuitem">Mes commandes</a>
           <a href="#enregistres" role="menuitem">Enregistrés</a>
           <button type="button" role="menuitem" data-logout>Se déconnecter</button>
         </div>`
      : `<button type="button" class="btn btn-ghost btn-sm" data-login="">Se connecter</button>`;
    const badge = $('#pending-badge');
    badge.hidden = !me?.pendingOrders;
    badge.textContent = me?.pendingOrders || '';
  }

  // =====================================================================
  //  Session
  // =====================================================================
  async function loadMe() {
    state.me = null;
    if (state.api.hasSession()) {
      try { state.me = await state.api.me(); } catch { state.me = null; }
    }
    renderAccount();
  }

  function onSessionExpired() {
    state.me = null;
    renderAccount();
    toast('Votre session a expiré. Reconnectez-vous.');
  }

  let authMode = 'login';
  let afterLogin = null;
  function openAuth(reason, then) {
    afterLogin = then || null;
    $('#auth-reason').textContent = reason || 'Connectez-vous pour aimer, commenter, suivre et commander.';
    $('#auth-error').textContent = '';
    setAuthMode('login');
    $('#auth-dialog').showModal();
  }
  function setAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll('[data-auth-mode]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.authMode === mode)));
    $('#name-field').hidden = mode !== 'register';
    $('#auth-submit').textContent = mode === 'register' ? 'Créer mon compte' : 'Se connecter';
    $('#a-password').autocomplete = mode === 'register' ? 'new-password' : 'current-password';
  }
  /** Exécute l'action si l'utilisateur est connecté, sinon ouvre la connexion puis l'exécute. */
  function withLogin(reason, action) {
    if (state.me) return action();
    openAuth(reason, action);
    return undefined;
  }

  // =====================================================================
  //  Commande
  // =====================================================================
  let order = null;
  function openOrder(post) {
    if (post.shop.mine) { toast('C’est votre produit : vos clients le commandent depuis le fil.'); return; }
    const fee = post.shop.deliveryFee;
    order = { post, qty: 1, delivery: fee == null ? 'PICKUP' : 'DELIVERY' };
    $('#order-sum').innerHTML = `${media(post, 'square')}<div><p><strong>${esc(post.productName)}</strong></p><p class="muted">${esc(post.shop.name)} · ${flag(post.shop.country)} ${esc(post.shop.city)}</p><p>${eur(post.price)} l'unité</p></div>`;
    const opts = [];
    if (fee != null) opts.push(['DELIVERY', `Livraison en France · ${num(fee) ? eur(fee) : 'offerte'}`]);
    opts.push(['PICKUP', 'Retrait / remise en main propre']);
    $('#delivery-seg').innerHTML = opts.map(([v, l]) => `<label><input type="radio" name="delivery" value="${v}" ${v === order.delivery ? 'checked' : ''}> ${l}</label>`).join('');
    $('#order-msg').value = '';
    $('#order-error').textContent = '';
    updateOrder();
    $('#order-dialog').showModal();
  }
  function updateOrder() {
    $('#qty').textContent = order.qty;
    const fee = order.delivery === 'DELIVERY' ? num(order.post.shop.deliveryFee) : 0;
    $('#order-total').textContent = eur(num(order.post.price) * order.qty + fee);
  }

  // =====================================================================
  //  Publication
  // =====================================================================
  let photo = null; // { file, url }
  function openComposer() {
    if (!state.me) return openAuth('Connectez-vous pour publier vos produits.', openComposer);
    if (!state.me.shop) { toast("Créez d'abord votre boutique."); location.hash = '#ma-boutique'; return; }
    $('#composer-shop').innerHTML = `Publié par <strong>${esc(state.me.shop.name)}</strong>, visible dans le fil de tous les visiteurs.`;
    $('#composer-form').reset();
    setPhoto(null);
    $('#kind-picker').innerHTML = Object.keys(ART).map((k, i) => `<label><input type="radio" name="kind" value="${k}" ${i === 0 ? 'checked' : ''}>${art(k, { square: true })}<span>${KIND_LABEL[k]}</span></label>`).join('');
    $('#composer-error').textContent = '';
    $('#composer-form').querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    $('#composer-dialog').showModal();
  }
  function setPhoto(file) {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    photo = file ? { file, url: URL.createObjectURL(file) } : null;
    $('#photo-zone').innerHTML = photo
      ? `<div class="photo-preview"><img src="${photo.url}" alt="Aperçu de la photo"><button type="button" class="btn btn-ghost btn-sm" data-remove-photo style="background:var(--surface)">Retirer</button></div>`
      : `<label class="photo-drop"><input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp">
           <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
           <span><strong>Ajouter une photo</strong><br><small>JPEG, PNG ou WebP · 5 Mo maximum</small></span></label>`;
    $('#or-line').hidden = !!photo;
    $('#kind-picker').hidden = !!photo;
  }

  // =====================================================================
  //  Notifications
  // =====================================================================
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3600);
  }
  const fail = (e) => toast(e.message || 'Une erreur est survenue.');

  // =====================================================================
  //  Événements
  // =====================================================================
  const reloadAll = async () => { await loadMe(); await renderAside(); await render(); };

  document.addEventListener('click', async (e) => {
    const q = (sel) => e.target.closest(sel);
    let el;
    try {
      if (q('[data-close]')) return q('dialog').close();
      if (!q('#account-btn') && !q('.menu .who')) { const m = $('#account-menu'); if (m) { m.hidden = true; $('#account-btn')?.setAttribute('aria-expanded', 'false'); } }
      if (q('#account-btn')) { const m = $('#account-menu'); m.hidden = !m.hidden; $('#account-btn').setAttribute('aria-expanded', String(!m.hidden)); return undefined; }
      if (q('[data-logout]')) { state.api.logout(); state.ui.tab = 'all'; toast('Vous êtes déconnecté.'); return await reloadAll(); }
      if ((el = q('[data-login]'))) return openAuth(el.dataset.login, null);
      if ((el = q('[data-auth-mode]'))) return setAuthMode(el.dataset.authMode);
      if (q('[data-open-composer]')) return openComposer();
      if (q('[data-remove-photo]')) return setPhoto(null);
      if (q('[data-retry]')) return await render();
      if (q('[data-back]')) return history.length > 1 ? history.back() : (location.hash = '#fil');
      if ((el = q('[data-order]'))) {
        const post = state.posts.get(Number(el.dataset.order));
        return post && withLogin('Connectez-vous pour envoyer une demande de commande.', () => openOrder(post));
      }
      if ((el = q('[data-shop]'))) { location.hash = `#b-${el.dataset.shop}`; scrollTo(0, 0); return undefined; }
      if ((el = q('[data-like]'))) {
        const id = Number(el.dataset.like);
        return await withLogin('Connectez-vous pour aimer ce produit.', async () => updatePost(await state.api.like(id, !state.posts.get(id).liked)));
      }
      if ((el = q('[data-save]'))) {
        const id = Number(el.dataset.save);
        return await withLogin('Connectez-vous pour enregistrer ce produit.', async () => {
          const v = await state.api.save(id, !state.posts.get(id).saved);
          updatePost(v);
          toast(v.saved ? 'Ajouté à vos enregistrés.' : 'Retiré de vos enregistrés.');
        });
      }
      if ((el = q('[data-follow]'))) {
        const slug = el.dataset.follow;
        return await withLogin('Connectez-vous pour suivre cette boutique.', async () => {
          const s = await state.api.follow(slug, el.getAttribute('aria-pressed') !== 'true');
          toast(s.following ? `Vous suivez ${s.name}.` : `Vous ne suivez plus ${s.name}.`);
          await renderAside(); await render();
        });
      }
      if ((el = q('[data-comment]'))) { $(`#c-${el.dataset.comment}`)?.focus(); return undefined; }
      if ((el = q('[data-more]'))) {
        const id = Number(el.dataset.more);
        const p = state.posts.get(id);
        p.allComments = await state.api.comments(id);
        state.ui.openComments.add(id);
        return updatePost(p);
      }
      if (q('[data-more-feed]')) { state.feed.page += 1; return await renderFeed(false); }
      if ((el = q('[data-tab]'))) { state.ui.tab = el.dataset.tab; return await renderFeed(true); }
      if ((el = q('[data-tag]'))) { state.ui.tag = el.dataset.tag; if (route().view !== 'fil') { location.hash = '#fil'; return undefined; } return await renderFeed(true); }
      if ((el = q('[data-country]'))) { state.ui.country = state.ui.country === el.dataset.country ? '' : el.dataset.country; return await render(); }
      if ((el = q('[data-clear]'))) {
        const k = el.dataset.clear;
        if (k === 'all') Object.assign(state.ui, { country: '', tag: '', q: '' }); else state.ui[k] = '';
        if (k === 'q' || k === 'all') $('#search-input').value = '';
        return await render();
      }
      if ((el = q('[data-step]'))) { order.qty = Math.min(20, Math.max(1, order.qty + Number(el.dataset.step))); return updateOrder(); }
      if ((el = q('[data-shop-tab]'))) { state.ui.shopTab = el.dataset.shopTab; return await render(); }
    } catch (err) { fail(err); }
    return undefined;
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'photo-input') {
      const f = e.target.files[0];
      if (!f) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { $('#composer-error').textContent = 'Format non accepté : JPEG, PNG ou WebP.'; return; }
      if (f.size > 5 * 1024 * 1024) { $('#composer-error').textContent = 'Photo trop lourde : 5 Mo maximum.'; return; }
      $('#composer-error').textContent = '';
      setPhoto(f);
    }
    if (e.target.name === 'delivery') { order.delivery = e.target.value; updateOrder(); }
    if (e.target.id === 's-delivers') $('#fee-field').hidden = !e.target.checked;
  });

  document.addEventListener('submit', async (e) => {
    const f = e.target;
    try {
      // Commentaire
      if (f.matches('[data-comment-form]')) {
        e.preventDefault();
        const input = f.querySelector('input');
        const body = input.value.trim();
        if (!body) return;
        const id = Number(f.dataset.commentForm);
        await withLogin('Connectez-vous pour commenter.', async () => {
          await state.api.comment(id, body);
          const p = state.posts.get(id);
          p.allComments = await state.api.comments(id);
          p.commentCount = p.allComments.length;
          p.latestComments = p.allComments.slice(-2);
          state.ui.openComments.add(id);
          updatePost(p);
          $(`#c-${id}`)?.focus();
        });
        return;
      }
      // Réponse d'une boutique à une demande
      if (f.matches('[data-answer]')) {
        e.preventDefault();
        const status = e.submitter?.value || 'ACCEPTED';
        await state.api.answer(Number(f.dataset.answer), status, f.querySelector('textarea').value.trim());
        toast(status === 'ACCEPTED' ? 'Demande acceptée : le client est prévenu.' : 'Demande refusée.');
        await loadMe(); await render();
        return;
      }
      // Création / modification de boutique
      if (f.id === 'shop-form') {
        e.preventDefault();
        const name = f.elements.name.value.trim(), city = f.elements.city.value.trim();
        if (!name || !city) { $('#shop-error').textContent = 'Indiquez le nom de la boutique et la ville.'; return; }
        const delivers = $('#s-delivers').checked;
        const fee = Number(f.elements.deliveryFee.value);
        if (delivers && (Number.isNaN(fee) || fee < 0 || fee > 200)) { $('#shop-error').textContent = 'Frais de livraison entre 0 et 200 €.'; return; }
        const body = { name, city, country: f.elements.country.value, shipsFrom: f.elements.shipsFrom.value.trim() || null,
          bio: f.elements.bio.value.trim() || null, color: f.elements.color.value || PALETTE[0], deliveryFee: delivers ? fee : null };
        const creating = !state.me.shop;
        await (creating ? state.api.createShop(body) : state.api.updateShop(body));
        toast(creating ? 'Boutique créée ! Publiez votre premier produit.' : 'Boutique mise à jour.');
        state.ui.shopTab = creating ? 'products' : 'orders';
        await reloadAll();
        if (creating) openComposer();
      }
    } catch (err) {
      if (f.id === 'shop-error' || f.id === 'shop-form') $('#shop-error').textContent = err.message; else fail(err);
    }
  });

  // Connexion / inscription
  $('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#a-email').value.trim(), password = $('#a-password').value, name = $('#a-name').value.trim();
    const err = $('#auth-error');
    if (!email || !password) { err.textContent = 'Renseignez votre e-mail et votre mot de passe.'; return; }
    if (authMode === 'register' && (!name || password.length < 8)) { err.textContent = name ? 'Mot de passe : 8 caractères minimum.' : 'Indiquez votre nom.'; return; }
    try {
      if (authMode === 'register') await state.api.register(email, password, name); else await state.api.login(email, password);
      $('#auth-dialog').close();
      $('#auth-form').reset();
      await loadMe();
      toast(`Marhba ${state.me.displayName} !`);
      await renderAside();
      await render();
      if (afterLogin) { const a = afterLogin; afterLogin = null; await a(); }
    } catch (ex) {
      err.textContent = ex.message;
    }
  });

  // Demande de commande
  $('#order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await state.api.order(order.post.id, { quantity: order.qty, delivery: order.delivery, message: $('#order-msg').value.trim() || null });
      $('#order-dialog').close();
      toast(`Demande envoyée à ${order.post.shop.name}. Suivez-la dans « Mes commandes ».`);
    } catch (ex) { $('#order-error').textContent = ex.message; }
  });

  // Publication d'un produit
  $('#composer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#c-name'), price = $('#c-price');
    const bad = [name, price].filter((el) => !el.checkValidity());
    [name, price].forEach((el) => el.toggleAttribute('aria-invalid', bad.includes(el)));
    if (bad.length) { $('#composer-error').textContent = bad[0] === name ? 'Donnez un nom au produit.' : 'Indiquez un prix entre 0,50 € et 100 000 €.'; bad[0].focus(); return; }
    const btn = $('#composer-submit');
    btn.disabled = true; btn.textContent = photo ? 'Envoi de la photo…' : 'Publication…';
    try {
      const req = { productName: name.value.trim(), price: Number(price.value), description: $('#c-text').value.trim() || null };
      if (photo) req.imageKey = (await state.api.upload(photo.file)).key;
      else req.visualKind = e.target.querySelector('input[name=kind]:checked').value;
      await state.api.publish(req);
      $('#composer-dialog').close();
      setPhoto(null);
      Object.assign(state.ui, { tab: 'all', country: '', tag: '', q: '' });
      $('#search-input').value = '';
      toast('Produit publié dans le fil.');
      await loadMe();
      if (location.hash !== '#fil') location.hash = '#fil'; else await render();
    } catch (ex) {
      $('#composer-error').textContent = ex.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Publier';
    }
  });

  let searchTimer;
  $('#search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.ui.q = e.target.value.trim();
      if (route().view !== 'fil') location.hash = '#fil'; else renderFeed(true).catch(fail);
    }, 250);
  });
  $('#top-search').addEventListener('submit', (e) => e.preventDefault());
  document.querySelectorAll('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  const closeMenu = () => { const m = $('#account-menu'); if (m) { m.hidden = true; $('#account-btn')?.setAttribute('aria-expanded', 'false'); } };
  window.addEventListener('hashchange', () => { closeMenu(); render(); scrollTo(0, 0); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // =====================================================================
  //  Démarrage : API réelle si disponible, sinon démonstration
  // =====================================================================
  (async () => {
    try {
      if (window.MAGHREB_FORCE_DEMO) throw new Error('démo forcée');
      await httpStore.probe();
      state.api = httpStore;
    } catch {
      state.api = makeDemoStore();
      $('#demo-note').hidden = false;
    }
    $('#demo-accounts').hidden = false;
    await reloadAll();
  })();
})();
