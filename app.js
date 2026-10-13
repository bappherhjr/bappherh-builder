'use strict';
/* =====================================================================
   Bappherh Builder — built by TheDev001
   Modules: utils · icons · registry · renderer · storage · history ·
   canvas · drag · layers · inspector · code · dialogs · templates
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let _uc = 0;
const uid = () => Math.random().toString(36).slice(2, 6) + (_uc++).toString(36) + Date.now().toString(36).slice(-3);
const clone = o => JSON.parse(JSON.stringify(o));
const debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; d.flush = () => { clearTimeout(t); fn(); }; return d; };
const raf = fn => { let q = false; return () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(); }); }; };
const fmtBytes = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const ago = t => { const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + ' min ago' : s < 86400 ? Math.floor(s / 3600) + ' h ago' : new Date(t).toLocaleDateString(); };
const slugify = s => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page';
const safeName = s => String(s || 'file').replace(/[^\w.\-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';

/* ---------- icons (stroke paths on a 24px grid) ---------- */
const IC = {
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3', redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeoff: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.8C3.9 8.5 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 4-.9',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3', unlock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 7.5-2',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', copy: 'M8 8h12v12H8zM4 16V4h12',
  up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', right: 'M9 6l6 6-6 6', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', x: 'M6 6l12 12M18 6L6 18',
  play: 'M7 5v14l12-7z', download: 'M12 4v11M7 11l5 5 5-5M5 20h14', sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6',
  save: 'M5 4h11l3 3v13H5zM8 4v5h7M8 20v-6h8v6', folder: 'M3 6h6l2 2h10v11H3z', file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  code: 'M9 7l-5 5 5 5M15 7l5 5-5 5', image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 8.5h.01',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01', edit: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  monitor: 'M3 5h18v11H3zM8 20h8M12 16v4', tablet: 'M6 3h12v18H6zM11 18h2', phone: 'M8 3h8v18H8zM11 18h2', laptop: 'M5 6h14v9H5zM2 19h20',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', search: 'M10.5 4a6.5 6.5 0 1 0 .01 0M15.5 15.5L20 20', home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  check: 'M5 12l5 5 9-10', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-6-4-11-8-11z', box: 'M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z', globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6', phone2: 'M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z',
  user: 'M12 4a4 4 0 1 0 .01 0M4 21a8 8 0 0 1 16 0', cart: 'M3 4h3l2 12h10l2-8H7M9 20h.01M17 20h.01',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', clock: 'M12 4a8 8 0 1 0 .01 0M12 8v4l3 2', camera: 'M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 .01 0',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-.01 0M20 16a3 3 0 1 1-.01 0', arrow: 'M5 12h14M13 6l6 6-6 6', leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-14 15zM5 19l8-8',
  pin: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 8a2 2 0 1 0 .01 0', book: 'M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z',
  coffee: 'M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3', sun: 'M12 8a4 4 0 1 0 .01 0M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8', pen: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3', layout: 'M4 4h16v16H4zM4 9h16M9 9v11'
};
const ico = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n] || ''}"/></svg>`;
const SITE_ICONS = ['star', 'heart', 'check', 'bolt', 'globe', 'mail', 'phone2', 'user', 'home', 'cart', 'search', 'shield', 'clock', 'code', 'camera', 'music', 'arrow', 'leaf', 'pin', 'book', 'coffee', 'sun', 'chart', 'pen', 'layout', 'palette'];

/* ---------- constants ---------- */
const BPS = ['desktop', 'tablet', 'mobile'];
const BP_LABEL = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
const DEVICES = { desktop: { w: 1440, bp: 'desktop' }, laptop: { w: 1100, bp: 'desktop' }, tablet: { w: 768, bp: 'tablet' }, mobile: { w: 390, bp: 'mobile' } };
const TOKENS = [['primary', 'Primary'], ['secondary', 'Secondary'], ['background', 'Background'], ['surface', 'Surface'], ['text', 'Text'], ['muted', 'Muted'], ['border', 'Border']];
const FONTS = [
  ['System UI', 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'], ['Arial / Helvetica', 'Arial,Helvetica,sans-serif'],
  ['Georgia', 'Georgia,"Times New Roman",serif'], ['Palatino', '"Palatino Linotype",Palatino,"Book Antiqua",serif'],
  ['Trebuchet', '"Trebuchet MS",Tahoma,sans-serif'], ['Verdana', 'Verdana,Geneva,sans-serif'],
  ['Courier', '"Courier New",Courier,monospace'], ['Impact', 'Impact,"Arial Narrow",sans-serif']
];
const PH_FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#2b2b3a"/><path d="M300 330l70-80 55 60 40-45 85 65z" fill="#454560"/></svg>');
const ph = (w, h, c1, c2, label = '') => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>` +
  (label ? `<text x="50%" y="52%" fill="rgba(255,255,255,.72)" font-family="Georgia,serif" font-size="${Math.round(h / 9)}" text-anchor="middle">${esc(label)}</text>` : '') + '</svg>');
const DATA_RE = /data:image\/[\w.+-]+(?:;[\w=.-]+)*,[^"'()\s<>]+/g;

/* ---------- model helpers ---------- */
const REG = {};
const mk = (type, o = {}) => ({ id: uid(), type, name: o.name || (REG[type] ? REG[type].label : type), content: o.c ?? '', props: o.p || {}, styles: { desktop: o.s || {}, tablet: o.t || {}, mobile: o.m || {} }, children: o.k || [], hidden: false, locked: false });
function X(type, o = {}) {
  const n = REG[type].make();
  if (o.name) n.name = o.name;
  if (o.c !== undefined) n.content = o.c;
  if (o.p) Object.assign(n.props, o.p);
  if (o.s) Object.assign(n.styles.desktop, o.s);
  if (o.t) Object.assign(n.styles.tablet, o.t);
  if (o.m) Object.assign(n.styles.mobile, o.m);
  if (o.k) n.children = o.k;
  return n;
}
function walk(n, fn, parent = null, i = 0, depth = 0) { fn(n, parent, i, depth); n.children.forEach((c, j) => walk(c, fn, n, j, depth + 1)); }
function cloneTree(n) { const c = clone(n); walk(c, x => { x.id = uid(); }); return c; }
function reg(type, label, d) {
  const r = REG[type] = Object.assign({ type, label, tag: 'div', container: false, text: false }, d);
  r.make = d.make || (() => mk(type, { c: d.c, p: { ...(d.p || {}) }, s: { ...(d.s || {}) }, k: d.k ? d.k() : [] }));
}

/* ---------- URL & HTML safety ---------- */
function safeUrl(u, forSrc) {
  u = String(u ?? '').trim();
  if (!u) return '#';
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(u);
  if (m) {
    const s = m[1].toLowerCase();
    if (['http', 'https', 'mailto', 'tel'].includes(s)) return u;
    if (forSrc && s === 'data' && /^data:image\//i.test(u)) return u;
    return '#';
  }
  return u;
}
const BAD_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'style', 'form', 'frame', 'frameset', 'applet', 'noscript', 'template']);
function sanitizeHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = String(html || '');
  const clean = el => {
    Array.from(el.children).forEach(c => {
      if (BAD_TAGS.has(c.tagName.toLowerCase())) { c.remove(); return; }
      Array.from(c.attributes).forEach(a => {
        const n = a.name.toLowerCase();
        if (n.startsWith('on') || n === 'srcdoc' || n === 'formaction') c.removeAttribute(a.name);
        else if (['href', 'src', 'xlink:href', 'action', 'poster'].includes(n) && safeUrl(a.value, true) === '#' && a.value.trim() !== '#') c.setAttribute(a.name, '#');
      });
      clean(c);
    });
  };
  clean(t.content);
  return t.innerHTML;
}
const cssVal = v => String(v ?? '').replace(/[<>{}]/g, '').replace(/\/\*|\*\//g, '').replace(/expression\s*\(|javascript:|@import|behavior\s*:/gi, '').trim();
const validProp = k => /^(--)?[a-z][a-z0-9-]*$/i.test(k);

/* ---------- registry (element types) ---------- */
const ZERO = { margin: '0' };
const youtube = u => { let m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(u || ''); if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1]; m = /vimeo\.com\/(\d+)/.exec(u || ''); return m ? 'https://player.vimeo.com/video/' + m[1] : ''; };
function linkAttrs(n, ctx) {
  const raw = n.props.href || '#', o = {};
  if (raw.startsWith('page:')) {
    const pg = ctx.project.pages.find(p => p.id === raw.slice(5));
    o.href = pg ? pageFile(ctx.project, pg) : '#'; if (pg) o['data-page'] = pg.slug;
  } else o.href = safeUrl(raw);
  if (n.props.target === '_blank') { o.target = '_blank'; o.rel = 'noopener noreferrer'; }
  return o;
}
const pageFile = (p, pg) => pg.id === p.homeId ? 'index.html' : pg.slug + '.html';
const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
const kidsOf = (n, ctx, extra) => n.children.map((c, i) => renderNode(c, ctx, typeof extra === 'function' ? extra(i) : extra)).join('');

reg('page', 'Page', { tag: 'body', container: true, hide: true });
reg('section', 'Section', { tag: 'section', container: true, plain: true, s: { padding: 'clamp(2.5rem,7vw,5rem) 1.25rem' } });
reg('container', 'Container', { container: true, plain: true, s: { width: '100%', 'max-width': '1100px', margin: '0 auto' } });
const cell = () => mk('container', { name: 'Cell', s: { width: 'auto', 'max-width': 'none', margin: '0', padding: '1rem', border: '1px solid var(--border)', 'border-radius': '12px' } });
reg('grid', 'Grid', { container: true, plain: true, s: { display: 'grid', 'grid-template-columns': 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '1.25rem' }, k: () => [cell(), cell(), cell()] });
reg('flex', 'Flexbox', { container: true, plain: true, s: { display: 'flex', gap: '1rem', 'flex-wrap': 'wrap', 'align-items': 'center' } });
const col = () => mk('container', { name: 'Column', s: { flex: '1 1 280px', width: 'auto', 'max-width': 'none', margin: '0', padding: '1rem' } });
reg('columns', 'Columns', { container: true, plain: true, s: { display: 'flex', gap: '1.5rem', 'flex-wrap': 'wrap' }, k: () => [col(), col()] });
reg('spacer', 'Spacer', { attrs: () => ({ 'aria-hidden': 'true' }), s: { height: '3rem' } });

reg('heading', 'Heading', { tag: n => 'h' + (Math.min(6, Math.max(1, +n.props.level || 2))), text: true, typo: true, c: 'Build something people remember', p: { level: '2' }, s: { 'font-size': 'clamp(1.75rem,4.5vw,2.75rem)', 'line-height': '1.15', 'font-weight': '700', 'letter-spacing': '-0.02em' }, fields: [{ t: 'sel', k: 'p.level', l: 'Level', o: ['1', '2', '3', '4', '5', '6'] }] });
reg('paragraph', 'Paragraph', { tag: 'p', text: true, typo: true, c: 'Share a short, clear message here. Double-click this text on the canvas to edit it.', s: { 'line-height': '1.65', color: 'var(--muted)', 'max-width': '65ch' } });
reg('text', 'Text', { tag: 'span', text: true, typo: true, c: 'Text' });
reg('button', 'Button', { tag: 'a', text: true, typo: true, cls: n => `bb-btn bb-btn--${n.props.variant || 'primary'}`, attrs: linkAttrs, c: 'Get started', p: { href: '#', target: '_self', variant: 'primary' }, fields: [{ t: 'link', k: 'p.href', l: 'URL' }, { t: 'sel', k: 'p.target', l: 'Target', o: [['_self', 'Same tab'], ['_blank', 'New tab']] }, { t: 'sel', k: 'p.variant', l: 'Style', o: ['primary', 'secondary', 'outline', 'ghost'] }] });
reg('link', 'Link', { tag: 'a', text: true, typo: true, attrs: linkAttrs, c: 'Learn more', p: { href: '#', target: '_self' }, s: { color: 'var(--primary)' }, fields: [{ t: 'link', k: 'p.href', l: 'URL' }, { t: 'sel', k: 'p.target', l: 'Target', o: [['_self', 'Same tab'], ['_blank', 'New tab']] }] });
reg('image', 'Image', { tag: 'img', p: { src: ph(800, 500, '#2a2a40', '#47477a'), alt: 'Image description', loading: 'lazy' }, s: { width: '100%', 'max-width': '100%', height: 'auto', 'aspect-ratio': '16 / 10', 'object-fit': 'cover', 'border-radius': '12px' },
  attrs: (n, ctx) => ({ src: ctx.imgSrc(n.props.src), alt: n.props.alt || '', loading: ctx.edit ? undefined : 'lazy', decoding: 'async', draggable: ctx.edit ? 'false' : undefined }),
  fields: [{ t: 'img', k: 'p.src', l: 'Image' }, { t: 'text', k: 'p.alt', l: 'Alt text' }, { t: 'sty', s: 'object-fit', l: 'Object fit', o: ['cover', 'contain', 'fill', 'none', 'scale-down'] }, { t: 'sty', s: 'border-radius', l: 'Radius' }] });
reg('video', 'Video', { p: { url: '' }, s: { width: '100%', 'aspect-ratio': '16 / 9', 'border-radius': '12px', background: '#000', overflow: 'hidden' },
  attrs: n => ({ 'data-src': n.props.url ? '1' : undefined }),
  inner: n => { const u = (n.props.url || '').trim(), y = youtube(u); if (y) return `<iframe src="${esc(y)}" title="Video" allowfullscreen loading="lazy" referrerpolicy="no-referrer"></iframe>`; return `<video controls playsinline preload="metadata"${u ? ` src="${esc(safeUrl(u))}"` : ''}></video>`; },
  fields: [{ t: 'text', k: 'p.url', l: 'Video URL', ph: 'YouTube, Vimeo or .mp4 link' }] });
reg('icon', 'Icon', { tag: 'span', p: { icon: 'star' }, s: { 'font-size': '2rem', color: 'var(--primary)', display: 'inline-flex' },
  inner: n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n.props.icon] || IC.star}"/></svg>`,
  fields: [{ t: 'sel', k: 'p.icon', l: 'Icon', o: SITE_ICONS }] });
reg('divider', 'Divider', { tag: 'hr', s: { border: '0', 'border-top': '1px solid var(--border)', margin: '2rem 0', width: '100%' } });

reg('navlinks', 'Page links', { tag: 'ul', hide: true, s: { display: 'flex', gap: '1.25rem', 'list-style': 'none', padding: '0', margin: '0', 'flex-wrap': 'wrap' },
  inner: (n, ctx) => ctx.project.pages.filter(p => p.inNav !== false).map(p => `<li><a href="${esc(pageFile(ctx.project, p))}" data-page="${esc(p.slug)}"${p.id === ctx.page.id ? ' class="active"' : ''}>${esc(p.name)}</a></li>`).join('') });
