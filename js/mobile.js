/*! QORVEX MOBILE · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
'use strict';
/* =====================================================================
   VALIDACIÓN DE MATERIALES — CH Industrial Solutions
   Una sola tableta · datos en localStorage · exporta a Excel (Descargas)
   ===================================================================== */
const Q_MARK = 'img/q-oscuro.png';
const Q_LOGO = 'img/logo-qorvex.jpg';
const QM_D = 'img/q-oscuro.png';
const QM_L = 'img/q-claro.png';
const HERO_D = 'img/almacen-oscuro.jpg';
const HERO_L = 'img/almacen-claro.jpg';
const qsv = (d, f) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" ${f ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
const TAB_ICO = {
  ent: qsv('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  dev: qsv('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  prod: qsv('<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>'),
  cap: qsv('<path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M20 5v14"/>'),
  dash: qsv('<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/>', 1),
  val: qsv('<circle cx="12" cy="12" r="9.2"/><path d="m7.6 12.3 3 3 5.8-6.3"/>'),
  seq: qsv('<rect x="3" y="3" width="7" height="5.5" rx="1.2"/><rect x="14" y="15.5" width="7" height="5.5" rx="1.2"/><rect x="3" y="15.5" width="7" height="5.5" rx="1.2"/><path d="M6.5 8.5v7M10 18.2h4M6.5 12h10.5v3.5" fill="none" stroke="currentColor" stroke-width="2"/>', 1),
  lbl: qsv('<path d="M3.5 4.5h9.2l7.8 7.8-8.2 8.2-7.8-7.8V4.5z"/><circle cx="8" cy="9" r="1.6"/>'),
  chg: qsv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  all: qsv('<rect x="3" y="4" width="18" height="5" rx="1.2"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>'),
  cfg: qsv('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
  sys: qsv('<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
};
const qBrand = (sub) => `<img class="qm-d" src="${QM_D}" alt=""><img class="qm-l" src="${QM_L}" alt=""><div class="bt"><span class="bn">QORVE<i>X</i><b>MOBILE</b></span><small>${sub}</small></div>`;
const CH_LOGO = 'img/logo-ch.jpg';
const COMPS = ['Switch Ch', 'Switch Gde', 'Llaves', 'BCM', 'Cluster', 'Arnés'];
const MAX_REPEAT = { 'Switch Gde': 5, 'Switch Ch': 5 };          // veces que un job puede repetirse por componente
const maxRep = (c) => MAX_REPEAT[c] || 1;
/* Nombre de este equipo (TAB1, TAB2…): cada tableta escribe su propio Validacion_TAB1.xlsx / Secuencia_TAB1.xlsx */
const DEV_KEY = 'vm_dev';
const devName = () => { try { return (localStorage.getItem(DEV_KEY) || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ''); } catch (e) { return ''; } };
const devFile = (k) => { const d = new Date(); return `${({ validacion: 'Validacion', secuencia: 'Secuencia', devolucion: 'Devolucion', entrega: 'Entrega' })[k] || 'Validacion'}_${devName() || 'SIN-EQUIPO'}_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}.txt`; };
/* IDs por equipo: TAB1 → 1000001…, TAB2 → 2000001… (el primer dígito dice de qué tableta es; nunca se repiten) */
const idBase = () => { const m = devName().match(/^TAB(\d{1,3})$/); return m ? Number(m[1]) * 1e6 : 0; };
const isSw = (c) => c === 'Switch Ch' || c === 'Switch Gde';   // en Validación se capturan como Caja + ID
const SW_ID_MAX = 15, JOB_DIGITS = 6;
const onlyNum = (v, max) => String(v ?? '').replace(/\D/g, '').slice(0, max || JOB_DIGITS);
/* Job e ID: solo números (el escáner puede mandar letras, ej. BC202526 → 202526) */
document.addEventListener('input', (e) => {
  const t = e.target; if (!t || !t.matches || !t.matches('input.job, input.cj')) return;
  const nv = onlyNum(t.value, +t.dataset.max || JOB_DIGITS); if (nv !== t.value) t.value = nv;
}, true);
const JOB_STEP = 5, JOB_MAX = 50, CLUSTER_ROWS = 36, CLUSTER_STEP = 3, PAGE = 100;
const STORAGE_LIMIT = 5000000;                    // ~5 millones de caracteres en localStorage
const K = { users: 'vm_users', recs: 'vm_records', chg: 'vm_changes', seq: 'vm_seq', prefs: 'vm_prefs', cfg: 'vm_cfg' };
const MASTER = 'ADMIN';
const ROLE_N = { master: 'Admin master', admin: 'Supervisor / Admin', verificador: 'Capturista / Validador' };
const DEF_CFG = { shifts: [
  { n: 'Día', s: '07:00', e: '15:00', gv: 0, gs: 0 },
  { n: 'Tarde', s: '15:00', e: '22:30', gv: 0, gs: 0 },
  { n: 'Noche', s: '22:30', e: '07:00', gv: 0, gs: 0 },
] };
const SS = { sess: 'vm_session', cap: 'vm_capture', sup: 'vm_sup' };

/* ---------------- Utilidades ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (v) => String(v ?? '').replace(/[\x00-\x1f\x7f]/g, '').trim().toUpperCase();
const pad = (n) => String(n).padStart(2, '0');
const fDate = (ts) => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const fTime = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const fDT = (ts) => `${fDate(ts)} ${fTime(ts)}`;
const stamp = () => { const d = new Date(); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`; };
const fmtN = (n) => Number(n).toLocaleString('es-MX');
const uniq = (a) => [...new Set(a)];
const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
};

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function ssGet(k, d) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin sesión persistente */ } }

/* SHA-256 (sin dependencias, funciona también abierto como archivo local) */
function sha256(ascii) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  const mp = Math.pow, maxWord = mp(2, 32);
  let i, j, result = '';
  const words = [], bitLen = ascii.length * 8;
  let hash = sha256.h = sha256.h || [];
  const k = sha256.k = sha256.k || [];
  let pc = k.length;
  const comp = {};
  for (let cand = 2; pc < 64; cand++) {
    if (!comp[cand]) {
      for (i = 0; i < 313; i += cand) comp[i] = cand;
      hash[pc] = (mp(cand, .5) * maxWord) | 0;
      k[pc++] = (mp(cand, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); if (j >> 8) return ''; words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = ((bitLen / maxWord) | 0);
  words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16), old = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
      const t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i]
        + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
  }
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; result += (b < 16 ? '0' : '') + b.toString(16); }
  return result;
}
const hashPw = (emp, pw) => sha256(unescape(encodeURIComponent(`vm|${emp}|${pw}`)));

/* ---------------- Base de datos (localStorage) ---------------- */
const S = { users: [], recs: [], chg: [], seq: { r: 0, b: 0, c: 0 }, prefs: { kb: true }, cfg: JSON.parse(JSON.stringify(DEF_CFG)) };
function loadAll() {
  S.users = lsGet(K.users, []);
  // Roles: Admin master (solo 25164), Administrador, Verificador
  let rc = false;
  S.users.forEach((u) => {
    if (u.emp === MASTER) { if (u.role !== 'master') { u.role = 'master'; rc = true; } }
    else if (u.role === 'master') { u.role = 'admin'; rc = true; }
    else if (u.role !== 'admin' && u.role !== 'verificador') { u.role = 'verificador'; rc = true; }
  });
  if (rc) { try { localStorage.setItem(K.users, JSON.stringify(S.users)); } catch (e) {} }
  S.cfg = lsGet(K.cfg, null) || JSON.parse(JSON.stringify(DEF_CFG));
  if (!Array.isArray(S.cfg.shifts) || !S.cfg.shifts.length) S.cfg.shifts = JSON.parse(JSON.stringify(DEF_CFG.shifts));
  S.recs = lsGet(K.recs, []);
  if (S.recs.some((r) => r.comp === 'Harness')) { S.recs.forEach((r) => { if (r.comp === 'Harness') r.comp = 'Arnés'; }); try { localStorage.setItem(K.recs, JSON.stringify(S.recs)); } catch (e) {} }
  if (S.recs.some((r) => Array.isArray(r.jobs))) {
    const seq0 = Object.assign({ r: 0, b: 0, c: 0 }, lsGet(K.seq, {}));
    const out = [];
    S.recs.forEach((r) => {
      if (!Array.isArray(r.jobs)) { out.push(r); return; }
      const lote = ++seq0.b;
      r.jobs.forEach((j) => out.push({ id: ++seq0.r, ts: r.ts, emp: r.emp, name: r.name || '', comp: r.comp, plates: '', cont: r.cont, job: j, lote, ses: r.ses, type: 'secuencia', ed: 0, del: null }));
    });
    S.recs = out;
    try { localStorage.setItem(K.recs, JSON.stringify(out)); localStorage.setItem(K.seq, JSON.stringify(seq0)); } catch (e) {}
  }
  { let fx = false; const sq = Object.assign({ r: 0, b: 0, c: 0 }, lsGet(K.seq, {}));
    S.recs.forEach((r) => {
      if (r.job == null && r.batch != null) { r.job = String(r.batch); fx = true; }
      if (r.job == null) { r.job = ''; fx = true; }
      if (r.cont == null) { r.cont = ''; fx = true; }
      if (r.plates == null) { r.plates = ''; fx = true; }
      if (r.name == null) { r.name = (S.users.find((u) => u.emp === r.emp) || {}).name || ''; fx = true; }
      if (r.id == null) { r.id = ++sq.r; fx = true; }
      if (r.lote == null) { r.lote = ++sq.b; fx = true; }
      if (r.del === undefined) { r.del = null; fx = true; }
    });
    if (fx) { try { localStorage.setItem(K.recs, JSON.stringify(S.recs)); localStorage.setItem(K.seq, JSON.stringify(sq)); } catch (e) {} } }
  S.chg = lsGet(K.chg, []);
  S.seq = Object.assign({ r: 0, b: 0, c: 0 }, lsGet(K.seq, {}));
  S.prefs = Object.assign({ kb: true }, lsGet(K.prefs, {}));
}
// Guarda las llaves indicadas. Si el almacenamiento se llena, revierte memoria y avisa.
function save(...keys) {
  try { keys.forEach((k) => localStorage.setItem(K[k], JSON.stringify(S[k]))); return true; }
  catch (e) { loadAll(); storageFullModal(); return false; }
}
function storageUsed() { let n = 0; Object.values(K).forEach((k) => { const v = localStorage.getItem(k); if (v) n += v.length + k.length; }); return n; }
function storagePct() { return Math.min(100, (storageUsed() / STORAGE_LIMIT) * 100); }

/* ---------------- Sesión ---------------- */
let ME = null, LOGIN_PREV = null;
const isAdmin = () => !!ME && (ME.role === 'admin' || ME.role === 'master');
const isMaster = () => !!ME && ME.role === 'master';
const roleName = (u) => (u && u.puesto && { admin: 'Supervisor / Admin', capturista: 'Capturista', validador: 'Validador' }[u.puesto]) || ROLE_N[u?.role] || 'Validador';

/* ---------------- Turnos ---------------- */
const hm = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const inShift = (x, m) => { const a = hm(x.s), b = hm(x.e); return a === b ? true : a < b ? (m >= a && m < b) : (m >= a || m < b); };
function shiftObj(ts) { const d = new Date(ts), m = d.getHours() * 60 + d.getMinutes(); return (S.cfg.shifts || []).find((x) => inShift(x, m)) || null; }
function shiftOf(ts) { const x = shiftObj(ts); return x ? x.n : 'Sin turno'; }
const recShift = (r) => r.shift || shiftOf(r.ts);
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/* Fecha operativa: si el turno cruza la medianoche, lo capturado después de las 00:00 cuenta para el día en que inició el turno */
function opDate(ts) {
  const d = new Date(ts), m = d.getHours() * 60 + d.getMinutes(), x = shiftObj(ts);
  if (x && hm(x.s) > hm(x.e) && m < hm(x.e)) d.setDate(d.getDate() - 1);
  return isoDay(d);
}
function currentUser() { const s = ssGet(SS.sess, null); if (!s) return null; return S.users.find((u) => u.emp === s.emp && u.active) || null; }
function logout() { ssSet(SS.sess, null); ssSet(SS.cap, null); ssSet(SS.sup, null); ME = null; CAP = null; TAB = 'cap'; renderLogin(); }

/* ---------------- UI: toasts, modales, sonido ---------------- */
function toast(msg, type = 'info', ms = 3200) {
  const t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = msg;
  const box = $('#toasts'); box.append(t); while (box.children.length > 3) box.firstChild.remove(); setTimeout(() => t.remove(), ms);
}
let AC = null;
function beep(kind) {
  try {
    if (kind === 'ok' || kind === 'save' || kind === 'err') { document.body.classList.remove('q-ok', 'q-err'); void document.body.offsetWidth; document.body.classList.add(kind === 'err' ? 'q-err' : 'q-ok'); clearTimeout(beep._t); beep._t = setTimeout(() => document.body.classList.remove('q-ok', 'q-err'), 500); }
    if (S.prefs && S.prefs.sound === false) { if (kind === 'err' && navigator.vibrate) navigator.vibrate([150, 80, 150]); return; }
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = kind === 'err' ? 'square' : 'sine';
    o.frequency.value = kind === 'err' ? 220 : (kind === 'save' ? 1046 : 880);
    g.gain.value = kind === 'err' ? 0.12 : 0.07;
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + (kind === 'err' ? 0.4 : 0.1));
    if (kind === 'err' && navigator.vibrate) navigator.vibrate([150, 80, 150]);
  } catch (e) { /* sin audio */ }
}
function modal({ title, body, buttons = [], wide = false, cls = '', onOpen }) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${wide ? 'wide' : ''} ${cls}" role="dialog" aria-modal="true">
    <header><h3>${title}</h3><button class="x" aria-label="Cerrar">&times;</button></header>
    <div class="body">${body}</div><footer></footer></div>`;
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  $('.x', bg).onclick = close;
  const foot = $('footer', bg);
  if (!buttons.length) foot.remove();
  buttons.forEach((b) => {
    const el = document.createElement('button'); el.type = 'button'; el.className = `btn ${b.cls || ''}`; el.innerHTML = b.t;
    el.onclick = async () => { if (b.fn) { const r = await b.fn(bg, close); if (r === false) return; } close(); };
    foot.append(el);
  });
  document.body.append(bg);
  if (onOpen) onOpen(bg, close);
  return { el: bg, close };
}
function confirmBox(title, html, okText, danger = true) {
  return new Promise((res) => {
    modal({ title, body: html, cls: danger ? 'danger' : '', buttons: [
      { t: 'Cancelar', fn: () => res(false) },
      { t: okText, cls: danger ? 'danger-solid' : 'primary', fn: () => res(true) },
    ] });
  });
}
function storageFullModal() {
  beep('err');
  modal({ title: 'Almacenamiento lleno', cls: 'danger', body: `<div class="banner err">No se pudo guardar: la memoria del navegador de esta tableta está llena.</div>
    <div>Lo último que capturaste <b>no se guardó</b>. Pide al administrador que exporte el respaldo y purgue registros limpiados desde <b>Sistema</b>.</div>`,
    buttons: [{ t: 'Entendido', cls: 'primary' }] });
}
function setMsg(inp, msg, kind = 'err') {
  const f = inp.closest('.field'); if (!f) return;
  f.classList.remove('invalid', 'good', 'warnf');
  const m = $('.msg', f);
  if (m) { m.textContent = msg || ''; m.className = `msg ${kind === 'warn' ? 'warn' : ''}`; }
  if (msg) f.classList.add(kind === 'warn' ? 'warnf' : 'invalid');
  else if (inp.value) f.classList.add('good');
}
const scanAttrs = () => `autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" enterkeyhint="next" inputmode="${S.prefs.kb ? 'text' : 'none'}"`;

/* =====================================================================
   REGLAS DE VALIDACIÓN
   - Job único por componente; en Switch Gde y Switch Ch máximo 5 veces.
   - Cluster: 1 contenedor = 1 job → el contenedor también es único.
   - Solo cuentan los registros activos (lo limpiado no bloquea).
   ===================================================================== */
const active = () => S.recs.filter((r) => !r.del);
function checkJob(comp, job, inFormCount, excludeIds = [], type) {
  if (!job) return '';
  if ((type || (CAP && CAP.type)) === 'devolucion') return checkDev(comp, job, inFormCount, excludeIds);
  if ((type || (CAP && CAP.type)) === 'entrega') return checkEnt(comp, job, inFormCount, excludeIds);
  // Validación y Secuencia llevan cuentas separadas; se revisa contra TODAS las tabletas (QX.others = lo de las demás)
  const ty = type || (CAP && CAP.type) || 'validacion';
  const same = (r) => !r.del && r.comp === comp && r.job === job && (r.type || 'validacion') === ty && !excludeIds.includes(r.id);
  const base = [...S.recs.filter(same), ...((window.QX && QX.others) || []).filter(same)];
  const max = maxRep(comp);
  if (base.length + inFormCount > max) {
    const b = base[0];
    if (max === 1) return base.length ? `Job ya capturado (${esc(b.dev || devName() || 'esta tableta')} · cont. ${esc(b.cont)} · ${fDT(b.ts)}). Si es correcto, pide a QORVEX que lo agregue como duplicado.` : 'Job repetido en esta captura';
    return `Máximo ${max} veces en ${ty === 'secuencia' ? 'Secuencia' : 'Validación'}: ya hay ${base.length}${inFormCount > 1 ? ` y ${inFormCount} aquí` : ''}`;
  }
  return '';
}
/* Devolución: solo se devuelve lo que se validó o secuenció antes; no se repite mientras su caja de devolución siga sin entregarse */
function checkDev(comp, job, inFormCount, excludeIds = []) {
  const pool = [...S.recs, ...((window.QX && QX.others) || [])].filter((r) => !r.del && r.comp === comp && r.job === job && !excludeIds.includes(r.id));
  if (!pool.some((r) => (r.type || 'validacion') !== 'devolucion')) return 'Este job no tiene validación ni secuencia capturada: no se puede devolver';
  const ent = (window.QX && QX.ent) || new Set();
  const open = pool.filter((r) => r.type === 'devolucion' && !ent.has(String(r.cont).toUpperCase()));
  const max = maxRep(comp);
  if (open.length + inFormCount > max) { const b = open[0]; return b ? `Ya está en devolución sin entregar (${esc(b.dev || devName() || 'esta tableta')} · caja ${esc(b.cont)} · ${fDT(b.ts)})` : 'Job repetido en esta devolución'; }
  return '';
}
/* Entrega por job (excepción): el job debe estar en el Plan General y no estar ya entregado en ese componente.
   Si después de entregarse regresó en una devolución, se puede volver a entregar. */
