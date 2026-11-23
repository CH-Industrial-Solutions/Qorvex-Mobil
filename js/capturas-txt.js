/*! QORVEX MOBILE · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/* =====================================================================
   QORVEX MOBILE · CAPTURAS EN TXT (carpeta compartida "Data Base")
   - Cada tableta escribe SOLO sus archivos, uno por mes y por tipo:
       Validacion_TAB1_2026-11.txt · Secuencia_TAB1_2026-11.txt
     Texto separado por tabulador (UTF-8), primera línea = encabezados.
   - Nunca se reescribe un archivo: cada movimiento AGREGA una línea al final
     con su ID y Movimiento (Alta / Edición / Baja). Al leer, el último
     movimiento de cada ID es el que vale.
   - Lee Config_QORVEX.json (lo escribe QORVEX Motor): turnos, metas, días
     laborables, festivos, supervisores y usuarios.
   - Si no se puede escribir (sin permiso, sin red), lo capturado queda en
     "pendientes" en la tableta y se reintenta; nunca se pierde.
   ===================================================================== */
(function () {
  const HEAD = ['Fecha', 'Hora', 'Turno', 'Tipo', 'Job', 'Contenedor', 'Componente', 'Placas', 'Lote', 'No. Empleado', 'Nombre', 'Supervisor', 'Editado', 'ID', 'Movimiento', 'Registrado', 'Duplicado', 'Motivo'];
  const SIGF = ['Fecha', 'Hora', 'Turno', 'Job', 'Contenedor', 'Componente', 'Placas', 'Lote', 'No. Empleado', 'Nombre', 'Supervisor', 'Editado'];
  const ROLES = { validacion: { t: 'Validación', pre: 'Validacion' }, secuencia: { t: 'Secuencia', pre: 'Secuencia' }, devolucion: { t: 'Devolución', pre: 'Devolucion' }, entrega: { t: 'Entrega', pre: 'Entrega' } };
  const KX = { snap: 'vm_tsnap', last: 'vm_xlast', xpend: 'vm_tpend', cfg: 'vm_qcfg' };
  const CFG_FILE = 'Config_QORVEX.json';
  const supported = () => typeof window.showDirectoryPicker === 'function';
  const nh = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const X = { dir: null, state: 'off', msg: '', last: null, busy: false, again: false, cache: [], counts: {}, sigs: {}, files: { validacion: [], secuencia: [], devolucion: [], entrega: [] }, cfg: null, others: [], ent: new Set(), entAt: 0, plan: null, planAt: '' };
  window.QX = X;
  const jget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  /* ---------- IndexedDB (recordar la carpeta) ---------- */
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open('qorvex-mobile', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function kv(k, v) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction('kv', v === undefined ? 'readonly' : 'readwrite'), s = t.objectStore('kv');
      const q = v === undefined ? s.get(k) : s.put(v, k);
      q.onsuccess = () => res(v === undefined ? q.result : true); q.onerror = () => rej(q.error);
    });
  }

  /* ---------- Formato de línea ---------- */
  const clean = (v) => String(v ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  const toLine = (a) => a.map(clean).join('\t');
  const monthTag = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const fileOf = (k, d) => `${ROLES[k].pre}_${devName()}_${monthTag(d)}.txt`;
  const fileRe = (k) => new RegExp(`^${ROLES[k].pre}_${devName()}_(\\d{4})-(\\d{2})\\.txt$`, 'i');
  const typeOf = (r) => (ROLES[r.type] ? r.type : 'validacion');
  const rowObj = (r) => { const o = recRow(r, false); o['ID'] = r.id; o['Tipo'] = ROLES[typeOf(r)].t; o['Motivo'] = r.motivo || ''; return o; };
  const lineOf = (r, mov) => { const o = rowObj(r); o['Movimiento'] = mov; o['Registrado'] = fDT(Date.now()); return toLine(HEAD.map((h) => o[h] ?? '')); };
  const sig = (r) => { const o = rowObj(r); return JSON.stringify(SIGF.map((h) => String(o[h] ?? ''))); };
  const keyOf = (r) => { const o = rowObj(r); return [o['Fecha'], o['Hora'], o['Job'], o['Contenedor'], o['Componente'], o['No. Empleado']].map((v) => String(v ?? '').trim().toUpperCase()).join('|'); };
  /** Locales que aún NO están en el TXT, contando repetidos (Switch: el mismo job puede ir hasta 5 veces en la misma caja) */
  function notIn(local, fileRecs) {
    const cnt = new Map(); fileRecs.forEach((r) => { const k = keyOf(r); cnt.set(k, (cnt.get(k) || 0) + 1); });
    return local.filter((r) => { const k = keyOf(r), n = cnt.get(k) || 0; if (n > 0) { cnt.set(k, n - 1); return false; } return true; });
  }
  function tsOf(f, h) {
    const m = String(f ?? '').match(/(\d{1,4})[\/\-.](\d{1,2})[\/\-.](\d{1,4})/); if (!m) return Date.now();
    const [a, b, c] = m.slice(1).map(Number), d = a > 31 ? new Date(a, b - 1, c) : new Date(c < 100 ? 2000 + c : c, b - 1, a);
    const t = String(h ?? '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/); if (t) d.setHours(+t[1], +t[2], +(t[3] || 0), 0);
    return d.getTime();
  }
  function recOf(o, type) {
    const g = (h) => String(o[nh(h)] ?? '').trim(), ed = g('Editado'), mE = ed.match(/\((\d+)\)/);
    return { id: Number(g('ID')), ts: tsOf(g('Fecha'), g('Hora')), emp: g('No. Empleado').toUpperCase(), name: g('Nombre'), comp: g('Componente') === 'Harness' ? 'Arnés' : g('Componente'),
      plates: g('Placas').toUpperCase(), cont: g('Contenedor').toUpperCase(), job: g('Job').toUpperCase(), lote: Number(g('Lote')) || 0, ses: '', type, shift: g('Turno') || undefined, sup: g('Supervisor'),
      ed: /^s[ií]/i.test(ed) ? (mE ? +mE[1] : 1) : 0, del: null, src: 'txt', motivo: g('Motivo') };
  }

  /* ---------- Pendientes: capturas nuevas, ediciones y bajas ---------- */
  const MAXCH = 300;
  const EXP_DAYS = 7;
  function pending() {
    const snap = jget(KX.snap, { folder: '', ids: {} });
    const ops = { validacion: [], secuencia: [], devolucion: [], entrega: [] }, seen = new Set();
    (S.recs || []).forEach((r) => {
      if (r.src === 'txt') {
        const o = X.sigs[r.id]; if (!o) return;
        if (r.del) { ops[o.t].push({ op: 'del', id: r.id, r }); seen.add(r.id); }
        else if (sig(r) !== o.s) { ops[o.t].push({ op: 'edit', id: r.id, r }); seen.add(r.id); }
        return;
      }
      if (r.del || r.exp || snap.ids[r.id]) return;
      ops[typeOf(r)].push({ op: 'add', id: r.id, r });
    });
    jget(KX.xpend, []).filter((p) => p && p.r && typeOf(p.r) === p.t).forEach((p) => { if (!seen.has(p.r.id)) { ops[p.t].push({ op: p.op, id: p.r.id, r: p.r }); seen.add(p.r.id); } });
    return ops;
  }
  const pendN = () => { const p = pending(); return p.validacion.length + p.secuencia.length + p.devolucion.length + p.entrega.length; };

  /* ---------- Archivos ---------- */
  async function listMine(k) {
    const out = [], re = fileRe(k);
    for await (const [n, h] of X.dir.entries()) { const m = h.kind === 'file' && n.match(re); if (m) out.push({ n, h, ym: `${m[1]}-${m[2]}` }); }
    return out.sort((a, b) => a.ym.localeCompare(b.ym));
  }
  /** Lee todos los TXT de un tipo y aplica los movimientos (el último de cada ID manda) */
  async function readType(k) {
    const files = await listMine(k), fold = new Map(); let lines = 0;
    for (const f of files) {
      const text = (await (await f.h.getFile()).text()).replace(/^﻿/, '');
      const L = text.split(/\r?\n/), head = (L.shift() || '').split('\t').map(nh);
      L.forEach((l) => {
        if (!l.trim()) return; lines++;
        const c = l.split('\t'), o = {}; head.forEach((h, i) => { o[h] = c[i] ?? ''; });
        const id = String(o.id || '').trim(); if (!id) return;
        if (nh(o.movimiento) === 'baja') fold.delete(id); else { fold.delete(id); fold.set(id, o); }
      });
    }
    X.files[k] = files.map((f) => f.n);
    return { recs: [...fold.values()].map((o) => recOf(o, k)), lines, files: files.map((f) => f.n) };
  }
  /** Capturas de las DEMÁS tabletas y del Motor (solo lectura): para no repetir jobs entre equipos */
  async function readOthers() {
    const re = /^(Validacion|Secuencia|Devolucion|Entrega)_([A-Za-z0-9-]+)_(\d{4})-(\d{2})\.txt$/i, files = [];
    for await (const [n, h] of X.dir.entries()) { const m = h.kind === 'file' && n.match(re); if (m && m[2].toUpperCase() !== devName()) files.push({ n, h, t: m[1].toLowerCase().startsWith('secu') ? 'secuencia' : m[1].toLowerCase().startsWith('devo') ? 'devolucion' : m[1].toLowerCase().startsWith('entr') ? 'entrega' : 'validacion', dev: m[2].toUpperCase(), ym: `${m[3]}-${m[4]}` }); }
    files.sort((a, b) => a.ym.localeCompare(b.ym));
    const fold = new Map();
    for (const f of files) {
      const text = (await (await f.h.getFile()).text()).replace(/^\uFEFF/, '');
      const L = text.split(/\r?\n/), head = (L.shift() || '').split('\t').map(nh);
      const at = (c, k) => c[head.indexOf(k)] ?? '';
      L.forEach((l) => {
        if (!l.trim()) return; const c = l.split('\t'), id = `${f.dev}|${f.t}|${String(at(c, 'id')).trim()}`;
        if (nh(at(c, 'movimiento')) === 'baja') { fold.delete(id); return; }
        fold.set(id, { dev: f.dev, type: f.t, comp: at(c, 'componente') === 'Harness' ? 'Arnés' : at(c, 'componente'), job: String(at(c, 'job')).trim().toUpperCase(), cont: String(at(c, 'contenedor')).trim().toUpperCase(), ts: tsOf(at(c, 'fecha'), at(c, 'hora')), del: null, id: -1, motivo: at(c, 'motivo') });
      });
    }
    X.others = [...fold.values()];
  }

  /** Entregas.xlsx (hoja Form1, columna F = caja o rack entregado): para saber qué devoluciones siguen abiertas */
  async function readEntregas() {
    if (typeof XLSX === 'undefined') return;
    let fh; try { fh = await X.dir.getFileHandle('Entregas.xlsx'); } catch (e) { X.ent = new Set(); return; }
    const f = await fh.getFile(); if (f.lastModified === X.entAt) return;
    const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' }), ws = wb.Sheets.Form1 || wb.Sheets[wb.SheetNames[0]];
    const rows = ws ? XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) : [];
    X.ent = new Set(rows.slice(1).map((r) => String(r[5] ?? '').trim().toUpperCase()).filter(Boolean)); X.entAt = f.lastModified;
  }
  /** Jobs del Plan General (columna B) para validar las entregas por job */
  async function readPlan() {
    if (typeof XLSX === 'undefined') return;
    let hit = null;
    for await (const [n, h] of X.dir.entries()) if (h.kind === 'file' && /^planes?.*\.xls[xmb]?$/i.test(n) && (!hit || /general/i.test(n))) hit = { n, h };
    if (!hit) { X.plan = null; return; }
    const f = await hit.h.getFile(), sig = `${hit.n}|${f.lastModified}|${f.size}`; if (sig === X.planAt) return;
    const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    X.plan = new Set(rows.slice(1).map((r) => normJob(r[1])).filter(Boolean)); X.planAt = sig;
  }
  const normJob = (v) => { const d = String(v ?? '').replace(/\D/g, ''); return d ? d.slice(-6).padStart(6, '0') : String(v ?? '').trim().toUpperCase(); };
  window.QXnormJob = normJob;
  /** Agrega líneas al final del TXT del mes (lo crea con encabezados) y verifica */
  async function appendLines(name, lines) {
    if (!lines.length) return;
    const fh = await X.dir.getFileHandle(name, { create: true });
    const f = await fh.getFile();
    let pre = '';
    if (f.size === 0) pre = `﻿${toLine([...HEAD, 'Verif'])}\r\n`;
    else { const last = new Uint8Array(await f.slice(f.size - 1).arrayBuffer())[0]; if (last !== 10) pre = '\r\n'; }
    lines = await QXsec.chain(f.size ? await f.text() : '', lines); // V 13.05: código de verificación encadenado
    const body = lines.join('\r\n') + '\r\n';
    const w = await fh.createWritable({ keepExistingData: true });
    try { await w.seek(f.size); await w.write(pre + body); await w.close(); } catch (e) { try { await w.abort(); } catch (x) {} throw e; }
    const back = await (await fh.getFile()).text();
    if (!back.endsWith(body)) throw new Error(`Verificación: ${name} no quedó con las líneas nuevas`);
  }

  /* ---------- Configuración de QORVEX (Motor) ---------- */
  async function readConfig() {
    try {
      const fh = await X.dir.getFileHandle(CFG_FILE), c = JSON.parse((await (await fh.getFile()).text()).replace(/^﻿/, ''));
      X.seal = await QXsec.sealCheck(c); X.tamper = false; X.sealBad = X.seal === 'mal'; X.master = await QXsec.readMaster(X.dir);
      applyConfig(c); jset(KX.cfg, c);
    } catch (e) {
      if (e && e.name === 'NotFoundError') { // carpeta nueva: se empieza de cero, también los usuarios
        X.cfg = null; jset(KX.cfg, null);
        const cfg = lsGet(K.cfg, null) || JSON.parse(JSON.stringify(DEF_CFG));
        delete cfg.fromMotor; cfg.supervisors = []; cfg.holidays = []; cfg.shifts = JSON.parse(JSON.stringify(DEF_CFG.shifts));
        S.users = [];
        try { localStorage.setItem(K.cfg, JSON.stringify(cfg)); localStorage.setItem(K.users, JSON.stringify(S.users)); } catch (x) {}
        S.cfg = cfg;
      } else console.warn('Config_QORVEX.json', e);
    }
  }
  const masterUser = () => null; // V 13.05: ya no hay cuenta fija (ver Admin master en Data Base\Seguridad)
  window.QXmaster = masterUser;
  const DEF_Q = () => ({ version: 1, updated: '', by: '', brand: { wall: 1, logos: [] }, shifts: [
    { n: 'Día', s: '07:00', e: '15:00', days: [1, 2, 3, 4, 5], goals: { val: { jobs: 0, cont: 0 }, seq: { jobs: 0, cont: 0 } } },
    { n: 'Tarde', s: '15:00', e: '22:30', days: [1, 2, 3, 4, 5], goals: { val: { jobs: 0, cont: 0 }, seq: { jobs: 0, cont: 0 } } },
    { n: 'Noche', s: '22:30', e: '07:00', days: [1, 2, 3, 4, 5], goals: { val: { jobs: 0, cont: 0 }, seq: { jobs: 0, cont: 0 } } }],
    supervisors: [], users: [], holidays: [], motor: { idleMin: 30 } });
  /** Usuarios creados o cambiados en la tableta → Config_QORVEX.json (así el Motor y las otras tabletas los ven) */
  const usig = (a) => JSON.stringify(a.map((u) => [u.emp, u.name, u.role === 'verificador' ? 'v' : 'a', u.pw, u.active !== false, !!u.must]).sort());
  async function pushUsers() {
    if (!X.dir || !(await perm(X.dir, false))) return;
    let ch = false;
    await cfgEdit((c) => {
      lsGet(K.users, []).forEach((u) => {
        const cu = (c.users || []).find((x) => x.emp === u.emp);
        if (cu && u.pw && (u.pwAt || 0) > (cu.pwAt || 0)) { Object.assign(cu, { pw: u.pw, pwAt: u.pwAt, must: !!u.must }); ch = true; }
      });
      return ch;
    });
  }
  /** Lee Config_QORVEX.json más reciente, aplica un cambio y lo vuelve a escribir (crea el archivo si no existe) */
  async function cfgEdit(fn) {
    if (!X.dir) throw new Error('Primero conecta la carpeta Data Base');
    if (!(await perm(X.dir, true))) throw new Error('Sin permiso para escribir en la carpeta');
    let c;
    try { const fh = await X.dir.getFileHandle(CFG_FILE); c = JSON.parse((await (await fh.getFile()).text()).replace(/^\uFEFF/, ''));}
    catch (e) { if (!e || e.name !== 'NotFoundError') throw e; c = DEF_Q(); }
    c.users = c.users || []; c.brand = c.brand || { wall: 1, logos: [] };
    if ((await fn(c)) === false) return c;
    c.updated = new Date().toISOString(); c.by = `QORVEX MOBILE · ${devName()}${ME ? ' · ' + ME.name : ''}`;
    X.master = await QXsec.readMaster(X.dir); QXsec.enforceMaster(c.users, X.master);
    delete c.sello; c.sello = await QXsec.seal(c); X.seal = 'ok'; X.sealBad = false;
    const fh = await X.dir.getFileHandle(CFG_FILE, { create: true }), w = await fh.createWritable();
    try { await w.write(JSON.stringify(c, null, 2)); await w.close(); } catch (e) { try { await w.abort(); } catch (x) {} throw e; }
    X.cfg = c; jset(KX.cfg, c); applyConfig(c);
    return c;
  }
  window.QXcfgEdit = cfgEdit;
  let pTmr = null;
  const schedulePush = () => { clearTimeout(pTmr); pTmr = setTimeout(() => pushUsers().catch((e) => toast(`No se pudo guardar el usuario en la carpeta: ${explain(e)}`, 'warn', 6000)), 300); };
  function applyConfig(c) {
    if (!c || !Array.isArray(c.shifts)) return;
    if (X.master) QXsec.enforceMaster(c.users = c.users || [], X.master); // V 13.05: el Admin master conserva rol y contraseña
    X.cfg = c;
    const cfg = lsGet(K.cfg, null) || JSON.parse(JSON.stringify(DEF_CFG));
    cfg.shifts = c.shifts.map((x) => ({ n: x.n, s: x.s, e: x.e, days: x.days || [1, 2, 3, 4, 5], gv: +(x.goals?.val?.jobs) || 0, gs: +(x.goals?.seq?.jobs) || 0, gvc: +(x.goals?.val?.cont) || 0, gsc: +(x.goals?.seq?.cont) || 0 }));
    // V 13.05: supervisores = usuarios con rol Supervisor / Admin (más los de la lista anterior mientras el Motor no la migre)
    { const ad = (c.users || []).filter((u) => u.role === 'admin' && u.active !== false && u.status !== 'pendiente').map((u) => ({ emp: String(u.emp).toUpperCase(), name: u.name, active: true }));
      (c.supervisors || []).filter((x) => x.active !== false && !ad.some((a) => a.emp === String(x.emp).toUpperCase())).forEach((x) => ad.push({ emp: String(x.emp).toUpperCase(), name: x.name, active: true }));
      cfg.supervisors = ad; }
    cfg.holidays = c.holidays || []; cfg.fromMotor = c.updated || 'sí';
    try { localStorage.setItem(K.cfg, JSON.stringify(cfg)); } catch (e) {}
    S.cfg = cfg;
    // usuarios: los de la carpeta (Config_QORVEX.json) son los que valen en esta tableta
    const loc = lsGet(K.users, []);
    const next = (c.users || []).filter((cu) => cu.status !== 'pendiente' && String(cu.emp || '').trim().toUpperCase() !== MASTER).map((cu) => {
      const emp = String(cu.emp || '').trim().toUpperCase(), l = loc.find((x) => x.emp === emp);
      const puesto = cu.role === 'admin' || cu.role === 'capturista' ? cu.role : 'validador';
      const u = { emp, name: cu.name, role: puesto === 'admin' ? 'admin' : 'verificador', pw: cu.pw, pwAt: cu.pwAt || 0, active: cu.active !== false, must: !!cu.must, created: (l && l.created) || Date.now(), last: (l && l.last) || null, cfg: true, puesto };
      if (l && (l.pwAt || 0) > (cu.pwAt || 0)) Object.assign(u, { pw: l.pw, pwAt: l.pwAt, must: !!l.must });
      return u;
    }).filter((u) => u.emp && u.pw);
    try { localStorage.setItem(K.users, JSON.stringify(next)); } catch (e) {}
    S.users = next;
    cfg.wall = c.brand && +c.brand.wall === 2 ? 2 : 1; try { localStorage.setItem(K.cfg, JSON.stringify(cfg)); localStorage.setItem('qx_wall', cfg.wall); } catch (e) {}
  }

  /* ---------- Sincronización ---------- */
  async function perm(h, ask) {
    if (!h) return false;
    const o = { mode: 'readwrite' };
    if ((await h.queryPermission(o)) === 'granted') return true;
    return ask ? (await h.requestPermission(o)) === 'granted' : false;
  }
  async function sync(opts = {}) {
    if (X.busy) { X.again = true; return; }
    if (!X.dir) { setState('off'); return; }
    if (!devName()) { X.msg = 'Este equipo no tiene nombre (TAB1, TAB2…): configúralo en CONFIG o al conectar la carpeta.'; setState('err'); return; }
    X.busy = true; setState('busy');
    try {
      if (!(await perm(X.dir, !!opts.ask))) { setState('perm'); return; }
      await readConfig();
      loadAll();
      const ops = pending();
      const nCh = ops.validacion.concat(ops.secuencia, ops.devolucion, ops.entrega).filter((o) => o.op !== 'add').length;
      if (nCh > MAXCH) throw new Error(`Se intentan cambiar ${nCh} filas de golpe; por seguridad el tope es ${MAXCH}. No se aplicó nada.`);
      const snap0 = jget(KX.snap, { folder: '', ids: {} });
      const cur = {};
      for (const k of Object.keys(ROLES)) cur[k] = await readType(k);
      try { await readOthers(); } catch (e) { console.warn('otras tabletas', e); }
      try { await readEntregas(); } catch (e) { console.warn('Entregas.xlsx', e); }
      try { await readPlan(); } catch (e) { console.warn('Plan', e); }
      const base = idBase(), inBase = (n) => !base || (n > base && n < base + 1e6);
      let maxId = Math.max(base, ...[S.seq.r || 0, ...(S.recs || []).map((r) => r.id || 0)].filter(inBase));
      Object.values(cur).forEach((c) => c.recs.forEach((r) => { if (r.id > maxId && inBase(r.id)) maxId = r.id; }));
      const failed = [], wrote = {};
      for (const k of Object.keys(ROLES)) {
        const ids = new Set(cur[k].recs.map((r) => r.id)), lines = [];
        const other = new Set(Object.keys(ROLES).filter((x) => x !== k).flatMap((x) => cur[x].recs.map((r) => r.id)));
        const toAdd = new Set(notIn(ops[k].filter((o) => o.op === 'add').map((o) => o.r), cur[k].recs)); // lo que ya está en el TXT no se duplica
        ops[k].forEach((o) => {
          const r = o.r;
          if (o.op === 'add') {
            if (!toAdd.has(r)) return;
            if (ids.has(r.id) || other.has(r.id) || !inBase(r.id)) r.id = ++maxId; // ID ocupado o de otro rango: uno nuevo
            lines.push(lineOf(r, 'Alta')); ids.add(r.id);
          } else if (ids.has(r.id)) lines.push(lineOf(r, o.op === 'del' ? 'Baja' : 'Edición'));
        });
        if (!lines.length) continue;
        try { await appendLines(fileOf(k), lines); wrote[k] = lines.length; } catch (e) { failed.push(`${fileOf(k)}: ${explain(e)}`); }
      }
      // volver a leer (verdad = TXT) y reconstruir
      const snap = snap0.folder === X.dir.name ? snap0 : { folder: X.dir.name, ids: {} }; snap.folder = X.dir.name;
      let recs = [];
      for (const k of Object.keys(ROLES)) {
        const mine = (S.recs || []).filter((r) => typeOf(r) === k);
        let fresh = null; try { fresh = await readType(k); } catch (e) { failed.push(`${ROLES[k].t}: ${explain(e)}`); }
        if (fresh) {
          Object.keys(snap.ids).forEach((id) => { if (snap.ids[id].t === k) delete snap.ids[id]; });
          Object.keys(X.sigs).forEach((id) => { if (X.sigs[id].t === k) delete X.sigs[id]; });
          fresh.recs.forEach((r) => { snap.ids[r.id] = { t: k }; X.sigs[r.id] = { t: k, s: sig(r) }; });
          if (wrote[k]) jset(KX.xpend, jget(KX.xpend, []).filter((p) => p.t !== k));
          recs = recs.concat(fresh.recs, notIn(mine.filter((r) => r.src !== 'txt' && !r.del), fresh.recs));
          X.counts[k] = fresh.recs.length;
        } else recs = recs.concat(mine);
      }
      recs.sort((a, b) => a.ts - b.ts || a.id - b.id);
      { const sesBy = new Map((S.recs || []).filter((r) => r.ses).map((r) => [r.id, r.ses])); recs.forEach((r) => { if (!r.ses && sesBy.has(r.id)) r.ses = sesBy.get(r.id); }); } // V 13.05: el resumen de «Finalizar captura» no se pierde al releer
      S.recs = recs;
      S.seq.r = Math.max(maxId, ...recs.map((r) => r.id || 0).filter(inBase));
      S.seq.b = Math.max(S.seq.b || 0, ...recs.map((r) => r.lote || 0));
      X.cache = recs.filter((r) => r.src === 'txt');
      try { localStorage.setItem(K.recs, JSON.stringify(recs.filter((r) => r.src !== 'txt'))); localStorage.setItem(K.seq, JSON.stringify(S.seq)); } catch (e) { storageFullModal(); }
      jset(KX.snap, snap);
      X.last = Date.now(); jset(KX.last, X.last);
      if (failed.length) { X.msg = failed.join(' · '); setState('err'); } else { X.msg = ''; setState(pendN() ? 'pend' : 'ok'); }
      if (opts.refresh !== false && typeof TAB !== 'undefined' && TAB !== 'cap' && $('#main') && ME) showTab(TAB);
    } catch (e) { X.msg = explain(e); setState('err'); console.error(e); }
    finally { X.busy = false; if (X.again) { X.again = false; setTimeout(() => sync(), 50); } }
  }
  function explain(e) {
    const m = (e && (e.message || e.name)) || String(e);
    if (e && e.name === 'NoModificationAllowedError') return 'el archivo está abierto o bloqueado';
    if (e && e.name === 'NotAllowedError') return 'sin permiso para la carpeta';
    if (e && e.name === 'NotFoundError') return 'no se encontró el archivo';
    return m;
  }

  /* ---------- Estado visible (chip en la barra) ---------- */
  function setState(s) { X.state = s; paint(); }
  function paint() {
    const v = $('#xlV'), k = $('#xlK'), chip = $('#xlChip'); if (!v) return;
    const n = pendN(), t = X.last ? fTime(X.last).slice(0, 5) : '';
    const map = {
      off: ['Base', n ? `⚠ ${n} pendientes · sin carpeta` : 'Sin carpeta', 'warn'],
      busy: ['Base', 'Guardando…', ''],
      ok: ['Base · ' + (devName() || ''), `✓ Guardado ${t}`, 'ok'],
      pend: ['Base', `⚠ ${n} pendientes`, 'warn'],
      perm: ['Base', `Toca para autorizar${n ? ` · ${n} pend.` : ''}`, 'warn'],
      err: ['Base', `⚠ ${n || ''} sin enviar`.replace('  ', ' '), 'err'],
      na: ['Base', 'No disponible aquí', 'warn'],
    };
    const [kk, vv, cls] = map[X.state] || map.off;
    k.textContent = kk; v.textContent = vv; chip.dataset.s = cls;
    const off = $('#qOff');
    if (off) {
      const m = X.dir ? 0 : porExportar().length;
      off.hidden = !m;
      if (m) $('#qOffT').innerHTML = `<b>Sin carpeta:</b> ${fmtN(m)} captura${m === 1 ? '' : 's'} por exportar. Expórtalas antes de terminar el turno.`;
    }
  }
  function chipHtml() { return `<button class="chip xl" id="xlChip" title="Conexión con la carpeta Data Base"><span class="k" id="xlK">Base</span><span class="v" id="xlV"></span></button>`; }

  function statusModal() {
    const n = pendN(), p = pending();
    const det = (k) => { const o = p[k], c = (t) => o.filter((x) => x.op === t).length; return o.length ? [c('add') && `${c('add')} nuevas`, c('edit') && `${c('edit')} editadas`, c('del') && `${c('del')} eliminadas`].filter(Boolean).join(' · ') : 'Al día'; };
    modal({ title: 'Conexión con la carpeta Data Base', wide: true, body: `
      ${!supported() ? '<div class="banner warn">Este navegador no permite conectar una carpeta. Usa Chrome o Edge actualizados en una tableta o PC con Windows.</div>' : ''}
      ${X.state === 'err' ? `<div class="banner err">${esc(X.msg)}</div>` : ''}
      <div class="grid g2">
        <div class="kpi"><div class="k">Carpeta · equipo</div><div class="v" style="font-size:18px">${X.dir ? esc(X.dir.name) : 'Sin conectar'} · ${esc(devName() || '—')}</div><div class="s">Último guardado: ${X.last ? fDT(X.last) : '—'}</div></div>
        <div class="kpi ${n ? 'warn' : ''}"><div class="k">Pendientes por enviar</div><div class="v">${fmtN(n)}</div><div class="s">${n ? 'Se envían solos al reconectar' : 'Todo está en la carpeta'}</div></div>
      </div>
      ${!X.dir ? `<div class="banner warn">Sin carpeta conectada: lo capturado se guarda en la tableta. Usa <b>Exportar y limpiar</b> para sacarlo en un Excel e intégralo en QORVEX con <b>Integrar capturas exportadas</b>.${exportados().length ? ` Exportados de los últimos ${EXP_DAYS} días: <b>${fmtN(exportados().length)}</b>.` : ''}</div>` : ''}
      <div class="table-wrap"><table class="t"><tr><th>Tipo</th><th>Archivos de este equipo</th><th>Registros</th><th>Pendientes</th></tr>
        ${Object.entries(ROLES).map(([k, R]) => `<tr><td>${R.t}</td><td><b>${(X.files[k] || []).map(esc).join('<br>') || esc(fileOf(k)) + ' <span class="muted">(se crea al guardar)</span>'}</b></td><td>${X.counts[k] != null ? fmtN(X.counts[k]) : '—'}</td><td>${det(k)}</td></tr>`).join('')}
      </table></div>
      <div class="banner info"><div>Cada captura se <b>agrega al final</b> del TXT del mes (separado por tabulador) con su ID. Editar fila, Eliminar fila o Limpiar <b>también agregan una línea</b> (Edición / Baja): nunca se borra ni se reescribe nada. ${X.cfg ? `Turnos, metas y supervisores vienen de QORVEX (Motor)${X.cfg.updated ? ` · actualizados ${fDT(new Date(X.cfg.updated).getTime())}` : ''}.` : 'Aún no hay Config_QORVEX.json en la carpeta.'}</div></div>`,
      buttons: [
        ...(exportados().length ? [{ t: `Volver a exportar (${fmtN(exportados().length)})`, fn: async () => { await reExport(); return false; } }] : []),
        ...(!X.dir && porExportar().length ? [{ t: `Exportar y limpiar (${fmtN(porExportar().length)})`, cls: 'primary', fn: async () => { await exportAndClear(); } }] : []),
        ...(supported() ? [{ t: X.dir ? 'Cambiar carpeta' : 'Conectar carpeta', fn: async () => { await connect(false); } }] : []),
        ...(X.dir && jget(KX.xpend, []).length ? [{ t: 'Descartar cambios a filas', cls: 'danger', fn: async () => { if (!(await confirmBox('Descartar cambios', '<div>Se descartan las ediciones y eliminaciones de filas que no se pudieron enviar. Los archivos quedan como están.</div>', 'Descartar'))) return false; jset(KX.xpend, []); X.cache = []; X.sigs = {}; await sync({ ask: true }); } }] : []),
        ...(X.dir ? [{ t: 'Enviar y actualizar ahora', cls: 'primary', fn: async () => { await sync({ ask: true }); toast(X.state === 'ok' ? 'Base actualizada' : 'Revisa la conexión', X.state === 'ok' ? 'ok' : 'warn'); } }] : []),
      ] });
  }

  /* ---------- Modo sin carpeta: exportar y limpiar ---------- */
  const porExportar = () => (S.recs || []).filter((r) => r.src !== 'txt' && !r.del && !r.exp);
  const exportados = () => (S.recs || []).filter((r) => r.src !== 'txt' && r.exp);
  const XH = HEAD.slice(0, HEAD.indexOf('ID') + 1);
  function bookOf(rows) {
    const wb = XLSX.utils.book_new();
    for (const [k, R] of Object.entries(ROLES)) {
      const rs = rows.filter((r) => typeOf(r) === k).sort((a, b) => a.ts - b.ts || a.id - b.id);
      if (!rs.length) continue;
      const aoa = [XH, ...rs.map((r) => { const o = rowObj(r); return XH.map((h) => (h === 'Lote' || h === 'ID' ? Number(o[h]) || '' : o[h] ?? '')); })];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = XH.map((h) => ({ wch: Math.max(10, h.length + 3) }));
      XLSX.utils.book_append_sheet(wb, ws, R.pre);
    }
    return wb;
  }
  async function saveCapture(rows, label) {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    const name = `QORVEX_captura_${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}_${p(d.getHours())}${p(d.getMinutes())}_${(ME && ME.emp) || 'tableta'}${label || ''}.xlsx`;
    const wb = bookOf(rows), bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx', compression: true }));
    if (typeof window.showSaveFilePicker === 'function') {
      let fh;
      try { fh = await window.showSaveFilePicker({ suggestedName: name, startIn: 'documents', types: [{ description: 'Libro de Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }] }); }
      catch (e) { if (e && e.name === 'AbortError') { toast('Exportación cancelada: no se limpió nada', 'warn'); return false; } fh = null; }
      if (fh) {
        try {
          const w = await fh.createWritable(); await w.write(bytes); await w.close();
          const back = XLSX.read(new Uint8Array(await (await fh.getFile()).arrayBuffer()), { type: 'array' });
          const n = back.SheetNames.reduce((a, sn) => a + Math.max(0, XLSX.utils.sheet_to_json(back.Sheets[sn], { header: 1 }).length - 1), 0);
          if (n !== rows.length) throw new Error(`el archivo guardado tiene ${n} filas y se esperaban ${rows.length}`);
          toast(`Guardado: ${fh.name} (${fmtN(rows.length)} filas)`, 'ok', 5000);
          return true;
        } catch (e) { toast(`No se pudo guardar el archivo: ${explain(e)}. No se limpió nada.`, 'err', 7000); return false; }
      }
    }
    XLSX.writeFile(wb, name, { compression: true });
    return confirmBox('¿Se descargó bien el archivo?', `<div>Revisa que <b>${esc(name)}</b> esté en la carpeta <b>Descargas</b> de la tableta.</div><div>Si está bien, se limpian las ${fmtN(rows.length)} capturas exportadas. Si no, cancela y vuelve a intentarlo.</div>`, 'Sí, se descargó: limpiar', false);
  }
  async function exportAndClear() {
    loadAll();
    const rows = porExportar();
    if (!rows.length) return toast('No hay capturas por exportar', 'info');
    if (typeof TAB !== 'undefined' && TAB === 'cap' && typeof pendingCount === 'function' && pendingCount() > 0) toast('Ojo: hay lecturas en pantalla sin Submit; esas no se exportan', 'warn', 5000);
    if (!(await saveCapture(rows))) return;
    const now = Date.now();
    rows.forEach((r) => { r.exp = now; r.del = { ts: now, emp: (ME && ME.emp) || '', exp: true }; });
    S.seq.c += 1; S.chg.push({ id: S.seq.c, ts: now, emp: ME.emp, name: ME.name, rid: 0, comp: '', plates: '', lote: '', owner: ME.emp, field: 'Exportación', before: `${fmtN(rows.length)} capturas`, after: 'Exportadas y limpiadas de la tableta' });
    save('recs', 'chg', 'seq');
    toast(`${fmtN(rows.length)} capturas exportadas y limpiadas. Se conservan ocultas ${EXP_DAYS} días por si hay que volver a exportarlas.`, 'ok', 6000);
    paint(); if (typeof TAB !== 'undefined' && $('#main')) showTab(TAB);
  }
  async function reExport() {
    loadAll(); const rows = exportados();
    if (!rows.length) return toast('No hay exportaciones de los últimos 7 días', 'info');
    if (await saveCapture(rows, '_reexportado')) toast('Se volvió a exportar; la tableta no cambió', 'ok');
  }
  window.QXexport = exportAndClear;

  /* ---------- Conectar carpeta ---------- */
  async function connect(useSaved) {
    try {
      if (!/^TAB\d{1,3}$/.test(devName())) { toast('Primero elige qué equipo es: TAB1 o TAB2', 'warn', 5000); return false; }
      let dir = useSaved ? await kv('dir') : null;
      if (dir && !(await perm(dir, true))) { toast('No se autorizó el acceso a la carpeta', 'warn'); return false; }
      if (!dir) dir = await window.showDirectoryPicker({ id: 'qorvex', mode: 'readwrite' });
      if (!(await perm(dir, true))) { toast('No se autorizó el acceso a la carpeta', 'warn'); return false; }
      { const sn = jget(KX.snap, { folder: '' }); loadAll(); const n = pendN();
        if (sn.folder && sn.folder !== dir.name && n && !(await confirmBox('Otra carpeta', `<div>Hay <b>${fmtN(n)}</b> captura(s) sin enviar de la carpeta <b>${esc(sn.folder)}</b>.</div><div>¿Las envío a <b>${esc(dir.name)}</b>? Si no, cancela y usa <b>Exportar y limpiar</b> antes de cambiar de carpeta.</div>`, 'Enviar a esta carpeta', false))) return false; }
      X.dir = dir; try { await kv('dir', dir); } catch (e) { console.warn('No se pudo recordar la carpeta', e); }
      await busyRun('Leyendo la carpeta Data Base…', () => sync({ ask: true, refresh: false }));
      if (!X.cfg) toast('No se encontró Config_QORVEX.json: se usan los turnos y usuarios de esta tableta', 'warn', 6000);
      if (X.state === 'ok' || X.state === 'pend') toast(`Conectado a ${dir.name} · ${devName()}`, 'ok');
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      toast(explain(e), 'err', 6000); return false;
    }
  }
  async function busyRun(msg, fn) {
    const b = document.createElement('div'); b.className = 'q-busy'; b.innerHTML = `<div><i></i>${esc(msg)}</div>`; document.body.append(b);
    try { return await fn(); } finally { b.remove(); }
  }

  /* ---------- Pantalla inicial: carpeta de trabajo ---------- */
  async function gate() {
    let saved = null; try { saved = await kv('dir'); } catch (e) {}
    app().innerHTML = `<div class="login-page">${hero()}
      <div class="login-card"><form id="f" onsubmit="return false">
        ${avatar()}
        <div class="l-head"><h2>Carpeta de trabajo</h2><div class="muted">Elige la carpeta compartida <b>Data Base</b>. Cada captura se guarda ahí en el TXT de este equipo.</div></div>
        <div class="field"><label>Este equipo es</label>
          <div class="seg q-dev">${['TAB1', 'TAB2'].map((d) => `<button type="button" data-dev="${d}" class="${devName() === d ? 'on' : ''}">${d}</button>`).join('')}</div>
          <div class="muted" id="gDevF" style="font-size:12.5px;margin-top:6px"></div></div>
        ${saved ? `<button class="btn primary xl" type="button" id="gRe">Reconectar «${esc(saved.name)}»</button><button class="btn xl" type="button" id="gPick">Elegir otra carpeta</button>`
          : '<button class="btn primary xl" type="button" id="gPick">Seleccionar carpeta</button>'}
        <a href="#" id="gSkip" class="muted l-help">Continuar sin carpeta (las capturas quedan pendientes)</a>
      </form></div></div>`;
    startClock();
    const showDev = () => { $('#gDevF').innerHTML = devName() ? `Guardará en <b>${esc(fileOf('validacion'))}</b> y <b>${esc(fileOf('secuencia'))}</b>` : '<b>Elige TAB1 o TAB2</b> antes de conectar.'; $$('.q-dev button').forEach((b) => b.classList.toggle('on', b.dataset.dev === devName())); };
    $$('.q-dev button').forEach((b) => (b.onclick = () => { if (devName() && devName() !== b.dataset.dev) return toast(`Este equipo ya es ${devName()}. Solo un Administrador lo cambia en CONFIG → Equipo.`, 'warn', 5000); try { localStorage.setItem(DEV_KEY, b.dataset.dev); } catch (e) {} showDev(); }));
    showDev();
    const go = async (useSaved) => { const ok = await connect(useSaved); if (ok) { clearInterval(clockTimer); boot(); } };
    if ($('#gRe')) $('#gRe').onclick = () => go(true);
    $('#gPick').onclick = () => go(false);
    $('#gSkip').onclick = (e) => { e.preventDefault(); clearInterval(clockTimer); setState('off'); boot(); };
  }

  /* ---------- Enganches con la app ---------- */
  const _loadAll = loadAll;
  window.loadAll = loadAll = function () {
    _loadAll();
    { const b = idBase(); if (b && !((S.seq.r || 0) >= b && S.seq.r < b + 1e6)) S.seq.r = b; }
    const now = Date.now();
    const local = (S.recs || []).filter((r) => r.src !== 'txt' && r.src !== 'xls' && !(r.exp && now - r.exp > EXP_DAYS * 864e5));
    if (local.length !== (S.recs || []).length) { try { localStorage.setItem(K.recs, JSON.stringify(local)); } catch (e) {} }
    if (X.cache.length) { const pend = notIn(local.filter((r) => !r.del), X.cache); S.recs = X.cache.concat(local.filter((r) => r.del), pend).sort((a, b) => a.ts - b.ts || a.id - b.id); }
    else S.recs = local;
  };
  const _save = save;
  window.save = save = function (...keys) {
    if (keys.includes('users') && X.dir) schedulePush();
    if (!keys.includes('recs')) return _save(...keys);
    const full = S.recs;
    // ediciones y bajas de filas que ya están en el TXT: se guardan aparte hasta que se escriban
    const xp = jget(KX.xpend, []), byId = new Map(xp.map((p) => [p.r.id, p]));
    full.forEach((r) => { if (r.src !== 'txt') return; const o = X.sigs[r.id]; if (!o) return;
      if (r.del) byId.set(r.id, { op: 'del', t: o.t, r: { ...r } });
      else if (sig(r) !== o.s) byId.set(r.id, { op: 'edit', t: o.t, r: { ...r } }); });
    jset(KX.xpend, [...byId.values()]);
    S.recs = full.filter((r) => r.src !== 'txt');
    let ok; try { ok = _save(...keys); } finally { if (ok) S.recs = full; }
    if (ok) schedule();
    return ok;
  };
  let tmr = null;
  function schedule() { paint(); clearTimeout(tmr); tmr = setTimeout(() => { if (X.dir) sync(); }, 250); }

  /* ---------- Supervisor (encargado) ---------- */
  const sups = () => ((S.cfg && S.cfg.supervisors) || []).filter((s) => s.active !== false);
  const curSup = () => ssGet(SS.sup, null);
  window.supTxt = () => { const s = curSup(); return s && sups().some((x) => x.emp === s.emp) ? `${s.emp} · ${s.name}` : ''; };
  function supModal(force) {
    const list = sups();
    if (!list.length) return;
    const bg = document.createElement('div'); bg.className = 'modal-bg q-sup';
    const cur = curSup();
    bg.innerHTML = `<div class="modal wide" role="dialog" aria-modal="true"><header><h3>¿Quién es tu supervisor en este turno?</h3>${force ? '' : '<button class="x" aria-label="Cerrar">&times;</button>'}</header>
      <div class="body"><div class="muted" style="margin-bottom:10px">Tus capturas quedarán registradas con este supervisor. Lo puedes cambiar después tocando <b>Supervisor</b> en la barra superior.</div>
      <div class="sup-grid">${list.map((s) => `<button type="button" class="sup-b ${cur && cur.emp === s.emp ? 'on' : ''}" data-e="${esc(s.emp)}"><b>${esc(s.name)}</b><small>No. ${esc(s.emp)}</small></button>`).join('')}</div></div></div>`;
    document.body.append(bg);
    const x = $('.x', bg); if (x) x.onclick = () => bg.remove();
    $$('.sup-b', bg).forEach((b) => (b.onclick = () => {
      const s = list.find((y) => y.emp === b.dataset.e); ssSet(SS.sup, { emp: s.emp, name: s.name });
      bg.remove(); toast(`Supervisor: ${s.name}`, 'ok'); paintSup(); if (typeof TAB !== 'undefined' && TAB === 'cap' && $('#main')) renderCaptura();
    }));
  }
  function paintSup() {
    const v = $('#supV'); if (!v) return;
    const s = curSup(); v.textContent = s ? s.name : 'Elegir'; $('#supChip').dataset.s = s ? 'ok' : 'warn';
  }
  window.QXsup = supModal;

  const _renderShell = renderShell;
  window.renderShell = renderShell = function () {
    _renderShell();
    const anchor = $('#sndChip') || $('#kbChip');
    const tabs = $('#tabs');
    if (tabs) { tabs.insertAdjacentHTML('afterend', `<div class="q-off" id="qOff" hidden><span id="qOffT"></span><button class="btn primary sm" id="qOffB" type="button">${ICON.dl} Exportar y limpiar</button></div>`); $('#qOffB').onclick = exportAndClear; }
    if (anchor) { anchor.insertAdjacentHTML('beforebegin', chipHtml()); $('#xlChip').onclick = () => { if (X.state === 'perm') sync({ ask: true }); else statusModal(); }; paint(); }
    const me = $('#meChip');
    if (me && sups().length) { me.insertAdjacentHTML('beforebegin', '<button class="chip sup" id="supChip" title="Cambiar de supervisor"><span class="k">Supervisor</span><span class="v" id="supV"></span></button>'); $('#supChip').onclick = () => supModal(false); paintSup(); }
    if (sups().length && !supTxt()) setTimeout(() => supModal(true), 50);
  };

  /* ---------- Sin supervisor no se captura ---------- */
  const _renderCaptura = renderCaptura;
  window.renderCaptura = renderCaptura = function () {
    if (supTxt() && sups().some((s) => `${s.emp} · ${s.name}` === supTxt())) return _renderCaptura();
    if (supTxt() && !sups().length) ssSet(SS.sup, null);
    const m = $('#main'), list = sups();
    m.innerHTML = `<div class="panel" style="max-width:720px;margin:30px auto;text-align:center">
      <h2>Elige a tu supervisor para empezar</h2>
      ${list.length ? '<div class="muted" style="margin:8px 0 16px">No se puede validar ni secuenciar sin supervisor (encargado).</div><button class="btn primary xl" id="pickSup">Elegir supervisor</button>'
        : `<div class="banner warn" style="margin-top:12px;text-align:left"><div>No hay supervisores en <b>${X.dir ? esc(X.dir.name) + ' / ' : ''}${CFG_FILE}</b>. Dalos de alta en <b>QORVEX (Motor) → CONFIG → Supervisores</b> y presiona <b>Guardar configuración</b>.${X.cfg && X.cfg.updated ? ` Última configuración leída: ${fDT(new Date(X.cfg.updated).getTime())}${X.cfg.by ? ` (${esc(X.cfg.by)})` : ''}.` : ''}</div></div><button class="btn primary xl" id="reSup" style="margin-top:14px">Volver a revisar</button>`}
    </div>`;
    if ($('#pickSup')) $('#pickSup').onclick = () => supModal(false);
    if ($('#reSup')) $('#reSup').onclick = async () => { if (!X.dir) return toast('Primero conecta la carpeta (chip Base)', 'warn'); await sync({ ask: true, refresh: false }); loadAll(); if (sups().length) { toast('Supervisores encontrados', 'ok'); renderCaptura(); if (!$('#supChip')) renderShell(); } else toast('Aún no hay supervisores guardados en la configuración', 'warn', 5000); };
  };

  /* ---------- CONFIG en la tableta: turnos y metas vienen del Motor ---------- */
  const _renderConfig = renderConfig;
  window.renderConfig = renderConfig = function () {
    _renderConfig();
    if (!(S.cfg && S.cfg.fromMotor)) return;
    const body = $('#shBody');
    if (body) {
      $$('input', body).forEach((i) => { i.disabled = true; });
      $$('button', body).forEach((b) => b.remove());
      ['#shAdd', '#shSave'].forEach((id) => { const b = $(id); if (b) b.remove(); });
      body.closest('.panel').insertAdjacentHTML('beforeend', `<div class="banner info" style="margin-top:10px"><div>Los turnos, días laborables, festivos, metas y supervisores se configuran en <b>QORVEX (Motor) → CONFIG</b> y llegan solos al conectar la carpeta${X.cfg && X.cfg.updated ? ` · última actualización ${fDT(new Date(X.cfg.updated).getTime())}` : ''}.</div></div>`);
    }
  };

  /* ---------- MI TURNO: mi productividad (resumen) ---------- */
  window.renderMyProd = function () {
    const m = $('#main'), now = Date.now(), x = shiftObj(now), od = opDate(now);
    const hol = ((S.cfg && S.cfg.holidays) || []).find((h) => h.d === od);
    const work = !!x && !hol && (!x.days || x.days.includes(new Date(`${od}T12:00:00`).getDay()));
    const mine = S.recs.filter((r) => !r.del && r.emp === ME.emp);
    const inSh = mine.filter((r) => x && opDate(r.ts) === od && recShift(r) === x.n);
    const cont = (rs) => uniq(rs.map((r) => `${r.comp}|${r.cont}`)).length;
    const mins = x ? (() => { const d = new Date(now), cur = d.getHours() * 60 + d.getMinutes(); let a = hm(x.s), e = hm(x.e), c = cur; if (e <= a) e += 1440; if (c < a) c += 1440; return Math.max(15, Math.min(c - a, e - a)); })() : 60;
    const jobsSh = inSh.length, rate = jobsSh / (mins / 60);
    const card = (ty, title, gj, gc) => {
      const rs = inSh.filter((r) => (r.type || 'validacion') === ty), j = rs.length, c = cont(rs);
      const pj = work && gj ? Math.round((j / gj) * 100) : null, pc = work && gc ? Math.round((c / gc) * 100) : null;
      const bar = (p) => (p == null ? '' : `<div class="bar mine"><i style="width:${Math.min(100, p)}%"></i></div>`);
      return `<div class="sh-card mp">
        <div class="sh-top"><b>${title}</b><span>${x ? esc(x.n) : 'Sin turno'}</span></div>
        <div class="mp-row"><div><div class="sh-num">${fmtN(j)}<small>jobs</small></div>${bar(pj)}<div class="sh-goal">${pj == null ? '<span class="muted">sin meta</span>' : `<span>Mi aporte a la meta del turno (${fmtN(gj)})</span><b>${pj}%</b>`}</div></div>
          <div><div class="sh-num">${fmtN(c)}<small>contenedores</small></div>${bar(pc)}<div class="sh-goal">${pc == null ? '<span class="muted">sin meta</span>' : `<span>Mi aporte a la meta del turno (${fmtN(gc)})</span><b>${pc}%</b>`}</div></div></div>
      </div>`;
    };
    const days = []; for (let i = 6; i >= 0; i--) { const t = new Date(`${od}T12:00:00`); t.setDate(t.getDate() - i); days.push(isoDay(t)); }
    const per = days.map((d) => { const rs = mine.filter((r) => opDate(r.ts) === d); return { d, v: rs.filter((r) => (r.type || 'validacion') !== 'secuencia').length, s: rs.filter((r) => r.type === 'secuencia').length }; });
    const mx = Math.max(1, ...per.map((p) => p.v + p.s));
    const dn = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    m.innerHTML = `
      <div class="page-title"><h1>Mi productividad</h1><div class="sub">${esc(ME.name)} · ${x ? `turno <b>${esc(x.n)}</b> (${esc(x.s)}–${esc(x.e)})` : 'fuera de turno'} · ${fDate(now)}${supTxt() ? ` · supervisor <b>${esc(curSup().name)}</b>` : ''}</div></div>
      ${hol ? `<div class="banner info">Hoy es festivo (${esc(hol.n || 'festivo')}): tus capturas cuentan, pero sin meta.</div>` : x && !work ? '<div class="banner info">Hoy no es día laborable para este turno: tus capturas cuentan, pero sin meta.</div>' : ''}
      <div class="sh-grid mp-grid">
        ${card('validacion', 'Validación', x && x.gv, x && x.gvc)}
        ${card('secuencia', 'Secuencia', x && x.gs, x && x.gsc)}
        <div class="sh-card mp"><div class="sh-top"><b>Mi ritmo</b><span>este turno</span></div>
          <div class="sh-num">${fmtN(Math.round(rate * 10) / 10)}<small>jobs por hora</small></div>
          <div class="sh-sub">${fmtN(jobsSh)} jobs en ${Math.floor(mins / 60)} h ${mins % 60} min transcurridos del turno</div></div>
      </div>
      <div class="panel"><div class="sec-head"><h2>Mis últimos 7 días</h2><span class="muted">jobs por día (el turno de noche cuenta para el día en que inicia)</span></div>
        <div class="mp-chart">${per.map((p) => `<div class="mp-col"><div class="mp-bars"><span class="n">${p.v + p.s ? fmtN(p.v + p.s) : ''}</span><div class="mp-b s" style="height:${(p.s / mx) * 100}%" title="Secuencia ${p.s}"></div><div class="mp-b v" style="height:${(p.v / mx) * 100}%" title="Validación ${p.v}"></div></div><small>${dn[new Date(`${p.d}T12:00:00`).getDay()]} ${p.d.slice(8)}</small></div>`).join('')}</div>
        <div class="mp-leg"><span><i class="v"></i>Validación</span><span><i class="s"></i>Secuencia</span></div></div>
      <div class="muted" style="font-size:12.5px;margin-top:8px">La meta es del turno completo (todo el equipo). Aquí ves cuánto aportaste tú. El detalle por supervisor y por persona está en QORVEX (Motor) → PRODUCTIVIDAD.</div>`;
  };

  // reintento automático
  setInterval(() => { if (X.dir && !X.busy) sync({ refresh: false }); }, 60000); // también toma la configuración nueva del Motor
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && X.dir && !X.busy) sync(); });

  const css = document.createElement('style');
  css.textContent = `.chip.xl{border:1px solid rgba(34,211,238,.35);border-radius:8px;margin-right:4px}
    .chip.xl[data-s=ok] .v{color:#34D399}.chip.xl[data-s=warn] .v{color:#FBBF5A}.chip.xl[data-s=err] .v{color:#FF8A8A}
    .chip.sup{border:1px solid rgba(34,211,238,.35);border-radius:8px;cursor:pointer}.chip.sup[data-s=warn] .v{color:#FBBF5A}
    .q-busy{position:fixed;inset:0;z-index:95;display:grid;place-items:center;background:rgba(3,7,15,.7)}
    .q-busy div{background:#0B1730;border:1px solid #22406E;border-radius:12px;padding:16px 22px;display:flex;gap:12px;align-items:center;font-weight:600;color:#E6F0FF}
    .q-busy i{width:18px;height:18px;border:3px solid rgba(34,211,238,.2);border-top-color:#00E5FF;border-radius:50%;animation:qsp .8s linear infinite}
    @keyframes qsp{to{transform:rotate(360deg)}}
    .q-off{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between;padding:8px 14px;background:rgba(251,191,90,.14);border-bottom:1px solid rgba(251,191,90,.45);color:#FCD38A;font-size:14px;position:sticky;top:116px;z-index:18}
    .q-off[hidden]{display:none}.q-off b{color:#FFE2A8}
    .q-dev{display:flex;width:100%}.q-dev button{flex:1;height:44px;font-weight:700;letter-spacing:.1em}
    .login-card .btn.xl:not(.primary){background:rgba(8,19,42,.85);border:1px solid #27416F;color:#DCE8FF;height:48px}
    .sup-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
    .sup-b{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:16px 18px;border-radius:12px;border:1px solid #27416F;background:#0B1730;color:#E6F0FF;cursor:pointer;text-align:left;font:inherit}
    .sup-b b{font-size:17px}.sup-b small{color:#8EA3C2}.sup-b:hover,.sup-b.on{border-color:#22D3EE;box-shadow:0 0 0 2px rgba(34,211,238,.25)}
    html[data-theme="light"] .sup-b{background:#fff;border-color:#C9DAF0;color:#0B2A5B}html[data-theme="light"] .sup-b small{color:#4A6286}
    .mp-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
    .bar.mine i{background:linear-gradient(90deg,#22D3EE,#1E88FF) !important}
    .mp-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .mp-chart{display:flex;align-items:flex-end;gap:12px;height:190px;padding:20px 6px 0}
    .mp-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
    .mp-bars{flex:1;width:100%;max-width:56px;display:flex;flex-direction:column;justify-content:flex-end;position:relative}
    .mp-bars .n{position:absolute;top:-18px;left:0;right:0;text-align:center;font-size:12px;font-weight:700}
    .mp-b.v{background:linear-gradient(180deg,#22D3EE,#0891B2);border-radius:0 0 4px 4px}.mp-b.s{background:linear-gradient(180deg,#A78BFA,#7C3AED);border-radius:6px 6px 0 0}
    .mp-col small{font-size:12px;padding-top:6px;opacity:.8}
    .mp-leg{display:flex;gap:16px;font-size:12.5px;margin-top:8px;opacity:.85}.mp-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}.mp-leg i.v{background:#22D3EE}.mp-leg i.s{background:#8B5CF6}`;
  document.head.append(css);

  /* ---------- Arranque ---------- */
  X.last = jget(KX.last, null);
  { const c = jget(KX.cfg, null); if (c) { X.cfg = c; } }
  if (!supported()) { setState('na'); boot(); }
  else {
    (async () => {
      let saved = null; try { saved = await kv('dir'); } catch (e) {}
      if (saved && devName() && ssGet(SS.sess, null) && (await saved.queryPermission({ mode: 'readwrite' })) === 'granted') { X.dir = saved; boot(); sync(); }
      else gate();
    })();
  }
  window.QXsync = sync; window.QXconnect = connect;
})();