reg('navbar', 'Navbar', { tag: 'nav', container: true, plain: true, s: { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', gap: '1rem', 'flex-wrap': 'wrap', padding: '1rem 1.5rem', background: 'var(--surface)', 'border-bottom': '1px solid var(--border)' },
  k: () => [mk('text', { name: 'Brand', c: 'Brand', s: { 'font-weight': '700', 'font-size': '1.25rem' } }), mk('navlinks'), X('button', { c: 'Contact' })] });
reg('sidebar', 'Sidebar', { tag: 'aside', container: true, plain: true, s: { width: '260px', 'max-width': '100%', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', 'border-radius': '12px', display: 'flex', 'flex-direction': 'column', gap: '.6rem' },
  k: () => [X('heading', { c: 'Menu', p: { level: '3' }, s: { 'font-size': '1rem' } }), X('link', { c: 'Overview' }), X('link', { c: 'Reports' }), X('link', { c: 'Settings' })] });
reg('breadcrumbs', 'Breadcrumbs', { tag: 'nav', p: { items: 'Home\nServices\nWeb design' }, s: { display: 'flex', gap: '.5rem', 'flex-wrap': 'wrap', 'font-size': '.9rem', color: 'var(--muted)' }, attrs: () => ({ 'aria-label': 'Breadcrumb' }),
  inner: n => { const it = lines(n.props.items); return it.map((t, i) => i < it.length - 1 ? `<a href="#">${esc(t)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page" style="color:var(--text)">${esc(t)}</span>`).join(''); },
  fields: [{ t: 'area', k: 'p.items', l: 'Items (one per line)' }] });
const tabPanel = t => mk('container', { name: t, s: { padding: '1rem 0', width: '100%', 'max-width': 'none', margin: '0' }, k: [X('paragraph', { c: t + ' content goes here.' })] });
reg('tabs', 'Tabs', { container: true, p: { titles: 'Overview\nDetails\nReviews' }, k: () => ['Overview', 'Details', 'Reviews'].map(tabPanel),
  inner: (n, ctx) => `<div class="bb-tablist" role="tablist">${lines(n.props.titles).map((t, i) => `<button type="button" role="tab" class="${i ? '' : 'active'}">${esc(t)}</button>`).join('')}</div>` + kidsOf(n, ctx, i => 'bb-panel' + (i ? '' : ' active')),
  fields: [{ t: 'area', k: 'p.titles', l: 'Tab titles (one per line)' }, { t: 'btn', l: 'Add tab', act: 'addTab' }] });
reg('footer', 'Footer', { tag: 'footer', container: true, plain: true, s: { padding: '2rem 1.25rem', 'border-top': '1px solid var(--border)', display: 'flex', 'justify-content': 'space-between', gap: '1rem', 'flex-wrap': 'wrap', 'align-items': 'center' }, k: () => [X('text', { c: '© 2026 Your Company' }), X('link', { c: 'Privacy' })] });

reg('card', 'Card', { container: true, plain: true, s: { display: 'flex', 'flex-direction': 'column', gap: '.75rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', 'border-radius': '16px' },
  k: () => [X('image', { s: { 'aspect-ratio': '16 / 10' } }), X('heading', { c: 'Card title', p: { level: '3' }, s: { 'font-size': '1.25rem' } }), X('paragraph', { c: 'A short description that explains what this card is about.' }), X('button', { c: 'Read more', p: { variant: 'outline' }, s: { 'align-self': 'flex-start' } })] });

const fieldWrap = (n, inner) => `<span class="bb-label">${esc(n.props.label)}</span>${inner}`;
const reqA = n => n.props.required ? ' required' : '';
reg('input', 'Input', { tag: 'label', typo: true, p: { label: 'Your name', name: 'name', type: 'text', placeholder: '', required: false }, s: { display: 'flex', 'flex-direction': 'column', gap: '.35rem' },
  inner: n => fieldWrap(n, `<input type="${['text', 'email', 'tel', 'url', 'number', 'password', 'date'].includes(n.props.type) ? n.props.type : 'text'}" name="${esc(n.props.name)}" placeholder="${esc(n.props.placeholder)}"${reqA(n)}>`),
  fields: [{ t: 'text', k: 'p.label', l: 'Label' }, { t: 'text', k: 'p.name', l: 'Field name' }, { t: 'sel', k: 'p.type', l: 'Type', o: ['text', 'email', 'tel', 'url', 'number', 'password', 'date'] }, { t: 'text', k: 'p.placeholder', l: 'Placeholder' }, { t: 'chk', k: 'p.required', l: 'Required' }] });
reg('textarea', 'Textarea', { tag: 'label', typo: true, p: { label: 'Message', name: 'message', placeholder: '', required: false }, s: { display: 'flex', 'flex-direction': 'column', gap: '.35rem' },
  inner: n => fieldWrap(n, `<textarea name="${esc(n.props.name)}" rows="4" placeholder="${esc(n.props.placeholder)}"${reqA(n)}></textarea>`),
  fields: [{ t: 'text', k: 'p.label', l: 'Label' }, { t: 'text', k: 'p.name', l: 'Field name' }, { t: 'text', k: 'p.placeholder', l: 'Placeholder' }, { t: 'chk', k: 'p.required', l: 'Required' }] });
reg('select', 'Select', { tag: 'label', typo: true, p: { label: 'Choose one', name: 'choice', options: 'Option one\nOption two\nOption three', required: false }, s: { display: 'flex', 'flex-direction': 'column', gap: '.35rem' },
  inner: n => fieldWrap(n, `<select name="${esc(n.props.name)}"${reqA(n)}>${lines(n.props.options).map(o => `<option>${esc(o)}</option>`).join('')}</select>`),
  fields: [{ t: 'text', k: 'p.label', l: 'Label' }, { t: 'text', k: 'p.name', l: 'Field name' }, { t: 'area', k: 'p.options', l: 'Options (one per line)' }, { t: 'chk', k: 'p.required', l: 'Required' }] });
reg('checkbox', 'Checkbox', { tag: 'label', typo: true, p: { label: 'I agree to the terms', name: 'agree', required: false }, s: { display: 'flex', 'align-items': 'center', gap: '.5rem' },
  inner: n => `<input type="checkbox" name="${esc(n.props.name)}"${reqA(n)}><span>${esc(n.props.label)}</span>`,
  fields: [{ t: 'text', k: 'p.label', l: 'Label' }, { t: 'text', k: 'p.name', l: 'Field name' }, { t: 'chk', k: 'p.required', l: 'Required' }] });
reg('radio', 'Radio group', { typo: true, p: { label: 'Pick an option', name: 'pick', options: 'Option A\nOption B' }, s: { display: 'flex', 'flex-direction': 'column', gap: '.4rem' }, attrs: () => ({ role: 'radiogroup' }),
  inner: n => `<span class="bb-label">${esc(n.props.label)}</span>` + lines(n.props.options).map((o, i) => `<label class="bb-opt"><input type="radio" name="${esc(n.props.name)}" value="${esc(o)}"${i ? '' : ' checked'}><span>${esc(o)}</span></label>`).join(''),
  fields: [{ t: 'text', k: 'p.label', l: 'Label' }, { t: 'text', k: 'p.name', l: 'Field name' }, { t: 'area', k: 'p.options', l: 'Options (one per line)' }] });
reg('form', 'Form', { tag: 'form', container: true, plain: true, p: { action: '', method: 'post', success: 'Thanks! Your message has been sent.' }, s: { display: 'flex', 'flex-direction': 'column', gap: '1rem', width: '100%', 'max-width': '520px' },
  attrs: n => { const a = (n.props.action || '').trim(); return a ? { action: safeUrl(a), method: n.props.method === 'get' ? 'get' : 'post' } : { 'data-demo': '1', 'data-success': n.props.success || 'Thanks!' }; },
  k: () => [X('input', { c: '', p: { label: 'Name', name: 'name', required: true } }), X('input', { p: { label: 'Email', name: 'email', type: 'email', required: true } }), X('textarea'), X('submit')],
  fields: [{ t: 'text', k: 'p.action', l: 'Action URL', ph: 'Empty = show success message' }, { t: 'sel', k: 'p.method', l: 'Method', o: ['post', 'get'] }, { t: 'text', k: 'p.success', l: 'Success text' }] });
reg('submit', 'Submit button', { tag: 'button', text: true, typo: true, cls: n => `bb-btn bb-btn--${n.props.variant || 'primary'}`, attrs: () => ({ type: 'submit' }), c: 'Send message', p: { variant: 'primary' }, s: { 'align-self': 'flex-start' }, fields: [{ t: 'sel', k: 'p.variant', l: 'Style', o: ['primary', 'secondary', 'outline', 'ghost'] }] });

reg('modal', 'Modal', { container: true, p: { trigger: 'Open modal' }, k: () => [X('heading', { c: 'Modal title', p: { level: '3' }, s: { 'font-size': '1.4rem' } }), X('paragraph', { c: 'Put any content inside this dialog.' })],
  inner: (n, ctx) => `<button type="button" class="bb-btn bb-btn--primary bb-trigger">${esc(n.props.trigger)}</button><div class="bb-overlay"><div class="bb-dialog" role="dialog" aria-modal="true"><button type="button" class="bb-close" aria-label="Close">×</button>${kidsOf(n, ctx)}</div></div>`,
  fields: [{ t: 'text', k: 'p.trigger', l: 'Button text' }] });
const accItem = (q, a) => mk('accitem', { name: q, p: { title: q }, k: [X('paragraph', { c: a })] });
reg('accitem', 'Accordion item', { tag: 'details', container: true, hide: true, editKey: 'p.title', editSel: 'summary', p: { title: 'Question' }, s: {}, attrs: (n, ctx) => ({ open: ctx.edit || n.props.open ? true : undefined }),
  inner: (n, ctx) => `<summary>${esc(n.props.title)}</summary><div class="bb-acc-body">${kidsOf(n, ctx)}</div>`, fields: [{ t: 'text', k: 'p.title', l: 'Title' }] });
reg('accordion', 'Accordion', { container: true, s: { display: 'flex', 'flex-direction': 'column', gap: '.6rem', width: '100%' }, k: () => [accItem('What is included?', 'Everything you need to get started.'), accItem('Can I change it later?', 'Yes, you can edit any part at any time.'), accItem('How do I get help?', 'Reach out through the contact page.')] });
const slide = (t, d) => mk('container', { name: 'Slide', s: { padding: 'clamp(2rem,6vw,4rem)', background: 'var(--surface)', 'border-radius': '16px', 'text-align': 'center', width: 'auto', 'max-width': 'none', margin: '0' }, k: [X('heading', { c: t, p: { level: '3' } }), X('paragraph', { c: d, s: { margin: '.5rem auto 0' } })] });
reg('carousel', 'Carousel', { container: true, s: { position: 'relative', width: '100%' }, k: () => [slide('First slide', 'Tell a short story with each slide.'), slide('Second slide', 'Slides scroll horizontally with snapping.'), slide('Third slide', 'Use the arrows or swipe on touch screens.')],
  inner: (n, ctx) => `<div class="bb-track">${kidsOf(n, ctx, 'bb-slide')}</div><button type="button" class="bb-nav bb-prev" data-dir="prev" aria-label="Previous">‹</button><button type="button" class="bb-nav bb-next" data-dir="next" aria-label="Next">›</button>` });
reg('dropdown', 'Dropdown', { tag: 'details', container: true, p: { label: 'Menu' }, attrs: (n, ctx) => ({ open: ctx.edit ? true : undefined }), k: () => [X('link', { c: 'First option', s: { color: 'var(--text)' } }), X('link', { c: 'Second option', s: { color: 'var(--text)' } })],
  inner: (n, ctx) => `<summary class="bb-btn bb-btn--secondary">${esc(n.props.label)}</summary><div class="bb-menu">${kidsOf(n, ctx)}</div>`, fields: [{ t: 'text', k: 'p.label', l: 'Button text' }] });
const cdParts = t => { const d = Math.max(0, new Date(t).getTime() - Date.now()) / 1000; return { d: Math.floor(d / 86400), h: Math.floor(d % 86400 / 3600), m: Math.floor(d % 3600 / 60), s: Math.floor(d % 60) }; };
reg('countdown', 'Countdown', { p: { target: '' }, make: () => mk('countdown', { p: { target: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 16) } }),
  attrs: n => ({ 'data-target': n.props.target }),
  inner: n => { const v = cdParts(n.props.target), p2 = x => (x < 10 ? '0' : '') + x; return [['d', 'Days'], ['h', 'Hours'], ['m', 'Minutes'], ['s', 'Seconds']].map(([k, l]) => `<div class="bb-unit"><strong data-u="${k}">${p2(v[k])}</strong><span>${l}</span></div>`).join(''); },
  fields: [{ t: 'dt', k: 'p.target', l: 'Ends at' }] });
reg('alert', 'Alert', { typo: true, c: 'Heads up — your changes were saved.', p: { kind: 'info' }, editSel: 'span', cls: n => 'bb-alert--' + (n.props.kind || 'info'), attrs: () => ({ role: 'alert' }),
  inner: n => `<span>${esc(n.content)}</span><button type="button" class="bb-x" aria-label="Dismiss">×</button>`, fields: [{ t: 'area', k: 'content', l: 'Message' }, { t: 'sel', k: 'p.kind', l: 'Type', o: ['info', 'success', 'warning', 'error'] }] });
reg('toast', 'Toast', { p: { trigger: 'Show toast', message: 'Saved successfully.' }, editSel: '.bb-toast', editKey: 'p.message',
  inner: n => `<button type="button" class="bb-btn bb-btn--secondary bb-trigger">${esc(n.props.trigger)}</button><div class="bb-toast" role="status">${esc(n.props.message)}</div>`,
  fields: [{ t: 'text', k: 'p.trigger', l: 'Button text' }, { t: 'text', k: 'p.message', l: 'Message' }] });
reg('html', 'Custom HTML', { c: '<p>Custom HTML goes here.</p>', inner: n => sanitizeHTML(n.content), fields: [{ t: 'area', k: 'content', l: 'HTML (sanitized)', tall: true }] });

/* ---------- renderer: JSON tree → HTML ---------- */
const VOID = new Set(['img', 'hr', 'input', 'br']);
const attrStr = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== false && v !== null).map(([k, v]) => v === true ? ' ' + k : ` ${k}="${esc(v)}"`).join('');
function renderNode(n, ctx, extra) {
  const d = REG[n.type];
  if (!d || (n.hidden && !ctx.edit)) return '';
  const tag = typeof d.tag === 'function' ? d.tag(n) : d.tag;
  let cls = d.cls ? d.cls(n) + ' ' : '';
  cls += `bb-${n.type} el-${n.id}` + (extra ? ' ' + extra : '');
  if (ctx.edit) { if (n.hidden) cls += ' bb-hidden'; if (d.container && !n.children.length) cls += ' bb-empty'; }
  const a = { class: cls, id: n.props.htmlId || undefined };
  Object.assign(a, d.attrs ? d.attrs(n, ctx) : {});
  if (ctx.edit) a['data-id'] = n.id;
  if (VOID.has(tag)) return `<${tag}${attrStr(a)}>`;
  const inner = d.inner ? d.inner(n, ctx) : d.text ? esc(n.content) : d.container ? kidsOf(n, ctx) : '';
  return `<${tag}${attrStr(a)}>${inner}</${tag}>`;
}
function assetMap(p) {
  const used = new Set(), m = {};
  p.assets.forEach(a => {
    const dot = a.name.lastIndexOf('.'); const base = safeName(dot > 0 ? a.name.slice(0, dot) : a.name), ext = dot > 0 ? safeName(a.name.slice(dot + 1)).toLowerCase() : (a.type.split('/')[1] || 'png').replace('svg+xml', 'svg');
    let f = base + '.' + ext, i = 2; while (used.has(f)) f = base + '-' + (i++) + '.' + ext; used.add(f); m[a.id] = f;
  });
  return m;
}
function makeCtx(p, page, o = {}) {
  const amap = o.export ? assetMap(p) : null;
  const assetUrl = id => { const a = p.assets.find(x => x.id === id); if (!a) return PH_FALLBACK; return amap ? 'assets/' + amap[id] : a.dataUrl; };
  const imgSrc = raw => { raw = String(raw || ''); return raw.startsWith('asset:') ? assetUrl(raw.slice(6)) : safeUrl(raw, true); };
  return { project: p, page, edit: !!o.edit, assetUrl, imgSrc, amap };
}
/* ---------- renderer: styles → CSS ---------- */
const BASE_CSS = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--background);color:var(--text);font-family:var(--font);line-height:1.5;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6{margin:0;font-family:var(--font-heading)}
p{margin:0}img,video,iframe{max-width:100%;display:block}iframe{border:0;width:100%;height:100%}
video{width:100%;height:100%;object-fit:cover}
a{color:inherit}
.bb-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.7rem 1.25rem;border-radius:10px;font:inherit;font-weight:600;text-decoration:none;cursor:pointer;border:1px solid transparent;line-height:1.2;transition:filter .15s,background .15s}
.bb-btn--primary{background:var(--primary);color:var(--background)}
.bb-btn--primary:hover{filter:brightness(1.1)}
.bb-btn--secondary{background:var(--surface);color:var(--text);border-color:var(--border)}
.bb-btn--outline{background:transparent;color:var(--text);border-color:var(--border)}
.bb-btn--outline:hover{border-color:var(--primary)}
.bb-btn--ghost{background:transparent;color:var(--primary)}
.bb-icon svg{width:1em;height:1em;display:block}
.bb-navlinks a{text-decoration:none;color:var(--muted)}.bb-navlinks a:hover,.bb-navlinks a.active{color:var(--text)}
.bb-breadcrumbs a{color:var(--muted);text-decoration:none}
.bb-field .bb-label,.bb-radio .bb-label{font-size:.875rem;font-weight:600}
.bb-field input,.bb-field textarea,.bb-field select{width:100%;padding:.65rem .8rem;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font:inherit}
.bb-field input:focus,.bb-field textarea:focus,.bb-field select:focus{outline:2px solid var(--primary);outline-offset:1px}
.bb-opt{display:flex;gap:.5rem;align-items:center}
.bb-checkbox input,.bb-opt input{accent-color:var(--primary);width:1.1rem;height:1.1rem}
.bb-success{padding:1rem 1.25rem;border-radius:12px;background:var(--surface);border:1px solid var(--primary)}
.bb-tablist{display:flex;gap:.25rem;border-bottom:1px solid var(--border);overflow-x:auto}
.bb-tablist button{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);padding:.7rem 1rem;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
.bb-tablist button.active{color:var(--text);border-bottom-color:var(--primary)}
.bb-tabs>.bb-panel{display:none}.bb-tabs>.bb-panel.active{display:block}
.bb-accitem{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.bb-accitem summary{padding:1rem 1.1rem;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:1rem}
.bb-accitem summary::-webkit-details-marker{display:none}.bb-accitem summary::after{content:"+";color:var(--muted)}
.bb-accitem[open] summary::after{content:"–"}
.bb-acc-body{padding:0 1.1rem 1rem}
.bb-modal .bb-overlay{display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);align-items:center;justify-content:center;padding:1rem}
.bb-modal .bb-overlay.open{display:flex}
.bb-dialog{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.75rem;width:100%;max-width:520px;max-height:90vh;overflow:auto;display:flex;flex-direction:column;gap:.75rem}
.bb-close{position:absolute;right:.6rem;top:.4rem;background:none;border:0;color:var(--muted);font-size:1.6rem;cursor:pointer;line-height:1}
.bb-carousel .bb-track{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.bb-carousel .bb-track::-webkit-scrollbar{display:none}
.bb-slide{flex:0 0 100%;scroll-snap-align:start}
.bb-nav{position:absolute;top:50%;transform:translateY(-50%);width:2.4rem;height:2.4rem;border-radius:50%;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:1.4rem;cursor:pointer;line-height:1}
.bb-prev{left:.6rem}.bb-next{right:.6rem}
.bb-dropdown{position:relative;display:inline-block}
.bb-dropdown summary{list-style:none}.bb-dropdown summary::-webkit-details-marker{display:none}
.bb-menu{position:absolute;z-index:50;top:calc(100% + .4rem);left:0;min-width:11rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:.5rem;display:flex;flex-direction:column;gap:.25rem}
.bb-menu a{padding:.5rem .7rem;border-radius:8px;text-decoration:none}.bb-menu a:hover{background:var(--border)}
.bb-countdown{display:flex;gap:.75rem;flex-wrap:wrap}
.bb-unit{min-width:5rem;padding:1rem .75rem;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:14px;display:flex;flex-direction:column;gap:.25rem}
.bb-unit strong{font-size:2rem;line-height:1;font-variant-numeric:tabular-nums}.bb-unit span{font-size:.75rem;color:var(--muted)}
.bb-alert{display:flex;gap:1rem;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;border-radius:12px;border:1px solid;background:var(--surface)}
.bb-alert--info{border-color:#4f8cff;color:#4f8cff}.bb-alert--success{border-color:#2fb27a;color:#2fb27a}.bb-alert--warning{border-color:#e0a030;color:#e0a030}.bb-alert--error{border-color:#e5586a;color:#e5586a}
.bb-alert span{color:var(--text)}.bb-x{background:none;border:0;color:inherit;font-size:1.3rem;cursor:pointer;line-height:1}
.bb-toast{position:fixed;left:50%;bottom:1.5rem;transform:translate(-50%,2rem);opacity:0;pointer-events:none;background:var(--text);color:var(--background);padding:.75rem 1.25rem;border-radius:12px;z-index:1100;transition:opacity .2s,transform .2s;max-width:90vw}
.bb-toast.show{opacity:1;transform:translate(-50%,0)}`;
const EDIT_CSS = `.bb-hidden{display:none!important}
html{scroll-behavior:auto}
body.bb-edit-root{min-height:100vh}
.bb-empty{min-height:72px;position:relative;outline:1px dashed rgba(128,128,150,.45);outline-offset:-1px}
.bb-empty::before{content:"Drop elements here";position:absolute;inset:0;display:grid;place-items:center;font:12px system-ui,sans-serif;color:rgba(128,128,150,.9);pointer-events:none}
body.bb-empty{min-height:100vh}body.bb-empty::before{content:"Your page is empty — drag an element here or tap one in the Add panel"}
.bb-field input,.bb-field textarea,.bb-field select,.bb-nav,.bb-tablist button,.bb-close,.bb-x,.bb-trigger,.bb-video video,.bb-video iframe,.bb-radio input,.bb-checkbox input{pointer-events:none}
.bb-tabs>.bb-panel{display:block!important;outline:1px dashed rgba(128,128,150,.35);outline-offset:-1px}
.bb-modal .bb-overlay{display:flex!important;position:static;background:rgba(128,128,150,.12);padding:1rem;border-radius:12px;margin-top:.5rem}
.bb-toast{position:static;opacity:1;transform:none;display:inline-block;margin-top:.5rem;pointer-events:none}
.bb-carousel .bb-track{flex-wrap:wrap}.bb-carousel .bb-nav{display:none}
.bb-menu{position:static;margin-top:.4rem}
.bb-video:not([data-src])::before{content:"Add a video URL in the Content tab";position:absolute;color:#aaa;font:12px system-ui;padding:8px}
.bb-video{position:relative}
.bb-accitem summary{pointer-events:auto}
body.bb-grid{background-image:linear-gradient(rgba(128,128,150,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(128,128,150,.14) 1px,transparent 1px)!important;background-size:16px 16px}
[contenteditable="true"]{outline:2px solid #6d7cff!important;outline-offset:2px;cursor:text}`;

const bpMax = (p, bp) => bp === 'tablet' ? (p.settings.tabMax || 900) : (p.settings.mobMax || 600);
function tokensCSS(p) {
  const rows = Object.entries(p.vars).filter(([k]) => /^[\w-]+$/.test(k)).map(([k, v]) => `  --${k}: ${cssVal(v)};`);
  rows.push(`  --font: ${cssVal(p.settings.font || FONTS[0][1])};`, `  --font-heading: ${cssVal(p.settings.headingFont || p.settings.font || FONTS[0][1])};`);
  return ':root {\n' + rows.join('\n') + '\n}';
}
function elementsCSS(p, ctx, pages) {
  const out = { desktop: [], tablet: [], mobile: [] };
  const fix = v => cssVal(v).replace(/asset:([\w-]+)/g, (m, id) => ctx.assetUrl(id));
  (pages || p.pages).forEach(pg => walk(pg.root, n => {
    BPS.forEach(bp => {
      const st = n.styles[bp], ks = Object.keys(st).filter(k => validProp(k) && st[k] !== '' && st[k] != null);
      if (ks.length) out[bp].push(`.el-${n.id} {\n${ks.map(k => `  ${k}: ${fix(st[k])};`).join('\n')}\n}`);
    });
  }));
  let css = out.desktop.join('\n');
  if (out.tablet.length) css += `\n@media (max-width: ${bpMax(p, 'tablet')}px) {\n${out.tablet.join('\n')}\n}`;
  if (out.mobile.length) css += `\n@media (max-width: ${bpMax(p, 'mobile')}px) {\n${out.mobile.join('\n')}\n}`;
  return css;
}
const CSS_MARK_T = '/* ==== Design tokens ==== */', CSS_MARK_C = '/* ==== Custom CSS ==== */';
const fullCSS = (p, ctx) => `/* Base styles (generated) */\n${BASE_CSS}\n\n${CSS_MARK_T}\n${tokensCSS(p)}\n\n/* Element styles */\n${elementsCSS(p, ctx)}\n\n${CSS_MARK_C}\n${p.customCSS || ''}\n`;
/* ---------- JS runtime for interactive components ---------- */
const RT = {
  tabs: `document.querySelectorAll('.bb-tabs').forEach(function(t){var b=t.querySelectorAll(':scope > .bb-tablist > button'),p=t.querySelectorAll(':scope > .bb-panel');function go(i){b.forEach(function(x,j){x.classList.toggle('active',i===j);x.setAttribute('aria-selected',i===j)});p.forEach(function(x,j){x.classList.toggle('active',i===j)})}b.forEach(function(x,i){x.addEventListener('click',function(){go(i)})});go(0)});`,
  modal: `document.querySelectorAll('.bb-modal').forEach(function(m){var o=m.querySelector(':scope > .bb-overlay'),t=m.querySelector(':scope > .bb-trigger');function close(){o.classList.remove('open')}t.addEventListener('click',function(){o.classList.add('open')});o.addEventListener('click',function(e){if(e.target===o||e.target.closest('.bb-close'))close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()})});`,
  carousel: `document.querySelectorAll('.bb-carousel').forEach(function(c){var t=c.querySelector(':scope > .bb-track');c.querySelectorAll(':scope > .bb-nav').forEach(function(b){b.addEventListener('click',function(){t.scrollBy({left:(b.dataset.dir==='next'?1:-1)*t.clientWidth,behavior:'smooth'})})})});`,
  countdown: `document.querySelectorAll('.bb-countdown').forEach(function(c){var end=new Date(c.dataset.target).getTime();function p(n){return n<10?'0'+n:''+n}function tick(){var d=Math.max(0,end-Date.now())/1000,v={d:Math.floor(d/86400),h:Math.floor(d%86400/3600),m:Math.floor(d%3600/60),s:Math.floor(d%60)};for(var k in v){var e=c.querySelector('[data-u="'+k+'"]');if(e)e.textContent=p(v[k])}}tick();setInterval(tick,1000)});`,
  alert: `document.querySelectorAll('.bb-alert .bb-x').forEach(function(b){b.addEventListener('click',function(){b.parentNode.remove()})});`,
  toast: `document.querySelectorAll('.bb-toast').forEach(function(t){var b=t.parentNode.querySelector('.bb-trigger');b.addEventListener('click',function(){t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3000)})});`,
  form: `document.querySelectorAll('form[data-demo]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var m=document.createElement('p');m.className='bb-success';m.textContent=f.dataset.success||'Thanks!';f.replaceWith(m)})});`
};
const RT_FOR = { tabs: 'tabs', modal: 'modal', carousel: 'carousel', countdown: 'countdown', alert: 'alert', toast: 'toast', form: 'form' };
function usedTypes(p) { const s = new Set(); p.pages.forEach(pg => walk(pg.root, n => s.add(n.type))); return s; }
const JS_MARK = '/* ==== Custom JavaScript ==== */';
function runtimeJS(p) { const u = usedTypes(p); return Object.keys(RT_FOR).filter(t => u.has(t)).map(t => RT[RT_FOR[t]]).join('\n'); }
const fullJS = p => `/* Interactive components (generated) */\n${runtimeJS(p)}\n\n${JS_MARK}\n${p.customJS || ''}\n`;

/* ---------- document generation ---------- */
const NAV_SCRIPT = `document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var s=a.getAttribute('data-page');if(s){e.preventDefault();parent.postMessage({bbGo:s},'*')}});`;
function genDoc(p, page, mode) {
  const ctx = makeCtx(p, page, { export: mode === 'export' });
  const body = kidsOf(page.root, ctx);
  const css = fullCSS(p, ctx), js = fullJS(p) + (mode === 'preview' ? '\n' + NAV_SCRIPT : '');
  const title = esc((page.title || page.name) + (page.title ? '' : ' · ' + p.name));
  const head = `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n` + (page.desc ? `<meta name="description" content="${esc(page.desc)}">\n` : '');
  const link = mode === 'export' ? '<link rel="stylesheet" href="style.css">' : `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`;
  const sc = mode === 'export' ? '<script src="script.js"></script>' : `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head}${link}\n</head>\n<body class="bb-page el-${page.root.id}">\n${body}\n${sc}\n</body>\n</html>`;
}
/* ---------- formatters ---------- */
function formatHTML(src) {
  const re = /<!--[\s\S]*?-->|<(script|style|textarea|pre)\b[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi;
  const inline = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'small', 'label', 'button', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'option', 'svg', 'textarea']);
  const voids = new Set(['img', 'hr', 'input', 'br', 'meta', 'link', 'path']);
  let out = '', depth = 0, m;
  const pad = () => '  '.repeat(Math.max(0, depth));
  const toks = []; while ((m = re.exec(src))) toks.push(m[0]);
  for (let i = 0; i < toks.length; i++) {
    let t = toks[i];
    if (!t.trim()) continue;
    if (t[0] !== '<') { out += pad() + t.trim().replace(/\s+/g, ' ') + '\n'; continue; }
    const name = (/^<\/?([\w-]+)/.exec(t) || [])[1]; const ln = name ? name.toLowerCase() : '';
    if (/^<\//.test(t)) { depth--; out += pad() + t + '\n'; continue; }
    if (/^<!/.test(t) || /^<(script|style|textarea|pre)\b/i.test(t) || voids.has(ln) || /\/>$/.test(t)) { out += pad() + t + '\n'; continue; }
    // compact inline element holding only text: <h2>Title</h2>
    if (inline.has(ln) && toks[i + 1] && toks[i + 1][0] !== '<' && toks[i + 2] && toks[i + 2] === `</${name}>`) { out += pad() + t + toks[i + 1].trim() + toks[i + 2] + '\n'; i += 2; continue; }
    out += pad() + t + '\n'; depth++;
  }
  return out.trimEnd() + '\n';
}
function formatCSS(src) {
  let out = '', depth = 0; const s = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/\n/g, ' \u0001 ')).replace(/\s+/g, ' ');
  const tokens = s.replace(/\s*\{\s*/g, ' {\n').replace(/;\s*/g, ';\n').replace(/\s*\}\s*/g, '\n}\n').split('\n');
  tokens.forEach(l => { l = l.trim().replace(/ \u0001 /g, '\n'); if (!l) return; if (l === '}') depth--; out += '  '.repeat(Math.max(0, depth)) + l + '\n'; if (l.endsWith('{')) depth++; if (l === '}' && depth === 0) out += '\n'; });
  return out.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
function formatJS(src) {
  let depth = 0; return src.split('\n').map(l => {
    const t = l.trim(); if (!t) return '';
    const stripped = t.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""').replace(/\/\/.*$/, '');
    const open = (stripped.match(/[{[(]/g) || []).length, close = (stripped.match(/[}\])]/g) || []).length;
    const lead = /^[}\])]/.test(stripped) ? 1 : 0; const d = Math.max(0, depth - lead);
    depth = Math.max(0, depth + open - close); return '  '.repeat(d) + t;
  }).join('\n');
}
/* ---------- zip & binary ---------- */
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const dt = new Date(), time = (dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1), date = ((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate();
  files.forEach(f => {
    const nm = enc.encode(f.name), d = f.data, crc = crc32(d);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, d.length, true); lh.setUint32(22, d.length, true); lh.setUint16(26, nm.length, true);
    parts.push(new Uint8Array(lh.buffer), nm, d);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, d.length, true); ch.setUint32(24, d.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), nm);
    off += 30 + nm.length + d.length;
  });
  const cs = central.reduce((a, b) => a + b.length, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cs, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
function dataToBytes(uri) {
  const i = uri.indexOf(','), head = uri.slice(0, i), body = uri.slice(i + 1);
  if (/;base64/i.test(head)) { const bin = atob(body), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return u; }
  return new TextEncoder().encode(decodeURIComponent(body));
}
const extOfData = uri => { const m = /^data:image\/([\w.+-]+)/.exec(uri); return m ? m[1].replace('svg+xml', 'svg').replace('jpeg', 'jpg') : 'png'; };
function exportFiles(p) {
  const enc = new TextEncoder(), files = [], extra = new Map(), amap = assetMap(p);
  const pull = s => s.replace(DATA_RE, m => { if (!extra.has(m)) extra.set(m, 'img-' + (extra.size + 1) + '.' + extOfData(m)); return 'assets/' + extra.get(m); });
  p.pages.forEach(pg => files.push({ name: pageFile(p, pg), data: enc.encode(pull(formatHTML(genDoc(p, pg, 'export')))) }));
  const ctx = makeCtx(p, p.pages[0], { export: true });
  files.push({ name: 'style.css', data: enc.encode(pull(fullCSS(p, ctx))) }, { name: 'script.js', data: enc.encode(fullJS(p)) });
  p.assets.forEach(a => files.push({ name: 'assets/' + amap[a.id], data: dataToBytes(a.dataUrl) }));
  extra.forEach((f, uri) => files.push({ name: 'assets/' + f, data: dataToBytes(uri) }));
  return files;
}
/* =====================================================================
   UI helpers: toast, dialogs, clipboard, downloads
   ===================================================================== */
function toast(msg, err) {
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), err ? 4200 : 2200);
}
const dlgStack = [];
function dlg(o) {
  const back = document.createElement('div'); back.className = 'dlg-back';
  back.innerHTML = `<div class="dlg${o.wide ? ' wide' : ''}" role="dialog" aria-modal="true"><div class="dlg-h"><span>${esc(o.title)}</span><button class="ib sm" data-x aria-label="Close">${ico('x')}</button></div><div class="dlg-b"></div><div class="dlg-f"></div></div>`;
  const b = $('.dlg-b', back), f = $('.dlg-f', back);
  if (typeof o.body === 'string') b.innerHTML = o.body; else if (o.body) b.appendChild(o.body);
  const api = { el: back, body: b, close() { const i = dlgStack.indexOf(api); if (i >= 0) dlgStack.splice(i, 1); back.remove(); o.onClose && o.onClose(); } };
  (o.actions || []).forEach(a => {
    const bt = document.createElement('button'); bt.className = 'btn ' + (a.kind || ''); bt.textContent = a.label;
    bt.onclick = () => { const r = a.fn ? a.fn(api) : undefined; if (r !== false) api.close(); }; f.appendChild(bt);
  });
  if (!(o.actions || []).length) f.remove();
  $('[data-x]', back).onclick = api.close;
  back.addEventListener('pointerdown', e => { if (e.target === back) api.close(); });
  $('#dlgRoot').appendChild(back); dlgStack.push(api);
  const first = $('input,select,textarea', b); if (first && !o.noFocus && matchMedia('(pointer:fine)').matches) first.focus();
  return api;
}
function askText(title, value, label = 'Name', ok = 'Save') {
  return new Promise(res => {
    let done = false;
    const d = dlg({ title, body: `<div class="f col"><label>${esc(label)}</label><input type="text" value="${esc(value || '')}" maxlength="120"></div>`, onClose: () => { if (!done) res(null); },
      actions: [{ label: 'Cancel' }, { label: ok, kind: 'pri', fn: () => { done = true; res($('input', d.body).value.trim()); } }] });
    const inp = $('input', d.body); inp.focus(); inp.select();
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { done = true; res(inp.value.trim()); d.close(); } });
  });
}
function askConfirm(title, msg, ok = 'Delete', danger = true) {
  return new Promise(res => {
    let done = false;
    dlg({ title, body: `<p style="margin:0;color:var(--dim)">${esc(msg)}</p>`, onClose: () => { if (!done) res(false); }, actions: [{ label: 'Cancel' }, { label: ok, kind: danger ? 'dng' : 'pri', fn: () => { done = true; res(true); } }] });
  });
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('Copied'); return true; } catch (e) { }
  try { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); toast(ok ? 'Copied' : 'Copy failed', !ok); return ok; } catch (e) { toast('Copy failed', true); return false; }
}
async function saveFile(name, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain' });
  try {
    const d = typeof claude !== 'undefined' && claude.use ? await claude.use('downloads') : null;
    if (d) {
      try { await d.save({ filename: name, data: blob }); toast('Saved ' + name); return true; }
      catch (e) {
        if (e && e.code === 'declined') return false;
        if (e && e.code === 'rejected_extension') { try { await d.save({ filename: name + '.txt', data: blob }); toast('Saved as ' + name + '.txt — rename after download'); return true; } catch (e2) { return false; } }
      }
    }
  } catch (e) { }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); toast('Downloading ' + name); return true; }
  catch (e) { toast('Downloads are not available in this view', true); return false; }
}
const readFile = (f, as = 'dataURL') => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); as === 'text' ? r.readAsText(f) : r.readAsDataURL(f); });
function pickFile(accept, multiple) {
  return new Promise(res => {
    const i = $('#fileIn'); i.value = ''; i.accept = accept || ''; i.multiple = !!multiple;
    i.onchange = () => res(Array.from(i.files)); i.click();
  });
}