function checkEnt(comp, job, inFormCount, excludeIds = []) {
  if (inFormCount > 1) return 'Job repetido en esta entrega';
  const plan = window.QX && QX.plan;
  if (plan && !plan.has(window.QXnormJob ? QXnormJob(job) : job)) return 'Este job no está en el Plan General';
  const pool = [...S.recs, ...((window.QX && QX.others) || [])].filter((r) => !r.del && r.comp === comp && r.job === job && !excludeIds.includes(r.id));
  const last = (t) => pool.filter((r) => r.type === t).sort((a, b) => b.ts - a.ts)[0];
  const e = last('entrega'), d = last('devolucion');
  if (e && (!d || e.ts >= d.ts)) return `Ya se registró su entrega (${esc(e.dev || devName() || 'esta tableta')} · ${fDT(e.ts)}${e.motivo ? ` · ${esc(e.motivo)}` : ''})`;
  const ent = (window.QX && QX.ent) || new Set();
  const box = pool.filter((r) => r.type !== 'entrega' && ent.has(String(r.cont).toUpperCase())).sort((a, b) => b.ts - a.ts)[0];
  if (box && (!d || box.ts >= d.ts || ent.has(String(d.cont).toUpperCase()))) return `Ya se entregó con la caja ${esc(box.cont)} (Entregas.xlsx)`;
  return '';
}
function checkClusterCont(cont, inFormCount, excludeIds = [], comp = 'Cluster') {
  if (!cont) return '';
  const sw = isSw(comp), base = [...S.recs, ...((window.QX && QX.others) || [])].filter((r) => !r.del && r.comp === comp && r.cont === cont && !excludeIds.includes(r.id) && (!sw || (r.type || 'validacion') !== 'secuencia'));
  if (base.length + inFormCount > 1) return base.length ? `${sw ? 'Caja' : 'Contenedor'} ya capturad${sw ? 'a' : 'o'} (${sw ? 'ID' : 'job'} ${base[0].job} · ${fDT(base[0].ts)})` : `${sw ? 'Caja repetida' : 'Contenedor repetido'} en esta captura`;
  return '';
}

/* =====================================================================
   ARRANQUE
   ===================================================================== */
let TAB = 'cap';
let CAP = null; // { comp, plates, sid, started, draft }
function boot() {
  loadAll();
  if (!S.users.length) return renderSetup();
  ME = currentUser();
  if (!ME) return renderLogin();
  if (ME.must) return renderChangePw(true);
  CAP = ssGet(SS.cap, null);
  renderShell();
}

/* ---------------- Login / configuración inicial ---------------- */
const hero = () => `
  <div class="login-hero">
    <div class="lh-top">
      <div class="lh-brand"><img class="lh-sese" src="${CH_LOGO}" alt="CH Industrial Solutions"><span>CH INDUSTRIAL SOLUTIONS · AUTOMATION · DATA · LOGISTICS</span></div>
    </div>
    <div class="lh-bot">
      <div class="login-clock" id="lclock"></div>
      <div class="login-dev"><img src="${CH_LOGO}" alt=""><span><b>QORVEX</b> · Desarrollado por <b>CH Industrial Solutions</b></span></div>
    </div>
  </div>
  <div class="lp-glow g1"></div><div class="lp-glow g2"></div><div class="lp-glow g3"></div>`;
const L_ICON = {
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  id: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h3"/></svg>',
};
const avatar = () => `<img class="l-logo" src="${Q_LOGO}" alt="QORVEX"><span class="l-mobile">MOBILE</span><div class="l-avatar"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12"/><path d="M10 58c2-12 11-18 22-18s20 6 22 18"/></svg></div>`;
let clockTimer = null;
function startClock() {
  clearInterval(clockTimer);
  const tick = () => { const c = $('#lclock'); if (!c) return clearInterval(clockTimer); c.textContent = new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' }); };
  tick(); clockTimer = setInterval(tick, 15000);
}
const app = () => $('#app');

function renderSetup() {
  app().innerHTML = `<div class="login-page">${hero()}
    <div class="login-card"><form id="f" autocomplete="off" novalidate>
      ${avatar()}<div><h2>Configuración inicial</h2><div class="muted">Carpeta nueva: aún no hay usuarios. Crea la cuenta del <b>Administrador</b>; se guarda en la carpeta (Config_QORVEX.json) y la ven el Motor y las demás tabletas.</div></div>
      <div class="field"><label>No. de empleado</label><input class="input" name="emp" autofocus><div class="msg"></div></div>
      <div class="field"><label>Nombre</label><input class="input" name="name"><div class="msg"></div></div>
      <div class="field"><label>Contraseña (mín. 4)</label><input class="input" name="pw" type="password"><div class="msg"></div></div>
      <div class="field"><label>Confirmar contraseña</label><input class="input" name="pw2" type="password"><div class="msg"></div></div>
      <button class="btn primary xl" type="submit">CREAR ADMINISTRADOR</button>
      <div class="muted" style="font-size:13px">¿Tienes un respaldo (.json)? <a href="#" id="rest">Restaurar respaldo</a></div>
    </form></div></div>`;
  startClock();
  const f = $('#f');
  f.emp.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
  $('#rest').onclick = (e) => { e.preventDefault(); restoreBackup(); };
  f.onsubmit = (e) => {
    e.preventDefault();
    const emp = norm(f.emp.value), name = f.name.value.trim(), pw = f.pw.value;
    $$('.field', f).forEach((x) => setMsg($('input', x), ''));
    if (!emp) return setMsg(f.emp, 'Requerido');
    if (!name) return setMsg(f.name, 'Requerido');
    if (pw.length < 4) return setMsg(f.pw, 'Mínimo 4 caracteres');
    if (pw !== f.pw2.value) return setMsg(f.pw2, 'No coincide');
    S.users = [{ emp, name, role: emp === MASTER ? 'master' : 'admin', pw: hashPw(emp, pw), active: true, must: false, created: Date.now(), last: null }];
    if (!save('users')) return;
    toast('Administrador creado. Inicia sesión.', 'ok');
    renderLogin(emp);
  };
}

function renderLogin(prefill = '') {
  app().innerHTML = `<div class="login-page">${hero()}
    <div class="login-card"><form id="f" autocomplete="off" novalidate>
      ${avatar()}
      <div class="l-head"><h2>Bienvenido</h2><div class="muted">Ingresa tu número de empleado y contraseña</div></div>
      <div class="field ic"><label>No. de empleado</label>${L_ICON.id}<input class="input" name="emp" value="${esc(prefill)}" placeholder="No. de empleado" autocomplete="username"><div class="msg"></div></div>
      <div class="field ic"><label>Contraseña</label>${L_ICON.lock}<input class="input" name="pw" type="password" placeholder="Contraseña" autocomplete="current-password"><div class="msg"></div></div>
      <div id="err"></div>
      <button class="btn primary xl" type="submit">INGRESAR</button>
      <div class="muted l-help">¿Olvidaste tu contraseña? Pide a un administrador que te asigne una nueva.</div>
    </form></div></div>`;
  startClock();
  const f = $('#f');
  (prefill ? f.pw : f.emp).focus();
  f.emp.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
  f.emp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); f.pw.focus(); } });
  f.onsubmit = (e) => {
    e.preventDefault();
    loadAll();
    const emp = norm(f.emp.value), u = S.users.find((x) => x.emp === emp);
    $('#err').innerHTML = '';
    if (!u || u.pw !== hashPw(emp, f.pw.value)) {
      $('#err').innerHTML = '<div class="form-error">No. de empleado o contraseña incorrectos.</div>';
      f.pw.value = ''; f.pw.focus(); beep('err'); return;
    }
    if (!u.active) { $('#err').innerHTML = '<div class="form-error">Usuario desactivado. Consulta al administrador.</div>'; return; }
    const prevLast = u.last; u.last = Date.now(); save('users'); LOGIN_PREV = prevLast;
    ME = u; ssSet(SS.sess, { emp: u.emp });
    clearInterval(clockTimer);
    if (u.must) return renderChangePw(true);
    CAP = null; ssSet(SS.cap, null); TAB = 'cap';
    flashThen(() => showWelcome(u, renderShell, prevLast));
  };
}

/* Destello breve al ingresar */
function flashThen(next) {
  const card = $('.login-card'); if (card) card.classList.add('ok');
  const f = document.createElement('div'); f.className = 'l-flash'; document.body.append(f);
  setTimeout(next, 380);
  setTimeout(() => f.remove(), 900);
}
/* Bienvenida al iniciar sesión (≈2 s, toca para saltar) */
function showWelcome(u, then, prevLast) {
  const now = new Date(), h = now.getHours();
  const hi = h >= 5 && h < 12 ? 'Buenos días' : h >= 12 && h < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nm = String(u.name || u.emp).trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const w = document.createElement('div'); w.className = 'welcome';
  w.innerHTML = `<div class="w-card">
      <img class="w-logo" src="${Q_LOGO}" alt="QORVEX"><div class="w-brand">MOBILE · Validación y Secuencia</div>
      <div class="w-hi">${hi},</div>
      <div class="w-nm">${esc(nm)}</div>
      <div class="w-meta">
        <div><div class="k">No. de empleado</div><div class="v">${esc(u.emp)}</div></div>
        <div><div class="k">Perfil</div><div class="v">${roleName(u)}</div></div>
        <div><div class="k">Último ingreso</div><div class="v">${prevLast ? fDT(prevLast).slice(0, 16) : 'Primer ingreso'}</div></div>
      </div>
      <div class="w-load"><i></i></div>
    </div>
    <div class="w-foot"><span>${now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${pad(h)}:${pad(now.getMinutes())}</span><span>QORVEX MOBILE · CH Industrial Solutions</span></div>`;
  document.body.append(w);
  then();
  let done = false;
  const end = () => { if (done) return; done = true; w.classList.add('out'); setTimeout(() => w.remove(), 300); };
  w.onclick = end; setTimeout(end, 2000);
}

function renderChangePw(forced) {
  app().innerHTML = `<div class="login-page">${hero()}
    <div class="login-card"><form id="f" novalidate>
      <div><h2>Cambia tu contraseña</h2><div class="muted">${forced ? 'Es tu primer ingreso o el administrador asignó una contraseña temporal.' : ''}</div></div>
      <div class="field"><label>Contraseña actual / temporal</label><input class="input" name="cur" type="password" autofocus><div class="msg"></div></div>
      <div class="field"><label>Nueva contraseña (mín. 4)</label><input class="input" name="nw" type="password"><div class="msg"></div></div>
      <div class="field"><label>Confirmar nueva contraseña</label><input class="input" name="nw2" type="password"><div class="msg"></div></div>
      <button class="btn primary xl" type="submit">GUARDAR</button>
      <a href="#" id="out" class="muted" style="text-align:center">Salir</a>
    </form></div></div>`;
  startClock();
  const f = $('#f');
  $('#out').onclick = (e) => { e.preventDefault(); logout(); };
  f.onsubmit = async (e) => {
    e.preventDefault();
    [f.cur, f.nw, f.nw2].forEach((i) => setMsg(i, ''));
    if (!(await QXsec.pwOk(ME.emp, f.cur.value, ME.pw))) return setMsg(f.cur, 'Contraseña incorrecta');
    if (f.nw.value.length < 4) return setMsg(f.nw, 'Mínimo 4 caracteres');
    if (f.nw.value !== f.nw2.value) return setMsg(f.nw2, 'No coincide');
    ME.pw = await QXsec.pwMake(ME.emp, f.nw.value); ME.pwAt = Date.now(); ME.must = false;
    try { if (window.QX && QX.master && QX.master.emp === ME.emp) { await QXsec.writeMaster(QX.dir, { ...QX.master, pw: ME.pw }); QX.master = await QXsec.readMaster(QX.dir); } } catch (x) { toast('No se pudo guardar la contraseña del Admin master en la carpeta', 'err'); return; }
    if (!save('users')) return;
    toast('Contraseña actualizada', 'ok');
    clearInterval(clockTimer); showWelcome(ME, renderShell, LOGIN_PREV);
  };
}

/* =====================================================================
   SHELL
   ===================================================================== */
const TABS = [
  { id: 'cap', t: 'Captura', c: 'SCAN' },
  { id: 'prod', t: 'Mi productividad', c: 'MI TURNO' },
  { id: 'dash', t: 'Avance por turno', c: 'DASHBOARD' },
  { id: 'val', t: 'Validación', c: 'VALIDATE' },
  { id: 'seq', t: 'Secuenciado', c: 'SEQUENCE' },
  { id: 'dev', t: 'Devoluciones', c: 'RETURNS' },
  { id: 'ent', t: 'Entregas por job', c: 'DELIVERY' },
  { id: 'lbl', t: 'Impresión 6 × 4', c: 'ETIQUETAS' },
  { id: 'chg', t: 'Cambios', c: 'LOG' },
  { id: 'all', t: 'Respaldo (todo)', c: 'BACKUP', admin: true },
  { id: 'cfg', t: 'Configuración', c: 'CONFIG', admin: true },
  { id: 'sys', t: 'Sistema', c: 'SYSTEM', admin: true },
];
function renderShell() {
  app().innerHTML = `<div class="shell">
    <header class="topbar">
      <div class="brand-name">${qBrand('VALIDACIÓN Y SECUENCIA · CH INDUSTRIAL SOLUTIONS')}</div>
      <span class="spacer"></span>
      <a class="chip xlink" href="https://ch-industrial-solutions.github.io/QORVEX_SeqManager/" data-qxapp="QORVEX_MOTOR" data-local="../QORVEX/index.html" rel="noopener" title="Abrir QORVEX (Motor) en su propia ventana"><span class="k">Abrir</span><span class="v">QORVEX ↗</span></a>
      <button class="tsw" data-tsw title="Cambiar tema (BLACK / WHITE)" aria-label="Cambiar tema"><span class="knob"><svg class="moon" viewBox="0 0 32 32" aria-hidden="true"><path d="M19.5 6.5a10 10 0 1 0 6 16.9A11.5 11.5 0 0 1 19.5 6.5z" fill="currentColor"/><path d="M23 7.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="currentColor"/><path d="M26.5 14.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor"/></svg><svg class="sun" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M16 3.5v3.2M16 25.3v3.2M3.5 16h3.2M25.3 16h3.2M7.2 7.2l2.2 2.2M22.6 22.6l2.2 2.2M7.2 24.8l2.2-2.2M22.6 9.4l2.2-2.2"/></g></svg></span></button>
      <button class="chip" id="sndChip" title="Activar o silenciar el sonido al escanear">
        <span class="k">Sonido</span><span class="v" id="sndV"></span></button>
      <button class="chip" id="kbChip" title="Mostrar u ocultar el teclado en pantalla al escanear">
        <span class="k">Teclado en pantalla</span><span class="v" id="kbV"></span></button>
      <button class="chip" id="meChip" title="Cambiar mi contraseña">
        <span class="k">${roleName(ME)}</span><span class="v">${esc(ME.emp)} · ${esc(ME.name)}</span></button>
      <button class="btn-logout" id="outBtn">Salir</button>
    </header>
    <nav class="tabs" id="tabs">${TABS.filter((t) => !t.admin || isAdmin()).map((t, i, arr) =>
      `${t.admin && !arr[i - 1]?.admin ? '<span class="tab-sep"></span>' : ''}<button class="tab ${t.admin ? 'adm' : ''}" data-t="${t.id}">${TAB_ICO[t.id] || ''}<span class="tl"><b>${t.c}</b><small>${t.t}</small></span></button>`).join('')}</nav>
    <main class="main" id="main"></main>
    <footer class="app-foot"><span class="ql">QORVEX MOBILE</span><span>CONNECT · VALIDATE · SEQUENCE · OPTIMIZE</span><span>|</span><img src="${CH_LOGO}" alt=""><span><b>CH Industrial Solutions</b> · Todos los derechos reservados</span></footer>
  </div>`;
  const kbV = () => { $('#kbV').textContent = S.prefs.kb ? 'Visible' : 'Oculto (escáner)'; };
  kbV();
  $('#kbChip').onclick = () => { S.prefs.kb = !S.prefs.kb; save('prefs'); kbV(); $$('input.scan').forEach((i) => i.setAttribute('inputmode', S.prefs.kb ? 'text' : 'none')); toast(S.prefs.kb ? 'Teclado en pantalla visible' : 'Teclado oculto: usa el escáner', 'info'); };
  const sndV = () => { $('#sndV').textContent = S.prefs.sound === false ? 'Silencio' : 'Activo'; };
  sndV();
  $('#sndChip').onclick = () => { S.prefs.sound = S.prefs.sound === false; save('prefs'); sndV(); if (S.prefs.sound !== false) beep('ok'); toast(S.prefs.sound === false ? 'Sonido silenciado' : 'Sonido activo', 'info'); };
  $('#meChip').onclick = changeMyPwModal;
  $('#outBtn').onclick = async () => {
    if (TAB === 'cap' && pendingCount() > 0 && !(await confirmBox('Salir', `<div class="banner warn">Hay <b>${pendingCount()}</b> lecturas sin enviar (Submit). Se perderán.</div>`, 'Salir de todos modos'))) return;
    logout();
  };
  $$('#tabs .tab').forEach((b) => (b.onclick = () => showTab(b.dataset.t)));
  showTab(TAB);
}
/* Contexto para el módulo compartido de etiquetas (mismo código que QORVEX Motor) */
const LBLCTX = {
  dir: () => (window.QX && QX.dir) || null, dev: () => devName() || 'TAB', user: () => (ME ? { emp: ME.emp, name: ME.name } : null), isAdmin: () => isAdmin(),
  cfg: () => (window.QX && QX.cfg) || null, toast: (m, t, ms) => toast(m, t, ms), confirm: (t, h, ok) => confirmBox(t, h, ok || 'Aceptar', false), ui: { panel: 'panel', head: 'sec-head' },
};
function showTab(id) {
  if (id === 'users') id = 'cfg';
  if (!TABS.some((t) => t.id === id && (!t.admin || isAdmin()))) id = 'cap';
  TAB = id;  if (id === 'seq') {
    const bn = $('.brand-name');
    if (bn) {
      const orig = bn.innerHTML;
      if (!orig.includes('SECUENCIADO DE')) {
        bn.innerHTML = qBrand('SECUENCIADO DE COMPONENTES · CH INDUSTRIAL SOLUTIONS');
      }
    }
  } else if (id === 'cap' || id === 'mine') {
    const bn = $('.brand-name');
    if (bn) bn.innerHTML = qBrand('VALIDACIÓN Y SECUENCIA · CH INDUSTRIAL SOLUTIONS');
  }

  $$('#tabs .tab').forEach((b) => b.classList.toggle('on', b.dataset.t === id));
  loadAll(); ME = S.users.find((u) => u.emp === ME.emp) || ME;
  const m = $('#main'); m.innerHTML = '';
  ({ cap: renderCaptura, val: () => renderRecords('mine', 'validacion'), seq: () => renderRecords('mine', 'secuencia'), dev: () => renderRecords('mine', 'devolucion'), ent: () => renderRecords('mine', 'entrega'), chg: renderChanges, all: () => renderRecords('all'), dash: renderDash, lbl: () => window.QXLabels.render($('#main'), LBLCTX), cfg: renderConfig, sys: renderSystem, prod: () => renderMyProd() })[id]();
  window.scrollTo(0, 0);
}
function changeMyPwModal() {
  modal({ title: 'Cambiar mi contraseña', body: `
    <div class="field"><label>Contraseña actual</label><input class="input" id="c1" type="password"><div class="msg"></div></div>
    <div class="field"><label>Nueva contraseña (mín. 4)</label><input class="input" id="c2" type="password"><div class="msg"></div></div>
    <div class="field"><label>Confirmar</label><input class="input" id="c3" type="password"><div class="msg"></div></div>`,
    onOpen: (el) => $('#c1', el).focus(),
    buttons: [{ t: 'Cancelar' }, { t: 'Guardar', cls: 'primary', fn: async (el) => {
      const [a, b, c] = ['#c1', '#c2', '#c3'].map((s) => $(s, el)); [a, b, c].forEach((i) => setMsg(i, ''));
      if (!(await QXsec.pwOk(ME.emp, a.value, ME.pw))) { setMsg(a, 'Incorrecta'); return false; }
      if (b.value.length < 4) { setMsg(b, 'Mínimo 4 caracteres'); return false; }
      if (b.value !== c.value) { setMsg(c, 'No coincide'); return false; }
      ME.pw = await QXsec.pwMake(ME.emp, b.value); ME.pwAt = Date.now();
      try { if (window.QX && QX.master && QX.master.emp === ME.emp) { await QXsec.writeMaster(QX.dir, { ...QX.master, pw: ME.pw }); QX.master = await QXsec.readMaster(QX.dir); } } catch (x) { toast('No se pudo guardar la contraseña del Admin master en la carpeta', 'err'); return false; }
      if (!save('users')) return false; toast('Contraseña actualizada', 'ok');
    } }] });
}

/* =====================================================================
   CAPTURA
   ===================================================================== */
function capSave() { ssSet(SS.cap, CAP); }
function pendingCount() {
  if (!CAP || !CAP.draft) return 0;
  const d = CAP.draft;
  if (d.pairs) return d.pairs.filter((p) => p[0] || p[1]).length;
  return (d.jobs || []).filter(Boolean).length;
}
function sessionStats() {
  const rows = CAP && CAP.sid ? S.recs.filter((r) => !r.del && r.ses === CAP.sid && r.type === (CAP.type || 'validacion')) : [];
  return { conts: uniq(rows.map((r) => r.cont)).length, jobs: rows.length, rows };
}
function renderCaptura() {
  if (!CAP || !CAP.comp) return renderCapStart();
  if (CAP.type === 'entrega') return CAP.com ? renderEntrega() : renderCapStart();
  const isSeq = CAP.type === 'secuencia' || CAP.type === 'devolucion';
  if (!isSeq && !CAP.plates) return renderCapStart();
  if (CAP.comp === 'Cluster' && !isSeq) return renderCluster(); // Cluster en Validación: 1 contenedor = 1 job
  return isSeq ? renderSeqJobs() : renderJobs();
}

function renderCapStart() {
  let sel = CAP?.comp || '';
  let mode = ssGet(SS.capMode, 'validacion');
  const m = $('#main');
  m.innerHTML = `
    <section class="m-hero"><div class="mh-ph mh-d" style="background-image:url(${HERO_D})"></div><div class="mh-ph mh-l" style="background-image:url(${HERO_L})"></div>
      <div class="mh-txt"><span class="mh-eye">QORVEX MOBILE · Validación y secuencia</span><span class="mh-ttl">Iniciar captura</span><span class="mh-tag">SCAN · VALIDATE · SEQUENCE</span>
      <span class="mh-sub">Selecciona el tipo de operación y configura los parámetros requeridos</span></div></section>
    <div class="panel">
      <h2>0 · Tipo de operación</h2>
      <div class="grid g3m g4m" style="max-width:1120px;margin-bottom:18px">
        <button class="mode-btn ${mode === 'validacion' ? 'sel' : ''}" data-m="validacion">
          <div class="mb-icon">✓</div>
          <div class="mb-title">Validación</div>
          <div class="mb-desc">Validar materiales con placas</div>
        </button>
        <button class="mode-btn ${mode === 'secuencia' ? 'sel' : ''}" data-m="secuencia">
          <div class="mb-icon">→</div>
          <div class="mb-title">Secuencia</div>
          <div class="mb-desc">Secuenciar componentes</div>
        </button>
        <button class="mode-btn ${mode === 'devolucion' ? 'sel' : ''}" data-m="devolucion">
          <div class="mb-icon">↩</div>
          <div class="mb-title">Devolución</div>
          <div class="mb-desc">Material que regresa de línea</div>
        </button>
        <button class="mode-btn ${mode === 'entrega' ? 'sel' : ''}" data-m="entrega">
          <div class="mb-icon">⇥</div>
          <div class="mb-title">Entrega por job</div>
          <div class="mb-desc">Excepción: job y componente</div>
        </button>
      </div>
      <h2>1 · Componente a procesar</h2>
      <div class="comp-grid">${COMPS.map((c) => `
        <button class="comp-tile ct-${COMPS.indexOf(c)} ${c === sel ? 'sel' : ''}" data-c="${esc(c)}">
          <b>${esc(c)}</b>
          <small>${mode === 'entrega' ? 'Jobs del Plan que se entregan sueltos' : mode === 'devolucion' ? 'Caja nueva + hasta 50 jobs ya capturados' : c === 'Cluster' && mode === 'validacion' ? 'Contenedor = job · hasta 36 pares' : `Caja o rack + hasta 50 jobs${isSw(c) ? ` · un job hasta ${maxRep(c)} veces` : ' · job único'}`}</small>
        </button>`).join('')}</div>
      ${mode === 'entrega' ? `<h2>2 · Comentario (obligatorio)</h2>
      <div class="field" style="max-width:720px"><input class="input big" id="ecom" maxlength="120" placeholder="Motivo de la entrega por job (ej. pull L1, devolución reenviada)"><div class="msg"></div></div>` : ''}
      ${mode === 'validacion' ? `<h2>2 · Placas de la unidad</h2>
      <div class="field" style="max-width:520px"><input class="input big scan" id="plates" placeholder="Escanea o escribe las placas" ${scanAttrs()}><div class="msg"></div></div>` : ''}
      <div style="margin-top:18px"><button class="btn primary xl" id="go">INICIAR ${mode === 'validacion' ? 'VALIDACIÓN' : mode === 'devolucion' ? 'DEVOLUCIÓN' : mode === 'entrega' ? 'ENTREGA' : 'SECUENCIA'}</button></div>
    </div>`;
  const pl = $('#plates');
  const go = () => {
    if (!sel) { beep('err'); toast('Selecciona un componente', 'err'); return; }
    if (mode === 'entrega') {
      const ec = $('#ecom'), com = ec.value.replace(/\s+/g, ' ').trim();
      if (!com) { beep('err'); setMsg(ec, 'Escribe el motivo: las entregas por job son excepciones'); ec.focus(); return; }
      CAP = { comp: sel, com, sid: `S${Date.now().toString(36)}`, started: Date.now(), draft: null, type: 'entrega' };
      capSave(); beep('ok'); return renderCaptura();
    }
    if (mode === 'validacion') {
      const plates = norm(pl.value); pl.value = plates;
      if (!plates) { beep('err'); setMsg(pl, 'Captura las placas de la unidad'); pl.focus(); return; }
      CAP = { comp: sel, plates, sid: `S${Date.now().toString(36)}`, started: Date.now(), draft: null, type: 'validacion' };
    } else {
      CAP = { comp: sel, sid: `S${Date.now().toString(36)}`, started: Date.now(), draft: null, type: mode === 'devolucion' ? 'devolucion' : 'secuencia' };
    }
    capSave(); beep('ok'); renderCaptura();
  };
  $$('.comp-tile', m).forEach((b) => (b.onclick = () => {
    sel = b.dataset.c; $$('.comp-tile', m).forEach((x) => x.classList.toggle('sel', x === b)); if (pl) pl.focus();
  }));
  $$('.mode-btn', m).forEach((b) => (b.onclick = () => {
    mode = b.dataset.m; ssSet(SS.capMode, mode); $$('.mode-btn', m).forEach((x) => x.classList.toggle('sel', x === b)); renderCapStart();
  }));
  if (pl) {
    pl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); go(); } });
    pl.addEventListener('input', () => setMsg(pl, ''));
  }
  $('#go').onclick = go;
  if (sel && pl) pl.focus();
}

function capHeader(extra = '') {
  const st = sessionStats();
  const ci = (ic, k, v, id = '', cls = '') => `<div class="ci">${ic}<div class="tx"><span class="k">${k}</span><span class="v ${cls}" ${id ? `id="${id}"` : ''}>${v}</span></div></div>`;
  return `<div class="cap-head">
    ${ci('<svg class="ico" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9"/></svg>', 'Componente', esc(CAP.comp), '', 't')}
    ${CAP.plates ? ci('<svg class="ico" viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>', 'Placas', esc(CAP.plates)) : ''}
    ${ci('<svg class="ico" viewBox="0 0 24 24"><path d="M3 7h18v13H3z M3 7l2-4h14l2 4 M9 11h6"/></svg>', 'Contenedores (unidad)', st.conts, 'stC')}
    ${ci('<svg class="ico" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z M9 11h7 M9 15h7 M9 7h3"/></svg>', 'Jobs (unidad)', st.jobs, 'stJ')}
    ${extra}
    <span class="spacer"></span>
    <span class="live">Captura en proceso</span>
    <button class="btn danger-solid fin">${ICON.flag} FINALIZAR CAPTURA</button>
  </div><div id="flashBox"></div>`;
}
function refreshStats() { const st = sessionStats(); const c = $('#stC'), j = $('#stJ'); if (c) c.textContent = st.conts; if (j) j.textContent = st.jobs; }
function showFlash(html) {
  const b = $('#flashBox'); if (!b) return;
  b.innerHTML = `<div class="flash">${ICON.check}<span>${html}</span></div>`;
  clearTimeout(showFlash.t); showFlash.t = setTimeout(() => { if (b) b.innerHTML = ''; }, 6000);
}

/* Lectura de escáner: Enter / Tab del escáner, o ráfaga rápida de teclas sin sufijo */
function wireScan(inp, onCommit) {
  let first = 0, last = 0, count = 0, timer = null;
  const commit = () => { clearTimeout(timer); count = 0; inp.value = norm(inp.value); onCommit(inp); };
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); commit(); }
  });
  inp.addEventListener('input', (e) => {
    const now = performance.now();
    if (e.inputType && e.inputType !== 'insertText') { count = 0; return; }
    if (!count || now - last > 80) { first = now; count = 1; } else count++;
    last = now; clearTimeout(timer);
    // Escáner sin Enter: ≥4 caracteres a <35 ms entre cada uno y luego 180 ms de silencio
    timer = setTimeout(() => { if (count >= 4 && (last - first) / (count - 1) < 35) commit(); }, 180);
  });
}

/* ---------- Componentes con contenedor + jobs (Switch Ch, Switch Gde, Llaves, BCM, Arnés) ---------- */
function renderJobs() {
  const d = CAP.draft && !CAP.draft.pairs ? CAP.draft : { cont: '', jobs: Array(JOB_STEP).fill('') };
  const m = $('#main');
  m.innerHTML = `${capHeader()}
    <div class="panel">
      <div class="field" style="max-width:640px;margin:0 auto"><label>Caja / Rack</label>
        <div class="cont-wrap"><svg class="bc" viewBox="0 0 24 24"><path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M20 5v14"/></svg><input class="input big scan" id="cont" maxlength="10" placeholder="Escanea la caja o el rack" value="${esc(d.cont)}" ${scanAttrs()}></div><div class="cont-hint">Escanea o escribe el código</div><div class="msg"></div></div>
      <div class="jobs-head"><h2>Jobs del contenedor</h2><span class="counter" id="cnt"></span>
        <span class="muted" style="font-size:13px">${isSw(CAP.comp) ? `Un job puede repetirse hasta ${maxRep(CAP.comp)} veces` : 'Cada job es único para este componente'}</span></div>
      <div class="job-grid" id="jobs"></div>
      <div class="cap-actions">
        <button class="btn" id="add5">${ICON.plus} Agregar 5 jobs</button>
        <button class="btn danger" id="clr">Limpiar formulario</button>
        <button class="btn danger-solid fin">${ICON.flag} Finalizar captura</button>
        <span class="spacer"></span>
        <button class="btn ok xl" id="submit">${ICON.check} SUBMIT</button>
        <div class="save-note">Al guardar, el formulario quedará listo para el siguiente contenedor.</div>
      </div>
    </div>`;
  const cont = $('#cont'), grid = $('#jobs');
  const jobInputs = () => $$('input.job', grid);
  const draftSave = () => { CAP.draft = { cont: norm(cont.value), jobs: jobInputs().map((i) => norm(i.value)) }; capSave(); updCount(); };
  const updCount = () => { const n = jobInputs().filter((i) => i.value.trim()).length; $('#cnt').textContent = `${n} / ${jobInputs().length} · máx ${JOB_MAX}`; $('#add5').disabled = false; };
  const addRows = (vals) => {
    const start = jobInputs().length;
    vals.forEach((v, k) => {
      const i = start + k;
      const f = document.createElement('div'); f.className = 'field';
      f.innerHTML = `<label>Job ${i + 1}</label><input class="input scan job" placeholder="Escanear job" data-max="6" data-i="${i}" value="${esc(v)}" ${scanAttrs()}><div class="msg"></div>`;
      grid.append(f);
      const inp = $('input', f);
      wireScan(inp, onJobCommit);
      inp.addEventListener('input', () => { setMsg(inp, ''); draftSave(); });
      inp.addEventListener('blur', () => { inp.value = norm(inp.value); validateJob(inp, false); });
    });
    updCount();
  };
  const validateJob = (inp, sound = true) => {
    const all = jobInputs(), idx = all.indexOf(inp), v = inp.value;
    if (!v) { setMsg(inp, ''); return true; }
    const inForm = all.slice(0, idx + 1).filter((x) => norm(x.value) === v).length;
    const msg = checkJob(CAP.comp, v, inForm);
    setMsg(inp, msg);
    if (msg && sound) beep('err');
    return !msg;
  };
  const validateCont = () => {
    const v = norm(cont.value); cont.value = v;
    if (!v) { setMsg(cont, 'Escanea la caja o el rack'); return false; }
    const prev = S.recs.filter((r) => !r.del && r.comp === CAP.comp && r.cont === v);
    setMsg(cont, prev.length ? `Aviso: este contenedor ya tiene ${prev.length} job(s) registrados (${fDT(prev[0].ts)})` : '', 'warn');
    return true;
  };
  function onJobCommit(inp) {
    draftSave();
    if (!inp.value) { $('#submit').focus(); return; }          // Enter en vacío = terminar
    if (!validateJob(inp)) { inp.select(); return; }
    beep('ok');
    const all = jobInputs(), idx = all.indexOf(inp);
    if (idx + 1 < all.length) { all[idx + 1].focus(); return; }
    if (all.length < JOB_MAX) { addRows(Array(JOB_STEP).fill('')); jobInputs()[idx + 1].focus(); draftSave(); return; }
    toast(`Llegaste al máximo de ${JOB_MAX} jobs. Presiona SUBMIT.`, 'warn'); $('#submit').focus();
  }
  wireScan(cont, () => { draftSave(); if (!validateCont()) { beep('err'); return; } beep('ok'); jobInputs()[0].focus(); });
  cont.addEventListener('input', () => { 
    setMsg(cont, '');
    if(cont.value.length > 10) { 
      setMsg(cont, 'Máximo 10 caracteres', 'warn'); 
    }
  });

  addRows(d.jobs.length ? d.jobs : Array(JOB_STEP).fill(''));
  jobInputs().forEach((i) => i.value && validateJob(i, false));
  if (d.cont) validateCont();

  $('#add5').onclick = () => { if (jobInputs().length >= JOB_MAX) return; const n = jobInputs().length; addRows(Array(JOB_STEP).fill('')); jobInputs()[n].focus(); draftSave(); };
  $('#clr').onclick = async () => {
    if (pendingCount() && !(await confirmBox('Limpiar formulario', 'Se borrarán las lecturas que no has enviado.', 'Limpiar'))) return;
    CAP.draft = null; capSave(); renderJobs();
  };
  $('#submit').onclick = () => {
    if (!validateCont()) { beep('err'); cont.focus(); return; }
    const all = jobInputs(); all.forEach((i) => { i.value = norm(i.value); });
    const filled = all.filter((i) => i.value);
    if (!filled.length) { beep('err'); toast('Captura al menos un job', 'err'); all[0].focus(); return; }
    const bad = filled.find((i) => !validateJob(i, false));
    if (bad) { beep('err'); toast('Corrige los jobs marcados en rojo', 'err'); bad.focus(); bad.select(); return; }
    const c = norm(cont.value), now = Date.now(), lote = S.seq.b + 1;
    const nuevos = filled.map((i) => ({ id: S.seq.r + 1 + filled.indexOf(i), ts: now, emp: ME.emp, name: ME.name, sup: supTxt(), comp: CAP.comp, plates: CAP.plates, cont: c, job: i.value, lote, ses: CAP.sid, type: 'validacion', shift: shiftOf(now), ed: 0, del: null }));
    S.recs.push(...nuevos); S.seq.r += nuevos.length; S.seq.b = lote;
    if (!save('recs', 'seq')) return;
    beep('save');
    CAP.draft = null; capSave();
    renderJobs();
    showFlash(`Contenedor <b>${esc(c)}</b>: ${nuevos.length} job(s) guardados · Job ${lote}`);
    $('#cont').focus();
  };
  $$('.fin', m).forEach((b) => (b.onclick = finalizeModal));
  updCount();
  (d.cont ? (jobInputs().find((i) => !i.value) || cont) : cont).focus();
}