/* =====================================================================
   Storage (IndexedDB with localStorage / memory fallbacks)
   ===================================================================== */
const Store = {
  mode: 'idb', db: null, mem: new Map(), metaMem: [],
  async init() {
    try {
      this.db = await new Promise((res, rej) => {
        const to = setTimeout(() => rej(new Error('timeout')), 2500);
        const r = indexedDB.open('bappherh-builder', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('projects', { keyPath: 'id' });
        r.onsuccess = () => { clearTimeout(to); res(r.result); };
        r.onerror = () => { clearTimeout(to); rej(r.error); };
      });
    } catch (e) { this.mode = 'ls'; }
  },
  req(mode, fn) { return new Promise((res, rej) => { const tx = this.db.transaction('projects', mode), r = fn(tx.objectStore('projects')); tx.oncomplete = () => res(r && r.result); tx.onerror = tx.onabort = () => rej(tx.error); }); },
  async put(p) {
    if (this.mode === 'idb') { try { await this.req('readwrite', s => s.put(p)); return; } catch (e) { this.mode = 'ls'; } }
    if (this.mode === 'ls') { try { localStorage.setItem('bb:p:' + p.id, JSON.stringify(p)); return; } catch (e) { this.mode = 'mem'; toast('Browser storage is full or unavailable — export your project to keep it', true); } }
    this.mem.set(p.id, clone(p));
  },
  async get(id) {
    if (this.mode === 'idb') { try { const r = await this.req('readonly', s => s.get(id)); if (r) return r; } catch (e) { } }
    try { const s = localStorage.getItem('bb:p:' + id); if (s) return JSON.parse(s); } catch (e) { }
    return this.mem.get(id) ? clone(this.mem.get(id)) : null;
  },
  async del(id) {
    if (this.mode === 'idb') { try { await this.req('readwrite', s => s.delete(id)); } catch (e) { } }
    try { localStorage.removeItem('bb:p:' + id); } catch (e) { }
    this.mem.delete(id);
  },
  metas() { try { const m = JSON.parse(localStorage.getItem('bb:index') || 'null'); if (Array.isArray(m)) return m; } catch (e) { } return this.metaMem; },
  setMetas(m) { this.metaMem = m; try { localStorage.setItem('bb:index', JSON.stringify(m)); } catch (e) { } },
  touchMeta(p) {
    const m = this.metas().filter(x => x.id !== p.id);
    m.unshift({ id: p.id, name: p.name, updated: p.updated, created: p.created, pages: p.pages.length, color: p.vars.primary });
    this.setMetas(m);
  },
  dropMeta(id) { this.setMetas(this.metas().filter(x => x.id !== id)); }
};

/* =====================================================================
   State, project creation & normalisation
   ===================================================================== */
const S = {
  project: null, pageId: null, selId: null, device: 'desktop', zoom: 'fit', clip: null, collapsed: new Set(), mode: 'design',
  ltab: 'elements', rtab: 'content', dirty: false,
  prefs: Object.assign({ theme: 'dark', autosave: true, grid: false, snap: false, canvasBg: '', font: FONTS[0][1] }, (() => { try { return JSON.parse(localStorage.getItem('bb:prefs') || '{}'); } catch (e) { return {}; } })())
};
const savePrefs = () => { try { localStorage.setItem('bb:prefs', JSON.stringify(S.prefs)); } catch (e) { } };
const bpOf = () => DEVICES[S.device].bp;
const curPage = () => S.project && (S.project.pages.find(p => p.id === S.pageId) || S.project.pages[0]);
const DEFAULT_VARS = { primary: '#6d7cff', secondary: '#a78bfa', background: '#0b0b10', surface: '#15151c', text: '#f1f1f5', muted: '#9a9aa8', border: '#2a2a35' };
function blankProject(name) {
  const pid = uid();
  return { id: 'p' + uid(), name: name || 'Untitled website', created: Date.now(), updated: Date.now(), version: 1, homeId: pid,
    pages: [{ id: pid, name: 'Home', slug: 'index', title: '', desc: '', inNav: true, root: mk('page', { name: 'Page' }) }], assets: [],
    vars: { ...DEFAULT_VARS }, customCSS: '', customJS: '', settings: { font: S.prefs.font || FONTS[0][1], headingFont: '', tabMax: 900, mobMax: 600 } };
}
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
function normalizeProject(raw) {
  if (!isObj(raw) || !Array.isArray(raw.pages) || !raw.pages.length) throw new Error('This file is not a Bappherh Builder project.');
  const p = { id: 'p' + uid(), name: String(raw.name || 'Imported website').slice(0, 120), created: raw.created || Date.now(), updated: Date.now(), version: 1,
    pages: [], assets: [], vars: { ...DEFAULT_VARS }, customCSS: String(raw.customCSS || ''), customJS: String(raw.customJS || ''), settings: { font: FONTS[0][1], headingFont: '', tabMax: 900, mobMax: 600 } };
  if (isObj(raw.vars)) Object.entries(raw.vars).forEach(([k, v]) => { if (/^[\w-]+$/.test(k) && typeof v === 'string') p.vars[k] = v.slice(0, 200); });
  if (isObj(raw.settings)) { const s = raw.settings; if (typeof s.font === 'string') p.settings.font = s.font; if (typeof s.headingFont === 'string') p.settings.headingFont = s.headingFont; if (+s.tabMax > 300) p.settings.tabMax = +s.tabMax; if (+s.mobMax > 200) p.settings.mobMax = +s.mobMax; }
  (Array.isArray(raw.assets) ? raw.assets : []).forEach(a => { if (isObj(a) && /^data:/.test(a.dataUrl || '') && /^[\w-]+$/.test(a.id || '')) p.assets.push({ id: a.id, name: String(a.name || 'image'), type: String(a.type || 'image/png'), w: +a.w || 0, h: +a.h || 0, size: +a.size || 0, dataUrl: a.dataUrl }); });
  const seen = new Set(), slugs = new Set();
  const fix = n => {
    if (!isObj(n)) return null;
    if (!REG[n.type]) n.type = 'container';
    if (typeof n.id !== 'string' || !/^[\w-]+$/.test(n.id) || seen.has(n.id)) n.id = uid();
    seen.add(n.id);
    n.name = String(n.name || REG[n.type].label); n.content = typeof n.content === 'string' ? n.content : ''; n.props = isObj(n.props) ? n.props : {};
    const st = isObj(n.styles) ? n.styles : {}; n.styles = {};
    BPS.forEach(bp => { n.styles[bp] = {}; if (isObj(st[bp])) Object.entries(st[bp]).forEach(([k, v]) => { if (validProp(k) && (typeof v === 'string' || typeof v === 'number')) n.styles[bp][k] = String(v); }); });
    n.hidden = !!n.hidden; n.locked = !!n.locked;
    n.children = (REG[n.type].container && Array.isArray(n.children) ? n.children : []).map(fix).filter(Boolean);
    return n;
  };
  raw.pages.forEach((pg, i) => {
    if (!isObj(pg) || !isObj(pg.root)) return;
    const root = fix(pg.root); root.type = 'page';
    let slug = slugify(pg.slug || pg.name); let s2 = slug, k = 2; while (slugs.has(s2)) s2 = slug + '-' + (k++); slugs.add(s2);
    p.pages.push({ id: /^[\w-]+$/.test(pg.id || '') ? pg.id : uid(), name: String(pg.name || 'Page ' + (i + 1)).slice(0, 80), slug: s2, title: String(pg.title || ''), desc: String(pg.desc || ''), inNav: pg.inNav !== false, root });
  });
  if (!p.pages.length) throw new Error('The project has no valid pages.');
  p.homeId = p.pages.find(x => x.id === raw.homeId) ? raw.homeId : p.pages[0].id;
  return p;
}

/* ---------- node lookup ---------- */
let ixMap = null;
const dirtyIx = () => { ixMap = null; };
function ix() {
  if (ixMap) return ixMap; ixMap = new Map(); const pg = curPage(); if (!pg) return ixMap;
  walk(pg.root, (n, parent, i) => ixMap.set(n.id, { node: n, parent, index: i })); return ixMap;
}
const find = id => ix().get(id) || null;
const selNode = () => S.selId ? (find(S.selId) || {}).node : null;
const isDesc = (anc, id) => { let f = find(id); while (f) { if (f.node.id === anc) return true; f = f.parent ? find(f.parent.id) : null; } return false; };
function setPath(n, path, val) {
  if (path === 'content') n.content = val; else if (path.startsWith('p.')) n.props[path.slice(2)] = val;
}
const getPath = (n, path) => path === 'content' ? n.content : path.startsWith('p.') ? n.props[path.slice(2)] : undefined;
function effStyle(n, bp, prop) { // cascade desktop → tablet → mobile
  let v; for (const b of BPS) { if (n.styles[b][prop] !== undefined && n.styles[b][prop] !== '') v = n.styles[b][prop]; if (b === bp) break; } return v;
}
function inheritedStyle(n, bp, prop) { let v; for (const b of BPS) { if (b === bp) break; if (n.styles[b][prop] !== undefined && n.styles[b][prop] !== '') v = n.styles[b][prop]; } return v; }

/* =====================================================================
   History
   ===================================================================== */
const H = { stack: [], idx: -1, key: '', t: 0 };
const snap = () => { const p = S.project; return JSON.stringify([p.pages, p.vars, p.customCSS, p.customJS, p.settings, p.homeId]); };
function histReset() { H.stack = [snap()]; H.idx = 0; H.key = ''; updateHistUI(); }
function commit(key) {
  dirtyIx();
  const s = snap(); if (s === H.stack[H.idx]) return false;
  const t = Date.now();
  if (key && key === H.key && t - H.t < 900 && H.idx > 0 && H.idx === H.stack.length - 1) H.stack[H.idx] = s;
  else { H.stack.length = H.idx + 1; H.stack.push(s); H.idx++; if (H.stack.length > 120) { H.stack.shift(); H.idx--; } }
  H.key = key || ''; H.t = t; markDirty(); updateHistUI(); return true;
}
function restore(s) {
  const [pages, vars, css, js, settings, home] = JSON.parse(s);
  Object.assign(S.project, { pages, vars, customCSS: css, customJS: js, settings, homeId: home }); dirtyIx();
  if (!S.project.pages.find(p => p.id === S.pageId)) S.pageId = S.project.pages[0].id;
  if (S.selId && !find(S.selId)) S.selId = null;
  refreshAll(); markDirty(); updateHistUI();
}
const undo = () => { if (H.idx > 0) { H.idx--; H.key = ''; restore(H.stack[H.idx]); } };
const redo = () => { if (H.idx < H.stack.length - 1) { H.idx++; H.key = ''; restore(H.stack[H.idx]); } };
function updateHistUI() {
  const u = H.idx > 0, r = H.idx < H.stack.length - 1;
  $('#bUndo').disabled = !u; $('#bRedo').disabled = !r;
  const mu = $('[data-m=undo]'), mr = $('[data-m=redo]'); if (mu) { mu.disabled = !u; mr.disabled = !r; }
}

/* =====================================================================
   Saving
   ===================================================================== */
function setSave(st) {
  const el = $('#saveInd'); el.className = 'sdot' + (st === 'saving' ? ' saving' : st === 'dirty' ? ' dirty' : '');
  el.textContent = st === 'saved' ? 'Saved' : st === 'saving' ? 'Saving...' : 'Unsaved changes';
}
const autosaveDeb = debounce(() => saveNow(true), 900);
function markDirty() { S.dirty = true; setSave('dirty'); if (S.prefs.autosave) autosaveDeb(); }
async function saveNow(silent) {
  if (!S.project) return;
  setSave('saving'); S.project.updated = Date.now();
  try { await Store.put(S.project); Store.touchMeta(S.project); S.dirty = false; setSave('saved'); if (!silent) toast('Project saved'); }
  catch (e) { setSave('dirty'); toast('Could not save: ' + (e.message || e), true); }
}

/* =====================================================================
   Mutations (every one commits to history)
   ===================================================================== */
function refreshStruct(selectId) {
  dirtyIx(); if (selectId !== undefined) S.selId = selectId;
  Canvas.renderAll(); Layers.render(); Inspector.render(); Pages.render(); Overlay.update();
}
function refreshAll() {
  syncChrome(); Canvas.layout(); Canvas.renderAll(); Layers.render(); Inspector.render(); Pages.render(); Assets.render(); Design.render(); Overlay.update(); updateHistUI();
  $('#projName').textContent = S.project ? S.project.name : 'Untitled';
}
function addNode(n, parentId, index, opts = {}) {
  const f = find(parentId); if (!f) return;
  const parent = f.node; if (!REG[parent.type].container) return;
  if (parent.locked) return toast('That layer is locked', true);
  const i = index == null ? parent.children.length : Math.max(0, Math.min(index, parent.children.length));
  parent.children.splice(i, 0, n); commit('add'); refreshStruct(opts.noSelect ? undefined : n.id);
  if (!opts.noSelect) requestAnimationFrame(() => Canvas.reveal(n.id));
}
function addFromPalette(make) {
  const sel = selNode(); let parentId, index;
  if (sel && REG[sel.type].container && !sel.locked) { parentId = sel.id; index = null; }
  else if (sel && sel.type !== 'page') { const f = find(sel.id); parentId = f.parent.id; index = f.index + 1; }
  else { parentId = curPage().root.id; index = null; }
  addNode(make(), parentId, index);
}
function removeNode(id) {
  const f = find(id); if (!f || !f.parent) return;
  if (f.node.locked) return toast('That layer is locked', true);
  f.parent.children.splice(f.index, 1); commit('del');
  const next = f.parent.children[f.index] || f.parent.children[f.index - 1] || (f.parent.type === 'page' ? null : f.parent);
  refreshStruct(next ? next.id : null);
}
function moveNode(id, parentId, index) {
  const f = find(id), t = find(parentId); if (!f || !t || !f.parent) return;
  if (f.node.locked) return toast('That layer is locked', true);
  if (t.node.locked) return toast('The target is locked', true);
  if (id === parentId || isDesc(id, parentId)) return toast("Can't move an element into itself", true);
  if (!REG[t.node.type].container) return;
  f.parent.children.splice(f.index, 1);
  let i = index == null ? t.node.children.length : index; if (f.parent === t.node && f.index < i) i--;
  t.node.children.splice(Math.max(0, Math.min(i, t.node.children.length)), 0, f.node); commit('move'); refreshStruct(id);
}
function shift(id, dir) {
  const f = find(id); if (!f || !f.parent) return; const j = f.index + dir;
  if (j < 0 || j >= f.parent.children.length) return;
  if (f.node.locked) return toast('That layer is locked', true);
  const [n] = f.parent.children.splice(f.index, 1); f.parent.children.splice(j, 0, n); commit('move'); refreshStruct(id); Canvas.reveal(id);
}
function dupNode(id) {
  const f = find(id); if (!f || !f.parent) return; const c = cloneTree(f.node); c.name = f.node.name; c.locked = false;
  f.parent.children.splice(f.index + 1, 0, c); commit('dup'); refreshStruct(c.id); Canvas.reveal(c.id);
}
function copyNode(id) { const f = find(id); if (!f || !f.parent) return; S.clip = clone(f.node); toast('Copied'); }
function pasteNode() {
  if (!S.clip) return toast('Nothing to paste', true);
  const c = cloneTree(S.clip); const sel = selNode();
  if (sel && REG[sel.type].container && !sel.locked) addNode(c, sel.id, null);
  else if (sel && sel.type !== 'page') { const f = find(sel.id); addNode(c, f.parent.id, f.index + 1); }
  else addNode(c, curPage().root.id, null);
}
function setProp(id, path, val, key) { const f = find(id); if (!f) return; setPath(f.node, path, val); commit(key || 'prop:' + path); }
function setStyle(id, bp, prop, val, key) {
  const f = find(id); if (!f) return; const st = f.node.styles[bp];
  if (val === '' || val == null) delete st[prop]; else st[prop] = val;
  commit(key || 'sty:' + bp + prop); Canvas.renderCSS(); Overlay.update();
}
function toggleFlag(id, flag) { const f = find(id); if (!f) return; f.node[flag] = !f.node[flag]; commit('flag'); refreshStruct(); }
function select(id, o = {}) {
  if (id && !find(id)) id = null;
  S.selId = id; Layers.render(); Inspector.render(); Overlay.update();
  if (id && o.reveal) Canvas.reveal(id);
}

/* =====================================================================
   Canvas (sandboxed iframe, JSON → DOM)
   ===================================================================== */
const Canvas = {
  frame: $('#frame'), wrap: $('#frameWrap'), doc: null, ready: false, zoom: 1, editing: null, hoverId: null,
  init() {
    this.frame.addEventListener('load', () => { this.doc = this.frame.contentDocument; this.ready = true; this.bind(); this.layout(); if (S.project) this.renderAll(); });
    this.frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style id="css"></style></head><body></body></html>';
  },
  layout() {
    const st = $('#stage'), dev = DEVICES[S.device], sw = st.clientWidth, sh = st.clientHeight;
    const z = S.zoom === 'fit' ? Math.min(1.25, Math.max(.2, (sw - 24) / dev.w)) : +S.zoom;
    this.zoom = z; const W = Math.round(dev.w * z), h = Math.max(100, sh - 24);
    const x = Math.max(12, Math.round((sw - W) / 2));
    Object.assign(this.wrap.style, { left: x + 'px', top: '12px', width: W + 'px', height: h + 'px' });
    Object.assign(this.frame.style, { width: dev.w + 'px', height: Math.ceil(h / z) + 'px', transform: `scale(${z})` });
    $('#ov').style.width = Math.max(sw, x + W + 12) + 'px';
    const bp = bpOf(); $('#bpChipTx').textContent = `${S.device[0].toUpperCase() + S.device.slice(1)} · ${dev.w}px` + (bp !== 'desktop' ? ` · editing ${bp} styles` : '');
    $('#sbInfo').textContent = Math.round(z * 100) + '%';
    $('#zoomSel').value = S.zoom === 'fit' ? 'fit' : String(+S.zoom);
    $('#sbDev').value = S.device;
    Overlay.update();
  },
  ctx() { return makeCtx(S.project, curPage(), { edit: true }); },
  css(ctx) { const p = S.project; return BASE_CSS + '\n' + tokensCSS(p) + '\n' + elementsCSS(p, ctx, [curPage()]) + '\n' + EDIT_CSS + '\n' + (p.customCSS || ''); },
  renderAll() {
    if (!this.ready || !S.project) return; const pg = curPage(), ctx = this.ctx(), d = this.doc, se = d.scrollingElement, sc = se ? se.scrollTop : 0;
    this.stopEdit(true);
    $('#css', d).textContent = this.css(ctx);
    d.body.className = 'bb-page bb-edit-root el-' + pg.root.id + (S.prefs.grid ? ' bb-grid' : '') + (pg.root.children.length ? '' : ' bb-empty');
    d.body.setAttribute('data-id', pg.root.id);
    d.body.innerHTML = kidsOf(pg.root, ctx); if (se) se.scrollTop = sc;
    $('#stage').style.background = S.prefs.canvasBg || '';
    Overlay.update();
  },
  renderCSS() { if (!this.ready || !S.project) return; $('#css', this.doc).textContent = this.css(this.ctx()); Overlay.update(); },
  node(id) {
    const f = find(id); if (!f || !this.ready) return this.renderAll();
    if (f.parent && ['carousel', 'tabs'].includes(f.parent.type)) return this.renderAll();
    const el = this.doc.querySelector(`[data-id="${id}"]`); if (!el) return this.renderAll();
    const t = this.doc.createElement('template'); t.innerHTML = renderNode(f.node, this.ctx()); const nw = t.content.firstElementChild;
    if (nw) el.replaceWith(nw); this.renderCSS();
  },
  el(id) { return this.ready ? this.doc.querySelector(`[data-id="${id}"]`) : null; },
  reveal(id) { const el = this.el(id); if (!el) return; const r = el.getBoundingClientRect(), vh = this.doc.documentElement.clientHeight; if (r.top < 0 || r.bottom > vh) el.scrollIntoView({ block: 'center' }); Overlay.update(); },
  pointInfo(cx, cy) { // client → iframe coordinates
    const fr = this.frame.getBoundingClientRect(), z = this.zoom; return { x: (cx - fr.left) / z, y: (cy - fr.top) / z, fr };
  },
  bind() {
    const d = this.doc, tgt = e => { const el = e.target.closest ? e.target.closest('[data-id]') : null; return el ? el.dataset.id : null; };
    d.addEventListener('click', e => {
      e.preventDefault(); if (this.editing) { if (this.editing.t.contains(e.target)) return; }
      hideCtx(); select(tgt(e));
    }, true);
    d.addEventListener('dblclick', e => { e.preventDefault(); const id = tgt(e); if (id) { select(id); this.startEdit(id); } });
    d.addEventListener('contextmenu', e => { e.preventDefault(); const id = tgt(e); if (id) { select(id); const fr = this.frame.getBoundingClientRect(); showCtx(fr.left + e.clientX * this.zoom, fr.top + e.clientY * this.zoom); } });
    d.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || D.active) return; const id = tgt(e); if (id !== this.hoverId) { this.hoverId = id; Overlay.hover(); } });
    d.addEventListener('pointerleave', () => { this.hoverId = null; Overlay.hover(); });
    d.addEventListener('scroll', () => Overlay.update(), { passive: true });
    d.addEventListener('dragstart', e => e.preventDefault());
    d.addEventListener('keydown', onKey);
    d.addEventListener('paste', e => { if (this.editing) { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData('text'); d.execCommand('insertText', false, t); } });
  },
  startEdit(id) {
    const f = find(id); if (!f) return; const dfn = REG[f.node.type];
    if (f.node.locked) return toast('That layer is locked', true);
    if (!(dfn.text || dfn.editSel)) { Inspector.focusContent(); return; }
    const el = this.el(id); if (!el) return; const t = dfn.editSel ? el.querySelector(dfn.editSel) : el; if (!t) return;
    this.stopEdit(false);
    t.contentEditable = 'true'; t.focus();
    const r = this.doc.createRange(); r.selectNodeContents(t); const s = this.frame.contentWindow.getSelection(); s.removeAllRanges(); s.addRange(r);
    const orig = t.textContent, key = dfn.editKey || 'content';
    const finish = (cancel) => {
      t.removeEventListener('blur', onBlur); t.removeEventListener('keydown', onK); t.removeAttribute('contenteditable'); this.editing = null;
      const val = cancel ? orig : t.textContent.replace(/\s+/g, ' ').trim();
      if (!cancel && val !== getPath(f.node, key)) { setPath(f.node, key, val); commit('text'); }
      this.node(id); Inspector.render(); Layers.render(); Overlay.update();
    };
    const onBlur = () => finish(false);
    const onK = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); t.blur(); } else if (e.key === 'Escape') { e.stopPropagation(); this.editing.cancel = true; finish(true); } };
    t.addEventListener('blur', onBlur); t.addEventListener('keydown', onK); this.editing = { id, t, finish };
    Overlay.update();
  },
  stopEdit(cancel) { if (this.editing) { const e = this.editing; this.editing = null; e.t.removeAttribute('contenteditable'); } }
};

/* =====================================================================
   Overlay: selection box, handles, floating toolbar, hover
   ===================================================================== */
const Overlay = {
  sel: $('#ovSel'), tool: $('#ovTool'), hov: $('#ovHover'), drop: $('#ovDrop'),
  init() {
    this.tool.innerHTML = `<span class="tl"></span><button data-a="edit" title="Edit">${ico('edit', 16)}</button><button data-a="dup" title="Duplicate">${ico('copy', 16)}</button><button data-a="up" title="Move up">${ico('up', 16)}</button><button data-a="down" title="Move down">${ico('down', 16)}</button><button data-a="del" title="Delete">${ico('trash', 16)}</button><button data-a="move" title="Drag to move" style="touch-action:none">${ico('grip', 16)}</button>`;
    this.tool.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !S.selId) return; const a = b.dataset.a, id = S.selId;
      if (a === 'edit') { const dd = REG[find(id).node.type]; if (dd.text || dd.editSel) Canvas.startEdit(id); else { openSheet('right'); Inspector.focusContent(); } }
      else if (a === 'dup') dupNode(id); else if (a === 'up') shift(id, -1); else if (a === 'down') shift(id, 1); else if (a === 'del') removeNode(id);
    });
    this.tool.addEventListener('pointerdown', e => {
      const b = e.target.closest('button[data-a=move]'); if (!b || !S.selId) return; e.preventDefault();
      const f = find(S.selId); if (!f || !f.parent) return; if (f.node.locked) return toast('That layer is locked', true);
      beginDrag(e, { kind: 'move', id: S.selId }, f.node.name, { immediate: true });
    });
    $$('.h', this.sel).forEach(h => h.addEventListener('pointerdown', e => this.startResize(e, h.dataset.h)));
    $('#stage').addEventListener('scroll', () => this.update());
  },
  box(el) { const r = el.getBoundingClientRect(), fr = Canvas.frame.getBoundingClientRect(), st = $('#stage'), sr = st.getBoundingClientRect(), z = Canvas.zoom; return { l: fr.left - sr.left + st.scrollLeft + r.left * z, t: fr.top - sr.top + r.top * z, w: r.width * z, h: r.height * z }; },
  place(node, b) { Object.assign(node.style, { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' }); },
  hover() {
    const id = Canvas.hoverId, el = id && id !== S.selId ? Canvas.el(id) : null;
    if (!el || id === (curPage() && curPage().root.id)) { this.hov.hidden = true; return; }
    this.hov.hidden = false; this.place(this.hov, this.box(el));
  },
  update: raf(() => Overlay._u()),
  _u() {
    this.hover();
    const pg = curPage(), el = S.selId && Canvas.ready ? Canvas.el(S.selId) : null;
    if (!el || !pg || S.selId === pg.root.id) { this.sel.hidden = true; this.tool.hidden = true; return; }
    const b = this.box(el); if (b.w < 1 && b.h < 1) { this.sel.hidden = true; this.tool.hidden = true; return; }
    const f = find(S.selId), locked = f && f.node.locked, editing = !!Canvas.editing;
    this.sel.hidden = false; this.place(this.sel, b); $$('.h', this.sel).forEach(h => h.hidden = !!locked || editing);
    this.sel.style.borderStyle = locked ? 'dashed' : 'solid';
    this.tool.hidden = editing; if (editing) return;
    $('.tl', this.tool).textContent = (f ? f.node.name : '') + (locked ? ' (locked)' : '');
    $$('button', this.tool).forEach(x => { x.hidden = ['up', 'down', 'dup', 'del', 'move'].includes(x.dataset.a) && !(f && f.parent); });
    const st = $('#stage'), tw = this.tool.offsetWidth, th = this.tool.offsetHeight;
    let top = b.t - th - 6; if (top < 2) top = Math.min(b.t + 6, st.clientHeight - th - 4);
    const left = Math.max(st.scrollLeft + 4, Math.min(b.l + b.w - tw, st.scrollLeft + st.clientWidth - tw - 4));
    this.tool.style.left = Math.max(2, left) + 'px'; this.tool.style.top = Math.max(2, top) + 'px';
  },
  showDrop(ind) {
    if (!ind) { this.drop.hidden = true; return; } const el = this.drop; el.hidden = false; el.className = ind.box ? 'box' : ''; this.place(el, ind);
  },
  startResize(e, dir) {
    e.preventDefault(); e.stopPropagation(); const id = S.selId, f = find(id), el = Canvas.el(id); if (!f || !el || f.node.locked) return;
    const bp = bpOf(), z = Canvas.zoom, r0 = el.getBoundingClientRect(), par = el.parentElement, cs = par ? getComputedStyle(par) : null;
    const pw = par ? par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) : r0.width;
    const sx = e.clientX, sy = e.clientY, snapOn = S.prefs.snap; let pend = false;
    const apply = ev => {
      const dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z, st = f.node.styles[bp];
      if (dir.includes('e')) { let w = Math.max(24, r0.width + dx), pct = Math.round(w / pw * 100); if (snapOn) pct = Math.round(pct / 5) * 5; st.width = Math.max(5, Math.min(100, pct)) + '%'; }
      if (dir.includes('s')) { let h = Math.max(16, r0.height + dy); if (snapOn) h = Math.round(h / 8) * 8; st.height = Math.round(h) + 'px'; }
      if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; Canvas.renderCSS(); }); }
    };
    const up = () => { window.removeEventListener('pointermove', apply); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); commit('resize'); Canvas.renderCSS(); Inspector.render(); };
    window.addEventListener('pointermove', apply); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
};

/* =====================================================================
   Drag & drop engine (pointer based: works with mouse and touch)
   ===================================================================== */
const D = { active: null, just: false, scroller: null };
document.addEventListener('touchmove', e => { if (D.active) e.preventDefault(); }, { passive: false });
function beginDrag(ev, src, label, opts = {}) {
  const sx = ev.clientX, sy = ev.clientY, touch = ev.pointerType === 'touch'; let started = false, timer = null, lx = sx, ly = sy, dead = false;
  const ghost = $('#ghost');
  const start = () => {
    started = true; D.active = { src, label, target: null }; ghost.textContent = label; ghost.hidden = false; document.body.style.userSelect = 'none';
    if (opts.closeSheets !== false) closeSheets(); hideCtx(); upd(lx, ly);
  };
  const upd = (cx, cy) => {
    ghost.style.left = cx + 'px'; ghost.style.top = cy + 'px';
    const t = dropTarget(cx, cy, src); D.active.target = t; drawTarget(t);
    const fr = Canvas.frame.getBoundingClientRect(); clearInterval(D.scroller);
    if (cx > fr.left && cx < fr.right && Canvas.ready) {
      const dy = cy < fr.top + 48 ? -14 : cy > fr.bottom - 48 ? 14 : 0;
      if (dy && cy > fr.top - 20 && cy < fr.bottom + 20) D.scroller = setInterval(() => { Canvas.doc.scrollingElement.scrollTop += dy; drawTarget(dropTarget(lx, ly, src)); }, 30);
    }
  };
  const move = e => {
    lx = e.clientX; ly = e.clientY;
    if (!started) { const dist = Math.hypot(lx - sx, ly - sy); if (touch) { if (dist > 10) cleanup(); } else if (dist > 5) start(); return; }
    upd(lx, ly);
  };
  const cleanup = () => { dead = true; clearTimeout(timer); clearInterval(D.scroller); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); };
  const cancel = () => { cleanup(); end(); };
  const end = () => { if (started) { ghost.hidden = true; document.body.style.userSelect = ''; drawTarget(null); D.just = true; setTimeout(() => D.just = false, 350); D.active = null; } };
  const up = () => {
    const t = started && D.active ? D.active.target : null; cleanup();
    if (started) { end(); if (t) performDrop(src, t); }
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel);
  if (opts.immediate) start(); else if (touch) timer = setTimeout(() => { if (!dead) start(); }, 280);
}
function axisRow(node) { // are the children laid out side by side?
  const els = node.children.map(c => Canvas.el(c.id)).filter(Boolean); if (els.length < 2) return false;
  const a = els[0].getBoundingClientRect(), b = els[1].getBoundingClientRect(); return Math.abs(a.top - b.top) < 6 && b.left > a.left + 2;
}
function validParent(n, src) {
  if (!REG[n.type].container || n.locked) return false;
  if (src.kind === 'move' && (n.id === src.id || isDesc(src.id, n.id))) return false;
  return true;
}
function dropTarget(cx, cy, src) {
  const fr = Canvas.frame.getBoundingClientRect(), stR = $('#stage').getBoundingClientRect();
  const over = document.elementFromPoint(cx, cy);
  if (over && over.closest('#lp-layers .lrow')) return layersTarget(over.closest('.lrow'), cy, src);
  if (!Canvas.ready || cx < fr.left || cx > fr.right || cy < fr.top || cy > fr.bottom || cx < stR.left || cx > stR.right || cy < stR.top || cy > stR.bottom) return null;
  const { x, y } = Canvas.pointInfo(cx, cy); const pg = curPage();
  let el = Canvas.doc.elementFromPoint(x, y), t = el && el.closest ? el.closest('[data-id]') : null;
  let f = t ? find(t.dataset.id) : find(pg.root.id); if (!f) f = find(pg.root.id);
  // climb out of locked or self-contained targets
  while (f && f.parent && src.kind === 'move' && (f.node.id === src.id || isDesc(src.id, f.node.id))) f = find(f.parent.id);
  if (!f) return null;
  const mkT = (parent, index) => ({ kind: 'canvas', parentId: parent.id, index, ind: indicator(parent, index) });
  const dom = Canvas.el(f.node.id) || Canvas.doc.body, r = dom.getBoundingClientRect();
  if (validParent(f.node, src)) {
    const edge = Math.min(10, r.height * .2);
    if (f.parent && f.node.id !== pg.root.id && (y - r.top < edge || r.bottom - y < edge) && validParent(f.parent, src)) return mkT(f.parent, f.index + (y - r.top < edge ? 0 : 1));
    return mkT(f.node, childIndex(f.node, x, y, src));
  }
  // leaf: insert before / after
  let p = f.parent; if (!p) return null; let pf = find(p.id);
  while (pf && !validParent(pf.node, src)) pf = pf.parent ? find(pf.parent.id) : null;
  if (!pf) return null;
  if (pf.node === p) { const row = axisRow(p), before = row ? x < r.left + r.width / 2 : y < r.top + r.height / 2; return mkT(p, f.index + (before ? 0 : 1)); }
  return mkT(pf.node, childIndex(pf.node, x, y, src));
}
function childIndex(node, x, y, src) {
  const row = axisRow(node); let idx = node.children.length;
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]; if (src.kind === 'move' && c.id === src.id) { continue; }
    const e = Canvas.el(c.id); if (!e) continue; const r = e.getBoundingClientRect();
    const before = y < r.top || (y <= r.bottom && (row ? x < r.left + r.width / 2 : y < r.top + r.height / 2));
    if (before) { idx = i; break; }
  }
  return idx;
}
function indicator(parent, index) {
  const pe = Canvas.el(parent.id) || Canvas.doc.body, kids = parent.children;
  if (!kids.length) return { ...Overlay.box(pe), box: true };
  const row = axisRow(parent); const ref = kids[index] || kids[kids.length - 1], re = Canvas.el(ref.id);
  if (!re) return { ...Overlay.box(pe), box: true };
  const b = Overlay.box(re), after = !kids[index];
  if (row) return { l: after ? b.l + b.w + 2 : b.l - 4, t: b.t, w: 3, h: b.h };
  return { l: b.l, t: after ? b.t + b.h + 1 : b.t - 2, w: b.w, h: 3 };
}
function layersTarget(row, cy, src) {
  const id = row.dataset.lid, f = find(id); if (!f) return null; const r = row.getBoundingClientRect(), q = (cy - r.top) / r.height;
  const okIn = validParent(f.node, src), canSib = f.parent && validParent(f.parent, src);
  let mode = q < .28 ? 'before' : q > .72 ? 'after' : 'inside';
  if (mode === 'inside' && !okIn) mode = q < .5 ? 'before' : 'after';
  if (mode !== 'inside' && !canSib) { if (okIn) mode = 'inside'; else return null; }
  if (mode === 'inside') return { kind: 'layers', row, mode, parentId: f.node.id, index: f.node.children.length };
  return { kind: 'layers', row, mode, parentId: f.parent.id, index: f.index + (mode === 'after' ? 1 : 0) };
}
let lastRow = null;
function drawTarget(t) {
  if (lastRow) { lastRow.classList.remove('dt-before', 'dt-after', 'dt-inside'); lastRow = null; }
  if (!t) { Overlay.showDrop(null); return; }
  if (t.kind === 'layers') { Overlay.showDrop(null); lastRow = t.row; t.row.classList.add('dt-' + t.mode); } else Overlay.showDrop(t.ind);
}
function performDrop(src, t) {
  if (src.kind === 'new') addNode(src.make(), t.parentId, t.index); else moveNode(src.id, t.parentId, t.index);
}
/* =====================================================================
   Palette (element library)
   ===================================================================== */
const PRESETS = { hero: () => hero(), features: () => features(), testimonials: () => testimonials(), pricing: () => pricing(), faq: () => faq(), team: () => team(), gallery: () => gallery() };
const PALETTE = [
  ['Layout', [['section', 'Section', 'layers'], ['container', 'Container', 'box'], ['grid', 'Grid', 'grid'], ['flex', 'Flexbox', 'layout'], ['columns', 'Columns', 'layout'], ['spacer', 'Spacer', 'minus']]],
  ['Basic', [['heading', 'Heading', 'pen'], ['paragraph', 'Paragraph', 'edit'], ['text', 'Text', 'pen'], ['button', 'Button', 'play'], ['link', 'Link', 'external'], ['image', 'Image', 'image'], ['video', 'Video', 'play'], ['icon', 'Icon', 'star'], ['divider', 'Divider', 'minus']]],
  ['Navigation', [['navbar', 'Navbar', 'menu'], ['sidebar', 'Sidebar', 'layout'], ['breadcrumbs', 'Breadcrumbs', 'arrow'], ['tabs', 'Tabs', 'layout'], ['footer', 'Footer', 'layout']]],
  ['Content', [['card', 'Card', 'box'], ['hero', 'Hero section', 'star'], ['features', 'Features', 'bolt'], ['testimonials', 'Testimonials', 'heart'], ['pricing', 'Pricing table', 'cart'], ['faq', 'FAQ', 'book'], ['team', 'Team section', 'user'], ['gallery', 'Gallery', 'camera']]],
  ['Forms', [['input', 'Input', 'edit'], ['textarea', 'Textarea', 'edit'], ['select', 'Select', 'down'], ['checkbox', 'Checkbox', 'check'], ['radio', 'Radio group', 'check'], ['form', 'Form', 'mail'], ['submit', 'Submit button', 'play']]],
  ['Advanced', [['modal', 'Modal', 'box'], ['accordion', 'Accordion', 'layers'], ['carousel', 'Carousel', 'image'], ['dropdown', 'Dropdown', 'down'], ['countdown', 'Countdown', 'clock'], ['alert', 'Alert', 'shield'], ['toast', 'Toast', 'bolt'], ['html', 'Custom HTML', 'code']]]
];
IC.menu = 'M4 7h16M4 12h16M4 17h16';
const makerFor = k => PRESETS[k] || (() => X(k));
const Palette = {
  el: $('#lp-elements'), q: '',
  render() {
    const q = this.q.toLowerCase();
    let h = `<div class="pal-search"><input type="text" id="palQ" placeholder="Search elements" value="${esc(this.q)}" autocomplete="off"></div>`;
    PALETTE.forEach(([cat, items]) => {
      const list = items.filter(i => !q || i[1].toLowerCase().includes(q) || cat.toLowerCase().includes(q)); if (!list.length) return;
      h += `<div class="pal-cat">${cat.toUpperCase()}</div><div class="pal-grid">` + list.map(([k, l, ic]) => `<button class="pal-item" data-k="${k}" data-l="${esc(l)}">${ico(ic, 16)}<span>${esc(l)}</span></button>`).join('') + '</div>';
    });
    h += '<div class="hint" style="padding:10px 12px 16px">Tap an element to add it, or drag it onto the canvas. Touch devices: press and hold, then drag.</div>';
    this.el.innerHTML = h;
  },
  init() {
    this.render();
    this.el.addEventListener('input', e => { if (e.target.id === 'palQ') { this.q = e.target.value; const pos = e.target.selectionStart; this.render(); const i = $('#palQ'); i.focus(); i.setSelectionRange(pos, pos); } });
    this.el.addEventListener('pointerdown', e => { const b = e.target.closest('.pal-item'); if (!b || e.button > 0) return; beginDrag(e, { kind: 'new', make: makerFor(b.dataset.k) }, b.dataset.l); });
    this.el.addEventListener('click', e => {
      const b = e.target.closest('.pal-item'); if (!b || D.just) return;
      addFromPalette(makerFor(b.dataset.k)); toast('Added ' + b.dataset.l); if (isMobile()) closeSheets();
    });
  }
};
const isMobile = () => matchMedia('(max-width:900px)').matches;

/* =====================================================================
   Layers
   ===================================================================== */
const Layers = {
  el: $('#lp-layers'),
  render() {
    if (!S.project) return; const pg = curPage(); if (!pg) return;
    const rows = []; const rec = (n, depth) => {
      const d = REG[n.type], isRoot = n.id === pg.root.id, kids = n.children.length, open = !S.collapsed.has(n.id);
      rows.push(`<div class="lrow${S.selId === n.id ? ' sel' : ''}${n.hidden ? ' dim' : ''}" data-lid="${n.id}" style="padding-left:${depth * 14 + 2}px">
        <span class="tg" data-tg>${kids ? `<span style="display:inline-block;transform:rotate(${open ? 90 : 0}deg);transition:transform .1s">${ico('right', 12)}</span>` : ''}</span>
        ${isRoot ? '<span style="width:20px"></span>' : `<span class="grip" data-grip title="Drag to reorder">${ico('grip', 14)}</span>`}
        <span class="nm" data-nm>${esc(n.name)}</span><span class="ty">${esc(d.label)}</span>
        ${isRoot ? '' : `<span class="act"><button class="lyr-btn" data-a="ren" title="Rename">${ico('edit', 14)}</button><button class="lyr-btn" data-a="dup" title="Duplicate">${ico('copy', 14)}</button><button class="lyr-btn" data-a="up" title="Move up">${ico('up', 14)}</button><button class="lyr-btn" data-a="down" title="Move down">${ico('down', 14)}</button><button class="lyr-btn" data-a="del" title="Delete">${ico('trash', 14)}</button></span>
        <button class="lyr-btn" data-a="eye" title="${n.hidden ? 'Show' : 'Hide'}">${ico(n.hidden ? 'eyeoff' : 'eye', 14)}</button><button class="lyr-btn" data-a="lock" title="${n.locked ? 'Unlock' : 'Lock'}" style="${n.locked ? 'color:var(--warn)' : ''}">${ico(n.locked ? 'lock' : 'unlock', 14)}</button>`}
      </div>`);
      if (open) n.children.forEach(c => rec(c, depth + 1));
    };
    rec(pg.root, 0);
    const st = this.el.scrollTop;
    this.el.innerHTML = `<div class="pane-pad" style="padding:6px">${rows.join('')}</div>`; this.el.scrollTop = st;
  },
  init() {
    const el = this.el;
    el.addEventListener('click', e => {
      const row = e.target.closest('.lrow'); if (!row) return; const id = row.dataset.lid;
      const a = e.target.closest('[data-a]'), tg = e.target.closest('[data-tg]');
      if (tg) { S.collapsed.has(id) ? S.collapsed.delete(id) : S.collapsed.add(id); return this.render(); }
      if (a) {
        e.stopPropagation(); const k = a.dataset.a;
        if (k === 'eye') toggleFlag(id, 'hidden'); else if (k === 'lock') toggleFlag(id, 'locked'); else if (k === 'dup') dupNode(id);
        else if (k === 'up') shift(id, -1); else if (k === 'down') shift(id, 1); else if (k === 'del') removeNode(id); else if (k === 'ren') this.rename(id);
        return;
      }
      select(id, { reveal: true }); if (isMobile()) closeSheets();
    });
    el.addEventListener('dblclick', e => { const nm = e.target.closest('[data-nm]'); if (nm) this.rename(nm.closest('.lrow').dataset.lid); });
    el.addEventListener('pointerdown', e => {
      const g = e.target.closest('[data-grip]'); if (!g) return; e.preventDefault(); const id = g.closest('.lrow').dataset.lid, f = find(id);
      if (!f || f.node.locked) return toast('That layer is locked', true);
      beginDrag(e, { kind: 'move', id }, f.node.name, { immediate: true, closeSheets: false });
    });
  },
  rename(id) {
    const f = find(id); if (!f) return; const row = $(`.lrow[data-lid="${id}"] .nm`, this.el); if (!row) return;
    row.innerHTML = `<input type="text" value="${esc(f.node.name)}" maxlength="60">`; const inp = $('input', row); inp.focus(); inp.select();
    const done = ok => { if (ok && inp.value.trim()) { f.node.name = inp.value.trim(); commit('rename'); } this.render(); Overlay.update(); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(true); else if (e.key === 'Escape') done(false); });
    inp.addEventListener('blur', () => done(true)); inp.addEventListener('click', e => e.stopPropagation());
  }
};