/* ---------- Cluster: cada contenedor = 1 job, hasta 36 pares por lote ---------- */

/* ---------- Secuencia: Componentes con jobs ---------- */
function renderSeqJobs() {
  const d = CAP.draft && !CAP.draft.pairs ? CAP.draft : { cont: '', jobs: Array(50).fill(''), vis: 6 };
  const lastFilled = d.jobs.reduce((a, j, i) => (j ? i + 1 : a), 0);
  let vis = Math.min(50, Math.max(d.vis || 6, Math.ceil(lastFilled / 6) * 6));
  const m = $('#main');
  const TY = CAP.type === 'devolucion' ? 'devolucion' : 'secuencia', isDev = TY === 'devolucion';
  m.innerHTML = `${capHeader(`<div class="ci"><span class="k">Tipo</span><span class="v t">${isDev ? 'DEVOLUCIÓN' : 'SECUENCIA'}</span></div>`)}${isDev ? '<div class="dev-note">Escanea la <b>caja nueva</b> (etiqueta de Devolución) y los jobs que regresan de línea. Solo se aceptan jobs que ya se validaron o secuenciaron.</div>' : ''}
    <div class="panel">
      <div class="field" style="max-width:640px;margin:0 auto"><label>Caja / Rack</label>
        <div class="cont-wrap"><svg class="bc" viewBox="0 0 24 24"><path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M20 5v14"/></svg><input class="input big scan" id="cont" maxlength="10" placeholder="Escanea la caja o el rack" value="${esc(d.cont)}" ${scanAttrs()}></div><div class="cont-hint">Escanea o escribe el código</div><div class="msg"></div></div>
      <div class="jobs-head"><h2>Jobs del contenedor</h2><span class="counter" id="cnt"></span>
        <span class="muted" style="font-size:13px">Capturar jobs (máx 6 dígitos)</span></div>
      <div class="job-grid" id="jobs"></div>
      <div class="cap-actions">
        <button class="btn" id="add6">${ICON.plus} Agregar 6 jobs</button>
        <button class="btn danger" id="clr">Limpiar formulario</button>
        <button class="btn danger-solid fin">${ICON.flag} Finalizar captura</button>
        <span class="spacer"></span>
        <button class="btn ok xl" id="submit">${ICON.check} SUBMIT</button>
        <div class="save-note">Al guardar, el formulario quedará listo para el siguiente contenedor.</div>
      </div>
    </div>`;
  const cont = $('#cont'), grid = $('#jobs');
  const jobInputs = () => $$('input.job', grid);
  const draftSave = () => { CAP.draft = { cont: norm(cont.value), jobs: jobInputs().map((i) => norm(i.value)), vis }; capSave(); updCount(); };
  const updCount = () => { const n = jobInputs().filter((i) => i.value.trim()).length; $('#cnt').textContent = `${n} / ${vis} · máx ${JOB_MAX}`; $('#add6').disabled = vis >= JOB_MAX; };
  const showMore = () => {
    if (vis >= JOB_MAX) return false;
    const from = vis; vis = Math.min(JOB_MAX, vis + 6);
    $$('#jobs .field', grid).slice(from, vis).forEach((f) => { f.style.display = ''; });
    draftSave(); return from;
  };
  const addRows = (vals) => {
    const start = jobInputs().length;
    vals.forEach((v, k) => {
      const i = start + k;
      const f = document.createElement('div'); f.className = 'field';
      f.innerHTML = `<label>Job ${i + 1}</label><input class="input scan job" placeholder="Escanear job" data-max="6" data-i="${i}" value="${esc(v)}" ${scanAttrs()}><div class="msg"></div>`;
      f.style.display = i < vis ? '' : 'none';
      grid.append(f);
      const inp = $('input', f);
      wireScan(inp, onJobCommit);
      inp.addEventListener('input', () => { setMsg(inp, ''); draftSave(); });
      inp.addEventListener('blur', () => { inp.value = norm(inp.value); draftSave(); });
    });
    updCount();
  };
  cont.addEventListener('input', () => {
    setMsg(cont, '');
    if(cont.value.length > 10) {
      setMsg(cont, 'Máximo 10 caracteres', 'warn');
    }
  });
  cont.addEventListener('keydown', (e) => { if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); (jobInputs().find((i) => !i.value) || jobInputs()[0])?.focus(); } });
  wireScan(cont, () => { draftSave(); jobInputs()[0]?.focus(); });
  const validateJob = (inp, sound = true) => {
    const all = jobInputs(), idx = all.indexOf(inp), v = norm(inp.value);
    if (!v) { setMsg(inp, ''); return true; }
    const inForm = all.slice(0, idx + 1).filter((x) => norm(x.value) === v).length;
    const msg = checkJob(CAP.comp, v, inForm, [], TY);
    setMsg(inp, msg); if (msg && sound) beep('err');
    return !msg;
  };
  const onJobCommit = (inp) => { if (inp.value && !validateJob(inp)) { inp.select(); return; } if (inp.value) beep('ok'); const idx = jobInputs().indexOf(inp); if (idx < jobInputs().length - 1) jobInputs()[idx + 1].focus(); else { draftSave(); if (jobInputs().length < JOB_MAX) { addRows(['']); if (jobInputs().length > vis && showMore() === false) { toast(`Jobs completo (${JOB_MAX}). Presiona SUBMIT.`, 'warn'); $('#submit').focus(); return; } jobInputs()[jobInputs().length - 1].focus(); } } };
  const trySubmit = () => {
    const actualCont = norm(cont.value);
    const actualJobs = jobInputs().map((i) => norm(i.value));
    if (!actualCont || !actualJobs.some((x) => x)) { toast('Completa la caja o rack y al menos 1 job', 'err'); return; }
    const badJ = jobInputs().filter((i) => i.value).find((i) => !validateJob(i, false));
    if (badJ) { beep('err'); toast('Corrige los jobs marcados en rojo', 'err'); badJ.focus(); badJ.select(); return; }
    const now = Date.now(), lote = S.seq.b + 1, js = actualJobs.filter(Boolean);
    const nuevos = js.map((j, k) => ({ id: S.seq.r + 1 + k, ts: now, emp: ME.emp, name: ME.name, sup: supTxt(), comp: CAP.comp, plates: '', cont: actualCont, job: j, lote, ses: CAP.sid, type: TY, shift: shiftOf(now), ed: 0, del: null }));
    S.recs.push(...nuevos); S.seq.r += nuevos.length; S.seq.b = lote;
    if (!save('recs', 'seq')) return; cont.value = ''; jobInputs().forEach(i => i.value = ''); CAP.draft = null; capSave(); beep('ok'); showFlash(isDev ? 'Devolución registrada' : 'Secuencia registrada'); refreshStats(); cont.focus();
  };
  addRows(d.jobs || Array(50).fill(''));
  $('#add6').onclick = () => { const from = showMore(); if (from !== false) { jobInputs()[from]?.focus(); } };
  $('#clr').onclick = () => { if (!confirm('¿Limpiar? Se perderán los datos')) return; CAP.draft = null; capSave(); renderCaptura(); };
  $('#submit').onclick = trySubmit;
  $$('.fin', m).forEach((b) => (b.onclick = finalizeModal));
}

/* ---------- Entrega por job (excepción): componente + comentario + jobs, sin caja ---------- */
function renderEntrega() {
  const d = CAP.draft && !CAP.draft.pairs ? CAP.draft : { jobs: Array(JOB_MAX).fill(''), vis: 6 };
  const lastFilled = d.jobs.reduce((a, j, i) => (j ? i + 1 : a), 0);
  let vis = Math.min(JOB_MAX, Math.max(d.vis || 6, Math.ceil(lastFilled / 6) * 6));
  const m = $('#main');
  m.innerHTML = `${capHeader('<div class="ci"><span class="k">Tipo</span><span class="v t">ENTREGA POR JOB</span></div>')}
    <div class="dev-note ent-note">Comentario: <b>${esc(CAP.com)}</b> · escanea los jobs de <b>${esc(CAP.comp)}</b> que se entregan sueltos. Cada job queda como entregado solo en este componente.</div>
    <div class="panel">
      <div class="jobs-head" style="margin-top:0"><h2>Jobs entregados</h2><span class="counter" id="cnt"></span><span class="muted" style="font-size:13px">Solo jobs del Plan General que no estén ya entregados</span></div>
      <div class="job-grid" id="jobs"></div>
      <div class="cap-actions">
        <button class="btn" id="add6">${ICON.plus} Agregar 6 jobs</button>
        <button class="btn danger" id="clr">Limpiar formulario</button>
        <button class="btn danger-solid fin">${ICON.flag} Finalizar captura</button>
        <span class="spacer"></span>
        <button class="btn ok xl" id="submit">${ICON.check} SUBMIT</button>
      </div>
    </div>`;
  const grid = $('#jobs'), jobInputs = () => $$('input.job', grid);
  const draftSave = () => { CAP.draft = { jobs: jobInputs().map((i) => norm(i.value)), vis }; capSave(); updCount(); };
  const updCount = () => { const n = jobInputs().filter((i) => i.value.trim()).length; $('#cnt').textContent = `${n} / ${vis} · máx ${JOB_MAX}`; $('#add6').disabled = vis >= JOB_MAX; };
  const showMore = () => { if (vis >= JOB_MAX) return false; const from = vis; vis = Math.min(JOB_MAX, vis + 6); $$('#jobs .field', grid).slice(from, vis).forEach((f) => { f.style.display = ''; }); draftSave(); return from; };
  const validateJob = (inp, sound = true) => {
    const all = jobInputs(), idx = all.indexOf(inp), v = norm(inp.value);
    if (!v) { setMsg(inp, ''); return true; }
    const inForm = all.slice(0, idx + 1).filter((x) => norm(x.value) === v).length;
    const msg = checkJob(CAP.comp, v, inForm, [], 'entrega');
    setMsg(inp, msg); if (msg && sound) beep('err');
    return !msg;
  };
  const onJobCommit = (inp) => {
    if (inp.value && !validateJob(inp)) { inp.select(); return; }
    if (inp.value) beep('ok');
    const idx = jobInputs().indexOf(inp);
    if (idx < vis - 1) jobInputs()[idx + 1].focus();
    else { draftSave(); const from = showMore(); if (from === false) { toast(`Máximo ${JOB_MAX} jobs. Presiona SUBMIT.`, 'warn'); $('#submit').focus(); } else jobInputs()[from]?.focus(); }
  };
  d.jobs.forEach((v, i) => {
    const f = document.createElement('div'); f.className = 'field';
    f.innerHTML = `<label>Job ${i + 1}</label><input class="input scan job" placeholder="Escanear job" data-max="6" data-i="${i}" value="${esc(v)}" ${scanAttrs()}><div class="msg"></div>`;
    f.style.display = i < vis ? '' : 'none'; grid.append(f);
    const inp = $('input', f); wireScan(inp, onJobCommit);
    inp.addEventListener('input', () => { setMsg(inp, ''); draftSave(); });
    inp.addEventListener('blur', () => { inp.value = norm(inp.value); draftSave(); });
  });
  updCount();
  const trySubmit = () => {
    const filled = jobInputs().filter((i) => norm(i.value));
    if (!filled.length) { toast('Escanea al menos 1 job', 'err'); return; }
    const bad = filled.find((i) => !validateJob(i, false));
    if (bad) { beep('err'); toast('Corrige los jobs marcados en rojo', 'err'); bad.focus(); bad.select(); return; }
    const now = Date.now(), lote = S.seq.b + 1;
    const nuevos = filled.map((i, k) => ({ id: S.seq.r + 1 + k, ts: now, emp: ME.emp, name: ME.name, sup: supTxt(), comp: CAP.comp, plates: '', cont: '', job: norm(i.value), lote, ses: CAP.sid, type: 'entrega', shift: shiftOf(now), ed: 0, del: null, motivo: CAP.com }));
    S.recs.push(...nuevos); S.seq.r += nuevos.length; S.seq.b = lote;
    if (!save('recs', 'seq')) return;
    CAP.draft = null; capSave(); beep('ok'); renderEntrega(); showFlash(`Entrega registrada: ${nuevos.length} job(s) de ${esc(CAP.comp)}`); refreshStats(); jobInputs()[0]?.focus();
  };
  $('#add6').onclick = () => { const from = showMore(); if (from !== false) jobInputs()[from]?.focus(); };
  $('#clr').onclick = () => { if (!confirm('¿Limpiar? Se perderán los datos')) return; CAP.draft = null; capSave(); renderEntrega(); };
  $('#submit').onclick = trySubmit;
  $$('.fin', m).forEach((b) => (b.onclick = finalizeModal));
  jobInputs()[0]?.focus();
}