/* =====================================================================
   Pages
   ===================================================================== */
const uniqueSlug = (slug, exceptId) => { const used = new Set(S.project.pages.filter(p => p.id !== exceptId).map(p => p.slug)); let s = slugify(slug), k = 2, b = s; while (used.has(s)) s = b + '-' + (k++); return s; };
function switchPage(id) { if (!S.project.pages.find(p => p.id === id)) return; S.pageId = id; S.selId = null; dirtyIx(); refreshAll(); }
const Pages = {
  el: $('#lp-pages'),
  render() {
    if (!S.project) return; const p = S.project;
    this.el.innerHTML = `<div class="pane-pad"><button class="btn pri" data-a="add" style="width:100%;justify-content:center;margin-bottom:10px">${ico('plus', 16)} New page</button>` +
      p.pages.map(pg => `<div class="item${pg.id === S.pageId ? ' on' : ''}" data-pid="${pg.id}"><div class="t" data-a="go" style="cursor:pointer"><b>${esc(pg.name)} ${pg.id === p.homeId ? '<span class="badge">Home</span>' : ''}</b><small>/${pg.id === p.homeId ? 'index' : esc(pg.slug)}.html${pg.inNav === false ? ' · hidden from nav' : ''}</small></div>
        <button class="ib sm" data-a="set" title="Page settings">${ico('sliders', 15)}</button><button class="ib sm" data-a="dup" title="Duplicate">${ico('copy', 15)}</button><button class="ib sm" data-a="home" title="Set as homepage">${ico('home', 15)}</button><button class="ib sm" data-a="del" title="Delete">${ico('trash', 15)}</button></div>`).join('') + '</div>';
  },
  init() {
    this.el.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]'); if (!a) return; const it = a.closest('.item'), id = it && it.dataset.pid, k = a.dataset.a, p = S.project;
      if (k === 'add') { const name = await askText('New page', '', 'Page name', 'Create'); if (name) this.add(name); }
      else if (k === 'go') { switchPage(id); if (isMobile()) closeSheets(); }
      else if (k === 'set') this.settings(id);
      else if (k === 'dup') this.dup(id);
      else if (k === 'home') { p.homeId = id; commit('home'); refreshStruct(); toast('Homepage updated'); }
      else if (k === 'del') {
        if (p.pages.length < 2) return toast('A website needs at least one page', true);
        if (await askConfirm('Delete page', 'This permanently removes the page and its content.')) {
          p.pages = p.pages.filter(x => x.id !== id); if (p.homeId === id) p.homeId = p.pages[0].id; if (S.pageId === id) S.pageId = p.homeId; S.selId = null; commit('delpage'); dirtyIx(); refreshAll();
        }
      }
    });
  },
  add(name) {
    const p = S.project, pg = { id: uid(), name, slug: uniqueSlug(name), title: '', desc: '', inNav: true, root: mk('page', { name: 'Page' }) };
    p.pages.push(pg); S.pageId = pg.id; S.selId = null; commit('addpage'); dirtyIx(); refreshAll();
  },
  dup(id) {
    const p = S.project, src = p.pages.find(x => x.id === id), root = cloneTree(src.root), name = src.name + ' copy';
    const pg = { id: uid(), name, slug: uniqueSlug(name), title: src.title, desc: src.desc, inNav: src.inNav, root }; p.pages.splice(p.pages.indexOf(src) + 1, 0, pg);
    S.pageId = pg.id; S.selId = null; commit('duppage'); dirtyIx(); refreshAll();
  },
  settings(id) {
    const p = S.project, pg = p.pages.find(x => x.id === id), home = pg.id === p.homeId;
    const d = dlg({ title: 'Page settings', body: `<div class="f"><label>Name</label><input type="text" id="psN" value="${esc(pg.name)}"></div>
      <div class="f"><label>URL</label><div class="row"><input type="text" id="psS" value="${home ? 'index' : esc(pg.slug)}"${home ? ' disabled' : ''}><span class="hint">.html</span></div></div>
      <div class="f"><label>Title tag</label><input type="text" id="psT" value="${esc(pg.title)}" placeholder="${esc(pg.name + ' · ' + p.name)}"></div>
      <div class="f"><label>Description</label><textarea id="psD" rows="2">${esc(pg.desc)}</textarea></div>
      <div class="f"><label>In navigation</label><input type="checkbox" id="psV"${pg.inNav !== false ? ' checked' : ''}></div>`,
      actions: [{ label: 'Cancel' }, { label: 'Save', kind: 'pri', fn: () => { const n = $('#psN', d.body).value.trim(); if (!n) return false; pg.name = n; if (!home) pg.slug = uniqueSlug($('#psS', d.body).value || n, pg.id); pg.title = $('#psT', d.body).value.trim(); pg.desc = $('#psD', d.body).value.trim(); pg.inNav = $('#psV', d.body).checked; commit('pageset'); refreshStruct(); } }] });
  }
};

/* =====================================================================
   Assets
   ===================================================================== */
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that image')); i.src = src; });
async function processImage(file) {
  const type = file.type || 'image/png'; let dataUrl = await readFile(file), w = 0, h = 0, size = file.size;
  const img = await loadImg(dataUrl); w = img.naturalWidth || 300; h = img.naturalHeight || 150;
  if (!['image/svg+xml', 'image/gif'].includes(type) && (w > 1920 || file.size > 1.5e6)) {
    const sc = Math.min(1, 1920 / w), c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const out = type === 'image/png' ? 'image/png' : 'image/jpeg';
    dataUrl = c.toDataURL(out, .86); w = c.width; h = c.height; size = Math.round(dataUrl.length * .75); return { dataUrl, w, h, size, type: out };
  }
  return { dataUrl, w, h, size, type };
}
const Assets = {
  el: $('#lp-assets'),
  render() {
    if (!S.project) return; const as = S.project.assets;
    this.el.innerHTML = `<div class="pane-pad"><button class="btn pri" data-a="up" style="width:100%;justify-content:center;margin-bottom:10px">${ico('plus', 16)} Upload images</button>` +
      (as.length ? `<div class="agrid">${as.map(a => `<div class="acard" data-aid="${a.id}"><div class="th"><img src="${a.dataUrl}" alt="${esc(a.name)}" loading="lazy"></div><div class="meta"><b>${esc(a.name)}</b>${a.w}×${a.h} · ${fmtBytes(a.size)}</div><div class="row"><button data-a="use" title="Use in selected element">${ico('check', 15)}</button><button data-a="ren" title="Rename">${ico('edit', 15)}</button><button data-a="url" title="Copy image URL">${ico('copy', 15)}</button><button data-a="del" title="Delete">${ico('trash', 15)}</button></div></div>`).join('')}</div>` : `<div class="empty"><b>No images yet</b>Upload PNG, JPG, GIF, WebP or SVG files to use them in your pages.</div>`) + '</div>';
  },
  async add(files) {
    const out = [];
    for (const f of files) {
      if (!/^image\/(png|jpe?g|gif|webp|svg\+xml|avif|bmp|x-icon)$/.test(f.type)) { toast(`${f.name}: unsupported image type`, true); continue; }
      try { const r = await processImage(f); const a = { id: uid(), name: f.name, ...r }; S.project.assets.push(a); out.push(a); } catch (e) { toast(`${f.name}: ${e.message}`, true); }
    }
    if (out.length) { markDirty(); this.render(); toast(out.length + (out.length > 1 ? ' images added' : ' image added')); }
    return out;
  },
  used(id) { return S.project.pages.some(pg => JSON.stringify(pg.root).includes('asset:' + id)); },
  use(id) {
    const n = selNode(); if (!n) return toast('Select an element first', true);
    if (n.type === 'image') { setProp(n.id, 'p.src', 'asset:' + id); Canvas.node(n.id); Inspector.render(); }
    else { setStyle(n.id, bpOf(), 'background-image', `url(asset:${id})`); if (!n.styles[bpOf()]['background-size']) setStyle(n.id, bpOf(), 'background-size', 'cover'); setStyle(n.id, bpOf(), 'background-position', 'center'); Inspector.render(); }
    toast('Image applied'); if (isMobile()) closeSheets();
  },
  pick() {
    return new Promise(res => {
      let chosen = null; const as = S.project.assets;
      const d = dlg({ title: 'Image library', wide: true, onClose: () => res(chosen), body: `<button class="btn" id="lbUp">${ico('plus', 16)} Upload new image</button>` + (as.length ? `<div class="agrid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${as.map(a => `<button class="acard" data-aid="${a.id}" style="text-align:left"><div class="th"><img src="${a.dataUrl}" alt=""></div><div class="meta"><b>${esc(a.name)}</b>${a.w}×${a.h}</div></button>`).join('')}</div>` : '<div class="empty"><b>Library is empty</b>Upload an image to get started.</div>') });
      d.body.addEventListener('click', async e => {
        const c = e.target.closest('.acard'); if (c) { chosen = c.dataset.aid; return d.close(); }
        if (e.target.closest('#lbUp')) { const fs = await pickFile('image/*', false); if (fs.length) { const r = await Assets.add(fs); if (r[0]) { chosen = r[0].id; d.close(); } } }
      });
    });
  },
  init() {
    this.el.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a, card = a.closest('.acard'), id = card && card.dataset.aid, as = S.project.assets, it = as.find(x => x.id === id);
      if (k === 'up') { const fs = await pickFile('image/*', true); if (fs.length) await this.add(fs); }
      else if (k === 'use') this.use(id);
      else if (k === 'ren') { const nm = await askText('Rename image', it.name, 'File name'); if (nm) { it.name = nm; markDirty(); this.render(); } }
      else if (k === 'url') { const m = assetMap(S.project); copyText('assets/' + m[id]); }
      else if (k === 'del') {
        const msg = this.used(id) ? 'This image is used on a page. Deleting it will leave a placeholder there.' : 'This image will be removed from the project.';
        if (await askConfirm('Delete image', msg)) { S.project.assets = as.filter(x => x.id !== id); markDirty(); this.render(); Canvas.renderAll(); Inspector.render(); }
      }
    });
  }
};

/* =====================================================================
   Design tokens & fonts
   ===================================================================== */
const Design = {
  el: $('#lp-design'),
  render() {
    if (!S.project) return; const p = S.project, std = new Set(TOKENS.map(t => t[0])), custom = Object.keys(p.vars).filter(k => !std.has(k));
    const fopts = (v) => FONTS.map(f => `<option value="${esc(f[1])}"${f[1] === v ? ' selected' : ''}>${esc(f[0])}</option>`).join('');
    const row = (k, label, del) => `<div class="tokrow"><span title="--${k}">${esc(label)}</span><input type="color" data-v="${k}" value="${toHex(p.vars[k])}"><input type="text" data-v="${k}" value="${esc(p.vars[k])}">${del ? `<button class="ib sm" data-del="${k}" title="Delete variable">${ico('x', 14)}</button>` : ''}</div>`;
    this.el.innerHTML = `<div class="pane-pad"><div class="pal-cat" style="padding:0 0 8px">DESIGN TOKENS</div>${TOKENS.map(([k, l]) => row(k, l)).join('')}
      ${custom.length ? '<div class="pal-cat" style="padding:10px 0 8px">CUSTOM VARIABLES</div>' + custom.map(k => row(k, '--' + k, true)).join('') : ''}
      <div class="pal-cat" style="padding:10px 0 6px">ADD VARIABLE</div>
      <div class="tokrow"><input type="text" id="tvN" placeholder="name e.g. accent" style="flex:1"><input type="text" id="tvV" placeholder="#ff7a00" style="flex:1"><button class="btn sm" id="tvA">Add</button></div>
      <div class="pal-cat" style="padding:10px 0 6px">TYPOGRAPHY</div>
      <div class="f col" style="margin-bottom:8px"><label>Body font</label><select id="fBody">${fopts(p.settings.font)}</select></div>
      <div class="f col"><label>Heading font</label><select id="fHead"><option value="">Same as body</option>${fopts(p.settings.headingFont)}</select></div>
      <div class="pal-cat" style="padding:14px 0 6px">GENERATED CSS</div><pre style="margin:0;padding:10px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;overflow:auto;font:11px/1.5 var(--mono);color:var(--dim)">${esc(tokensCSS(p))}</pre></div>`;
  },
  init() {
    const el = this.el;
    el.addEventListener('input', e => {
      const k = e.target.dataset.v; if (!k) return; const v = e.target.value.trim(); S.project.vars[k] = v; commit('var:' + k);
      $$(`[data-v="${k}"]`, el).forEach(i => { if (i !== e.target) i.value = i.type === 'color' ? toHex(v) : v; }); Canvas.renderCSS();
      const pre = $('pre', el); if (pre) pre.textContent = tokensCSS(S.project);
    });
    el.addEventListener('change', e => {
      if (e.target.id === 'fBody') { S.project.settings.font = e.target.value; commit('font'); Canvas.renderCSS(); this.render(); }
      if (e.target.id === 'fHead') { S.project.settings.headingFont = e.target.value; commit('font'); Canvas.renderCSS(); this.render(); }
    });
    el.addEventListener('click', e => {
      const del = e.target.closest('[data-del]'); if (del) { delete S.project.vars[del.dataset.del]; commit('vardel'); Canvas.renderCSS(); this.render(); Inspector.render(); return; }
      if (e.target.id === 'tvA') {
        const n = $('#tvN', el).value.trim().toLowerCase().replace(/^-+/, '').replace(/[^a-z0-9-]+/g, '-'), v = $('#tvV', el).value.trim();
        if (!/^[a-z][a-z0-9-]*$/.test(n) || !v) return toast('Enter a name (letters, numbers, dashes) and a value', true);
        if (n === 'font' || n === 'font-heading') return toast('That name is reserved', true);
        S.project.vars[n] = v; commit('varadd'); Canvas.renderCSS(); this.render(); Inspector.render();
      }
    });
  }
};
const _cc = document.createElement('canvas').getContext('2d');
function toHex(v) {
  v = String(v || '').trim(); const m = /^var\(--([\w-]+)\)$/.exec(v); if (m && S.project && S.project.vars[m[1]]) v = S.project.vars[m[1]];
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase(); if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(c => c + c).join('').toLowerCase();
  _cc.fillStyle = '#000000'; _cc.fillStyle = v; const r = _cc.fillStyle; return /^#[0-9a-f]{6}$/i.test(r) ? r : '#000000';
}

/* =====================================================================
   Inspector
   ===================================================================== */
const opts = (list, v) => { let found = false; const h = list.map(x => { const [a, b] = Array.isArray(x) ? x : [x, x]; if (a === v) found = true; return `<option value="${esc(a)}"${a === v ? ' selected' : ''}>${esc(b)}</option>`; }).join(''); return h + (v && !found ? `<option value="${esc(v)}" selected>${esc(v)}</option>` : ''); };
const frow = (label, inner, col) => `<div class="f${col ? ' col' : ''}"><label>${esc(label)}</label>${inner}</div>`;
const grp = (title, body, open = true) => `<details class="grp"${open ? ' open' : ''}><summary>${esc(title)}</summary><div class="gb">${body}</div></details>`;
function sty(n, bp, prop, label, o = {}) {
  const own = n.styles[bp][prop] ?? '', inh = inheritedStyle(n, bp, prop) ?? '';
  if (o.color) {
    const cur = own || inh || ''; const chips = TOKENS.concat(Object.keys(S.project.vars).filter(k => !TOKENS.find(t => t[0] === k)).map(k => [k, k])).map(([k]) => `<button class="chip" data-tok="${prop}" data-v="var(--${k})" title="--${k}" style="background:${esc(S.project.vars[k])}"></button>`).join('');
    return frow(label, `<div style="display:grid;gap:6px"><div class="row"><input type="color" data-s="${prop}" value="${toHex(cur || '#000000')}"><input type="text" data-s="${prop}" value="${esc(own)}" placeholder="${esc(inh || 'none')}"><button class="ib sm" data-clr="${prop}" title="Clear">${ico('x', 14)}</button></div><div class="chips">${chips}</div></div>`, true);
  }
  if (o.opts) return frow(label, `<select data-s="${prop}"><option value="">${inh ? esc('inherit: ' + inh) : 'default'}</option>${opts(o.opts, own)}</select>`);
  if (o.range) return frow(label, `<div class="row"><input type="range" min="0" max="1" step=".05" data-s="${prop}" value="${own !== '' ? own : inh !== '' ? inh : 1}"><button class="ib sm" data-clr="${prop}" title="Reset">${ico('x', 14)}</button></div>`);
  return frow(label, `<input type="text" data-s="${prop}" value="${esc(own)}" placeholder="${esc(inh || o.ph || '')}"${o.list ? ` list="${o.list}"` : ''} autocomplete="off">`);
}
const DISPLAYS = ['block', 'flex', 'inline-flex', 'grid', 'inline-block', 'inline', 'none'];
const Inspector = {
  body: $('#rbody'),
  focusContent() { S.rtab = 'content'; this.render(); if (isMobile()) openSheet('right'); const i = $('input[type=text],textarea', this.body); if (i && !isMobile()) i.focus(); },
  render() {
    const body = this.body; if (!S.project) return;
    $$('#rtabs button').forEach(b => b.classList.toggle('on', b.dataset.rt === S.rtab));
    $$('#rBp button').forEach(b => b.classList.toggle('on', b.dataset.dev === bpOf()));
    const bp = bpOf(), bar = $('#rBpBar'); bar.className = 'bpbar' + (bp !== 'desktop' ? ' alt' : '');
    bar.textContent = bp === 'desktop' ? 'Editing desktop styles (base). Tablet and mobile inherit from it.' : `Editing ${bp} styles — applied at ≤ ${bpMax(S.project, bp)}px, overriding desktop.`;
    const n = selNode(), root = curPage().root;
    if (!n) { $('#rTitle').textContent = 'Inspector'; body.innerHTML = `<div class="empty"><b>Nothing selected</b>Tap or click an element on the canvas, or pick one in Layers, to edit its properties.<div style="margin-top:12px"><button class="btn sm" data-act="selroot">Edit page styles</button></div></div>`; return; }
    const d = REG[n.type]; $('#rTitle').innerHTML = `${esc(n.name)} <small style="color:var(--faint);font-weight:400">${esc(d.label)}</small>`;
    let h = '';
    if (S.rtab === 'content') h = this.content(n, d); else if (S.rtab === 'layout') h = this.layout(n, bp); else if (S.rtab === 'style') h = this.style(n, bp); else h = this.resp(n);
    const st = body.scrollTop; body.innerHTML = h; body.scrollTop = st;
  },
  content(n, d) {
    let h = ''; const bp = bpOf();
    if (n.type === 'page') return `<div class="empty"><b>Page canvas</b>Use the Layout and Style tabs to set the page background, text color and fonts. Manage page names and URLs in the Pages panel.</div>`;
    if (n.type === 'navlinks') return `<div class="empty"><b>Automatic navigation</b>These links are generated from your pages. Rename pages or hide them from navigation in the Pages panel.</div>` + grp('Typography', this.typo(n, bp));
    let main = '';
    if (d.text && !d.fields?.some(f => f.k === 'content')) main += frow('Text', `<textarea data-p="content" rows="3">${esc(n.content)}</textarea>`, true);
    (d.fields || []).forEach(f => main += this.field(n, f, bp));
    if (main) h += grp('Content', main);
    if (d.typo) h += grp('Typography', this.typo(n, bp));
    h += grp('Advanced', frow('Layer name', `<input type="text" data-name value="${esc(n.name)}" maxlength="60">`) + frow('HTML id', `<input type="text" data-p="p.htmlId" value="${esc(n.props.htmlId || '')}" placeholder="e.g. pricing (for #links)">`), false);
    return h;
  },
  typo(n, bp) {
    return sty(n, bp, 'font-family', 'Font', { list: 'fontlist', ph: 'inherit' }) + sty(n, bp, 'font-size', 'Size', { ph: 'e.g. 1.25rem' }) +
      sty(n, bp, 'font-weight', 'Weight', { opts: [['300', 'Light 300'], ['400', 'Regular 400'], ['500', 'Medium 500'], ['600', 'Semibold 600'], ['700', 'Bold 700'], ['800', 'Extra bold 800']] }) +
      sty(n, bp, 'text-align', 'Align', { opts: ['left', 'center', 'right', 'justify'] }) + sty(n, bp, 'line-height', 'Line height', { ph: '1.5' }) + sty(n, bp, 'letter-spacing', 'Letter spacing', { ph: '0.02em' });
  },
  field(n, f, bp) {
    if (f.t === 'btn') return `<button class="btn sm" data-act="${f.act}">${esc(f.l)}</button>`;
    if (f.t === 'sty') return sty(n, bp, f.s, f.l, f.o ? { opts: f.o } : {});
    const v = getPath(n, f.k) ?? '', k = esc(f.k);
    if (f.t === 'sel') return frow(f.l, `<select data-p="${k}">${opts(f.o, String(v))}</select>`);
    if (f.t === 'area') return frow(f.l, `<textarea data-p="${k}" rows="${f.tall ? 8 : 4}"${f.tall ? ' style="font-family:var(--mono);font-size:12px"' : ''}>${esc(v)}</textarea>`, true);
    if (f.t === 'chk') return frow(f.l, `<input type="checkbox" data-p="${k}"${v ? ' checked' : ''}>`);
    if (f.t === 'dt') return frow(f.l, `<input type="datetime-local" data-p="${k}" value="${esc(v)}">`);
    if (f.t === 'link') return frow(f.l, `<div style="display:grid;gap:6px"><input type="text" data-p="${k}" value="${esc(v.startsWith('page:') ? '' : v)}" placeholder="https://… or #section" autocomplete="off"><select data-pagelink="${k}"><option value="">Link to a page…</option>${S.project.pages.map(p => `<option value="page:${p.id}"${v === 'page:' + p.id ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>`, true);
    if (f.t === 'img') {
      const src = String(v), shown = src.startsWith('data:') ? '' : src, prev = src.startsWith('asset:') ? ((S.project.assets.find(a => a.id === src.slice(6)) || {}).dataUrl || '') : src;
      return frow(f.l, `<div style="display:grid;gap:6px">${prev ? `<img src="${esc(prev)}" alt="" style="width:100%;max-height:110px;object-fit:contain;background:var(--panel3);border-radius:6px">` : ''}<input type="text" data-p="${k}" value="${esc(shown)}" placeholder="Paste an image URL" autocomplete="off"><div class="row"><button class="btn sm" data-act="upload" data-k="${k}" style="flex:1">Upload</button><button class="btn sm" data-act="lib" data-k="${k}" style="flex:1">Library</button></div></div>`, true);
    }
    return frow(f.l, `<input type="text" data-p="${k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}" autocomplete="off">`);
  },
  layout(n, bp) {
    const s = (p, l, o) => sty(n, bp, p, l, o);
    return grp('Size', s('width', 'Width', { ph: 'auto, 50%, 20rem' }) + s('height', 'Height', { ph: 'auto' }) + s('min-width', 'Min width') + s('max-width', 'Max width', { ph: 'none' }) + s('min-height', 'Min height')) +
      grp('Spacing', s('padding', 'Padding', { ph: '1rem 1.5rem' }) + s('margin', 'Margin', { ph: '0 auto' })) +
      grp('Display & position', s('display', 'Display', { opts: DISPLAYS }) + s('position', 'Position', { opts: ['static', 'relative', 'absolute', 'fixed', 'sticky'] }) + s('top', 'Top') + s('left', 'Left') + s('z-index', 'Z-index') + s('overflow', 'Overflow', { opts: ['visible', 'hidden', 'auto', 'scroll'] })) +
      grp('Flexbox', s('flex-direction', 'Direction', { opts: ['row', 'column', 'row-reverse', 'column-reverse'] }) + s('flex-wrap', 'Wrap', { opts: ['nowrap', 'wrap'] }) + s('justify-content', 'Justify', { opts: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] }) + s('align-items', 'Align items', { opts: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] }) + s('gap', 'Gap', { ph: '1rem' }) + s('flex', 'Flex (item)', { ph: '1 1 280px' }) + s('align-self', 'Align self', { opts: ['auto', 'flex-start', 'center', 'flex-end', 'stretch'] }), false) +
      grp('CSS Grid', s('grid-template-columns', 'Columns', { ph: 'repeat(3, 1fr)' }) + s('grid-template-rows', 'Rows') + s('grid-column', 'Column span', { ph: 'span 2' }), false);
  },
  style(n, bp) {
    const s = (p, l, o) => sty(n, bp, p, l, o), bg = n.styles[bp]['background-image'] || '', um = /^url\(["']?(.*?)["']?\)$/.exec(bg), cur = n.styles[bp];
    const lg = /linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/.exec(cur['background-image'] || '');
    const shadows = [['', 'default'], ['none', 'None'], ['0 1px 3px rgba(0,0,0,.25)', 'Small'], ['0 6px 20px rgba(0,0,0,.28)', 'Medium'], ['0 18px 48px rgba(0,0,0,.4)', 'Large'], ['0 0 0 1px var(--border)', 'Outline']];
    return grp('Background', s('background-color', 'Color', { color: true }) +
      frow('Image', `<div style="display:grid;gap:6px"><input type="text" data-bgurl value="${esc(um && !um[1].startsWith('asset:') && !um[1].startsWith('data:') ? um[1] : '')}" placeholder="Image URL"><div class="row"><button class="btn sm" data-act="bgup" style="flex:1">Upload</button><button class="btn sm" data-act="bglib" style="flex:1">Library</button><button class="ib sm" data-clr="background-image" title="Remove">${ico('x', 14)}</button></div></div>`, true) +
      s('background-size', 'Size', { opts: ['cover', 'contain', 'auto', '100% 100%'] }) + s('background-position', 'Position', { opts: ['center', 'top', 'bottom', 'left', 'right'] })) +
      grp('Gradient', frow('From', `<input type="color" data-g="a" value="${toHex(lg ? lg[2].trim() : '#6d7cff')}">`) + frow('To', `<input type="color" data-g="b" value="${toHex(lg ? lg[3].trim() : '#a78bfa')}">`) + frow('Angle', `<input type="range" min="0" max="360" data-g="deg" value="${lg ? lg[1] : 135}">`) + `<div class="hint">Moving a control applies the gradient as the background image.</div>`, false) +
      grp('Text', s('color', 'Text color', { color: true })) +
      grp('Border', s('border-width', 'Width', { ph: '1px' }) + s('border-style', 'Style', { opts: ['none', 'solid', 'dashed', 'dotted', 'double'] }) + s('border-color', 'Color', { color: true }) + s('border-radius', 'Radius', { ph: '12px' })) +
      grp('Effects', frow('Shadow', `<select data-s="box-shadow">${opts(shadows, cur['box-shadow'] || '')}</select>`) + s('box-shadow', 'Custom shadow', { ph: '0 4px 12px #0003' }) + s('opacity', 'Opacity', { range: true }));
  },
  resp(n) {
    const rows = [['font-size', 'Font size'], ['display', 'Display'], ['flex-direction', 'Direction'], ['grid-template-columns', 'Grid cols'], ['width', 'Width'], ['padding', 'Padding'], ['gap', 'Gap'], ['text-align', 'Align']];
    const sel = { display: DISPLAYS, 'flex-direction': ['row', 'column'], 'text-align': ['left', 'center', 'right'] };
    let h = `<div class="rtable" style="font-weight:600;color:var(--text)"><span></span><span>Desktop</span><span>Tablet</span><span>Mobile</span></div>`;
    h += rows.map(([p, l]) => `<div class="rtable"><span>${l}</span>` + BPS.map(bp => { const v = n.styles[bp][p] ?? '', inh = inheritedStyle(n, bp, p) ?? ''; return sel[p] ? `<select data-rs="${p}" data-rbp="${bp}"><option value="">${esc(inh || '—')}</option>${opts(sel[p], v)}</select>` : `<input type="text" data-rs="${p}" data-rbp="${bp}" value="${esc(v)}" placeholder="${esc(inh)}">`; }).join('') + '</div>').join('');
    return `<div class="pane-pad" style="display:grid;gap:8px"><div class="hint">Set a different value per screen size. Empty cells inherit from the larger screen. Example: font size 64px → 48px → 34px. Choose “none” for Display to hide an element on one device.</div>${h}<div class="hint">Tablet applies at ≤ ${bpMax(S.project, 'tablet')}px, mobile at ≤ ${bpMax(S.project, 'mobile')}px.</div></div>`;
  },
  init() {
    const body = this.body;
    $('#rtabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { S.rtab = b.dataset.rt; this.render(); } });
    $('#rBp').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setDevice(b.dataset.dev); });
    const sync = t => { const p = t.dataset.s; $$(`[data-s="${p}"]`, body).forEach(i => { if (i !== t && i.tagName === 'INPUT') i.value = i.type === 'color' ? toHex(t.value) : t.value; }); if (t.type === 'color') { const tx = $(`input[type=text][data-s="${p}"]`, body); if (tx) tx.value = t.value; } };
    const grad = () => {
      const a = $('[data-g=a]', body).value, b = $('[data-g=b]', body).value, deg = $('[data-g=deg]', body).value, n = selNode();
      setStyle(n.id, bpOf(), 'background-image', `linear-gradient(${deg}deg, ${a}, ${b})`, 'grad');
    };
    body.addEventListener('input', e => {
      const t = e.target, n = selNode(); if (!n) return; const bp = bpOf();
      if (t.dataset.s !== undefined) { setStyle(n.id, bp, t.dataset.s, t.value.trim(), 's:' + t.dataset.s + bp); sync(t); }
      else if (t.dataset.rs) setStyle(n.id, t.dataset.rbp, t.dataset.rs, t.value.trim(), 'r:' + t.dataset.rs + t.dataset.rbp);
      else if (t.dataset.p) { const v = t.type === 'checkbox' ? t.checked : t.value; setProp(n.id, t.dataset.p, v, 'p:' + t.dataset.p); Canvas.node(n.id); if (t.dataset.p === 'p.items' || t.dataset.p === 'p.titles') Overlay.update(); }
      else if (t.dataset.name !== undefined) { n.name = t.value; commit('rename'); Layers.render(); Overlay.update(); }
      else if (t.dataset.g) grad();
      else if (t.dataset.bgurl !== undefined) { const v = t.value.trim(); setStyle(n.id, bp, 'background-image', v ? `url("${v.replace(/["()\\]/g, '')}")` : '', 'bgurl'); if (v && !n.styles[bp]['background-size']) setStyle(n.id, bp, 'background-size', 'cover', 'bgs'); }
    });
    body.addEventListener('change', e => {
      const t = e.target, n = selNode(); if (!n) return;
      if (t.dataset.pagelink) { setProp(n.id, t.dataset.pagelink, t.value || '#'); Canvas.node(n.id); this.render(); }
      else if (t.dataset.rs || t.dataset.g || t.dataset.s !== undefined) { if (t.dataset.s === 'box-shadow' || t.tagName === 'SELECT') this.render(); }
    });
    body.addEventListener('click', async e => {
      const n = selNode(); const b = e.target.closest('[data-act],[data-clr],[data-tok]'); if (!b) return;
      if (b.dataset.act === 'selroot') return select(curPage().root.id);
      if (!n) return; const bp = bpOf();
      if (b.dataset.clr) { setStyle(n.id, bp, b.dataset.clr, ''); return this.render(); }
      if (b.dataset.tok) { setStyle(n.id, bp, b.dataset.tok, b.dataset.v); return this.render(); }
      const act = b.dataset.act, k = b.dataset.k;
      if (act === 'upload' || act === 'bgup') { const fs = await pickFile('image/*', false); if (!fs.length) return; const r = await Assets.add(fs); if (r[0]) this.useAsset(n, act === 'upload' ? k : null, r[0].id); }
      else if (act === 'lib' || act === 'bglib') { const id = await Assets.pick(); if (id) this.useAsset(n, act === 'lib' ? k : null, id); }
      else if (act === 'addTab') { const t = lines(n.props.titles); const name = 'Tab ' + (t.length + 1); n.props.titles = t.concat(name).join('\n'); n.children.push(tabPanel(name)); commit('addtab'); refreshStruct(n.id); }
    });
  },
  useAsset(n, key, id) {
    if (key) { setProp(n.id, key, 'asset:' + id); Canvas.node(n.id); }
    else { const bp = bpOf(); setStyle(n.id, bp, 'background-image', `url(asset:${id})`); if (!n.styles[bp]['background-size']) setStyle(n.id, bp, 'background-size', 'cover'); if (!n.styles[bp]['background-position']) setStyle(n.id, bp, 'background-position', 'center'); }
    this.render();
  }
};
/* =====================================================================
   Section builders (used by palette presets and templates)
   ===================================================================== */
const CENTER = { 'text-align': 'center' };
function wrapSec(name, kids, s) { return X('section', { name, s, k: [X('container', { k: kids.filter(Boolean) })] }); }
function secHead(title, sub) {
  return [X('heading', { c: title, s: CENTER }), sub ? X('paragraph', { c: sub, s: { 'text-align': 'center', margin: '.75rem auto 0' } }) : null];
}
function hero(o = {}) {
  const center = !o.img, al = center ? 'center' : 'flex-start';
  const txt = X('container', { name: 'Hero text', s: { display: 'flex', 'flex-direction': 'column', gap: '1.25rem', 'align-items': al, 'text-align': center ? 'center' : 'left', margin: '0', 'max-width': 'none' }, k: [
    X('heading', { c: o.title || 'A better way to build your next idea', p: { level: '1' }, s: { 'font-size': 'clamp(2.25rem,7vw,4rem)', 'line-height': '1.05', 'letter-spacing': '-0.03em' } }),
    X('paragraph', { c: o.sub || 'Explain what you do in one or two sentences. Keep it specific and easy to scan.', s: { 'font-size': 'clamp(1rem,2.4vw,1.2rem)', margin: center ? '0 auto' : '0' } }),
    X('flex', { name: 'Buttons', s: { 'justify-content': center ? 'center' : 'flex-start' }, k: [X('button', { c: o.cta || 'Get started', p: { href: o.href || '#' } }), o.cta2 ? X('button', { c: o.cta2, p: { variant: 'outline', href: o.href2 || '#' } }) : null].filter(Boolean) })] });
  const body = o.img ? X('grid', { name: 'Hero layout', s: { 'grid-template-columns': 'repeat(auto-fit,minmax(min(100%,320px),1fr))', 'align-items': 'center', gap: 'clamp(1.5rem,5vw,3.5rem)' }, k: [txt, X('image', { p: { src: o.img, alt: o.alt || '' }, s: { 'aspect-ratio': o.ratio || '4 / 3' } })] }) : txt;
  return X('section', { name: 'Hero', s: { padding: 'clamp(3rem,10vw,7rem) 1.25rem', ...(o.bg ? { background: o.bg } : {}) }, k: [X('container', { k: [body] })] });
}
function features(o = {}) {
  const items = o.items || [['bolt', 'Fast by default', 'Pages load quickly on any device, even on slow connections.'], ['shield', 'Reliable', 'Built on simple, proven web standards that keep working.'], ['globe', 'Reach everyone', 'Responsive layouts adapt to phones, tablets and desktops.']];
  return wrapSec(o.name || 'Features', [...secHead(o.title || 'Everything you need to launch', o.sub),
    X('grid', { s: { 'margin-top': '2.5rem' }, k: items.map(([ic, t, d]) => X('card', { name: t, k: [X('icon', { p: { icon: ic } }), X('heading', { c: t, p: { level: '3' }, s: { 'font-size': '1.2rem' } }), X('paragraph', { c: d })] })) })]);
}
function cardsSec(o = {}) {
  return wrapSec(o.name || 'Cards', [...secHead(o.title || 'Latest', o.sub), X('grid', { s: { 'margin-top': '2.5rem' }, k: (o.items || []).map(it => X('card', { name: it.title, k: [
    X('image', { p: { src: it.img, alt: it.title } }), X('heading', { c: it.title, p: { level: '3' }, s: { 'font-size': '1.2rem' } }),
    it.price ? X('text', { c: it.price, s: { 'font-weight': '700', color: 'var(--primary)', 'font-size': '1.1rem' } }) : null, X('paragraph', { c: it.text }),
    it.btn ? X('button', { c: it.btn, p: { variant: 'outline', href: it.href || '#' }, s: { 'align-self': 'flex-start' } }) : null].filter(Boolean) })) })]);
}
function testimonials(o = {}) {
  const items = o.items || [['The new site took an afternoon to set up and our enquiries doubled within a month.', 'Amara Cole', 'Owner, Cole & Daughters'], ['Clear, quick and exactly what we asked for. Our customers keep complimenting it.', 'Tomas Reyes', 'Operations lead'], ['I edit everything myself now, from my phone. No more waiting on developers.', 'Priya Nair', 'Founder']];
  return wrapSec('Testimonials', [...secHead(o.title || 'What people say'), X('grid', { s: { 'margin-top': '2.5rem' }, k: items.map(([q, n, r]) => X('card', { name: n, k: [X('paragraph', { c: '“' + q + '”', s: { color: 'var(--text)', 'font-size': '1.05rem' } }), X('text', { c: n, s: { 'font-weight': '700' } }), X('text', { c: r, s: { color: 'var(--muted)', 'font-size': '.9rem' } })] })) })]);
}
function pricing(o = {}) {
  const plans = o.plans || [['Starter', '$0', 'For trying things out', ['1 website', 'Community support', 'Basic templates'], 'Start free', false], ['Pro', '$19', 'For growing projects', ['Unlimited pages', 'Custom domain', 'Priority support'], 'Choose Pro', true], ['Team', '$49', 'For teams and agencies', ['Everything in Pro', '5 collaborators', 'Client handoff'], 'Contact us', false]];
  return wrapSec('Pricing', [...secHead(o.title || 'Simple, honest pricing', o.sub), X('grid', { s: { 'margin-top': '2.5rem', 'align-items': 'stretch' }, k: plans.map(([nm, pr, ds, fs, cta, feat]) => X('card', { name: nm, s: feat ? { 'border-color': 'var(--primary)', 'border-width': '2px' } : {}, k: [
    X('heading', { c: nm, p: { level: '3' }, s: { 'font-size': '1.2rem' } }), X('heading', { c: pr, p: { level: '2' }, s: { 'font-size': '2.5rem' } }), X('paragraph', { c: ds }),
    ...fs.map(f => X('paragraph', { c: '✓ ' + f, s: { color: 'var(--text)' } })), X('button', { c: cta, p: { variant: feat ? 'primary' : 'outline', href: o.href || '#' }, s: { 'margin-top': 'auto', 'align-self': 'stretch' } })] })) })]);
}
function faq(o = {}) {
  const items = o.items || [['How do I get started?', 'Create a project, pick a template and start editing. Nothing to install.'], ['Can I use my own domain?', 'Yes. Export your site and host it anywhere you like.'], ['Is there a free plan?', 'Yes, you can build and publish a basic site for free.']];
  return wrapSec('FAQ', [...secHead(o.title || 'Frequently asked questions'), X('accordion', { s: { 'margin-top': '2rem', 'max-width': '760px', 'margin-left': 'auto', 'margin-right': 'auto' }, k: items.map(([q, a]) => accItem(q, a)) })]);
}
function team(o = {}) {
  const items = o.items || [['Jordan Lee', 'Founder', '#3b3b6b', '#6d7cff'], ['Sam Okafor', 'Design lead', '#5b3b6b', '#c06dff'], ['Mia Chen', 'Engineer', '#2f5b6b', '#4fd1c5'], ['Luis Ortega', 'Support', '#6b4a3b', '#ff9a6d']];
  return wrapSec('Team', [...secHead(o.title || 'Meet the team'), X('grid', { s: { 'margin-top': '2.5rem' }, k: items.map(([n, r, a, b]) => X('card', { name: n, s: { 'align-items': 'center', 'text-align': 'center' }, k: [X('image', { p: { src: ph(300, 300, a, b, n.split(' ').map(w => w[0]).join('')), alt: n }, s: { width: '96px', 'aspect-ratio': '1 / 1', 'border-radius': '50%' } }), X('heading', { c: n, p: { level: '3' }, s: { 'font-size': '1.1rem' } }), X('text', { c: r, s: { color: 'var(--muted)' } })] })) })]);
}
function gallery(o = {}) {
  const cs = o.colors || [['#2a2a40', '#6d7cff'], ['#40302a', '#ff9a6d'], ['#233b36', '#4fd1c5'], ['#3b2a40', '#c06dff'], ['#2a3a40', '#6dc7ff'], ['#40382a', '#ffd36d']];
  return wrapSec('Gallery', [...secHead(o.title || 'Gallery', o.sub), X('grid', { s: { 'margin-top': '2.5rem', 'grid-template-columns': 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '1rem' }, k: cs.map((c, i) => X('image', { p: { src: ph(800, 600, c[0], c[1], (o.labels || [])[i] || ''), alt: (o.labels || [])[i] || 'Gallery image ' + (i + 1) }, s: { 'aspect-ratio': '4 / 3' } })) })]);
}
function split(o = {}) {
  const t = X('container', { name: 'Text', s: { display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'flex-start', margin: '0', 'max-width': 'none' }, k: [X('heading', { c: o.title }), X('paragraph', { c: o.text }), o.btn ? X('button', { c: o.btn, p: { href: o.href || '#', variant: 'outline' } }) : null].filter(Boolean) });
  const im = X('image', { p: { src: o.img, alt: o.alt || '' }, s: { 'aspect-ratio': '4 / 3' } });
  return wrapSec(o.name || 'About', [X('grid', { s: { 'grid-template-columns': 'repeat(auto-fit,minmax(min(100%,320px),1fr))', 'align-items': 'center', gap: 'clamp(1.5rem,5vw,3.5rem)' }, k: o.reverse ? [im, t] : [t, im] })]);
}
function ctaSec(o = {}) {
  return X('section', { name: 'Call to action', s: { padding: '2rem 1.25rem clamp(3rem,8vw,5rem)' }, k: [X('container', { k: [X('container', { name: 'CTA band', s: { background: 'var(--surface)', border: '1px solid var(--border)', 'border-radius': '20px', padding: 'clamp(2rem,6vw,3.5rem)', 'text-align': 'center', display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '1rem', 'max-width': 'none' }, k: [X('heading', { c: o.title || 'Ready to begin?' }), X('paragraph', { c: o.sub || 'Tell us what you need and we will get back to you within a day.', s: { margin: '0 auto' } }), X('button', { c: o.btn || 'Get in touch', p: { href: o.href || '#' } })] })] })] });
}
function contactSec(o = {}) {
  const info = (o.info || []).map(([ic, tx]) => X('flex', { name: tx, s: { 'flex-wrap': 'nowrap', 'align-items': 'flex-start' }, k: [X('icon', { p: { icon: ic }, s: { 'font-size': '1.3rem' } }), X('text', { c: tx })] }));
  return wrapSec('Contact', [X('grid', { s: { 'grid-template-columns': 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(1.5rem,5vw,3.5rem)' }, k: [
    X('container', { name: 'Details', s: { margin: '0', display: 'flex', 'flex-direction': 'column', gap: '1rem', 'max-width': 'none' }, k: [X('heading', { c: o.title || 'Contact us' }), X('paragraph', { c: o.sub || 'Send a message and we will reply soon.' }), ...info] }), X('form')] })]);
}
function pageHead(t, s) { return X('section', { name: 'Page header', s: { padding: 'clamp(2.5rem,8vw,5rem) 1.25rem 1rem' }, k: [X('container', { k: [X('heading', { c: t, p: { level: '1' }, s: { 'font-size': 'clamp(2rem,6vw,3.25rem)' } }), s ? X('paragraph', { c: s, s: { 'margin-top': '.75rem' } }) : null].filter(Boolean) })] }); }
function navBar(brand, cta) { return X('navbar', { k: [X('text', { name: 'Brand', c: brand, s: { 'font-weight': '700', 'font-size': '1.25rem' } }), mk('navlinks'), X('button', { c: cta, p: { href: '@contact' } })] }); }
function footBar(brand, tag) { return X('footer', { k: [X('text', { c: '© 2026 ' + brand }), X('text', { c: tag, s: { color: 'var(--muted)' } })] }); }

/* =====================================================================
   Templates (real, editable projects)
   ===================================================================== */