function renderSeqCluster() {
  const d = CAP.draft && !CAP.draft.pairs ? CAP.draft : { cont: '', jobs: Array(36).fill(''), vis: 6 };
  const lastFilled = d.jobs.reduce((a, j, i) => (j ? i + 1 : a), 0);
  let vis = Math.min(36, Math.max(d.vis || 6, Math.ceil(lastFilled / 6) * 6));
  const m = $('#main');
  m.innerHTML = `${capHeader('<div class="ci"><span class="k">Tipo</span><span class="v t">SECUENCIA</span></div>')}
    <div class="panel">
      <div class="field" style="max-width:640px;margin:0 auto"><label>Caja / Rack</label>
        <div class="cont-wrap"><svg class="bc" viewBox="0 0 24 24"><path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M20 5v14"/></svg><input class="input big scan" id="cont" maxlength="10" placeholder="Escanea la caja o el rack" value="${esc(d.cont)}" ${scanAttrs()}></div><div class="cont-hint">Escanea o escribe el código</div><div class="msg"></div></div>
      <div class="jobs-head"><h2>Jobs del contenedor</h2><span class="counter" id="cnt"></span>
        <span class="muted" style="font-size:13px">Capturar jobs (máx 6 dígitos)</span></div>
      <div class="job-grid" id="jobs"></div>
      <div class="cap-actions">
        <button class="btn" id="add6">${ICON.plus} Agregar 6 jobs</button>
        <button class="btn danger" id="clr">Limpiar formulario</button>
        <button class="btn danger-solid fin">${ICON.flag} Finalizar captura</button>
        <span class="spacer"></span>
        <button class="btn ok xl" id="submit">${ICON.check} SUBMIT</button>
        <div class="save-note">Al guardar, el formulario quedará listo para el siguiente contenedor.</div>
      </div>
    </div>`;
  const cont = $('#cont'), grid = $('#jobs');
  const jobInputs = () => $$('input.job', grid);
  const draftSave = () => { CAP.draft = { cont: norm(cont.value), jobs: jobInputs().map((i) => norm(i.value)), vis }; capSave(); updCount(); };
  const updCount = () => { const n = jobInputs().filter((i) => i.value.trim()).length; $('#cnt').textContent = `${n} / ${vis} · máx 36`; $('#add6').disabled = vis >= 36; };
  const showMore = () => {
    if (vis >= 36) return false;
    const from = vis; vis = Math.min(36, vis + 6);
    $$('#jobs .field', grid).slice(from, vis).forEach((f) => { f.style.display = ''; });
    draftSave(); return from;
  };
  const addRows = (vals) => {
    const start = jobInputs().length;
    vals.forEach((v, k) => {
      const i = start + k;
      const f = document.createElement('div'); f.className = 'field';
      f.innerHTML = `<label>Job ${i + 1}</label><input class="input scan job" placeholder="Escanear job" data-max="6" data-i="${i}" value="${esc(v)}" ${scanAttrs()}><div class="msg"></div>`;
      f.style.display = i < vis ? '' : 'none';
      grid.append(f);
      const inp = $('input', f);
      wireScan(inp, onJobCommit);
      inp.addEventListener('input', () => { setMsg(inp, ''); draftSave(); });
      inp.addEventListener('blur', () => { inp.value = norm(inp.value); draftSave(); });
    });
    updCount();
  };
  cont.addEventListener('input', () => { 
    setMsg(cont, '');
    if(cont.value.length > 10) { 
      setMsg(cont, 'Máximo 10 caracteres', 'warn'); 
    }
  });
  cont.addEventListener('keydown', (e) => { if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); (jobInputs().find((i) => !i.value) || jobInputs()[0])?.focus(); } });
  wireScan(cont, () => { draftSave(); jobInputs()[0]?.focus(); });
  const onJobCommit = (inp) => { const idx = jobInputs().indexOf(inp); if (idx < jobInputs().length - 1) jobInputs()[idx + 1].focus(); else { draftSave(); if (jobInputs().length < 36) { addRows(['']); if (jobInputs().length > vis && showMore() === false) { toast(`Jobs completo (36). Presiona SUBMIT.`, 'warn'); $('#submit').focus(); return; } jobInputs()[jobInputs().length - 1].focus(); } } };
  const trySubmit = () => {
    const actualCont = norm(cont.value);
    const actualJobs = jobInputs().map((i) => norm(i.value));
    if (!actualCont || !actualJobs.some((x) => x)) { toast('Completa contenedor y al menos 1 job', 'err'); return; }
    const now = Date.now(), lote = S.seq.b + 1, js = actualJobs.filter(Boolean);
    const nuevos = js.map((j, k) => ({ id: S.seq.r + 1 + k, ts: now, emp: ME.emp, name: ME.name, sup: supTxt(), comp: CAP.comp, plates: '', cont: actualCont, job: j, lote, ses: CAP.sid, type: 'secuencia', shift: shiftOf(now), ed: 0, del: null }));
    S.recs.push(...nuevos); S.seq.r += nuevos.length; S.seq.b = lote;
    if (!save('recs', 'seq')) return; cont.value = ''; jobInputs().forEach(i => i.value = ''); CAP.draft = null; capSave(); beep('ok'); showFlash('Secuencia registrada'); refreshStats(); cont.focus();
  };
  addRows(d.jobs || Array(36).fill(''));
  $('#add6').onclick = () => { const from = showMore(); if (from !== false) { jobInputs()[from]?.focus(); } };
  $('#clr').onclick = () => { if (!confirm('¿Limpiar? Se perderán los datos')) return; CAP.draft = null; capSave(); renderCaptura(); };
  $('#submit').onclick = trySubmit;
  $$('.fin', m).forEach((b) => (b.onclick = finalizeModal));
}