const TPLS = [
  { id: 'portfolio', name: 'Portfolio', desc: 'Designer showcase with selected work', brand: 'Ife Adeyemi', cta: 'Hire me', tag: 'Product designer based in Lagos',
    vars: { background: '#0e0e10', surface: '#17171b', text: '#f4f1ea', muted: '#a09d94', border: '#2b2a2e', primary: '#ff6a3d', secondary: '#ffb199' }, font: FONTS[2][1], hfont: FONTS[2][1],
    home: () => [hero({ title: 'I design calm, clear products for busy people.', sub: 'Product designer with eight years of experience in fintech and health apps. Currently booking projects for autumn.', cta: 'See selected work', href: '#work', cta2: 'Say hello', href2: '@contact' }),
      Object.assign(gallery({ title: 'Selected work', labels: ['Ledger app', 'Clinic booking', 'Travel planner', 'Design system', 'Savings tool', 'Recipe box'], colors: [['#2b1d17', '#ff6a3d'], ['#1d2b2a', '#3dd6c4'], ['#1f1d2b', '#8a7dff'], ['#2b2717', '#ffd23d'], ['#17252b', '#3d9dff'], ['#2b171f', '#ff3d7d']] }), { props: { htmlId: 'work' } }),
      split({ title: 'How I work', text: 'I start with a week of listening: customers, support logs and the people who build the product. Then I sketch fast, test early and hand over a system your team can keep extending.', img: ph(800, 600, '#2b2a2e', '#ff6a3d', 'Studio'), alt: 'Studio desk', btn: 'Read my story', href: '@about' }),
      testimonials({ title: 'Kind words' }), ctaSec({ title: 'Have a project in mind?', btn: 'Start a conversation', href: '@contact' })],
    extra: [['About', 'about', () => [pageHead('About', 'Designer, mentor and occasional potter.'), split({ title: 'Hello, I am Ife', text: 'I grew up fixing radios with my uncle and never lost the habit of opening things up to see how they work. Today I help teams make software that feels as simple as it looks.', img: ph(800, 600, '#2b2a2e', '#ffb199', 'Portrait'), alt: 'Portrait' })]]] },
  { id: 'saas', name: 'SaaS landing page', desc: 'Pricing, features and FAQ for a software product', brand: 'Loomstack', cta: 'Start free', tag: 'Workflow automation for small teams',
    vars: { background: '#ffffff', surface: '#f6f7fb', text: '#0f172a', muted: '#566074', border: '#e3e6ee', primary: '#4f46e5', secondary: '#818cf8' }, font: FONTS[0][1], hfont: FONTS[0][1],
    home: () => [hero({ title: 'Automate the busywork. Keep the human parts.', sub: 'Loomstack connects your forms, spreadsheets and chat so routine tasks finish themselves.', cta: 'Start free', href: '@contact', cta2: 'See pricing', href2: '#pricing', img: ph(900, 680, '#4f46e5', '#a5b4fc', 'Dashboard'), alt: 'Product dashboard' }),
      features({ title: 'Built for teams that move fast', items: [['bolt', 'Instant triggers', 'Start a workflow the moment a form is submitted or a row changes.'], ['shield', 'Safe by design', 'Role-based access and a full audit trail for every run.'], ['chart', 'Clear reporting', 'See what saved time and what needs attention in one view.']] }),
      Object.assign(pricing({ href: '@contact' }), { props: { htmlId: 'pricing' } }), faq(), ctaSec({ title: 'Your first workflow takes ten minutes', btn: 'Create a free account', href: '@contact' })], extra: [] },
  { id: 'restaurant', name: 'Restaurant', desc: 'Menu highlights, story and opening hours', brand: 'Ember & Salt', cta: 'Book a table', tag: 'Wood-fired kitchen · Open Tue–Sun',
    vars: { background: '#15100c', surface: '#201813', text: '#f6ece0', muted: '#b4a290', border: '#35291f', primary: '#e0a43f', secondary: '#c4572f' }, font: FONTS[2][1], hfont: FONTS[2][1],
    home: () => [hero({ title: 'Fire, salt and seasonal produce.', sub: 'A neighbourhood kitchen cooking over open flame. Small plates, big flavours, good company.', cta: 'Book a table', href: '@contact', cta2: 'See the menu', href2: '#menu', img: ph(900, 700, '#3a2414', '#e0a43f', 'Ember & Salt'), alt: 'The dining room' }),
      Object.assign(cardsSec({ title: 'From the menu', sub: 'Changes with the market, so ask what is fresh today.', items: [{ img: ph(700, 500, '#3a2414', '#c4572f', 'Flatbread'), title: 'Charred flatbread', price: '£7', text: 'Whipped ricotta, wild honey and thyme.' }, { img: ph(700, 500, '#2a3a1e', '#9ccf5a', 'Greens'), title: 'Embered greens', price: '£9', text: 'Smoked almond, lemon and aged pecorino.' }, { img: ph(700, 500, '#3a1e1e', '#e05a4f', 'Short rib'), title: 'Short rib', price: '£22', text: 'Slow-cooked for twelve hours, served with burnt onion.' }] }), { props: { htmlId: 'menu' } }),
      split({ title: 'Our story', text: 'Ember & Salt began as weekend suppers in a tiny flat. Today we still cook everything over wood and buy from growers within fifty miles.', img: ph(800, 600, '#35291f', '#e0a43f', 'Kitchen'), reverse: true, alt: 'Chefs at the grill' }), testimonials({ title: 'Guests say' })],
    extra: [['Contact', 'contact', () => [pageHead('Reservations', 'Tell us when you would like to visit.'), contactSec({ title: 'Find us', sub: 'Walk-ins welcome, bookings recommended at weekends.', info: [['pin', '12 Harbour Row, Brighton'], ['clock', 'Tue–Thu 5–10pm · Fri–Sun 12–11pm'], ['phone2', '01273 555 0142']] })]]] },
  { id: 'perfume', name: 'Perfume store', desc: 'Boutique fragrance shop with product cards', brand: 'Maison Noor', cta: 'Shop now', tag: 'Small-batch fragrance since 2016',
    vars: { background: '#f7f1ee', surface: '#ffffff', text: '#2a1c1c', muted: '#7d6a68', border: '#e7d9d4', primary: '#7a2e3b', secondary: '#c9a24b' }, font: FONTS[2][1], hfont: FONTS[2][1],
    home: () => [hero({ title: 'Scents with a story.', sub: 'Hand-blended in small batches from oud, saffron and rose absolute. Find the one that feels like you.', cta: 'Explore the collection', href: '#shop', img: ph(800, 900, '#7a2e3b', '#e0b3a5', 'Maison Noor'), alt: 'Perfume bottle', ratio: '4 / 5' }),
      Object.assign(cardsSec({ title: 'The collection', items: [{ img: ph(700, 700, '#4a1d27', '#c9a24b', 'Oud Nuit'), title: 'Oud Nuit', price: '$128', text: 'Smoked oud, black pepper, amber.', btn: 'Add to bag' }, { img: ph(700, 700, '#7a2e3b', '#f2c1c1', 'Rose Aube'), title: 'Rose Aube', price: '$112', text: 'Dewy rose, pink pepper, white musk.', btn: 'Add to bag' }, { img: ph(700, 700, '#8a6a2b', '#f4e1a3', 'Safran'), title: 'Safran Doré', price: '$120', text: 'Saffron, cardamom, warm vanilla.', btn: 'Add to bag' }] }), { props: { htmlId: 'shop' } }),
      split({ title: 'Made slowly, on purpose', text: 'Every bottle is blended, rested for six weeks and filled by hand in our Marseille workshop.', img: ph(800, 600, '#c9a24b', '#7a2e3b', 'Atelier'), alt: 'Atelier' }), testimonials({ title: 'Loved by our customers' }), ctaSec({ title: 'Not sure where to start?', sub: 'Order a discovery set of five 2 ml samples.', btn: 'Get the discovery set', href: '@contact' })], extra: [] },
  { id: 'business', name: 'Business website', desc: 'Services, team and enquiry page for a firm', brand: 'Halden & Co.', cta: 'Get a quote', tag: 'Accountancy and advisory',
    vars: { background: '#f5f7fa', surface: '#ffffff', text: '#14213d', muted: '#5b6b86', border: '#dde3ee', primary: '#1f4fd8', secondary: '#5b8cff' }, font: FONTS[0][1], hfont: FONTS[0][1],
    home: () => [hero({ title: 'Financial clarity for growing businesses.', sub: 'Bookkeeping, tax and planning from a team that explains things in plain English.', cta: 'Get a quote', href: '@contact', cta2: 'Our services', href2: '#services', img: ph(900, 700, '#1f4fd8', '#9db8ff', 'Halden & Co.'), alt: 'Our office' }),
      Object.assign(features({ title: 'What we do', items: [['chart', 'Bookkeeping', 'Monthly accounts and clear reports you can act on.'], ['shield', 'Tax planning', 'Stay compliant and keep more of what you earn.'], ['user', 'Advisory', 'Hands-on help with funding, hiring and growth.']] }), { props: { htmlId: 'services' } }),
      team({ title: 'The people behind your numbers' }), testimonials({ title: 'Clients on working with us' }), ctaSec({ title: 'Let us take the paperwork off your plate', btn: 'Book a free call', href: '@contact' })],
    extra: [['Contact', 'contact', () => [pageHead('Contact', 'We reply to every message within one working day.'), contactSec({ title: 'Talk to us', info: [['mail', 'hello@haldenandco.example'], ['phone2', '020 7946 0112'], ['pin', '18 Carter Lane, London']] })]]] },
  { id: 'personal', name: 'Personal website', desc: 'A simple home for your writing and projects', brand: 'Daniel Reyes', cta: 'Contact', tag: 'Writer and editor',
    vars: { background: '#fbfaf6', surface: '#ffffff', text: '#1d1f1e', muted: '#666d69', border: '#e5e3da', primary: '#0f766e', secondary: '#5eead4' }, font: FONTS[2][1], hfont: FONTS[2][1],
    home: () => [hero({ title: 'Hi, I am Daniel. I write about cities, trains and the people in between.', sub: 'Freelance writer and editor. My work has appeared in magazines, newspapers and a few very small zines.', cta: 'Read my work', href: '#work', cta2: 'Get in touch', href2: '@contact' }),
      Object.assign(features({ title: 'What I do', items: [['pen', 'Features', 'Long-form reporting with a human angle.'], ['book', 'Editing', 'Structural and line edits for books and essays.'], ['mic', 'Talks', 'Short talks on writing about place.']].map(x => x[0] === 'mic' ? ['music', x[1], x[2]] : x) }), { props: { htmlId: 'work' } }), ctaSec({ title: 'Working on something?', sub: 'I take on a few new projects each season.', btn: 'Email me', href: '@contact' })], extra: [] },
  { id: 'blog', name: 'Blog', desc: 'Article grid with a newsletter signup', brand: 'The Slow Web', cta: 'Subscribe', tag: 'Essays on building calmer software',
    vars: { background: '#ffffff', surface: '#f7f7f8', text: '#111111', muted: '#6b6b73', border: '#e6e6ea', primary: '#111111', secondary: '#7c3aed' }, font: FONTS[2][1], hfont: FONTS[0][1],
    home: () => [hero({ title: 'Thoughtful writing about the web we want.', sub: 'One essay every Sunday on design, tools and the craft of making things for people.', cta: 'Subscribe', href: '@contact' }),
      cardsSec({ title: 'Latest posts', items: [{ img: ph(700, 440, '#e9e4f7', '#7c3aed', 'Quiet UI'), title: 'The case for quiet interfaces', text: 'Why fewer notifications make better products.', btn: 'Read post' }, { img: ph(700, 440, '#e4f0f7', '#3a8fb7', 'Offline'), title: 'Offline first, always', text: 'Designing for the train tunnel, not the demo.', btn: 'Read post' }, { img: ph(700, 440, '#f7ece4', '#d98a4a', 'Type'), title: 'Choosing type that lasts', text: 'A short guide to picking fonts you will not regret.', btn: 'Read post' }] }),
      ctaSec({ title: 'Get the Sunday essay', sub: 'No tracking, no spam. Unsubscribe whenever you like.', btn: 'Subscribe', href: '@contact' })], extra: [] },
  { id: 'agency', name: 'Agency', desc: 'Creative studio with services and case studies', brand: 'Northline Studio', cta: 'Start a project', tag: 'Brand, web and motion',
    vars: { background: '#0a0a0c', surface: '#141418', text: '#f3f3f6', muted: '#9b9ba6', border: '#26262e', primary: '#8b7bff', secondary: '#ff7ab8' }, font: FONTS[0][1], hfont: FONTS[0][1],
    home: () => [hero({ title: 'We build brands people remember.', sub: 'Northline is a twelve-person studio crafting identities, websites and launch films for ambitious companies.', cta: 'Start a project', href: '@contact', cta2: 'See our work', href2: '#work' }),
      features({ title: 'Services', items: [['pen', 'Brand identity', 'Strategy, naming, logo and a flexible visual system.'], ['layout', 'Web design', 'Fast, accessible sites that are a joy to update.'], ['camera', 'Motion', 'Launch films and social content with a clear voice.']] }),
      Object.assign(gallery({ title: 'Recent work', labels: ['Fieldwork', 'Orbit Bank', 'Kind Co.', 'Plateau', 'Marlow', 'Tidal'] }), { props: { htmlId: 'work' } }), testimonials({ title: 'Clients' }), ctaSec({ title: 'Tell us what you are building', btn: 'Start a project', href: '@contact' })], extra: [] },
  { id: 'school', name: 'School', desc: 'Programmes, staff and admissions FAQ', brand: 'Greenfield Academy', cta: 'Apply now', tag: 'Curious minds, kind community',
    vars: { background: '#fffdf6', surface: '#ffffff', text: '#1c2b22', muted: '#5d6e63', border: '#e6e2d0', primary: '#1b7f4b', secondary: '#f2b134' }, font: FONTS[4][1], hfont: FONTS[4][1],
    home: () => [hero({ title: 'A school where every child is known.', sub: 'Small classes, outdoor learning and teachers who care. Welcoming pupils from age 4 to 16.', cta: 'Apply now', href: '@contact', cta2: 'Book a visit', href2: '@contact', img: ph(900, 700, '#1b7f4b', '#a8e0b8', 'Greenfield'), alt: 'Pupils in the garden' }),
      features({ title: 'Our programmes', items: [['book', 'Early years', 'Play-based learning that builds confidence and curiosity.'], ['leaf', 'Primary', 'Strong foundations in reading, maths and nature study.'], ['globe', 'Secondary', 'Broad subjects, languages and real-world projects.']] }),
      team({ title: 'Meet our teachers', items: [['Ms. Ade', 'Head teacher', '#1b7f4b', '#a8e0b8'], ['Mr. Brown', 'Science', '#2f5b6b', '#6dc7ff'], ['Mrs. Khan', 'Languages', '#6b4a3b', '#ffb36d'], ['Mr. Silva', 'Music', '#5b3b6b', '#c06dff']] }), faq({ title: 'Admissions questions', items: [['When can my child start?', 'We admit pupils in September and January. Mid-year places depend on availability.'], ['Do you offer financial support?', 'Yes. Bursaries are available. Ask the office for details.'], ['Can I visit first?', 'Absolutely. Book a tour and meet the teachers.']] })],
    extra: [['Contact', 'contact', () => [pageHead('Admissions', 'We would love to meet you.'), contactSec({ title: 'Visit Greenfield', info: [['pin', '4 Orchard Lane'], ['phone2', '01632 960 123'], ['mail', 'office@greenfield.example']] })]]] },
  { id: 'product', name: 'Product landing page', desc: 'Launch page for a single hardware product', brand: 'Aerobud', cta: 'Pre-order', tag: 'Wireless earbuds with 40-hour battery',
    vars: { background: '#080d17', surface: '#101827', text: '#eef3fb', muted: '#97a3b8', border: '#1f2a3f', primary: '#36c2ff', secondary: '#7affd1' }, font: FONTS[0][1], hfont: FONTS[0][1],
    home: () => [hero({ title: 'Forty hours of sound. Zero fuss.', sub: 'Aerobud pairs in one tap, blocks the noise you do not want and lasts the whole week.', cta: 'Pre-order for $99', href: '@contact', cta2: 'See features', href2: '#features', img: ph(900, 700, '#0f2a45', '#36c2ff', 'Aerobud'), alt: 'Aerobud earbuds' }),
      Object.assign(features({ title: 'Why Aerobud', items: [['music', 'Studio-tuned sound', 'Custom 11 mm drivers with a warm, balanced response.'], ['bolt', '40-hour battery', 'Ten minutes in the case gives you three hours of playback.'], ['shield', 'Adaptive noise control', 'Hear the world or shut it out, automatically.']] }), { props: { htmlId: 'features' } }),
      X('section', { name: 'Countdown', s: { padding: '1rem 1.25rem 3rem' }, k: [X('container', { k: [X('heading', { c: 'Launch offer ends in', s: CENTER }), X('countdown', { s: { 'justify-content': 'center', 'margin-top': '1.5rem' } })] })] }),
      pricing({ title: 'Choose your colour', plans: [['Midnight', '$99', 'The classic', ['40-hour battery', 'USB-C case', '1-year warranty'], 'Pre-order', true], ['Frost', '$99', 'Light and bright', ['40-hour battery', 'USB-C case', '1-year warranty'], 'Pre-order', false]], href: '@contact' }), faq({ items: [['Is it water resistant?', 'Yes, IPX5: sweat and rain are fine.'], ['When will it ship?', 'Pre-orders ship within three weeks.'], ['Is there a warranty?', 'Every pair includes a one-year warranty.']] })], extra: [] }
];
function resolveLinks(p) {
  const bySlug = {}; p.pages.forEach(pg => bySlug[pg.slug] = pg.id);
  p.pages.forEach(pg => walk(pg.root, n => { const h = n.props && n.props.href; if (typeof h === 'string' && h[0] === '@') n.props.href = bySlug[h.slice(1)] ? 'page:' + bySlug[h.slice(1)] : '#'; }));
}
function buildTemplate(t, name) {
  const p = blankProject(name || t.name + ' website'); Object.assign(p.vars, t.vars); p.settings.font = t.font; p.settings.headingFont = t.hfont === t.font ? '' : t.hfont;
  const mkPage = (nm, slug, secs) => { const root = mk('page', { name: 'Page' }); root.children = [navBar(t.brand, t.cta), ...secs, footBar(t.brand, t.tag)]; return { id: uid(), name: nm, slug, title: '', desc: '', inNav: true, root }; };
  const home = mkPage('Home', 'index', t.home()); p.pages = [home]; p.homeId = home.id;
  const extra = t.extra.slice(); if (!extra.find(e => e[1] === 'contact')) extra.push(['Contact', 'contact', () => [pageHead('Contact', 'Send a message and we will get back to you.'), contactSec({ title: 'Get in touch', info: [['mail', 'hello@' + slugify(t.brand).replace(/-/g, '') + '.example']] })]]);
  extra.forEach(([nm, sl, fn]) => p.pages.push(mkPage(nm, sl, fn())));
  resolveLinks(p); return p;
}
/* =====================================================================
   Chrome: sheets, tabs, devices, theme, context menu, shortcuts
   ===================================================================== */
function openSheet(side) {
  if (!isMobile()) return;
  $('#left').classList.toggle('open', side === 'left'); $('#right').classList.toggle('open', side === 'right');
  $('#sheetBack').classList.add('on'); syncChrome();
}
function closeSheets() { $('#left').classList.remove('open'); $('#right').classList.remove('open'); $('#sheetBack').classList.remove('on'); syncChrome(); }
function setLTab(t) {
  S.ltab = t;
  $$('#ltabs button').forEach(b => b.classList.toggle('on', b.dataset.lt === t));
  ['elements', 'layers', 'pages', 'assets', 'design'].forEach(k => { $('#lp-' + k).hidden = k !== t; });
  if (t === 'layers') Layers.render();
}
function setDevice(d) { S.device = d; Canvas.layout(); Inspector.render(); syncChrome(); }
function syncChrome() {
  $$('#devSeg button').forEach(b => b.classList.toggle('on', b.dataset.dev === S.device));
  $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
  $$('#ltabs button').forEach(b => b.classList.toggle('on', b.dataset.lt === S.ltab));
  const l = $('#left').classList.contains('open'), r = $('#right').classList.contains('open');
  $$('#mbar button').forEach(b => { const m = b.dataset.m; b.classList.toggle('on', (m === 'elements' && l && S.ltab === 'elements') || (m === 'layers' && l && S.ltab === 'layers') || (m === 'inspect' && r)); });
  $('#sbDev').value = S.device;
}
function applyTheme() {
  const t = S.prefs.theme === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : S.prefs.theme;
  document.documentElement.setAttribute('data-theme', t);
}
function showCtx(x, y) {
  const n = selNode(); if (!n) return; const root = n.type === 'page', m = $('#ctx');
  const it = [['edit', 'Edit', 'edit'], ['dup', 'Duplicate', 'copy'], ['copy', 'Copy', 'copy'], ['paste', 'Paste', 'file'], ['del', 'Delete', 'trash'], '-', ['up', 'Move up', 'up'], ['down', 'Move down', 'down'], '-', ['lock', n.locked ? 'Unlock' : 'Lock', n.locked ? 'unlock' : 'lock'], ['hide', n.hidden ? 'Show' : 'Hide', n.hidden ? 'eye' : 'eyeoff'], ['inspect', 'Inspect', 'sliders']];
  m.innerHTML = it.map(i => i === '-' ? '<hr>' : `<button data-c="${i[0]}"${(root && !['paste', 'inspect'].includes(i[0])) || (i[0] === 'paste' && !S.clip) ? ' disabled' : ''}>${ico(i[2], 15)}${i[1]}</button>`).join('');
  m.hidden = false; const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(4, Math.min(x, innerWidth - w - 4)) + 'px'; m.style.top = Math.max(4, Math.min(y, innerHeight - h - 4)) + 'px';
}
const hideCtx = () => { $('#ctx').hidden = true; };
$('#ctx').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const id = S.selId, c = b.dataset.c; hideCtx(); if (!id) return;
  if (c === 'edit') { const d = REG[find(id).node.type]; if (d.text || d.editSel) Canvas.startEdit(id); else { openSheet('right'); Inspector.focusContent(); } }
  else if (c === 'dup') dupNode(id); else if (c === 'copy') copyNode(id); else if (c === 'paste') pasteNode(); else if (c === 'del') removeNode(id);
  else if (c === 'up') shift(id, -1); else if (c === 'down') shift(id, 1); else if (c === 'lock') toggleFlag(id, 'locked'); else if (c === 'hide') toggleFlag(id, 'hidden');
  else if (c === 'inspect') { S.rtab = 'style'; Inspector.render(); openSheet('right'); }
});
document.addEventListener('pointerdown', e => { if (!e.target.closest('#ctx')) hideCtx(); });
function onKey(e) {
  const t = e.target, typing = t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable), mod = e.ctrlKey || e.metaKey, k = (e.key || '').toLowerCase();
  if (mod && k === 's') { e.preventDefault(); saveNow(); return; }
  if (mod && k === 'p') { e.preventDefault(); if (S.project) Preview.open(); return; }
  if (e.key === 'Escape') {
    if (dlgStack.length) dlgStack[dlgStack.length - 1].close(); else if (!$('#ctx').hidden) hideCtx(); else if (!$('#prev').hidden) Preview.close(); else if (S.mode === 'code') Code.close(); else if (S.selId) select(null); return;
  }
  if (typing || S.mode !== 'design' || !S.project || dlgStack.length || !$('#prev').hidden || !$('#dash').hidden) return;
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && k === 'y') { e.preventDefault(); redo(); }
  else if (mod && k === 'c' && S.selId) { e.preventDefault(); copyNode(S.selId); }
  else if (mod && k === 'v') { e.preventDefault(); pasteNode(); }
  else if (mod && k === 'd' && S.selId) { e.preventDefault(); dupNode(S.selId); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && S.selId) { e.preventDefault(); removeNode(S.selId); }
}

/* =====================================================================
   Preview
   ===================================================================== */
const Preview = {
  dev: 'desktop', pageId: null,
  open() {
    this.pageId = S.pageId; $('#prev').hidden = false;
    $('#pvPage').innerHTML = S.project.pages.map(p => `<option value="${p.id}"${p.id === this.pageId ? ' selected' : ''}>${esc(p.name)}</option>`).join('');
    this.load(); this.setDev(this.dev);
  },
  pg() { return S.project.pages.find(p => p.id === this.pageId) || S.project.pages[0]; },
  load() { $('#pvFrame').srcdoc = genDoc(S.project, this.pg(), 'preview'); },
  setDev(d) {
    this.dev = d; $('#pvFrame').style.width = { desktop: '100%', tablet: '768px', mobile: '390px' }[d];
    $$('#pvDev button').forEach(b => b.classList.toggle('on', b.dataset.pd === d));
  },
  close() { $('#prev').hidden = true; $('#pvFrame').srcdoc = ''; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); },
  init() {
    $('#pvDev').addEventListener('click', e => { const b = e.target.closest('button'); if (b) this.setDev(b.dataset.pd); });
    $('#pvPage').addEventListener('change', e => { this.pageId = e.target.value; this.load(); });
    $('#pvClose').onclick = () => this.close();
    $('#pvFull').onclick = () => { const el = $('#pvStage'); (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).catch(() => { $('#pvStage').classList.remove('framed'); toast('Fullscreen is unavailable here — showing edge to edge'); }); };
    $('#pvTab').onclick = () => {
      try { const w = window.open(URL.createObjectURL(new Blob([genDoc(S.project, this.pg(), 'inline')], { type: 'text/html' })), '_blank'); if (!w) throw 0; } catch (e) { toast('New tabs are blocked in this view — use Fullscreen instead', true); }
    };
    window.addEventListener('message', e => {
      if (e.source !== $('#pvFrame').contentWindow || !e.data || !e.data.bbGo) return;
      const pg = S.project.pages.find(p => p.slug === e.data.bbGo); if (pg) { this.pageId = pg.id; $('#pvPage').value = pg.id; this.load(); }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) $('#pvStage').classList.add('framed'); });
  }
};

/* =====================================================================
   Export
   ===================================================================== */
function exportDialog() {
  if (!S.project) return; const p = S.project, base = safeName(p.name);
  const d = dlg({ title: 'Export website', body: `<button class="xopt" data-x="html">${ico('code', 22)}<span><b>Export HTML</b><small>One self-contained file for the current page</small></span></button>
    <button class="xopt" data-x="zip">${ico('box', 22)}<span><b>Export ZIP</b><small>index.html, style.css, script.js and assets/ — works without the builder</small></span></button>
    <button class="xopt" data-x="json">${ico('file', 22)}<span><b>Export project JSON</b><small>Full project (pages, styles, assets) for backup or sharing</small></span></button>` });
  d.body.addEventListener('click', async e => {
    const b = e.target.closest('[data-x]'); if (!b) return; const k = b.dataset.x; d.close();
    try {
      if (k === 'html') await saveFile(slugify(curPage().name) + '.html', formatHTML(genDoc(p, curPage(), 'inline')), 'text/html');
      else if (k === 'zip') await saveFile(base + '.zip', makeZip(exportFiles(p)));
      else await saveFile(base + '.json', JSON.stringify(p), 'application/json');
    } catch (err) { toast('Export failed: ' + err.message, true); }
  });
}

/* =====================================================================
   Code editor (HTML / CSS / JS)
   ===================================================================== */
function hl(src, re, cls) {
  if (src.length > 120000) return esc(src);
  let out = '', last = 0, m; re.lastIndex = 0;
  while ((m = re.exec(src))) {
    if (!m[0]) { re.lastIndex++; continue; }
    out += esc(src.slice(last, m.index)); let i = 1; while (i < m.length && m[i] === undefined) i++;
    out += `<span class="t-${cls[i - 1]}">${esc(m[0])}</span>`; last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}
const HL = {
  html: [/(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*)|("[^"]*"|'[^']*')|([\w:-]+)(?==)|(\/?>)/g, ['c', 't', 's', 'a', 't']],
  css: [/(\/\*[\s\S]*?\*\/)|(@[\w-]+)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|rem|em|%|vw|vh|s|ms|deg)?\b)|(--?[\w-]+)(?=\s*:)|(\.[\w-]+)/g, ['c', 'k', 's', 'n', 'n', 'p', 'f']],
  js: [/(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|new|this|document|window|true|false|null|class|async|await|try|catch|of|in|typeof|break|continue)\b|(\b\d+\.?\d*\b)|([A-Za-z_$][\w$]*)(?=\()/g, ['c', 's', 'k', 'n', 'f']]
};
const Code = {
  tab: 'html', texts: {}, gen: {}, ta: null,
  open() {
    if (!S.project) return; S.mode = 'code'; syncChrome(); $('#code').hidden = false; this.regen(); this.show(this.tab);
  },
  close() { S.mode = 'design'; $('#code').hidden = true; syncChrome(); },
  regen() {
    const p = S.project, pg = curPage(), ctx = makeCtx(p, pg, { export: true });
    this.gen = { html: formatHTML(genDoc(p, pg, 'export')), css: fullCSS(p, ctx), js: fullJS(p) }; this.texts = { ...this.gen };
  },
  show(t) {
    if (this.ta) this.texts[this.tab] = this.ta.value; this.tab = t;
    $$('#cdTabs button').forEach(b => b.classList.toggle('on', b.dataset.ct === t));
    const ed = $('#ed'); ed.innerHTML = `<div class="ed-find" hidden><input type="text" id="cfF" placeholder="Find"><input type="text" id="cfR" placeholder="Replace"><button class="btn sm" id="cfN">Next</button><button class="btn sm" id="cfRe">Replace</button><button class="btn sm" id="cfAll">All</button><span class="hint" id="cfC"></span></div>
      <div class="ed-wrap"><div class="ed-gut"></div><div class="ed-area"><pre><code></code></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea></div></div>`;
    const ta = this.ta = $('textarea', ed), code = $('code', ed), gut = $('.ed-gut', ed); ta.value = this.texts[t];
    let lines = 0; const paint = () => { code.innerHTML = hl(ta.value, ...HL[t]) + '\n'; const n = ta.value.split('\n').length; if (n !== lines) { lines = n; gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n'); } this.state(); };
    const paintD = debounce(paint, 120), scroll = () => { code.style.transform = `translate(${-ta.scrollLeft}px,${-ta.scrollTop}px)`; gut.style.transform = `translateY(${-ta.scrollTop}px)`; };
    ta.addEventListener('input', paintD); ta.addEventListener('scroll', scroll);
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); paintD(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.apply(); }
    });
    this.paint = paint; paint(); scroll(); this.prev();
    const find = $('.ed-find', ed), F = $('#cfF'), R = $('#cfR');
    const count = () => { const q = F.value; $('#cfC').textContent = q ? (ta.value.split(q).length - 1) + ' found' : ''; };
    const next = () => { const q = F.value; if (!q) return; let i = ta.value.indexOf(q, ta.selectionEnd); if (i < 0) i = ta.value.indexOf(q); if (i < 0) return toast('No matches'); ta.focus(); ta.setSelectionRange(i, i + q.length); const ln = ta.value.slice(0, i).split('\n').length; ta.scrollTop = Math.max(0, (ln - 4) * 20); scroll(); };
    F.addEventListener('input', count); F.addEventListener('keydown', e => { if (e.key === 'Enter') next(); });
    $('#cfN').onclick = next;
    $('#cfRe').onclick = () => { const q = F.value; if (q && ta.value.slice(ta.selectionStart, ta.selectionEnd) === q) { ta.setRangeText(R.value, ta.selectionStart, ta.selectionEnd, 'end'); paint(); } next(); };
    $('#cfAll').onclick = () => { const q = F.value; if (!q) return; const n = ta.value.split(q).length - 1; ta.value = ta.value.split(q).join(R.value); paint(); toast(n + ' replaced'); count(); };
    this.findBar = find;
  },
  state() { const dirty = this.ta && this.ta.value !== this.gen[this.tab]; $('#cdState').textContent = dirty ? 'Unapplied changes' : ''; },
  prev() { $('#codePrev').innerHTML = '<iframe title="Live preview" sandbox="allow-scripts"></iframe>'; $('#codePrev iframe').srcdoc = genDoc(S.project, curPage(), 'inline'); },
  apply() {
    const v = this.ta.value, p = S.project;
    try {
      if (this.tab === 'html') applyHTML(v); else if (this.tab === 'css') applyCSS(v);
      else { const i = v.indexOf(JS_MARK); p.customJS = (i < 0 ? v : v.slice(i + JS_MARK.length)).trim(); commit('js'); }
    } catch (e) { return toast('Could not apply: ' + e.message, true); }
    this.regen(); const keep = this.tab; this.tab = null; this.ta = null; this.show(keep); Canvas.renderAll(); Layers.render(); Inspector.render(); Design.render(); toast('Changes applied');
  },
  fmt() { const ta = this.ta, t = this.tab; ta.value = t === 'html' ? formatHTML(ta.value) : t === 'css' ? formatCSS(ta.value) : formatJS(ta.value); this.paint(); toast('Formatted'); },
  init() {
    $('#cdTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) this.show(b.dataset.ct); });
    $('#cdClose').onclick = () => this.close(); $('#cdApply').onclick = () => this.apply(); $('#cdFmt').onclick = () => this.fmt();
    $('#cdCopy').onclick = () => copyText(this.ta.value); $('#cdFind').onclick = () => { const f = this.findBar; f.hidden = !f.hidden; if (!f.hidden) $('#cfF').focus(); };
    $('#cdDl').onclick = () => { const t = this.tab, nm = t === 'html' ? slugify(curPage().name) + '.html' : t === 'css' ? 'style.css' : 'script.js'; saveFile(nm, this.ta.value, 'text/plain'); };
  }
};
function normHTML(s) { const t = document.createElement('template'); t.innerHTML = s; return t.innerHTML.replace(/\s*(<[^>]+>)\s*/g, '$1').replace(/\s+/g, ' ').trim(); }
function applyHTML(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html'), pg = curPage(), ctx = makeCtx(S.project, pg, {}), pool = new Map();
  walk(pg.root, n => pool.set(n.id, n));
  const rec = el => {
    const m = /\bel-([\w-]+)/.exec(el.getAttribute('class') || ''), cand = m && pool.get(m[1]);
    if (cand && cand.type !== 'page') {
      const d = REG[cand.type], tag = typeof d.tag === 'function' ? d.tag(cand) : d.tag;
      if (el.tagName.toLowerCase() === tag) {
        if (normHTML(el.outerHTML) === normHTML(renderNode(cand, ctx))) return cand;
        if (d.plain) { cand.children = Array.from(el.children).map(rec).filter(Boolean); return cand; }
        if (d.text) { cand.content = el.textContent.trim(); if (el.hasAttribute('href') && !el.hasAttribute('data-page')) cand.props.href = el.getAttribute('href'); if (/^h[1-6]$/.test(tag)) cand.props.level = tag[1]; return cand; }
        if (cand.type === 'image') { const s = el.getAttribute('src'); if (s && s !== ctx.imgSrc(cand.props.src)) cand.props.src = s; cand.props.alt = el.getAttribute('alt') || ''; return cand; }
      }
    }
    return mk('html', { name: 'Custom HTML', c: sanitizeHTML(el.outerHTML) });
  };
  pg.root.children = Array.from(doc.body.children).filter(e => !['SCRIPT', 'LINK', 'STYLE', 'NOSCRIPT'].includes(e.tagName)).map(rec).filter(Boolean);
  commit('code'); refreshStruct(null);
}
function parseBlocks(src) {
  src = src.replace(/\/\*[\s\S]*?\*\//g, ''); const out = [];
  const rec = (s, media) => { let i = 0; while (i < s.length) { const o = s.indexOf('{', i); if (o < 0) break; const sel = s.slice(i, o).trim(); let d = 1, j = o + 1; while (j < s.length && d) { if (s[j] === '{') d++; else if (s[j] === '}') d--; j++; } const body = s.slice(o + 1, j - 1); if (sel.startsWith('@media')) rec(body, sel); else out.push({ sel, body, media }); i = j; } };
  rec(src, ''); return out;
}
function parseDecls(body) {
  const out = []; let cur = '', depth = 0, q = '';
  for (const ch of body) { if (q) { cur += ch; if (ch === q) q = ''; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ';' && !depth) { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur); return out.map(d => { const i = d.indexOf(':'); return i < 0 ? null : [d.slice(0, i).trim(), d.slice(i + 1).trim()]; }).filter(x => x && x[0] && x[1]);
}
function applyCSS(text) {
  const p = S.project, ti = text.indexOf(CSS_MARK_T), ci = text.indexOf(CSS_MARK_C);
  if (ti < 0) throw new Error('Keep the "Design tokens" marker comment so the CSS can be mapped back.');
  const mid = text.slice(ti + CSS_MARK_T.length, ci < 0 ? undefined : ci), custom = ci < 0 ? '' : text.slice(ci + CSS_MARK_C.length).trim();
  const nodes = new Set(), styles = {}, left = []; p.pages.forEach(pg => walk(pg.root, n => nodes.add(n.id)));
  const vars = {}; let font = p.settings.font, hfont = p.settings.headingFont;
  parseBlocks(mid).forEach(b => {
    const raw = `${b.media ? b.media + ' {' : ''}${b.sel} {${b.body}}${b.media ? '}' : ''}`;
    if (b.sel === ':root') parseDecls(b.body).forEach(([k, v]) => { if (!k.startsWith('--')) return; const n = k.slice(2); if (n === 'font') font = v; else if (n === 'font-heading') hfont = v === font ? '' : v; else vars[n] = v; });
    else { const m = /^\.el-([\w-]+)$/.exec(b.sel); let bp = null; if (m && nodes.has(m[1])) { if (!b.media) bp = 'desktop'; else { const px = +(/max-width:\s*(\d+)px/.exec(b.media) || [])[1]; bp = px === bpMax(p, 'tablet') ? 'tablet' : px === bpMax(p, 'mobile') ? 'mobile' : null; } }
      if (bp) { const o = (styles[m[1]] = styles[m[1]] || {}); o[bp] = Object.assign(o[bp] || {}, Object.fromEntries(parseDecls(b.body).filter(([k]) => validProp(k)))); } else left.push(raw); }
  });
  TOKENS.forEach(([k]) => { if (!(k in vars)) vars[k] = p.vars[k]; });
  p.vars = vars; p.settings.font = font; p.settings.headingFont = hfont;
  p.pages.forEach(pg => walk(pg.root, n => { const s = styles[n.id] || {}; n.styles = { desktop: s.desktop || {}, tablet: s.tablet || {}, mobile: s.mobile || {} }; }));
  p.customCSS = (custom + '\n' + left.join('\n')).trim(); commit('css'); dirtyIx(); refreshAll();
}

/* =====================================================================
   Projects dashboard
   ===================================================================== */
async function openProject(idOrObj) {
  const p = typeof idOrObj === 'string' ? await Store.get(idOrObj) : idOrObj; if (!p) return toast('Project not found', true);
  S.project = p; S.pageId = p.homeId; S.selId = null; S.collapsed.clear(); S.device = isMobile() ? 'mobile' : 'desktop'; S.zoom = 'fit'; S.mode = 'design'; dirtyIx();
  try { localStorage.setItem('bb:last', p.id); } catch (e) { }
  $('#code').hidden = true; $('#dash').hidden = true; histReset(); refreshAll(); setSave('saved'); S.dirty = false;
}
async function createProject(name, tpl) {
  const p = tpl ? buildTemplate(tpl, name) : blankProject(name); p.name = name || p.name; p.updated = Date.now();
  await Store.put(p); Store.touchMeta(p); await openProject(p);
}
async function importProject() {
  const [f] = await pickFile('.json,application/json', false); if (!f) return;
  try { const p = normalizeProject(JSON.parse(await readFile(f, 'text'))); await Store.put(p); Store.touchMeta(p); toast('Imported “' + p.name + '”'); await openProject(p); }
  catch (e) { toast(e.message || 'Import failed', true); }
}
function newProjectDialog(tpl) {
  const d = dlg({ title: tpl ? 'New project from “' + tpl.name + '”' : 'New blank website', body: `<div class="f col"><label>Project name</label><input type="text" id="npN" value="${esc(tpl ? tpl.name + ' website' : 'My website')}" maxlength="120"></div>`,
    actions: [{ label: 'Cancel' }, { label: 'Create', kind: 'pri', fn: () => { const n = $('#npN', d.body).value.trim() || 'Untitled website'; createProject(n, tpl); } }] });
  const i = $('#npN', d.body); i.select(); i.addEventListener('keydown', e => { if (e.key === 'Enter') { createProject(i.value.trim() || 'Untitled website', tpl); d.close(); } });
}
function templateDialog() {
  const d = dlg({ title: 'Choose a template', wide: true, body: `<div class="tpl-grid">${TPLS.map(t => `<button class="tpl" data-t="${t.id}"><img class="th" src="tpl-${t.id}.svg" alt="" loading="lazy" style="background:${t.vars.background}"><div class="tx"><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></div></button>`).join('')}</div>` });
  d.body.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { d.close(); newProjectDialog(TPLS.find(t => t.id === b.dataset.t)); } });
}
const Dash = {
  el: $('#dash'),
  open() { this.el.hidden = false; this.render(); },
  render() {
    const ms = Store.metas(), hdr = `<div class="dash-hd"><h1>Your websites</h1>${S.project ? `<button class="btn" id="dBack">${ico('x', 16)} Back to editor</button>` : ''}<button class="btn" id="dImp">${ico('download', 16)} Import</button><button class="btn" id="dTpl">${ico('layout', 16)} Templates</button><button class="btn pri" id="dNew">${ico('plus', 16)} Blank website</button></div>`;
    const body = ms.length ? `<div class="pgrid">${ms.map(m => `<div class="pcard" data-id="${m.id}"><div class="pv" data-a="open" style="background:linear-gradient(135deg,${esc(m.color || '#6d7cff')},#1b1b26)">${esc((m.name || '?')[0].toUpperCase())}</div><div class="pi" data-a="open"><b>${esc(m.name)}</b><small>${m.pages} page${m.pages === 1 ? '' : 's'} · ${ago(m.updated)}</small></div><div class="pa"><button data-a="ren" title="Rename">${ico('edit', 16)}</button><button data-a="dup" title="Duplicate">${ico('copy', 16)}</button><button data-a="exp" title="Export project">${ico('download', 16)}</button><button data-a="del" title="Delete">${ico('trash', 16)}</button></div></div>`).join('')}</div>`
      : `<div class="hero-empty"><img class="hero-art" src="hero-illustration.svg" alt="Bappherh Builder editor" width="720" height="400"><h1>Create your first website</h1><p>Build responsive sites visually, then export clean HTML, CSS and JavaScript that runs anywhere.</p><div class="row"><button class="btn pri" id="eBlank">${ico('plus', 16)} Blank Website</button><button class="btn" id="eTpl">${ico('layout', 16)} Choose Template</button><button class="btn" id="eImp">${ico('download', 16)} Import Project</button></div></div>`;
    this.el.innerHTML = `<div class="dash-in">${ms.length ? hdr : '<div class="dash-hd"><h1></h1></div>'}${body}<div class="credit">Bappherh Builder · Built by TheDev001</div><div class="legal"><a href="terms-of-service.html" target="_blank" rel="noopener">Terms of Service</a>·<a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>·<a href="terms-and-conditions.html" target="_blank" rel="noopener">Terms and Conditions</a></div></div>`;
  },
  init() {
    this.el.addEventListener('click', async e => {
      const id = e.target.id, card = e.target.closest('.pcard'), a = e.target.closest('[data-a]');
      if (id === 'dBack') this.el.hidden = true; else if (id === 'dNew' || id === 'eBlank') newProjectDialog(); else if (id === 'dTpl' || id === 'eTpl') templateDialog(); else if (id === 'dImp' || id === 'eImp') importProject();
      if (!card || !a) return; const pid = card.dataset.id, k = a.dataset.a;
      if (k === 'open') return openProject(pid);
      const p = S.project && S.project.id === pid ? S.project : await Store.get(pid); if (!p) return toast('Project not found', true);
      if (k === 'ren') { const n = await askText('Rename project', p.name, 'Project name'); if (n) { p.name = n; await Store.put(p); Store.touchMeta(p); if (S.project === p) $('#projName').textContent = n; this.render(); } }
      else if (k === 'dup') { const c = normalizeProject(clone(p)); c.name = p.name + ' copy'; await Store.put(c); Store.touchMeta(c); this.render(); toast('Duplicated'); }
      else if (k === 'exp') saveFile(safeName(p.name) + '.json', JSON.stringify(p), 'application/json');
      else if (k === 'del') { if (await askConfirm('Delete project', `“${p.name}” will be permanently deleted from this device.`)) { await Store.del(pid); Store.dropMeta(pid); if (S.project && S.project.id === pid) { S.project = null; try { localStorage.removeItem('bb:last'); } catch (x) { } } this.render(); } }
    });
  }
};

/* =====================================================================
   Settings
   ===================================================================== */
function settingsDialog() {
  const P = S.prefs, p = S.project;
  const kb = [['Ctrl/Cmd + S', 'Save'], ['Ctrl/Cmd + Z', 'Undo'], ['Ctrl/Cmd + Shift + Z', 'Redo'], ['Ctrl/Cmd + C / V', 'Copy / Paste'], ['Ctrl/Cmd + D', 'Duplicate'], ['Delete / Backspace', 'Delete element'], ['Ctrl/Cmd + P', 'Preview'], ['Double-click', 'Edit text'], ['Esc', 'Deselect / close']];
  const d = dlg({ title: 'Settings', wide: true, body: `<div class="f"><label>Theme</label><select id="sTh">${opts([['dark', 'Dark'], ['light', 'Light'], ['system', 'System']], P.theme)}</select></div>
    <div class="f"><label>Autosave</label><input type="checkbox" id="sAs"${P.autosave ? ' checked' : ''}></div>
    <div class="f"><label>Show grid</label><input type="checkbox" id="sGr"${P.grid ? ' checked' : ''}></div>
    <div class="f"><label>Snap to grid</label><input type="checkbox" id="sSn"${P.snap ? ' checked' : ''}></div>
    <div class="f"><label>Canvas background</label><div class="row"><input type="color" id="sBg" value="${toHex(P.canvasBg || '#1a1a22')}"><button class="btn sm" id="sBgR">Reset</button></div></div>
    <div class="f"><label>Default font</label><select id="sFt">${FONTS.map(f => `<option value="${esc(f[1])}"${f[1] === (p ? p.settings.font : P.font) ? ' selected' : ''}>${esc(f[0])}</option>`).join('')}</select></div>
    ${p ? `<div class="f"><label>Tablet breakpoint</label><div class="row"><input type="number" id="sTb" min="400" max="1400" value="${p.settings.tabMax}"><span class="hint">px max</span></div></div><div class="f"><label>Mobile breakpoint</label><div class="row"><input type="number" id="sMb" min="240" max="800" value="${p.settings.mobMax}"><span class="hint">px max</span></div></div>` : ''}
    <div><b>Keyboard shortcuts</b>${kb.map(([a, b]) => `<div class="krow"><span>${b}</span><span class="kbd">${a}</span></div>`).join('')}</div>
    <div class="hint">Bappherh Builder · Built by TheDev001. Projects are stored locally in this browser.</div><div><b>Legal</b><div class="krow"><a href="terms-of-service.html" target="_blank" rel="noopener">Terms of Service</a></div><div class="krow"><a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a></div><div class="krow"><a href="terms-and-conditions.html" target="_blank" rel="noopener">Terms and Conditions</a></div></div>`, actions: [{ label: 'Done', kind: 'pri' }] });
  const b = d.body;
  b.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'sTh') { P.theme = e.target.value; applyTheme(); } else if (id === 'sAs') { P.autosave = e.target.checked; if (P.autosave && S.dirty) autosaveDeb(); }
    else if (id === 'sGr') { P.grid = e.target.checked; Canvas.renderAll(); } else if (id === 'sSn') P.snap = e.target.checked;
    else if (id === 'sBg') { P.canvasBg = e.target.value; $('#stage').style.background = P.canvasBg; }
    else if (id === 'sFt') { P.font = e.target.value; if (p) { p.settings.font = P.font; commit('font'); Canvas.renderCSS(); Design.render(); } }
    else if (id === 'sTb' || id === 'sMb') { const v = Math.round(+e.target.value); if (!v) return; if (id === 'sTb') p.settings.tabMax = Math.max(400, Math.min(1400, v)); else p.settings.mobMax = Math.max(240, Math.min(800, v)); if (p.settings.mobMax >= p.settings.tabMax) p.settings.mobMax = p.settings.tabMax - 100; commit('bp'); Canvas.renderAll(); Inspector.render(); }
    savePrefs();
  });
  $('#sBgR', b).onclick = () => { P.canvasBg = ''; $('#stage').style.background = ''; savePrefs(); };
}

/* =====================================================================
   Boot
   ===================================================================== */
async function boot() {
  $$('[data-ic]').forEach(b => b.insertAdjacentHTML('afterbegin', ico(b.dataset.ic, b.classList.contains('sm') ? 15 : 17)));
  $('#fontlist').innerHTML = FONTS.map(f => `<option value="${esc(f[1])}">${esc(f[0])}</option>`).join('') + '<option value="inherit">inherit</option>';
  applyTheme(); matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.prefs.theme === 'system') applyTheme(); });
  await Store.init();
  Palette.init(); Layers.init(); Pages.init(); Assets.init(); Design.init(); Inspector.init(); Overlay.init(); Preview.init(); Code.init(); Dash.init(); Canvas.init();
  $('#ltabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLTab(b.dataset.lt); });
  $('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !S.project) return; b.dataset.mode === 'code' ? Code.open() : Code.close(); });
  $('#devSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setDevice(b.dataset.dev); });
  $('#sbDev').addEventListener('change', e => setDevice(e.target.value));
  $('#zoomSel').addEventListener('change', e => { S.zoom = e.target.value; Canvas.layout(); });
  const steps = [.5, .75, 1, 1.25]; const zs = d => { const cur = S.zoom === 'fit' ? Canvas.zoom : +S.zoom; let i = steps.findIndex(s => s >= cur - .01); if (i < 0) i = steps.length - 1; S.zoom = String(steps[Math.max(0, Math.min(steps.length - 1, i + d))]); Canvas.layout(); };
  $('#zIn').onclick = () => zs(1); $('#zOut').onclick = () => zs(-1);
  $('#bUndo').onclick = undo; $('#bRedo').onclick = redo; $('#bSave').onclick = () => saveNow();
  $('#bPreview').onclick = () => S.project && Preview.open(); $('#bExport').onclick = exportDialog; $('#bSettings').onclick = settingsDialog;
  $('#bNew').onclick = () => newProjectDialog(); $('#bOpen').onclick = () => Dash.open();
  $('#projName').onclick = async () => { if (!S.project) return; const n = await askText('Rename project', S.project.name, 'Project name'); if (n) { S.project.name = n; commit('pname'); $('#projName').textContent = n; } };
  $('#mbar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const m = b.dataset.m;
    if (m === 'elements' || m === 'layers') { setLTab(m); openSheet('left'); } else if (m === 'inspect') { openSheet('right'); Inspector.render(); }
    else if (m === 'undo') undo(); else if (m === 'redo') redo(); else if (m === 'preview') S.project && Preview.open();
  });
  $('#sheetBack').addEventListener('click', closeSheets);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', debounce(() => { Canvas.layout(); }, 120));
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.dirty && S.project) saveNow(true); });
  window.addEventListener('pagehide', () => { if (S.dirty && S.project) saveNow(true); });
  setLTab('elements'); syncChrome(); updateHistUI();
  const last = (() => { try { return localStorage.getItem('bb:last'); } catch (e) { return null; } })();
  const metas = Store.metas();
  if (last && metas.find(m => m.id === last)) await openProject(last); else Dash.open();
}
boot().catch(e => { console.error(e); toast('Startup problem: ' + e.message, true); });