function renderCluster() {
  const comp = CAP.comp, sw = isSw(comp), LC = sw ? 'Caja' : 'Contenedor', LJ = sw ? 'ID' : 'Job';
  const d = CAP.draft && CAP.draft.pairs ? CAP.draft : { pairs: Array.from({ length: CLUSTER_ROWS }, () => ['', '']), vis: CLUSTER_STEP };
  // Filas visibles: de 6 en 6 hasta 36 (respeta las ya capturadas al restaurar el borrador)
  const lastFilled = d.pairs.reduce((a, p, i) => (p[0] || p[1] ? i + 1 : a), 0);
  let vis = Math.min(CLUSTER_ROWS, Math.max(d.vis || CLUSTER_STEP, Math.ceil(lastFilled / CLUSTER_STEP) * CLUSTER_STEP));
  const m = $('#main');
  m.innerHTML = `${capHeader()}
    <div class="panel">
      <div class="jobs-head" style="margin-top:0"><h2>${sw ? `Relación caja → ID · ${esc(comp)}` : 'Relación contenedor → job'}</h2><span class="counter" id="cnt"></span>
        <span class="muted" style="font-size:13px">${sw ? `Escanea la caja y luego su ID (solo números, hasta ${SW_ID_MAX} dígitos). Cada caja lleva un ID${maxRep(comp) > 1 ? `; el ID puede repetirse hasta ${maxRep(comp)} veces` : ' y el ID es único'}.` : 'Escanea el contenedor y luego su job. Contenedor y job son únicos.'}</span></div>
      <div class="table-wrap"><table class="t cl-table"><thead><tr><th>#</th><th>${LC}</th><th>${LJ}</th></tr></thead><tbody id="tb">
      ${d.pairs.map((p, i) => `<tr ${i >= vis ? 'hidden' : ''}>
        <td class="n">${i + 1}</td>
        <td><div class="field"><input class="input scan cc" maxlength="10" data-i="${i}" value="${esc(p[0])}" ${scanAttrs()}><div class="msg"></div></div></td>
        <td><div class="field"><input class="input scan cj" data-max="${sw ? SW_ID_MAX : JOB_DIGITS}" data-i="${i}" value="${esc(p[1])}" ${scanAttrs()}><div class="msg"></div></div></td>
      </tr>`).join('')}</tbody></table></div>
      <div class="cap-actions">
        <button class="btn" id="add6">${ICON.plus} Agregar 6 filas</button>
        <button class="btn danger" id="clr">Limpiar formulario</button>
        <button class="btn danger-solid fin">${ICON.flag} Finalizar captura</button>
        <span class="spacer"></span>
        <button class="btn ok xl" id="submit">${ICON.check} SUBMIT</button>
        <div class="save-note">Al guardar, el formulario quedará listo para el siguiente contenedor.</div>
      </div>
    </div>`;
  const ccs = $$('input.cc', m), cjs = $$('input.cj', m);
  const order = []; ccs.forEach((c, i) => order.push(c, cjs[i]));
  const rowsEl = $$('#tb tr', m);
  const draftSave = () => { CAP.draft = { pairs: ccs.map((c, i) => [norm(c.value), norm(cjs[i].value)]), vis }; capSave(); updCount(); };
  const updCount = () => {
    const n = ccs.filter((c, i) => c.value.trim() || cjs[i].value.trim()).length;
    $('#cnt').textContent = `${n} / ${vis} · máx ${CLUSTER_ROWS}`; $('#add6').disabled = vis >= CLUSTER_ROWS;
  };
  const showMore = () => {
    if (vis >= CLUSTER_ROWS) return false;
    const from = vis; vis = Math.min(CLUSTER_ROWS, vis + CLUSTER_STEP);
    rowsEl.slice(from, vis).forEach((r) => { r.hidden = false; });
    draftSave(); return from;
  };
  const validate = (inp, sound = true) => {
    const isC = inp.classList.contains('cc'), list = isC ? ccs : cjs, idx = list.indexOf(inp), v = inp.value;
    if (!v) { setMsg(inp, ''); return true; }
    const inForm = list.slice(0, idx + 1).filter((x) => norm(x.value) === v).length;
    const msg = isC ? checkClusterCont(v, inForm, [], comp) : checkJob(comp, v, inForm);
    setMsg(inp, msg); if (msg && sound) beep('err');
    return !msg;
  };
  order.forEach((inp) => {
    wireScan(inp, (x) => {
      draftSave();
      if (!x.value) { $('#submit').focus(); return; }
      if (!validate(x)) { x.select(); return; }
      beep('ok');
      const k = order.indexOf(x);
      if (k + 1 >= vis * 2 && showMore() === false) { toast(`Lote completo (${CLUSTER_ROWS}). Presiona SUBMIT.`, 'warn'); $('#submit').focus(); return; }
      order[k + 1].focus(); order[k + 1].scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    inp.addEventListener('input', () => { setMsg(inp, ''); draftSave(); });
    inp.addEventListener('blur', () => { inp.value = norm(inp.value); validate(inp, false); });
    if (inp.value) validate(inp, false);
  });
  $('#add6').onclick = () => { const from = showMore(); if (from !== false) { ccs[from].focus(); ccs[from].scrollIntoView({ block: 'center', behavior: 'smooth' }); } };
  $('#clr').onclick = async () => {
    if (pendingCount() && !(await confirmBox('Limpiar formulario', 'Se borrarán las lecturas que no has enviado.', 'Limpiar'))) return;
    CAP.draft = null; capSave(); renderCluster();
  };
  $('#submit').onclick = () => {
    order.forEach((i) => { i.value = norm(i.value); });
    let firstBad = null;
    const pairs = [];
    ccs.forEach((c, i) => {
      const j = cjs[i];
      if (!c.value && !j.value) return;
      if (!c.value) { setMsg(c, `Falta ${LC.toLowerCase()}`); firstBad = firstBad || c; }
      if (!j.value) { setMsg(j, `Falta ${LJ}`); firstBad = firstBad || j; }
      if (c.value && !validate(c, false)) firstBad = firstBad || c;
      if (j.value && !validate(j, false)) firstBad = firstBad || j;
      pairs.push([c.value, j.value]);
    });
    if (!pairs.length) { beep('err'); toast(`Captura al menos ${sw ? 'una caja con su ID' : 'un contenedor con su job'}`, 'err'); ccs[0].focus(); return; }
    if (firstBad) { beep('err'); toast('Corrige las casillas marcadas en rojo', 'err'); firstBad.focus(); firstBad.scrollIntoView({ block: 'center' }); return; }
    const now = Date.now(), lote = S.seq.b + 1;
    const nuevos = pairs.map((p, k) => ({ id: S.seq.r + 1 + k, ts: now, emp: ME.emp, name: ME.name, sup: supTxt(), comp, plates: CAP.plates, cont: p[0], job: p[1], lote, ses: CAP.sid, type: 'validacion', shift: shiftOf(now), ed: 0, del: null }));
    S.recs.push(...nuevos); S.seq.r += nuevos.length; S.seq.b = lote;
    if (!save('recs', 'seq')) return;
    beep('save');
    CAP.draft = null; capSave();
    renderCluster();
    showFlash(`${nuevos.length} ${sw ? 'caja(s)' : 'contenedor(es)'} ${esc(comp)} guardad${sw ? 'as' : 'os'} · Job ${lote}`);
  };
  $$('.fin', m).forEach((b) => (b.onclick = finalizeModal));
  updCount();
  (order.slice(0, vis * 2).find((i) => !i.value) || ccs[0]).focus();
}

function finalizeModal() {
  const st = sessionStats(), pend = pendingCount();
  const clusterRows = st.rows.filter(r => r.comp === 'Cluster');
  const hasData = clusterRows.length > 0;
  let page = 0;
  const perPage = 6;

  const buildTable = (p) => {
    const start = p * perPage;
    const end = start + perPage;
    const rows = clusterRows.slice(start, end);
    const html = `<table class="t" style="margin-bottom:16px;width:100%"><thead><tr><th>#</th><th>Contenedor</th><th>Job</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td class="n">${start + i + 1}</td><td>${esc(r.cont)}</td><td>${esc(r.job)}</td></tr>`).join('')}
    </tbody></table>`;
    const pageInfo = `<div class="muted" style="text-align:center;font-size:12px;margin-bottom:12px">${start + rows.length} de ${clusterRows.length} registros</div>`;
    const nav = clusterRows.length > perPage ? `<div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
      <button class="btn sm" data-action="prev" ${p === 0 ? 'disabled' : ''}>← Anterior</button>
      <button class="btn sm" data-action="next" ${end >= clusterRows.length ? 'disabled' : ''}>Siguiente →</button>
    </div>` : '';
    return html + pageInfo + nav;
  };

  const modal_el = modal({ title: 'Finalizar captura', wide: true, body: `
    ${pend ? `<div class="banner warn">Hay <b>${pend}</b> lectura(s) sin enviar. Si continúas sin presionar SUBMIT se perderán.</div>` : ''}
    ${!hasData && CAP.comp === 'Cluster' ? `<div class="muted" style="padding:20px;text-align:center">No hay registros capturados para Cluster.</div>` : ''}
    <div id="cluster-table">${hasData ? buildTable(0) : ''}</div>
    <div class="grid g2">
      <div class="kpi"><div class="k">Contenedores</div><div class="v">${st.conts}</div><div class="s">${esc(CAP.comp)} · Placas ${esc(CAP.plates)}</div></div>
      <div class="kpi blue"><div class="k">Jobs guardados</div><div class="v">${st.jobs}</div><div class="s">en esta unidad</div></div>
    </div>
    <div class="muted">¿Qué quieres hacer?</div>
    <div class="opt-list">
      <button class="opt" data-a="more"><b>Capturar otra unidad</b><span class="n">Mismo componente, nuevas placas</span></button>
      <button class="opt" data-a="comp"><b>Cambiar de componente</b><span class="n">Elegir componente y placas</span></button>
      ${st.jobs ? '<button class="opt" data-a="xls"><b>Descargar Excel de esta unidad</b><span class="n">Va a Descargas</span></button>' : ''}
      <button class="opt" data-a="out"><b>Salir</b><span class="n">Cerrar sesión</span></button>
    </div>`,
    buttons: [{ t: 'Atrás', cls: 'primary' }],
    onOpen: (el, close) => {
      $$('[data-action]', el).forEach((b) => (b.onclick = () => {
        const action = b.dataset.action;
        if (action === 'prev') page--;
        else if (action === 'next') page++;
        $('#cluster-table').innerHTML = buildTable(page);
        $$('[data-action]', el).forEach((btn) => {
          btn.disabled = (page === 0 && btn.dataset.action === 'prev') ||
                        (page * perPage + perPage >= clusterRows.length && btn.dataset.action === 'next');
        });
      }));
      $$('.opt', el).forEach((b) => (b.onclick = () => {
        const a = b.dataset.a;
        if (a === 'xls') { exportRecords(st.rows, `${CAP.comp}_${CAP.plates}`, false); return; }
        close();
        if (a === 'more') { CAP = { comp: CAP.comp }; capSave(); renderCaptura(); }
        else if (a === 'comp') { CAP = null; capSave(); renderCaptura(); }
        else if (a === 'out') logout();
      }));
    },
  });
}

/* =====================================================================
   REGISTROS: "Mis capturas" (usuario) y "Respaldo" (admin, incluye limpiados)
   ===================================================================== */
const F0 = () => ({ q: '', comp: '', from: '', to: '', range: false, shift: '', user: '', page: 0 });
const FILT = { mine: F0(), validacion: F0(), secuencia: F0(), devolucion: F0(), entrega: F0(), all: { q: '', comp: '', from: '', to: '', range: false, shift: '', user: '', est: 'all', page: 0 } };
/* Todos los usuarios ven todos los registros activos; solo quien capturó puede editar */
function baseRows(mode) { return mode === 'mine' ? S.recs.filter((r) => !r.del) : S.recs; }
function applyFilters(rows, F, mode, skipComp = false) {
  if (mode === 'all') {
    if (F.est === 'act') rows = rows.filter((r) => !r.del);
    else if (F.est === 'del') rows = rows.filter((r) => r.del);
  }
  if (F.user) rows = rows.filter((r) => r.emp === F.user);
  if (F.shift) rows = rows.filter((r) => recShift(r) === F.shift);
  if (F.comp && !skipComp) rows = rows.filter((r) => r.comp === F.comp);
  if (F.q) { const q = norm(F.q); rows = rows.filter((r) => [r.job, r.cont, r.plates, r.emp, r.name, r.comp].some((v) => norm(v).includes(q)) || String(r.lote) === q); }
  // Fecha sola = ese día; con "Hasta" = rango
  if (F.from) { const t = new Date(`${F.from}T00:00:00`).getTime(); rows = rows.filter((r) => r.ts >= t); }
  const until = F.range ? F.to : F.from;
  if (until) { const t = new Date(`${until}T00:00:00`).getTime() + 86400000; rows = rows.filter((r) => r.ts < t); }
  return rows;
}
const canEdit = (r) => !!r && !r.del && !!ME && (r.emp === ME.emp || isAdmin());
function renderRecords(mode, typeFilter = null) {
  const F = FILT[(mode === 'mine' && typeFilter) || mode], m = $('#main'), adm = mode === 'all';
  const isSeq = typeFilter === 'secuencia' || typeFilter === 'devolucion' || typeFilter === 'entrega';
  const today = opDate(Date.now()), onlyToday = !adm && !isAdmin();
  const pool = ofType(baseRows(mode), typeFilter).filter((r) => !onlyToday || (r.emp === ME.emp && opDate(r.ts) === today));
  const users = uniq(pool.map((r) => r.emp)).map((e) => ({ emp: e, name: (S.users.find((u) => u.emp === e) || pool.find((r) => r.emp === e)).name }));
  const shifts = uniq([...S.cfg.shifts.map((x) => x.n), ...pool.map(recShift)]);
  const typeLabel = typeFilter === 'validacion' ? 'Validación' : typeFilter === 'devolucion' ? 'Devoluciones' : typeFilter === 'entrega' ? 'Entregas por job' : isSeq ? 'Secuenciado' : null;
  m.innerHTML = `
    <div class="page-title"><h1>${adm ? 'Respaldo de todo lo escaneado' : typeLabel || 'Registros'}</h1>
      <div class="sub">${adm ? 'Incluye lo que los usuarios limpiaron' : onlyToday ? `Tus capturas de hoy · ${fDate(Date.now())} · puedes editar o eliminar por fila` : `Todos los registros de ${(typeLabel || '').toLowerCase()} · editar o eliminar por fila`}</div>
      <div class="actions">
        <button class="btn primary" id="exp">${ICON.dl} Exportar a Excel</button>
      </div></div>
    <div class="grid g4" id="kpis" style="margin-bottom:14px"></div>
    <div class="fbar" id="fbar">
    <div class="comp-chips" id="chips"></div>
    <div class="toolbar">
      <div class="field search"><label>Buscar</label><input class="input" id="q" placeholder="Job, contenedor, lote o usuario" value="${esc(F.q)}" autocomplete="off"></div>
      <div class="field"><label>Fecha</label><input class="input" type="date" id="fd" value="${F.from}" title="${F.range ? 'Desde' : 'Fecha específica'}"></div>
      <button class="btn sm rng ${F.range ? 'on' : ''}" id="frg" title="Buscar por rango de fechas">${F.range ? 'Hasta' : 'Rango'}</button>
      ${F.range ? `<div class="field"><label>Hasta</label><input class="input" type="date" id="fh" value="${F.to}" title="Hasta"></div>` : ''}
      <div class="field"><label>Turno</label><select class="input" id="fs" title="Turno"><option value="">Turno</option>${shifts.map((x) => `<option ${F.shift === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label>Usuario</label><select class="input" id="fu" title="Usuario"><option value="">Usuario</option>${users.map((u) => `<option value="${esc(u.emp)}" ${F.user === u.emp ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></div>
      ${adm ? `<div class="field"><label>Estado</label><select class="input" id="fe">
        <option value="all" ${F.est === 'all' ? 'selected' : ''}>Todos</option><option value="act" ${F.est === 'act' ? 'selected' : ''}>Activos</option><option value="del" ${F.est === 'del' ? 'selected' : ''}>Limpiados</option></select></div>` : ''}
      <button class="btn sm" id="reset">Quitar filtros</button>
    </div>
    </div>
    <div class="table-wrap" id="tw"></div>
    <div class="pager" id="pg"></div>`;
  const pin = () => {
    const tabs = $('#tabs'), fb = $('#fbar'); if (!tabs || !fb) return;
    const top = tabs.getBoundingClientRect().height + ($('.topbar')?.getBoundingClientRect().height || 0);
    fb.style.top = top + 'px';
    document.documentElement.style.setProperty('--thTop', (top + fb.getBoundingClientRect().height) + 'px');
  };
  window.onresize = pin; setTimeout(pin, 0);
  const draw = () => {
    const pre = applyFilters(pool, F, mode, true);
    $('#chips').innerHTML = [['', 'Todos', pre.length], ...COMPS.map((c) => [c, c, pre.filter((r) => r.comp === c).length])]
      .map(([v, t, n]) => `<button class="cchip ${F.comp === v ? 'on' : ''}" data-c="${esc(v)}">${esc(t)}<b>${fmtN(n)}</b></button>`).join('');
    $$('#chips .cchip').forEach((b) => (b.onclick = () => { F.comp = b.dataset.c; F.page = 0; draw(); }));
    const rows = applyFilters(pool, F, mode).slice().sort((a, b) => b.ts - a.ts || b.id - a.id);
    const delN = rows.filter((r) => r.del).length;
    $('#kpis').innerHTML = `
      <div class="kpi"><div class="k">Registros (jobs)</div><div class="v">${fmtN(rows.length)}</div><div class="s">${adm ? `${fmtN(delN)} limpiados` : 'con los filtros actuales'}</div></div>
      <div class="kpi blue"><div class="k">Contenedores</div><div class="v">${fmtN(uniq(rows.map((r) => `${r.comp}|${r.cont}`)).length)}</div></div>
      ${isSeq ? `<div class="kpi"><div class="k">Usuarios</div><div class="v">${fmtN(uniq(rows.map((r) => r.emp)).length)}</div></div>`
        : `<div class="kpi"><div class="k">Unidades (placas)</div><div class="v">${fmtN(uniq(rows.map((r) => r.plates)).length)}</div></div>`}
      <div class="kpi warn"><div class="k">Filas editadas</div><div class="v">${fmtN(rows.filter((r) => r.ed).length)}</div></div>`;
    const pages = Math.max(1, Math.ceil(rows.length / PAGE)); F.page = Math.min(F.page, pages - 1);
    const view = rows.slice(F.page * PAGE, (F.page + 1) * PAGE);
    $('#tw').innerHTML = rows.length ? `<table class="t"><thead><tr>
        <th>Fecha</th><th>Hora</th><th>Job</th><th>Contenedor</th><th>Componente</th>${isSeq ? '' : '<th>Placas</th>'}<th>Lote</th><th>Usuario</th><th>Turno</th>${adm ? '<th>Estado</th>' : ''}<th></th></tr></thead><tbody>
      ${view.map((r) => `<tr class="${r.del ? 'deleted' : ''}">
        <td>${fDate(r.ts)}</td><td>${fTime(r.ts)}</td>
        <td class="mono">${esc(r.job)}</td><td class="mono">${esc(r.cont)}</td>
        <td><span class="badge b-info">${esc(r.comp)}</span></td>
        ${isSeq ? '' : `<td class="mono">${esc(r.plates || '—')}</td>`}
        <td>${r.lote}</td>
        <td class="usr">${esc(r.name || r.emp)}${r.emp === ME.emp ? ' <span class="badge b-ok">Tú</span>' : ''}</td>
        <td><span class="shf">${esc(recShift(r))}</span></td>
        ${adm ? `<td>${r.del ? `<span class="badge b-mute" title="Limpiado por ${esc(r.del.emp)} el ${fDT(r.del.ts)}">Limpiado</span>` : '<span class="badge b-ok">Activo</span>'}</td>` : ''}
        <td style="white-space:nowrap">${r.ed ? `<span class="badge b-warn" title="Editado ${r.ed} vez/veces">Editado</span> ` : ''}${canEdit(r) ? `<button class="btn sm" data-ed="${r.id}">${ICON.edit} Editar</button> <button class="btn sm danger" data-dl="${r.id}" title="Eliminar esta fila">${ICON.trash}</button>` : ''}</td>
      </tr>`).join('')}</tbody></table>` : `<div class="empty">${pool.length ? 'Ningún registro coincide con los filtros.' : onlyToday ? 'Aún no tienes capturas hoy.' : 'Aún no hay capturas.'}</div>`;
    $$('[data-ed]', m).forEach((b) => (b.onclick = () => editRecord(S.recs.find((r) => r.id === Number(b.dataset.ed)), draw)));
    $$('[data-dl]', m).forEach((b) => (b.onclick = () => deleteRow(S.recs.find((r) => r.id === Number(b.dataset.dl)), draw)));
    $('#pg').innerHTML = pages > 1 ? `<button class="btn sm" id="pv" ${F.page ? '' : 'disabled'}>‹ Anterior</button><span class="muted">Página ${F.page + 1} de ${pages} · ${fmtN(rows.length)} registros</span><button class="btn sm" id="nx" ${F.page < pages - 1 ? '' : 'disabled'}>Siguiente ›</button>` : '';
    if (pages > 1) { $('#pv').onclick = () => { F.page--; draw(); }; $('#nx').onclick = () => { F.page++; draw(); }; }
  };
  let qt = null;
  $('#q').oninput = (e) => { clearTimeout(qt); qt = setTimeout(() => { F.q = e.target.value; F.page = 0; draw(); }, 200); };
  $('#fd').onchange = (e) => { F.from = e.target.value; F.page = 0; draw(); };
  if (F.range) $('#fh').onchange = (e) => { F.to = e.target.value; F.page = 0; draw(); };
  $('#frg').onclick = () => { F.range = !F.range; if (!F.range) F.to = ''; F.page = 0; renderRecords(mode, typeFilter); };
  $('#fs').onchange = (e) => { F.shift = e.target.value; F.page = 0; draw(); };
  $('#fu').onchange = (e) => { F.user = e.target.value; F.page = 0; draw(); };
  if (adm) $('#fe').onchange = (e) => { F.est = e.target.value; F.page = 0; draw(); };
  $('#reset').onclick = () => { Object.assign(F, { q: '', comp: '', from: '', to: '', range: false, shift: '', user: '', page: 0 }, adm ? { est: 'all' } : {}); renderRecords(mode, typeFilter); };
  $('#exp').onclick = () => exportModal(mode, typeFilter);
  draw();
}

const ofType = (rows, t) => (t ? rows.filter((r) => (r.type || 'validacion') === t) : rows);
const typeName = (t) => (t === 'secuencia' ? 'Secuencia' : t === 'validacion' ? 'Validación' : t === 'devolucion' ? 'Devolución' : t === 'entrega' ? 'Entrega' : '');
function exportModal(mode, typeFilter = null) {
  const F = FILT[(mode === 'mine' && typeFilter) || mode], adm = mode === 'all';
  const base = ofType(baseRows(mode), typeFilter), filtered = applyFilters(base, F, mode);
  const opts = [
    ['f', 'Lo que estoy viendo (filtros actuales)', filtered.length],
    ['all', adm ? 'Todo el respaldo' : `Todo ${typeName(typeFilter) || ''} (todos los usuarios)`, base.length],
    ...COMPS.map((c) => [`c:${c}`, `Solo ${c}`, base.filter((r) => r.comp === c).length]),
  ];
  modal({ title: `Exportar a Excel${typeFilter ? ' · ' + typeName(typeFilter) : ''}`, body: `
    <div class="muted">El archivo se guarda en la carpeta <b>Descargas</b> de la tableta. Incluye una hoja <b>Resumen</b> y una hoja por componente.</div>
    <div class="opt-list">${opts.map(([k, t, n]) => `<button class="opt" data-k="${esc(k)}" ${n ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}><b>${esc(t)}</b><span class="n">${fmtN(n)} registros</span></button>`).join('')}</div>`,
    buttons: [{ t: 'Cerrar' }],
    onOpen: (el, close) => $$('.opt', el).forEach((b) => (b.onclick = () => {
      const k = b.dataset.k;
      const rows = k === 'f' ? filtered : k === 'all' ? base : base.filter((r) => r.comp === k.slice(2));
      const label = k === 'f' ? (F.comp || 'Filtrado') : k === 'all' ? 'Todo' : k.slice(2);
      exportRecords(rows, `${adm ? 'Respaldo_' : ''}${label}`, adm, typeFilter);
      close();
    })),
  });
}

function editRecord(r, after) {
  if (!r || r.del) return;
  if (!canEdit(r)) return toast('Solo quien capturó este registro puede editarlo', 'err');
  const loteRows = S.recs.filter((x) => !x.del && x.lote === r.lote);
  const swV = false, pairC = r.comp === 'Cluster' || swV;
  const canJob = !pairC && loteRows.length > 1;
  modal({ title: `Editar registro #${r.id}`, body: `
    <div class="grid g2" style="font-size:14px">
      <div><span class="muted">Componente</span><br><b>${esc(r.comp)}</b></div>
      <div><span class="muted">Placas</span><br><b>${esc(r.plates)}</b></div>
      <div><span class="muted">Capturado</span><br><b>${fDT(r.ts)}</b></div>
      <div><span class="muted">Usuario</span><br><b>${esc(r.emp)} · ${esc(r.name)}</b></div>
    </div>
    <div class="field"><label>${swV ? 'Caja' : 'Contenedor'}</label><input class="input big scan" id="eC" value="${esc(r.cont)}" ${scanAttrs()}><div class="msg"></div></div>
    ${canJob ? `<label class="check"><input type="checkbox" id="eL"> Aplicar el cambio de contenedor a los ${loteRows.length} jobs de este contenedor (lote ${r.lote})</label>` : ''}
    <div class="field"><label>${swV ? 'ID' : 'Job'}</label><input class="input big scan job" id="eJ" data-max="${swV ? SW_ID_MAX : JOB_DIGITS}" value="${esc(r.job)}" ${scanAttrs()}><div class="msg"></div></div>
    <div class="muted" style="font-size:13px">Cada cambio queda registrado en <b>Cambios</b> con el valor anterior y el nuevo.</div>`,
    onOpen: (el) => { const i = $('#eJ', el); i.focus(); i.select(); $('#eC', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); i.focus(); i.select(); } }); },
    buttons: [{ t: 'Cancelar' }, { t: 'Guardar cambios', cls: 'primary', fn: (el) => {
      const ci = $('#eC', el), ji = $('#eJ', el), lote = canJob && $('#eL', el).checked;
      const nc = norm(ci.value), nj = onlyNum(ji.value, swV ? SW_ID_MAX : JOB_DIGITS); ci.value = nc; ji.value = nj;
      setMsg(ci, ''); setMsg(ji, '');
      if (!nc) { setMsg(ci, 'Requerido'); return false; }
      if (!nj) { setMsg(ji, 'Requerido'); return false; }
      if (nc === r.cont && nj === r.job) { toast('Sin cambios', 'info'); return; }
      if (nj !== r.job) { const msg = checkJob(r.comp, nj, 1, [r.id], r.type || 'validacion'); if (msg) { setMsg(ji, msg); beep('err'); return false; } }
      if (pairC && nc !== r.cont) { const msg = checkClusterCont(nc, 1, [r.id], r.comp); if (msg) { setMsg(ci, msg); beep('err'); return false; } }
      const now = Date.now();
      const log = (rec, field, before, afterV) => { S.seq.c += 1; S.chg.push({ id: S.seq.c, ts: now, emp: ME.emp, name: ME.name, rid: rec.id, comp: rec.comp, plates: rec.plates, lote: rec.lote, owner: rec.emp, field, before, after: afterV }); };
      const touched = new Set();
      if (nc !== r.cont) (lote ? loteRows : [r]).forEach((t) => { if (t.cont !== nc) { log(t, 'Contenedor', t.cont, nc); t.cont = nc; touched.add(t); } });
      if (nj !== r.job) { log(r, 'Job', r.job, nj); r.job = nj; touched.add(r); }
      touched.forEach((t) => { t.ed = (t.ed || 0) + 1; });
      if (!save('recs', 'chg', 'seq')) return false;
      toast('Cambio guardado y registrado', 'ok');
      if (after) after();
    } }],
  });
}

function wipeModal(typeFilter = null) {
  const today = opDate(Date.now());
  const mine = ofType(S.recs.filter((r) => r.emp === ME.emp && !r.del && opDate(r.ts) === today), typeFilter);
  if (!mine.length) return toast('No tienes capturas de hoy para limpiar', 'info');
  modal({ title: 'Limpiar mis capturas de hoy', cls: 'danger', body: `
    <div class="banner err">Se eliminarán del Excel <b>solo tus capturas de hoy</b> (${fDate(Date.now())}). Las de fechas anteriores no se tocan; esas se corrigen fila por fila.</div>
    <div class="field"><label>¿Qué quieres limpiar?</label><select class="input" id="wS">
      <option value="">Todas mis capturas de hoy (${fmtN(mine.length)})</option>
      ${COMPS.map((c) => { const n = mine.filter((r) => r.comp === c).length; return n ? `<option value="${esc(c)}">Solo ${esc(c)} (${fmtN(n)})</option>` : ''; }).join('')}
    </select></div>
    <label class="check"><input type="checkbox" id="wX" checked> Descargar Excel de esas capturas antes de limpiar</label>
    <div class="field"><label>Escribe LIMPIAR para confirmar</label><input class="input" id="wC" autocomplete="off"><div class="msg"></div></div>`,
    buttons: [{ t: 'Cancelar' }, { t: 'Limpiar', cls: 'danger-solid', fn: (el) => {
      const cc = $('#wC', el); if (norm(cc.value) !== 'LIMPIAR') { setMsg(cc, 'Escribe LIMPIAR'); return false; }
      const c = $('#wS', el).value, rows = mine.filter((r) => !c || r.comp === c);
      if ($('#wX', el).checked) exportRecords(rows, `Antes_de_limpiar_${c || 'Todo'}`, false, typeFilter);
      const now = Date.now();
      rows.forEach((r) => { r.del = { ts: now, emp: ME.emp }; S.seq.c += 1; S.chg.push({ id: S.seq.c, ts: now, emp: ME.emp, name: ME.name, rid: r.id, comp: r.comp, plates: r.plates, lote: r.lote, owner: r.emp, field: 'Fila', before: `${r.job} · ${r.cont}`, after: 'Eliminada (limpieza del día)' }); });
      if (!save('recs', 'chg', 'seq')) return false;
      toast(`${fmtN(rows.length)} registro(s) limpiados`, 'ok'); showTab(TAB);
    } }],
  });
}
/* Eliminar UNA fila (cualquier fecha): quien la capturó o un administrador */
function deleteRow(r, after) {
  if (!canEdit(r)) return toast('Solo quien capturó o un administrador puede eliminar esta fila', 'err');
  modal({ title: `Eliminar fila #${r.id}`, cls: 'danger', body: `
    <div class="banner err">Se eliminará <b>solo esta fila</b> del Excel de ${typeName(r.type || 'validacion')}. Se guarda un respaldo antes.</div>
    <div class="grid g2" style="font-size:14px">
      <div><span class="muted">Fecha</span><br><b>${fDT(r.ts)}</b></div>
      <div><span class="muted">Componente</span><br><b>${esc(r.comp)}</b></div>
      <div><span class="muted">Job</span><br><b>${esc(r.job)}</b></div>
      <div><span class="muted">Contenedor</span><br><b>${esc(r.cont)}</b></div>
      <div><span class="muted">Capturó</span><br><b>${esc(r.emp)} · ${esc(r.name)}</b></div>
      <div><span class="muted">Lote</span><br><b>${esc(r.lote)}</b></div>
    </div>`,
    buttons: [{ t: 'Cancelar' }, { t: 'Eliminar fila', cls: 'danger-solid', fn: () => {
      const now = Date.now(); r.del = { ts: now, emp: ME.emp };
      S.seq.c += 1; S.chg.push({ id: S.seq.c, ts: now, emp: ME.emp, name: ME.name, rid: r.id, comp: r.comp, plates: r.plates, lote: r.lote, owner: r.emp, field: 'Fila', before: `${r.job} · ${r.cont}`, after: 'Eliminada' });
      if (!save('recs', 'chg', 'seq')) return false;
      toast('Fila eliminada', 'ok'); if (after) after();
    } }],
  });
}

/* =====================================================================
   CAMBIOS EJECUTADOS
   ===================================================================== */
const CF = { q: '', comp: '', user: '', page: 0 };
function renderChanges() {
  const adm = isAdmin(), m = $('#main');
  const base = () => (adm ? S.chg : S.chg.filter((c) => c.emp === ME.emp || c.owner === ME.emp));
  const users = uniq(S.chg.map((c) => c.emp));
  m.innerHTML = `
    <div class="page-title"><h1>Cambios ejecutados</h1><div class="sub">${adm ? 'Todas las ediciones con valor anterior y nuevo' : 'Ediciones hechas a tus capturas'}</div>
      <div class="actions"><button class="btn primary" id="exp">${ICON.dl} Exportar a Excel</button></div></div>
    <div class="toolbar">
      <div class="field search"><label>Buscar</label><input class="input" id="q" placeholder="Valor anterior o nuevo, placas, # registro" value="${esc(CF.q)}" autocomplete="off"></div>
      <div class="field"><label>Componente</label><select class="input" id="fc"><option value="">Todos</option>${COMPS.map((c) => `<option ${CF.comp === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      ${adm ? `<div class="field"><label>Editado por</label><select class="input" id="fu"><option value="">Todos</option>${users.map((u) => `<option ${CF.user === u ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></div>` : ''}
    </div>
    <div class="table-wrap" id="tw"></div><div class="pager" id="pg"></div>`;
  const rowsF = () => {
    let rows = base();
    if (CF.comp) rows = rows.filter((c) => c.comp === CF.comp);
    if (adm && CF.user) rows = rows.filter((c) => c.emp === CF.user);
    if (CF.q) { const q = norm(CF.q); rows = rows.filter((c) => c.before.includes(q) || c.after.includes(q) || c.plates.includes(q) || String(c.rid) === q.replace('#', '')); }
    return rows.slice().sort((a, b) => b.ts - a.ts || b.id - a.id);
  };
  const draw = () => {
    const rows = rowsF(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); CF.page = Math.min(CF.page, pages - 1);
    const view = rows.slice(CF.page * PAGE, (CF.page + 1) * PAGE);
    $('#tw').innerHTML = rows.length ? `<table class="t"><thead><tr><th>Fecha y hora</th><th>Editado por</th><th>Registro</th><th>Componente</th><th>Placas</th><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody>
      ${view.map((c) => `<tr><td>${fDT(c.ts)}</td><td>${esc(c.emp)}<div class="muted" style="font-size:12px">${esc(c.name)}</div></td><td>#${c.rid}<div class="muted" style="font-size:12px">Job ${c.lote}</div></td>
        <td><span class="badge b-info">${esc(c.comp)}</span></td><td class="mono">${esc(c.plates)}</td><td><b>${esc(c.field)}</b></td>
        <td class="diff-b">${esc(c.before)}</td><td class="diff-a">${esc(c.after)}</td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No hay cambios registrados.</div>';
    $('#pg').innerHTML = pages > 1 ? `<button class="btn sm" id="pv" ${CF.page ? '' : 'disabled'}>‹ Anterior</button><span class="muted">Página ${CF.page + 1} de ${pages}</span><button class="btn sm" id="nx" ${CF.page < pages - 1 ? '' : 'disabled'}>Siguiente ›</button>` : '';
    if (pages > 1) { $('#pv').onclick = () => { CF.page--; draw(); }; $('#nx').onclick = () => { CF.page++; draw(); }; }
  };
  let qt = null;
  $('#q').oninput = (e) => { clearTimeout(qt); qt = setTimeout(() => { CF.q = e.target.value; CF.page = 0; draw(); }, 200); };
  $('#fc').onchange = (e) => { CF.comp = e.target.value; CF.page = 0; draw(); };
  if (adm) $('#fu').onchange = (e) => { CF.user = e.target.value; CF.page = 0; draw(); };
  $('#exp').onclick = () => { const rows = rowsF(); if (!rows.length) return toast('No hay cambios para exportar', 'warn'); exportWorkbook([['Cambios', changeRows(rows)]], `Cambios_${stamp()}.xlsx`); };
  draw();
}

/* =====================================================================
   ADMIN · USUARIOS
   ===================================================================== */
function renderUsers() {
  const box = $('#cfgUsers') || $('#main');
  const list = S.users.filter((u) => u.role !== 'master' || isMaster()); // el Admin master solo lo ve él mismo
  box.innerHTML = `
    <div class="sec-head"><h2>Usuarios</h2><span class="muted">Alta, rol, contraseña y acceso</span><span class="spacer"></span>
      <button class="btn primary" id="uAdd">${ICON.plus} Agregar usuario</button></div>
    <div class="table-wrap"><table class="t"><thead><tr><th>No. empleado</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Capturas</th><th>Último ingreso</th><th></th></tr></thead><tbody>
    ${list.slice().sort((a, b) => a.emp.localeCompare(b.emp)).map((u) => `<tr>
      <td class="mono">${esc(u.emp)}</td><td>${esc(u.name)}${u.emp === ME.emp ? ' <span class="badge b-info">Tú</span>' : ''}</td>
      <td><span class="badge ${u.role === 'master' ? 'b-err' : u.role === 'admin' ? 'b-warn' : 'b-mute'}">${roleName(u)}</span></td>
      <td>${u.active ? '<span class="badge b-ok">Activo</span>' : '<span class="badge b-err">Inactivo</span>'}${u.must ? ' <span class="badge b-info" title="Debe cambiar contraseña al entrar">Temporal</span>' : ''}</td>
      <td>${fmtN(S.recs.filter((r) => r.emp === u.emp && !r.del).length)}</td>
      <td>${u.last ? fDT(u.last) : '<span class="muted">Nunca</span>'}</td>
      <td><button class="btn sm" data-u="${esc(u.emp)}">${ICON.edit} Editar</button></td></tr>`).join('')}
    </tbody></table></div>`;
  $('#uAdd').onclick = () => userModal(null);
  $$('[data-u]', box).forEach((b) => (b.onclick = () => userModal(S.users.find((u) => u.emp === b.dataset.u))));
}
function userModal(u) {
  const isNew = !u;
  if (u && u.role === 'master' && !isMaster()) return toast('Sin permiso', 'err');
  const isM = u?.role === 'master';
  modal({ title: isNew ? 'Agregar usuario' : `Editar usuario ${esc(u.emp)}`, body: `
    <div class="grid g2">
      <div class="field"><label>No. de empleado</label><input class="input" id="uE" value="${esc(u?.emp || '')}" ${isNew ? '' : 'readonly style="background:#f4f7fb"'}><div class="msg"></div></div>
      <div class="field"><label>Rol</label>${isM ? '<input class="input" value="Admin master" readonly style="background:#f4f7fb"><input type="hidden" id="uR" value="master">'
        : `<select class="input" id="uR"><option value="verificador">Verificador</option><option value="admin" ${u?.role === 'admin' ? 'selected' : ''}>Administrador</option></select>`}</div>
    </div>
    <div class="field"><label>Nombre</label><input class="input" id="uN" value="${esc(u?.name || '')}"><div class="msg"></div></div>
    <div class="field"><label>${isNew ? 'Contraseña (mín. 4)' : 'Nueva contraseña (vacío = no cambiar)'}</label><input class="input" id="uP" type="password" autocomplete="new-password"><div class="msg"></div></div>
    <label class="check"><input type="checkbox" id="uM" ${isNew || u?.must ? 'checked' : ''}> Pedir cambio de contraseña al primer ingreso</label>
    ${isNew || isM ? '' : `<label class="check"><input type="checkbox" id="uA" ${u.active ? 'checked' : ''}> Usuario activo (puede iniciar sesión)</label>`}
    <div class="muted" style="font-size:12.5px"><b>Verificador:</b> captura y consulta. <b>Administrador:</b> además configura turnos, metas y usuarios.</div>`,
    onOpen: (el) => $(isNew ? '#uE' : '#uN', el).focus(),
    buttons: [{ t: 'Cancelar' }, { t: isNew ? 'Agregar' : 'Guardar', cls: 'primary', fn: (el) => {
      const E = $('#uE', el), N = $('#uN', el), P = $('#uP', el);
      [E, N, P].forEach((i) => setMsg(i, ''));
      const emp = norm(E.value), name = N.value.trim(), pw = P.value, must = $('#uM', el).checked;
      let role = $('#uR', el).value;
      const activeV = isNew || isM ? true : $('#uA', el).checked;
      if (!emp) { setMsg(E, 'Requerido'); return false; }
      if (isNew && S.users.some((x) => x.emp === emp)) { setMsg(E, 'Ese número ya existe'); return false; }
      if (isNew && emp === MASTER) { setMsg(E, 'Número reservado'); return false; }
      if (!name) { setMsg(N, 'Requerido'); return false; }
      if ((isNew || pw) && pw.length < 4) { setMsg(P, 'Mínimo 4 caracteres'); return false; }
      if (isM) role = 'master';
      if (!isNew && !isM) {
        const admins = S.users.filter((x) => (x.role === 'admin' || x.role === 'master') && x.active && x.emp !== u.emp).length;
        if ((role !== 'admin' || !activeV) && u.role === 'admin' && admins === 0) { toast('Debe quedar al menos un administrador activo', 'err'); return false; }
        if (u.emp === ME.emp && !activeV) { toast('No puedes desactivarte a ti mismo', 'err'); return false; }
      }
      if (isNew) S.users.push({ emp, name, role, pw: hashPw(emp, pw), pwAt: Date.now(), active: true, must, created: Date.now(), last: null });
      else { Object.assign(u, { name, role, active: activeV, must }); if (pw) { u.pw = hashPw(u.emp, pw); u.pwAt = Date.now(); } }
      if (!save('users')) return false;
      toast(isNew ? `Usuario ${emp} agregado` : 'Usuario actualizado', 'ok');
      if (!isNew && u.emp === ME.emp) { ME = u; return renderShell(); }
      renderUsers();
    } }],
  });
}

/* =====================================================================
   ADMIN · CONFIGURACIÓN (turnos, metas y usuarios)
   ===================================================================== */
function shiftCoverage(list) {
  const cnt = new Array(1440).fill(0);
  list.forEach((x) => { for (let m = 0; m < 1440; m++) if (inShift(x, m)) cnt[m]++; });
  return { gaps: cnt.filter((c) => c === 0).length, over: cnt.filter((c) => c > 1).length };
}
function renderConfig() {
  const m = $('#main');
  let rows = S.cfg.shifts.map((x) => ({ ...x }));
  m.innerHTML = `
    <div class="page-title"><h1>Configuración</h1><div class="sub">Turnos, metas por turno y usuarios · solo administradores</div></div>
    <div class="panel">
      <div class="sec-head"><h2>Turnos y metas</h2><span class="muted">La meta es la cantidad de jobs por turno, por día</span><span class="spacer"></span>
        <button class="btn" id="shAdd">${ICON.plus} Agregar turno</button><button class="btn primary" id="shSave">${ICON.check} Guardar turnos</button></div>
      <div class="table-wrap"><table class="t cfg-t"><thead><tr><th>Turno</th><th>Inicio</th><th>Fin</th><th>Meta validación (jobs)</th><th>Meta secuencia (jobs)</th><th></th></tr></thead><tbody id="shBody"></tbody></table></div>
      <div id="shWarn"></div>
    </div>
    <div class="panel"><div class="sec-head"><h2>Equipo</h2><span class="muted">Cada tableta escribe su propia base en la carpeta</span></div>
      <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
        <div class="field" style="max-width:260px;margin:0"><label>Nombre del equipo</label><input class="input" id="devN" maxlength="12" placeholder="TAB1" value="${esc(devName())}"></div>
        <button class="btn primary" id="devSave">${ICON.check} Guardar nombre</button>
        <div class="muted" style="font-size:13px">Archivos de este equipo: <b id="devF">${esc(devFile('validacion'))} · ${esc(devFile('secuencia'))} · ${esc(devFile('devolucion'))} · ${esc(devFile('entrega'))}</b></div>
      </div></div>
    <div class="panel" id="cfgUsers"></div>
    <div class="panel"><div class="sec-head"><h2>Acerca de QORVEX MOBILE</h2></div>
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-size:14px;line-height:1.55"><img src="${CH_LOGO}" alt="CH Industrial Solutions" style="height:60px;width:auto;border-radius:10px;background:#fff;padding:4px">
        <div><b>Desarrollado por CH Industrial Solutions</b><br>Titular: Ing. Carlos Alberto Hernández Hernández<br>charliealberth290116@outlook.es · 8115377033 · General Escobedo, Nuevo León, México</div></div></div>`;
  $('#devN').oninput = (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''); };
  $('#devSave').onclick = async () => {
    const v = $('#devN').value.trim();
    if (v === devName()) return toast('Sin cambios', 'info');
    if (!/^TAB\d{1,3}$/.test(v)) return toast('El nombre del equipo debe ser TAB1, TAB2…', 'err');
    if (!(await confirmBox('Nombre del equipo', `<div>Este equipo pasará a escribir en <b>Validacion_${esc(v)}_aaaa-mm.txt</b> y <b>Secuencia_${esc(v)}_aaaa-mm.txt</b>.</div><div class="muted" style="font-size:13px">Se crean solos con encabezados, uno por mes. Los archivos anteriores no se tocan.</div>`, 'Guardar', false))) return;
    try { if (v) localStorage.setItem(DEV_KEY, v); else localStorage.removeItem(DEV_KEY); } catch (e) {}
    $('#devF').textContent = `${devFile('validacion')} · ${devFile('secuencia')} · ${devFile('devolucion')} · ${devFile('entrega')}`;
    toast(`Equipo: ${v || 'sin nombre'}`, 'ok');
    if (window.QXconnect) await window.QXconnect(true);
  };
  const body = $('#shBody');
  const check = () => {
    const c = shiftCoverage(rows);
    $('#shWarn').innerHTML = c.gaps || c.over ? `<div class="banner warn" style="margin-top:10px">${c.gaps ? `Hay ${Math.floor(c.gaps / 60)} h ${c.gaps % 60} min del día sin turno (se mostrará como “Sin turno”). ` : ''}${c.over ? `Hay ${Math.floor(c.over / 60)} h ${c.over % 60} min en más de un turno (se toma el primero de la lista).` : ''}</div>` : '<div class="muted" style="margin-top:8px;font-size:12.5px">✓ Los turnos cubren las 24 horas sin traslaparse.</div>';
  };
  const draw = () => {
    body.innerHTML = rows.map((x, i) => `<tr>
      <td><input class="input" data-i="${i}" data-k="n" value="${esc(x.n)}" maxlength="20"></td>
      <td><input class="input" type="time" data-i="${i}" data-k="s" value="${esc(x.s)}"></td>
      <td><input class="input" type="time" data-i="${i}" data-k="e" value="${esc(x.e)}"></td>
      <td><input class="input" type="number" min="0" step="1" data-i="${i}" data-k="gv" value="${Number(x.gv) || 0}"></td>
      <td><input class="input" type="number" min="0" step="1" data-i="${i}" data-k="gs" value="${Number(x.gs) || 0}"></td>
      <td><button class="btn sm danger" data-del="${i}" ${rows.length < 2 ? 'disabled' : ''}>${ICON.trash}</button></td></tr>`).join('');
    $$('input', body).forEach((inp) => (inp.oninput = () => { const x = rows[+inp.dataset.i], k = inp.dataset.k; x[k] = k === 'gv' || k === 'gs' ? Math.max(0, parseInt(inp.value, 10) || 0) : inp.value; check(); }));
    $$('[data-del]', body).forEach((b) => (b.onclick = () => { rows.splice(+b.dataset.del, 1); draw(); }));
    check();
  };
  $('#shAdd').onclick = () => { rows.push({ n: `Turno ${rows.length + 1}`, s: '00:00', e: '00:00', gv: 0, gs: 0 }); draw(); };
  $('#shSave').onclick = () => {
    rows.forEach((x) => { x.n = String(x.n || '').trim(); });
    if (rows.some((x) => !x.n)) return toast('Cada turno necesita nombre', 'err');
    if (uniq(rows.map((x) => x.n.toLowerCase())).length !== rows.length) return toast('Hay turnos con el mismo nombre', 'err');
    if (rows.some((x) => !/^\d{2}:\d{2}$/.test(x.s) || !/^\d{2}:\d{2}$/.test(x.e))) return toast('Revisa las horas de inicio y fin', 'err');
    S.cfg.shifts = rows.map((x) => ({ n: x.n, s: x.s, e: x.e, gv: Number(x.gv) || 0, gs: Number(x.gs) || 0 }));
    if (!save('cfg')) return;
    toast('Turnos y metas guardados. Aplican a las capturas nuevas.', 'ok');
  };
  draw();
  renderUsers();
}

/* =====================================================================
   DASHBOARD POR TURNO
   ===================================================================== */
const DF = { mode: 'day', d: '', from: '', to: '' };
function renderDash() {
  const m = $('#main');
  const today = opDate(Date.now());
  if (!DF.d) DF.d = today;
  if (!DF.from) { const t = new Date(); t.setDate(t.getDate() - 6); DF.from = isoDay(t); DF.to = today; }
  const [d1, d2] = DF.mode === 'day' ? [DF.d, DF.d] : [DF.from <= DF.to ? DF.from : DF.to, DF.from <= DF.to ? DF.to : DF.from];
  const days = []; for (let t = new Date(`${d1}T12:00:00`); isoDay(t) <= d2; t.setDate(t.getDate() + 1)) days.push(isoDay(t));
  const recs = S.recs.filter((r) => !r.del).map((r) => ({ r, od: opDate(r.ts), sh: recShift(r), ty: r.type || 'validacion' })).filter((x) => x.od >= d1 && x.od <= d2);
  const shifts = S.cfg.shifts;
  const extra = uniq(recs.map((x) => x.sh)).filter((n) => !shifts.some((s) => s.n === n));
  const allSh = [...shifts, ...extra.map((n) => ({ n, s: '', e: '', gv: 0, gs: 0 }))];
  const fmtD = (iso) => { const [y, mo, d] = iso.split('-'); return `${d}/${mo}/${y}`; };
  const pctCls = (p) => (p >= 100 ? 'ok' : p >= 80 ? 'mid' : 'low');
  const section = (ty, title, gk) => {
    const R = recs.filter((x) => x.ty === ty);
    const goalTot = shifts.reduce((a, s) => a + (Number(s[gk]) || 0), 0) * days.length;
    const pTot = goalTot ? Math.round((R.length / goalTot) * 100) : null;
    const cards = allSh.map((s) => {
      const rs = R.filter((x) => x.sh === s.n), g = (Number(s[gk]) || 0) * days.length, p = g ? Math.round((rs.length / g) * 100) : null;
      return `<div class="sh-card">
        <div class="sh-top"><b>${esc(s.n)}</b><span>${s.s ? `${esc(s.s)}–${esc(s.e)}` : 'fuera de turno'}</span></div>
        <div class="sh-num">${fmtN(rs.length)}<small>jobs</small></div>
        <div class="sh-sub">${fmtN(uniq(rs.map((x) => `${x.r.comp}|${x.r.cont}`)).length)} contenedores · ${fmtN(uniq(rs.map((x) => x.r.emp)).length)} usuarios</div>
        ${g ? `<div class="bar ${pctCls(p)}"><i style="width:${Math.min(100, p)}%"></i></div><div class="sh-goal"><span>Meta ${fmtN(g)}</span><b class="${pctCls(p)}">${p}%</b></div>`
          : '<div class="sh-goal muted">Sin meta definida</div>'}
      </div>`;
    }).join('');
    const comps = COMPS.filter((c) => R.some((x) => x.r.comp === c));
    const compT = comps.length ? `<table class="t mini"><thead><tr><th>Componente</th>${allSh.map((s) => `<th>${esc(s.n)}</th>`).join('')}<th>Total</th></tr></thead><tbody>
      ${comps.map((c) => `<tr><td><span class="badge b-info">${esc(c)}</span></td>${allSh.map((s) => `<td>${fmtN(R.filter((x) => x.r.comp === c && x.sh === s.n).length)}</td>`).join('')}<td><b>${fmtN(R.filter((x) => x.r.comp === c).length)}</b></td></tr>`).join('')}
      </tbody></table>` : '';
    const dayT = days.length > 1 ? `<table class="t mini"><thead><tr><th>Fecha</th>${allSh.map((s) => `<th>${esc(s.n)}</th>`).join('')}<th>Total</th></tr></thead><tbody>
      ${days.slice().reverse().map((d) => `<tr><td>${fmtD(d)}</td>${allSh.map((s) => { const n = R.filter((x) => x.od === d && x.sh === s.n).length, g = Number(s[gk]) || 0; return `<td><span class="${g ? pctCls((n / g) * 100) : ''}">${fmtN(n)}</span>${g ? `<span class="muted"> / ${fmtN(g)}</span>` : ''}</td>`; }).join('')}<td><b>${fmtN(R.filter((x) => x.od === d).length)}</b></td></tr>`).join('')}
      </tbody></table>` : '';
    return `<div class="panel dash-sec">
      <div class="sec-head"><h2>${title}</h2><span class="tot">${fmtN(R.length)} jobs</span>${goalTot ? `<span class="muted">de ${fmtN(goalTot)} · </span><b class="${pctCls(pTot)}">${pTot}% de la meta</b>` : '<span class="muted">sin meta definida</span>'}</div>
      <div class="sh-grid">${cards}</div>
      ${R.length ? `<div class="dash-tabs">${compT ? `<div><h3>Por componente</h3>${compT}</div>` : ''}${dayT ? `<div><h3>Por día</h3>${dayT}</div>` : ''}</div>` : '<div class="empty" style="padding:14px">Sin capturas en este periodo.</div>'}
    </div>`;
  };
  m.innerHTML = `
    <div class="page-title"><h1>Dashboard por turno</h1><div class="sub">${DF.mode === 'day' ? fmtD(d1) : `${fmtD(d1)} al ${fmtD(d2)} · ${days.length} días`} · el turno de noche cuenta para el día en que inicia</div></div>
    <div class="toolbar dash-f">
      <div class="seg"><button class="${DF.mode === 'day' ? 'on' : ''}" data-mode="day">Fecha</button><button class="${DF.mode === 'range' ? 'on' : ''}" data-mode="range">Rango</button></div>
      ${DF.mode === 'day' ? `<input class="input" type="date" id="dd" value="${DF.d}">`
        : `<input class="input" type="date" id="df" value="${DF.from}"><span class="muted">a</span><input class="input" type="date" id="dt" value="${DF.to}">`}
      <button class="btn sm" data-q="0">Hoy</button><button class="btn sm" data-q="1">Ayer</button><button class="btn sm" data-q="7">Últimos 7 días</button>
      ${isAdmin() ? '<span class="spacer"></span><button class="btn sm" id="goCfg">Configurar metas</button>' : ''}
    </div>
    ${section('validacion', 'Validación', 'gv')}
    ${section('secuencia', 'Secuenciado', 'gs')}`;
  $$('[data-mode]', m).forEach((b) => (b.onclick = () => { DF.mode = b.dataset.mode; renderDash(); }));
  if (DF.mode === 'day') $('#dd').onchange = (e) => { DF.d = e.target.value || today; renderDash(); };
  else { $('#df').onchange = (e) => { DF.from = e.target.value || DF.from; renderDash(); }; $('#dt').onchange = (e) => { DF.to = e.target.value || DF.to; renderDash(); }; }
  $$('[data-q]', m).forEach((b) => (b.onclick = () => {
    const q = +b.dataset.q, t = new Date(`${today}T12:00:00`);
    if (q === 7) { DF.mode = 'range'; DF.to = today; t.setDate(t.getDate() - 6); DF.from = isoDay(t); }
    else { DF.mode = 'day'; t.setDate(t.getDate() - q); DF.d = isoDay(t); }
    renderDash();
  }));
  if ($('#goCfg')) $('#goCfg').onclick = () => showTab('cfg');
}

/* =====================================================================
   ADMIN · SISTEMA (almacenamiento y respaldos)
   ===================================================================== */
function renderSystem() {
  const pct = storagePct(), m = $('#main'), delN = S.recs.filter((r) => r.del).length;
  m.innerHTML = `
    <div class="page-title"><h1>Sistema</h1><div class="sub">Almacenamiento de la tableta y respaldos</div></div>
    <div class="panel">
      <h2>Almacenamiento usado</h2>
      <div class="meter ${pct > 80 ? 'hot' : ''}"><i style="width:${pct.toFixed(1)}%"></i></div>
      <div><b>${pct.toFixed(1)}%</b> <span class="muted">· ${fmtN(S.recs.length)} registros (${fmtN(delN)} limpiados) · ${fmtN(S.chg.length)} cambios · ${fmtN(S.users.length)} usuarios</span></div>
      ${pct > 80 ? '<div class="banner warn" style="margin-top:12px">La memoria está casi llena. Exporta el respaldo y purga los registros limpiados.</div>' : ''}
    </div>
    <div class="grid g2">
      <div class="panel"><h2>Respaldo</h2>
        <p class="muted" style="margin-top:0">Excel con todos los registros (activos y limpiados), cambios y usuarios. El respaldo .json sirve para restaurar en otra tableta.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" id="bx">${ICON.dl} Respaldo Excel</button><button class="btn" id="bj">${ICON.dl} Respaldo .json</button></div></div>
      <div class="panel"><h2>Restaurar / purgar</h2>
        <p class="muted" style="margin-top:0">Restaurar reemplaza <b>todo</b> lo de esta tableta. Purgar elimina definitivamente los registros que los usuarios limpiaron.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="rs">Restaurar .json</button><button class="btn danger" id="pu" ${delN ? '' : 'disabled'}>${ICON.trash} Purgar ${fmtN(delN)} limpiados</button></div></div>
    </div>`;
  $('#bx').onclick = fullExcelBackup;
  $('#bj').onclick = jsonBackup;
  $('#rs').onclick = restoreBackup;
  $('#pu').onclick = () => {
    modal({ title: 'Purgar registros limpiados', cls: 'danger', body: `
      <div class="banner err">Se borrarán definitivamente ${fmtN(delN)} registros limpiados. Esta acción no se puede deshacer.</div>
      <label class="check"><input type="checkbox" id="pX" checked> Descargar respaldo Excel antes de purgar</label>
      <div class="field"><label>Escribe PURGAR para confirmar</label><input class="input" id="pC" autocomplete="off"><div class="msg"></div></div>`,
      buttons: [{ t: 'Cancelar' }, { t: 'Purgar', cls: 'danger-solid', fn: (el) => {
        const c = $('#pC', el); if (norm(c.value) !== 'PURGAR') { setMsg(c, 'Escribe PURGAR'); return false; }
        if ($('#pX', el).checked) fullExcelBackup();
        S.recs = S.recs.filter((r) => !r.del);
        if (!save('recs')) return false;
        toast('Registros limpiados purgados', 'ok'); renderSystem();
      } }],
    });
  };
}
function jsonBackup() {
  const data = { app: 'validacion-materiales', v: 1, exported: new Date().toISOString(), by: ME.emp, users: S.users, recs: S.recs, chg: S.chg, seq: S.seq, cfg: S.cfg };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
  a.download = `Respaldo_Validacion_${stamp()}.json`; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('Respaldo .json descargado', 'ok');
}
function restoreBackup() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    let d; try { d = JSON.parse(await file.text()); } catch (e) { return toast('Archivo no válido', 'err'); }
    if (d.app !== 'validacion-materiales' || !Array.isArray(d.users) || !Array.isArray(d.recs)) return toast('El archivo no es un respaldo de esta app', 'err');
    if (!d.users.some((u) => (u.role === 'admin' || u.role === 'master') && u.active)) return toast('El respaldo no tiene administrador activo', 'err');
    if (!(await confirmBox('Restaurar respaldo', `<div class="banner err">Se reemplazará todo lo de esta tableta por el respaldo del ${esc(fDT(d.exported))}: ${fmtN(d.recs.length)} registros, ${fmtN(d.users.length)} usuarios.</div>`, 'Restaurar'))) return;
    Object.assign(S, { users: d.users, recs: d.recs, chg: d.chg || [], seq: Object.assign({ r: 0, b: 0, c: 0 }, d.seq), cfg: d.cfg || S.cfg });
    if (!save('users', 'recs', 'chg', 'seq', 'cfg')) return;
    toast('Respaldo restaurado. Inicia sesión.', 'ok'); logout();
  };
  inp.click();
}

/* =====================================================================
   EXCEL (SheetJS incluido en el archivo, funciona sin internet)
   ===================================================================== */
function recRow(r, adm) {
  const o = { 'Fecha': fDate(r.ts), 'Hora': fTime(r.ts), 'Turno': recShift(r), 'Tipo': typeName(r.type || 'validacion'), 'Job': r.job, 'Contenedor': r.cont, 'Componente': r.comp, 'Placas': r.plates, 'Lote': r.lote, 'No. Empleado': r.emp, 'Nombre': r.name, 'Supervisor': r.sup || '', 'Editado': r.ed ? `Sí (${r.ed})` : 'No' };
  if (r.type === 'entrega') o['Comentario'] = r.motivo || '';
  if (adm) Object.assign(o, { 'Estado': r.del ? 'Limpiado' : 'Activo', 'Limpiado por': r.del ? r.del.emp : '', 'Fecha limpiado': r.del ? fDT(r.del.ts) : '', 'ID': r.id });
  return o;
}
function changeRows(rows) {
  return rows.map((c) => ({ 'Fecha': fDate(c.ts), 'Hora': fTime(c.ts), 'Editado por': c.emp, 'Nombre': c.name, 'Registro #': c.rid, 'Lote': c.lote, 'Componente': c.comp, 'Placas': c.plates, 'Campo': c.field, 'Antes': c.before, 'Después': c.after }));
}
function summaryRows(rows) {
  return COMPS.filter((c) => rows.some((r) => r.comp === c)).map((c) => {
    const rs = rows.filter((r) => r.comp === c);
    return { 'Componente': c, 'Contenedores': uniq(rs.map((r) => r.cont)).length, 'Jobs': rs.length, 'Unidades (placas)': uniq(rs.map((r) => r.plates)).length,
      'Primera captura': fDT(Math.min(...rs.map((r) => r.ts))), 'Última captura': fDT(Math.max(...rs.map((r) => r.ts))) };
  });
}
function exportWorkbook(sheets, filename) {
  if (typeof XLSX === 'undefined') { toast('No se pudo cargar el generador de Excel', 'err'); return false; }
  const wb = XLSX.utils.book_new();
  sheets.forEach(([name, rows]) => {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 'Sin datos': '' }]);
    const keys = Object.keys(rows[0] || { 'Sin datos': '' });
    ws['!cols'] = keys.map((k) => ({ wch: Math.min(40, Math.max(k.length + 2, ...rows.slice(0, 500).map((r) => String(r[k] ?? '').length + 2))) }));
    if (rows.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: keys.length - 1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));
  });
  try { XLSX.writeFile(wb, filename, { compression: true }); toast(`Excel descargado: ${filename}`, 'ok', 4500); return true; }
  catch (e) { toast(`No se pudo generar el Excel: ${e.message}`, 'err'); return false; }
}
function exportRecords(rows, label, adm, typeFilter = null) {
  if (!rows.length) return toast('No hay registros para exportar', 'warn');
  const sorted = rows.slice().sort((a, b) => a.ts - b.ts || a.id - b.id);
  const comps = COMPS.filter((c) => sorted.some((r) => r.comp === c));
  const sheets = [['Resumen', summaryRows(sorted)]];
  if (comps.length > 1) sheets.push(['Todo', sorted.map((r) => recRow(r, adm))]);
  comps.forEach((c) => sheets.push([c, sorted.filter((r) => r.comp === c).map((r) => recRow(r, adm))]));
  if (adm) { const ids = new Set(sorted.map((r) => r.id)); const ch = S.chg.filter((c) => ids.has(c.rid)); if (ch.length) sheets.push(['Cambios', changeRows(ch)]); }
  exportWorkbook(sheets, `${typeFilter === 'secuencia' ? 'Secuencia' : typeFilter === 'devolucion' ? 'Devolucion' : typeFilter === 'entrega' ? 'Entrega' : 'Validacion'}_${label.replace(/[^\w-]+/g, '_')}_${stamp()}.xlsx`);
}
function fullExcelBackup() {
  const sorted = S.recs.slice().sort((a, b) => a.ts - b.ts || a.id - b.id);
  exportWorkbook([
    ['Resumen', summaryRows(sorted.filter((r) => !r.del))],
    ['Registros', sorted.map((r) => recRow(r, true))],
    ['Cambios', changeRows(S.chg)],
    ['Usuarios', S.users.filter((u) => u.role !== 'master' || isMaster()).map((u) => ({ 'No. Empleado': u.emp, 'Nombre': u.name, 'Rol': roleName(u), 'Activo': u.active ? 'Sí' : 'No', 'Alta': u.created ? fDT(u.created) : '', 'Último ingreso': u.last ? fDT(u.last) : '' }))],
  ], `Respaldo_Validacion_${stamp()}.xlsx`);
}

/* Otra pestaña/ventana modificó los datos → recargar */
window.addEventListener('storage', (e) => { if (Object.values(K).includes(e.key)) loadAll(); });
// el arranque lo hace la conexión con Excel (script siguiente)

// Validar jobs a 6 dígitos
$$('input.scan.job').forEach(inp => {
  inp.addEventListener('blur', function(){
    if(this.value && this.value.length > 6){
      this.value = this.value.substring(0, 6);
    }
    // Solo números
    this.value = this.value.replace(/[^0-9]/g, '');
  });
});
