/*! QORVEX · © 2026 CH Industrial Solutions · Todos los derechos reservados. Software propietario: prohibida su copia, modificación o distribución sin autorización por escrito. Ver LEGAL.md y LICENSE.txt. */
/* =====================================================================
   QORVEX LABELS — etiquetas 6 × 4 in (Validación · Secuencia · Línea)
   Módulo compartido por QORVEX (Motor) y QORVEX MOBILE.
   Todo vive en la carpeta Data Base / Etiquetas:
     Etiquetas_Consecutivos.txt  último ID por operación, componente y línea (se reescribe con candado)
     Etiquetas_<EQUIPO>_<AAAA-MM>.txt  registro (cada equipo escribe solo el suyo; solo agrega líneas)
     Etiquetas_candado.json      candado de reserva (dura segundos)
   Nunca se reutiliza un ID: al reservar se toma el mayor entre el consecutivo y lo ya registrado.
   ===================================================================== */
(function (G) {
  'use strict';
  const DIRN = 'Etiquetas', CONS = 'Etiquetas_Consecutivos.txt', LOCK = 'Etiquetas_candado.json';
  const OPS = ['Validación', 'Secuencia', 'Devolución', 'Línea'], MAXQ = 500, MAXP = 999;
  const HEAD = ['Fecha', 'Hora', 'Equipo', 'No. Empleado', 'Nombre', 'Operacion', 'Componente', 'Linea', 'ID', 'Posicion', 'Lote', 'Estado', 'Impresora', 'Registrado', 'Motivo'];
  const CHEAD = ['Operacion', 'Componente', 'Linea', 'Prefijo', 'Ultimo', 'Actualizado', 'Equipo'];
  const RE = /^Etiquetas_([A-Z0-9_-]+)_(\d{4}-\d{2})\.txt$/;
  const T = { stale: 20000, wait: 15000, retry: 700, verify: 400 }; // candado (ms)
  const QLOGO = 'img/logo-etiqueta.png'; // se puede cambiar reemplazando img/logo-etiqueta.png
  try { const pre = new Image(); pre.src = QLOGO; } catch (e) { /* sin navegador */ }
  const PKEY = 'qx_lbl_printer';

  /* ---------- Configuración (Config_QORVEX.json → labels) ---------- */
  const DEF = () => ({
    logo: true,
    comps: [['Arnés', 'AA'], ['BCM', 'BA'], ['Cluster', 'CA'], ['Switch Gde', 'DA'], ['Switch CH', 'EA'], ['Llaves', 'FA']].map(([n, p]) => ({ n, p, pd: 'R' + p[0], a: true })),
    lines: ['011', '065', '014', '044'].map((l) => ({ l, a: true })),
  });
  function norm(cfg) {
    const l = (cfg && cfg.labels) || {}, d = DEF();
    const comps = Array.isArray(l.comps) ? l.comps.map((x) => { const p = String(x.p || '').trim().toUpperCase(), pd = String(x.pd || '').trim().toUpperCase(); return { n: String(x.n || '').trim(), p, pd: validPrefix(pd) ? pd : 'R' + (p[0] || 'X'), a: x.a !== false }; }).filter((x) => x.n && validPrefix(x.p)) : d.comps;
    const lines = Array.isArray(l.lines) ? l.lines.map((x) => ({ l: String(x.l || '').trim(), a: x.a !== false })).filter((x) => x.l) : d.lines;
    return { logo: l.logo !== false, comps, lines };
  }

  /* ---------- IDs (lógica pura) ---------- */
  const pad3 = (n) => String(n).padStart(3, '0');
  const formatId = (p, n) => p + pad3(n);
  function validPrefix(p) { return typeof p === 'string' && /^[A-Z]{1,4}$/.test(p); }
  function nextPrefix(p) {
    const c = p.split(''); let i = c.length - 1;
    while (i >= 0) { if (c[i] !== 'Z') { c[i] = String.fromCharCode(c[i].charCodeAt(0) + 1); return c.join(''); } c[i] = 'A'; i--; }
    return 'A' + c.join('');
  }
  function allocate(prefix, last, qty) {
    if (!validPrefix(prefix)) throw new Error('Prefijo inválido: ' + prefix);
    if (!Number.isInteger(qty) || qty < 1) throw new Error('La cantidad debe ser un entero mayor a 0');
    const ids = []; let p = prefix, n = last;
    for (let i = 0; i < qty; i++) { if (n >= MAXP) { p = nextPrefix(p); n = 0; } n++; ids.push(formatId(p, n)); }
    return { ids, prefix: p, last: n };
  }
  const pIdx = (p) => [...p].reduce((a, ch) => a * 26 + (ch.charCodeAt(0) - 64), 0); // AA=27 … ZZ=702, AAA=703
  const ord = (p, n) => pIdx(p) * 1000 + n;
  const parseId = (id) => { const m = /^([A-Z]{1,4})(\d{3,})$/.exec(String(id || '')); return m ? { p: m[1], n: +m[2] } : null; };
  const lineaKey = (op, linea) => (op === 'Secuencia' ? String(linea) : '');
  const ckey = (op, comp, linea) => `${op}|${comp}|${lineaKey(op, linea)}`;

  /* ---------- Code 128 (B) en SVG, sin librerías ---------- */
  const C128 = '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
  function code128(text) {
    const vals = [104]; // Start B
    for (const ch of String(text)) { const v = ch.charCodeAt(0) - 32; if (v < 0 || v > 94) throw new Error('Carácter no válido para Code 128: ' + ch); vals.push(v); }
    vals.push(vals.reduce((s, v, i) => s + v * (i || 1), 0) % 103, 106);
    return vals.map((v) => C128[v]).join('');
  }
  function barcodeSVG(text) {
    const w = code128(text), q = 10; let x = q, bars = '';
    for (let i = 0; i < w.length; i++) { const k = +w[i]; if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${k}" height="60"/>`; x += k; }
    return `<svg class="qxl-bc" viewBox="0 0 ${x + q} 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g fill="#000">${bars}</g></svg>`;
  }

  /* ---------- Texto separado por tabulador ---------- */
  const clean = (v) => String(v == null ? '' : v).replace(/[\t\r\n]+/g, ' ').trim();
  const toLine = (a) => a.map(clean).join('\t');
  function parse(text) {
    const L = String(text || '').replace(/^﻿/, '').split(/\r?\n/).filter((s) => s.trim() !== '');
    if (!L.length) return [];
    const h = L[0].split('\t');
    return L.slice(1).map((s) => { const c = s.split('\t'), o = {}; h.forEach((k, i) => (o[k] = c[i] == null ? '' : c[i])); return o; });
  }
  const pad = (n) => String(n).padStart(2, '0');
  const today = (d = new Date()) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const nowHM = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const monthTag = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Archivos ---------- */
  async function perm(dir) {
    if (!dir) throw new Error('Primero conecta la carpeta Data Base.');
    if (dir.queryPermission && (await dir.queryPermission({ mode: 'readwrite' })) === 'granted') return;
    if (dir.requestPermission && (await dir.requestPermission({ mode: 'readwrite' })) === 'granted') return;
    throw new Error('Sin permiso para escribir en la carpeta Data Base.');
  }
  const sub = async (dir) => dir.getDirectoryHandle(DIRN, { create: true });
  async function readText(d, name) {
    try { const f = await (await d.getFileHandle(name)).getFile(); return await f.text(); }
    catch (e) { if (e && e.name === 'NotFoundError') return null; throw e; }
  }
  async function writeWhole(d, name, text) {
    const w = await (await d.getFileHandle(name, { create: true })).createWritable();
    try { await w.write(text); await w.close(); } catch (e) { try { await w.abort(); } catch (x) {} throw e; }
  }
  async function append(d, name, head, lines) {
    if (!lines.length) return;
    const fh = await d.getFileHandle(name, { create: true }), size = (await fh.getFile()).size;
    const w = await fh.createWritable({ keepExistingData: true });
    try { await w.seek(size); await w.write((size ? '' : '﻿' + toLine(head) + '\r\n') + lines.map(toLine).join('\r\n') + '\r\n'); await w.close(); }
    catch (e) { try { await w.abort(); } catch (x) {} throw e; }
  }
  async function readJson(d, name) { const t = await readText(d, name); if (!t) return null; try { return JSON.parse(t); } catch (e) { return null; } }

  /* ---------- Candado de reserva (un equipo a la vez) ---------- */
  async function withLock(ctx, fn) {
    const d = await sub(ctx.dir()), me = ctx.dev(), u = ctx.user() || {};
    const tok = `${me}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, t0 = Date.now();
    let cur = null;
    for (;;) {
      cur = await readJson(d, LOCK);
      const busy = cur && !cur.released && cur.tok !== tok && Date.now() - (+cur.at || 0) < T.stale;
      if (!busy) {
        await writeWhole(d, LOCK, JSON.stringify({ tok, dev: me, who: u.name || '', at: Date.now() }));
        await sleep(T.verify);
        const chk = await readJson(d, LOCK);
        if (chk && chk.tok === tok) break;
      }
      if (Date.now() - t0 > T.wait) throw new Error(`Otro equipo (${(cur && cur.dev) || '?'}) está reservando etiquetas. Intenta de nuevo en unos segundos.`);
      await sleep(T.retry);
    }
    try { return await fn(d); }
    finally { try { await writeWhole(d, LOCK, JSON.stringify({ released: true, dev: me, at: Date.now() })); } catch (e) { /* vence solo en 20 s */ } }
  }

  /* ---------- Registro y consecutivos ---------- */
  async function loadAll(d) {
    const rows = [];
    for await (const [name, h] of d.entries()) {
      if (h.kind !== 'file' || !RE.test(name)) continue;
      parse(await (await h.getFile()).text()).forEach((r) => { r._file = name; rows.push(r); });
    }
    rows.sort((a, b) => (+a.Registrado || 0) - (+b.Registrado || 0));
    return rows;
  }
  /** Una fila por etiqueta (Lote + ID); el último movimiento define el Estado */
  function fold(rows) {
    const M = new Map();
    rows.forEach((r) => {
      const k = `${r.Lote}|${r.ID}`, o = M.get(k);
      if (!o) { M.set(k, Object.assign({}, r, { reimp: 0, last: r })); return; }
      if (r.Estado === 'Reimpreso') o.reimp++;
      else o.Estado = r.Estado;
      if (r.Estado === 'Anulado') o.Motivo = r.Motivo;
      o.last = r;
    });
    return [...M.values()];
  }
  async function readCons(d) { return parse(await readText(d, CONS)); }
  function regMax(rows) {
    const M = {};
    rows.forEach((r) => {
      if (r.Operacion === 'Línea') return;
      const id = parseId(r.ID); if (!id) return;
      const k = ckey(r.Operacion, r.Componente, r.Linea);
      if (!M[k] || ord(id.p, id.n) > ord(M[k].p, M[k].n)) M[k] = id;
    });
    return M;
  }
  /** Contador vigente de una clave: el mayor entre el archivo de consecutivos y lo registrado */
  function counterOf(cons, rmax, op, comp, linea, base) {
    const k = ckey(op, comp, linea), c = cons.find((r) => ckey(r.Operacion, r.Componente, r.Linea) === k);
    let cur = c && validPrefix(c.Prefijo) ? { p: c.Prefijo, n: +c.Ultimo || 0 } : { p: base, n: 0 };
    const r = rmax[k]; if (r && ord(r.p, r.n) > ord(cur.p, cur.n)) cur = { p: r.p, n: r.n };
    return cur;
  }
  const regName = (dev) => `Etiquetas_${dev}_${monthTag()}.txt`;
  const row = (ctx, o) => { const u = ctx.user() || {}, now = new Date(); return [o.fecha || today(now), o.hora || nowHM(now), ctx.dev(), u.emp || '', u.name || '', o.op, o.comp, o.linea || '', o.id, o.pos, o.lote, o.estado, printer(), Date.now(), o.motivo || '']; };

  /** Reserva qty IDs nuevos (con candado). Devuelve el lote listo para vista previa. */
  async function reserve(ctx, op, comp, linea, qty) {
    const C = norm(ctx.cfg()), cp = C.comps.find((c) => c.n === comp);
    if (!cp) throw new Error('Componente no configurado: ' + comp);
    const basePre = op === 'Devolución' ? cp.pd : cp.p;
    await perm(ctx.dir());
    return withLock(ctx, async (d) => {
      const cons = await readCons(d), all = await loadAll(d);
      const cur = counterOf(cons, regMax(all), op, comp, linea, basePre);
      const al = allocate(cur.p, cur.n, qty), now = new Date(), fecha = today(now), hora = nowHM(now), lote = `${ctx.dev()}-${Date.now()}`;
      // 1) registro primero: aunque falle lo demás, esos IDs ya no se reutilizan
      await append(d, regName(ctx.dev()), HEAD, al.ids.map((id, i) => row(ctx, { fecha, hora, op, comp, linea: op === 'Secuencia' ? linea : '', id, pos: `${i + 1}/${qty}`, lote, estado: 'Reservado' })));
      // 2) consecutivo
      const k = ckey(op, comp, linea), out = cons.filter((r) => ckey(r.Operacion, r.Componente, r.Linea) !== k);
      out.push({ Operacion: op, Componente: comp, Linea: lineaKey(op, linea), Prefijo: al.prefix, Ultimo: al.last, Actualizado: new Date().toISOString(), Equipo: ctx.dev() });
      await writeWhole(d, CONS, '﻿' + [CHEAD, ...out.map((r) => CHEAD.map((h) => r[h]))].map(toLine).join('\r\n') + '\r\n');
      return { op, comp, linea: op === 'Secuencia' ? linea : '', ids: al.ids, qty, fecha, hora, lote };
    });
  }
  /** Línea: sin consecutivo ni código de barras; un renglón por lote */
  async function reserveLinea(ctx, comp, linea, qty) {
    await perm(ctx.dir());
    const d = await sub(ctx.dir()), now = new Date(), fecha = today(now), hora = nowHM(now), lote = `${ctx.dev()}-LIN${Date.now()}`;
    await append(d, regName(ctx.dev()), HEAD, [row(ctx, { fecha, hora, op: 'Línea', comp, linea, id: '—', pos: `${qty} cop.`, lote, estado: 'Reservado' })]);
    return { op: 'Línea', comp, linea, ids: Array.from({ length: qty }, () => ''), qty, fecha, hora, lote };
  }
  /** Cambia el estado de un lote (agrega un movimiento por etiqueta) */
  async function mark(ctx, b, estado, motivo) {
    const d = await sub(ctx.dir());
    const ids = b.op === 'Línea' ? ['—'] : b.ids;
    await append(d, regName(ctx.dev()), HEAD, ids.map((id, i) => row(ctx, { op: b.op, comp: b.comp, linea: b.linea, id, pos: b.op === 'Línea' ? `${b.qty} cop.` : `${i + 1}/${b.qty}`, lote: b.lote, estado, motivo })));
  }

  /* ---------- Impresora de este equipo ---------- */
  function printer(v) {
    try { if (v !== undefined) localStorage.setItem(PKEY, v); return localStorage.getItem(PKEY) || ''; } catch (e) { return v || ''; }
  }

  /* ---------- Etiqueta (HTML) ---------- */
  function labelHTML(d, logo) {
    if (d.op === 'Línea') return `<div class="qxl-lab"><div class="qxl-g qxl-lg">
      <div class="qxl-head"><b>${esc(d.comp.toUpperCase())}</b></div>
      <div class="qxl-big">L-${esc(d.linea)}</div>
      <div class="qxl-foot qxl-fc"><div class="qxl-date"><span>FECHA Y HORA</span><b>${esc(d.fecha)} ${esc(d.hora)}</b></div></div></div></div>`;
    let bc = ''; try { bc = barcodeSVG(d.id); } catch (e) { bc = ''; }
    return `<div class="qxl-lab"><div class="qxl-g">
      <div class="qxl-logo">${logo ? `<img src="${QLOGO}" alt="QORVEX">` : `<b class="qxl-opsm">${esc(d.op.toUpperCase())}</b>`}</div>
      <div class="qxl-op">${esc(d.op.toUpperCase())}</div>
      <div class="qxl-lin"><span>LÍNEA</span><b>${esc(d.linea || '—')}</b></div>
      <div class="qxl-comp"><span>COMPONENTE</span><b>${esc(d.comp.toUpperCase())}</b></div>
      <div class="qxl-id">${esc(d.id)}</div>
      <div class="qxl-cons"><span>CONSECUTIVO</span><b>${d.pos} / ${d.total}</b></div>
      <div class="qxl-foot"><div class="qxl-date"><span>FECHA Y HORA</span><b>${esc(d.fecha)} ${esc(d.hora)}</b></div>${bc}</div></div></div>`;
  }
  const listOf = (b) => b.ids.map((id, i) => ({ op: b.op, comp: b.comp, linea: b.linea, id, pos: i + 1, total: b.qty, fecha: b.fecha, hora: b.hora }));

  const CSS = `
.qxl-wrap{display:flex;flex-direction:column;gap:14px;}
.qxl-h{margin:0;color:inherit;font-size:18px;font-weight:800;letter-spacing:.04em;;-webkit-text-fill-color:currentColor;background:none}
.qxl-h small{font-size:13px;font-weight:600;color:var(--muted,#888);-webkit-text-fill-color:currentColor;letter-spacing:0;margin-left:6px}
.qxl-form label[hidden]{display:none}
.dpanel .qxl-h,.dpanel .qxl-range,.dpanel .qxl-tbl td{color:#0A1A3A;-webkit-text-fill-color:#0A1A3A}
.dpanel .qxl-tbl th,.dpanel .qxl-muted{color:#5B6B85}
.qxl-sub{display:flex;gap:6px;flex-wrap:wrap}
.qxl-sub .on{outline:2px solid currentColor;outline-offset:-2px;font-weight:800}
.qxl-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;align-items:end}
.qxl-form label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted,#888);font-weight:600}
.qxl-range{;grid-column:1/-1;padding:10px 12px;border:1px solid var(--line,rgba(128,128,128,.35));border-radius:8px;font-weight:700}
.qxl-act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;grid-column:1/-1}
.qxl-err{color:#e5484d;font-weight:600;min-height:18px;grid-column:1/-1;margin:0}
.qxl-prev{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.qxl-tw{overflow-x:auto}
.qxl-tbl{width:100%;border-collapse:collapse;font-size:13px}
.qxl-tbl th,.qxl-tbl td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line,rgba(128,128,128,.3));white-space:nowrap}
.qxl-tbl th{color:var(--muted,#888);font-weight:700}
.qxl-st{-webkit-text-fill-color:currentColor;display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid currentColor}
.qxl-st.Impreso{color:#17a35b}.qxl-st.Enviado{color:#d99a00}.qxl-st.Reservado{color:#3b82f6}.qxl-st.Anulado{color:#e5484d}
.qxl-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.qxl-muted{color:var(--muted,#888);font-size:13px}
/* etiqueta 6 × 4 (siempre blanco y negro) */
.qxl-lab{box-sizing:border-box;width:100%;aspect-ratio:3/2;background:#000;padding:2px;color:#000;font-family:Arial,Helvetica,sans-serif;container-type:inline-size}
.qxl-g{display:grid;grid-template-columns:25% 1fr;grid-template-rows:24fr 17fr 41fr 18fr;gap:2px;height:100%;min-height:0}
.qxl-g>div{min-height:0;min-width:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;line-height:1.05}
.qxl-g span{font-size:2.6cqw;font-weight:700;letter-spacing:.1em}
.qxl-logo{padding:4px}.qxl-logo img{max-width:100%;max-height:100%;object-fit:contain}
.qxl-opsm{font-size:3.4cqw;font-weight:900}
.qxl-op{font-family:"Arial Black",Arial,sans-serif;font-weight:900;font-size:10.5cqw;letter-spacing:.02em}
.qxl-lin b{font-size:5.5cqw}.qxl-comp b{font-size:6.5cqw;font-weight:900}.qxl-cons b{font-size:4.8cqw}
.qxl-id{grid-column:1/span 2;font-family:"Arial Black",Arial,sans-serif;font-weight:900;font-size:24cqw;letter-spacing:.02em}
.qxl-foot{flex-direction:row!important;justify-content:space-between!important;padding:0 2.2cqw;gap:8px}
.qxl-fc{justify-content:center!important}
.qxl-date b{display:block;font-size:3.5cqw;white-space:nowrap}
.qxl-bc{width:30cqw;height:9.5cqw;flex:none}
.qxl-lg{grid-template-columns:1fr;grid-template-rows:20fr 62fr 18fr}
.qxl-head{flex-direction:row!important;padding:0 14px}.qxl-head b{font-family:"Arial Black",Arial,sans-serif;font-weight:900;font-size:6.6cqw}
.qxl-big{font-family:"Arial Black",Arial,sans-serif;font-weight:900;font-size:21cqw;letter-spacing:.02em}
#qxLblPrint{display:none}
@media print{
  body.qx-lbl-print>*:not(#qxLblPrint){display:none!important}
  body.qx-lbl-print>#qxLblPrint{display:block!important}
  body.qx-lbl-print{background:#fff!important;margin:0!important;padding:0!important}
  #qxLblPrint .qxl-lab{width:100%;height:calc(4in - 2.6cm - 2px);aspect-ratio:auto;break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  #qxLblPrint .qxl-lab:last-child{break-after:auto;page-break-after:auto}
}`;
  function ensureCSS() {
    if (document.getElementById('qxLblCss')) return;
    const s = document.createElement('style'); s.id = 'qxLblCss'; s.textContent = CSS; document.head.appendChild(s);
  }

  /** Imprime con el diálogo de Windows (página 6 × 4 in, márgenes 1.3 cm) */
  function runPrint(list, logo) {
    ensureCSS();
    return new Promise((resolve) => {
      let area = document.getElementById('qxLblPrint');
      if (!area) { area = document.createElement('div'); area.id = 'qxLblPrint'; document.body.appendChild(area); }
      area.innerHTML = list.map((d) => labelHTML(d, logo)).join('');
      const pg = document.createElement('style'); pg.id = 'qxLblPage'; pg.textContent = '@page{size:6in 4in;margin:1.3cm}';
      document.head.appendChild(pg); document.body.classList.add('qx-lbl-print');
      setTimeout(() => {
        try { window.print(); } finally {
          document.body.classList.remove('qx-lbl-print'); pg.remove(); area.innerHTML = '';
          resolve();
        }
      }, 150);
    });
  }

  /* =====================================================================
     Pantalla
     ===================================================================== */
  const V = { view: 'gen', batch: null, q: '', busy: false };
  async function render(el, ctx) {
    ensureCSS();
    const C = norm(ctx.cfg()), P = ctx.ui.panel, H = ctx.ui.head, admin = ctx.isAdmin();
    const has = !!ctx.dir();
    const tabs = [['gen', 'Generar'], ['hist', 'Historial'], ['cons', 'Último ID']];
    el.innerHTML = `<div class="qxl-wrap">
      <div class="${P}"><div class="${H}"><h2 class="qxl-h">ETIQUETAS <small>6 × 4 in · Validación · Secuencia · Devolución · Línea</small></h2></div>
        <div class="qxl-row" style="margin-top:8px"><div class="qxl-sub">${tabs.map(([k, t]) => `<button class="btn sm ${V.view === k ? 'on' : ''}" data-v="${k}">${t}</button>`).join('')}</div>
        <span style="flex:1"></span><span class="qxl-muted">Equipo <b>${esc(ctx.dev())}</b> · Impresora</span>
        <input class="input" id="qxlPr" style="max-width:220px;height:32px" placeholder="Nombre en Windows" value="${esc(printer())}"><button class="btn sm" id="qxlPrS">Guardar</button></div></div>
      <div id="qxlBody"></div></div>`;
    el.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => { V.view = b.dataset.v; render(el, ctx); }));
    el.querySelector('#qxlPrS').onclick = () => { printer(el.querySelector('#qxlPr').value.trim()); ctx.toast('Impresora guardada en este equipo', 'ok'); };
    const body = el.querySelector('#qxlBody');
    if (!has) { body.innerHTML = `<div class="${P}"><p class="qxl-muted">Conecta la carpeta Data Base para generar etiquetas.</p></div>`; return; }
    if (V.view === 'gen') return vGen(body, ctx, C);
    if (V.view === 'hist') return vHist(body, ctx, C, admin);
    return vCons(body, ctx, C);
  }

  function vGen(body, ctx, C) {
    const P = ctx.ui.panel, comps = C.comps.filter((c) => c.a), lines = C.lines.filter((l) => l.a);
    body.innerHTML = `<div class="${P}">
      <div class="qxl-form">
        <label>Operación<select class="input" id="qxlOp">${OPS.map((o) => `<option>${o}</option>`).join('')}</select></label>
        <label>Componente<select class="input" id="qxlComp">${comps.map((c) => `<option value="${esc(c.n)}">${esc(c.n)} (${esc(c.p)})</option>`).join('')}</select></label>
        <label id="qxlLinL">Línea<select class="input" id="qxlLin">${lines.map((l) => `<option>${esc(l.l)}</option>`).join('')}</select></label>
        <label>Cantidad de etiquetas<input class="input" id="qxlQty" type="number" min="1" max="${MAXQ}" value="1"></label>
        <div class="qxl-range" id="qxlRange">…</div>
        <div class="qxl-act"><button class="btn primary" id="qxlGen">Generar y reservar</button></div>
        <p class="qxl-err" id="qxlErr"></p>
      </div></div>
      <div class="${P}" id="qxlPrevP" hidden><div class="qxl-row"><h2 class="qxl-h">Vista previa</h2><span style="flex:1"></span>
        <button class="btn" id="qxlCancel">Cancelar lote</button><button class="btn primary" id="qxlPrint">Imprimir</button></div>
        <div class="qxl-prev" id="qxlPrev" style="margin-top:10px"></div><p class="qxl-muted" id="qxlMore"></p></div>`;
    const $ = (s) => body.querySelector(s);
    if (!comps.length) { $('#qxlErr').textContent = 'No hay componentes activos. El Administrador los configura en QORVEX › CONFIG › Etiquetas.'; $('#qxlGen').disabled = true; }
    let cons = [], rmax = {};
    const sync = () => { const o = $('#qxlOp').value; $('#qxlLinL').hidden = o === 'Validación' || o === 'Devolución'; };
    const upd = () => {
      sync();
      const op = $('#qxlOp').value, comp = $('#qxlComp').value, lin = $('#qxlLin').value, qty = Number($('#qxlQty').value);
      const R = $('#qxlRange');
      if (!comp || !Number.isInteger(qty) || qty < 1 || qty > MAXQ) { R.textContent = `Cantidad inválida (1 a ${MAXQ}).`; return; }
      if ((op === 'Secuencia' || op === 'Línea') && !lin) { R.textContent = 'No hay líneas activas.'; return; }
      if (op === 'Línea') { R.textContent = `Se imprimirán ${qty} copia(s) de L-${lin} para ${comp}. Sin consecutivo ni código de barras.`; return; }
      const cp = C.comps.find((c) => c.n === comp), cur = counterOf(cons, rmax, op, comp, lin, op === 'Devolución' ? cp.pd : cp.p), al = allocate(cur.p, cur.n, qty);
      R.textContent = `Se generará de ${al.ids[0]} a ${al.ids[al.ids.length - 1]} (${qty} etiquetas)${op === 'Secuencia' ? ' · línea ' + lin : ''}${al.prefix !== cur.p ? ' · incluye cambio de prefijo a ' + al.prefix : ''}. El rango final se confirma al reservar.`;
    };
    ['#qxlOp', '#qxlComp', '#qxlLin'].forEach((s) => ($(s).onchange = upd)); $('#qxlQty').oninput = upd;
    (async () => { try { const d = await sub(ctx.dir()); cons = await readCons(d); rmax = regMax(await loadAll(d)); } catch (e) { /* solo vista previa */ } upd(); })();
    upd();
    const showPrev = () => {
      const b = V.batch; if (!b) { $('#qxlPrevP').hidden = true; return; }
      $('#qxlPrevP').hidden = false;
      $('#qxlPrev').innerHTML = listOf(b).slice(0, 6).map((d) => labelHTML(d, C.logo)).join('');
      $('#qxlMore').textContent = b.qty > 6 ? `Se muestran 6 de ${b.qty}. Se imprimirán todas.` : '';
    };
    showPrev();
    $('#qxlGen').onclick = async () => {
      if (V.busy) return;
      const err = (m) => ($('#qxlErr').textContent = m); err('');
      if (V.batch) return err('Primero imprime o cancela el lote en vista previa.');
      const op = $('#qxlOp').value, comp = $('#qxlComp').value, lin = $('#qxlLin').value, qty = Number($('#qxlQty').value);
      if (!comp || ((op === 'Secuencia' || op === 'Línea') && !lin)) return err('Selecciona operación, componente y línea.');
      if (!Number.isInteger(qty) || qty < 1 || qty > MAXQ) return err(`La cantidad debe ser entera entre 1 y ${MAXQ}.`);
      if (!(await ctx.confirm('Confirmar etiquetas', `<p>¿Confirmas <b>${qty}</b> ${op === 'Línea' ? `copia(s) de <b>L-${esc(lin)}</b>` : 'etiqueta(s)'} de <b>${esc(comp)}</b>${op === 'Secuencia' ? ` para la línea <b>${esc(lin)}</b>` : ''}?</p>`, 'Generar'))) return;
      V.busy = true; $('#qxlGen').disabled = true; $('#qxlGen').textContent = 'Reservando…';
      try {
        V.batch = op === 'Línea' ? await reserveLinea(ctx, comp, lin, qty) : await reserve(ctx, op, comp, lin, qty);
        if (op !== 'Línea') ctx.toast(`Reservado: ${V.batch.ids[0]} a ${V.batch.ids[V.batch.ids.length - 1]}`, 'ok');
        showPrev(); $('#qxlPrevP').scrollIntoView({ behavior: 'smooth' });
        try { const d = await sub(ctx.dir()); cons = await readCons(d); rmax = regMax(await loadAll(d)); } catch (e) {} upd();
      } catch (e) { err('No se reservó: ' + (e.message || e) + '. No se imprimió nada.'); }
      finally { V.busy = false; $('#qxlGen').disabled = false; $('#qxlGen').textContent = 'Generar y reservar'; }
    };
    $('#qxlPrint').onclick = async () => {
      const b = V.batch; if (!b) return;
      try { await mark(ctx, b, 'Enviado'); } catch (e) { return ctx.toast('No se pudo registrar el envío: ' + (e.message || e), 'err', 6000); }
      await runPrint(listOf(b), C.logo);
      const ok = await ctx.confirm('¿Salieron bien?', `<p>¿Se imprimieron correctamente las <b>${b.qty}</b> etiquetas${printer() ? ` en <b>${esc(printer())}</b>` : ''}?</p><p class="qxl-muted">Si eliges «No», quedan como <b>Enviado</b> para revisión y puedes reimprimirlas desde Historial.</p>`, 'Sí, salieron bien');
      try { if (ok) await mark(ctx, b, 'Impreso'); ctx.toast(ok ? 'Impresión confirmada' : 'Lote marcado como Enviado', ok ? 'ok' : 'warn'); }
      catch (e) { ctx.toast('No se pudo actualizar el estado: ' + (e.message || e), 'err', 6000); }
      V.batch = null; showPrev();
    };
    $('#qxlCancel').onclick = async () => {
      const b = V.batch; if (!b) return;
      if (!(await ctx.confirm('Cancelar lote', '<p>Los IDs ya reservados quedan <b>anulados</b> y no se vuelven a usar.</p>', 'Cancelar lote'))) return;
      try { await mark(ctx, b, 'Anulado', 'Lote cancelado antes de imprimir'); ctx.toast('Lote anulado. Los IDs no se reutilizan.', 'ok'); V.batch = null; showPrev(); }
      catch (e) { ctx.toast('Error al anular: ' + (e.message || e), 'err', 6000); }
    };
  }

  async function vHist(body, ctx, C, admin) {
    const P = ctx.ui.panel;
    body.innerHTML = `<div class="${P}"><div class="qxl-row"><h2 class="qxl-h">Historial</h2><span style="flex:1"></span>
      <input class="input" id="qxlQ" style="max-width:300px" placeholder="Buscar ID, componente, línea, usuario o equipo" value="${esc(V.q)}"><button class="btn sm" id="qxlRe">Actualizar</button></div>
      <div class="qxl-tw" style="margin-top:10px"><table class="qxl-tbl"><thead><tr><th>Fecha</th><th>Hora</th><th>Equipo</th><th>Usuario</th><th>Operación</th><th>Componente</th><th>Línea</th><th>ID</th><th>Posición</th><th>Estado</th><th>Reimpr.</th><th></th></tr></thead><tbody id="qxlTb"><tr><td colspan="12" class="qxl-muted">Cargando…</td></tr></tbody></table></div></div>`;
    const $ = (s) => body.querySelector(s);
    let rows = [];
    try { rows = fold(await loadAll(await sub(ctx.dir()))).reverse(); } catch (e) { $('#qxlTb').innerHTML = `<tr><td colspan="12">No se pudo leer: ${esc(e.message)}</td></tr>`; return; }
    const draw = () => {
      const q = V.q.trim().toLowerCase();
      const list = rows.filter((r) => !q || [r.ID, r.Componente, r.Linea, r.Nombre, r['No. Empleado'], r.Equipo, r.Estado].some((v) => String(v).toLowerCase().includes(q))).slice(0, 300);
      $('#qxlTb').innerHTML = list.map((r) => `<tr><td>${esc(r.Fecha)}</td><td>${esc(r.Hora)}</td><td>${esc(r.Equipo)}</td><td>${esc(r.Nombre || r['No. Empleado'])}</td><td>${esc(r.Operacion)}</td><td>${esc(r.Componente)}</td><td>${esc(r.Linea || '—')}</td><td><b>${esc(r.ID)}</b></td><td>${esc(r.Posicion)}</td>
        <td><span class="qxl-st ${esc(r.Estado)}" title="${esc(r.Motivo || '')}">${esc(r.Estado)}</span></td><td>${r.reimp || ''}</td>
        <td>${r.Operacion === 'Línea' || r.Estado === 'Anulado' ? '' : `<button class="btn sm" data-rp="${esc(r.Lote)}|${esc(r.ID)}">Reimprimir</button>${admin ? ` <button class="btn sm" data-an="${esc(r.Lote)}|${esc(r.ID)}">Anular</button>` : ''}`}</td></tr>`).join('') || '<tr><td colspan="12" class="qxl-muted">Sin registros.</td></tr>';
      body.querySelectorAll('[data-rp]').forEach((b) => (b.onclick = () => reprint(b.dataset.rp)));
      body.querySelectorAll('[data-an]').forEach((b) => (b.onclick = () => annul(b.dataset.an)));
    };
    const find = (k) => rows.find((r) => `${r.Lote}|${r.ID}` === k);
    const one = (r, estado, motivo) => ({ op: r.Operacion, comp: r.Componente, linea: r.Linea, ids: [r.ID], qty: 1, lote: r.Lote, pos: r.Posicion, estado, motivo });
    async function reprint(k) {
      const r = find(k); if (!r) return;
      if (!(await ctx.confirm('Reimprimir', `<p>¿Reimprimir <b>${esc(r.ID)}</b>? Conserva su ID original y queda registrado como <b>Reimpreso</b>.</p>`, 'Reimprimir'))) return;
      try {
        await perm(ctx.dir());
        await append(await sub(ctx.dir()), regName(ctx.dev()), HEAD, [row(ctx, { op: r.Operacion, comp: r.Componente, linea: r.Linea, id: r.ID, pos: r.Posicion, lote: r.Lote, estado: 'Reimpreso' })]);
      } catch (e) { return ctx.toast('No se pudo registrar: ' + (e.message || e), 'err', 6000); }
      const [pos, total] = String(r.Posicion).split('/').map(Number);
      await runPrint([{ op: r.Operacion, comp: r.Componente, linea: r.Linea, id: r.ID, pos: pos || 1, total: total || 1, fecha: r.Fecha, hora: r.Hora }], C.logo);
      vHist(body, ctx, C, admin);
    }
    async function annul(k) {
      if (!ctx.isAdmin()) return ctx.toast('Solo el Administrador puede anular etiquetas.', 'warn');
      const r = find(k); if (!r) return;
      if (!(await ctx.confirm('Anular', `<p>¿Anular <b>${esc(r.ID)}</b>? Queda registrado y el ID <b>no se reutiliza</b>.</p>`, 'Anular'))) return;
      try { await perm(ctx.dir()); const b = one(r); await append(await sub(ctx.dir()), regName(ctx.dev()), HEAD, [row(ctx, { op: b.op, comp: b.comp, linea: b.linea, id: r.ID, pos: r.Posicion, lote: r.Lote, estado: 'Anulado', motivo: 'Anulado por Administrador' })]); ctx.toast(r.ID + ' anulado', 'ok'); }
      catch (e) { return ctx.toast('No se pudo anular: ' + (e.message || e), 'err', 6000); }
      vHist(body, ctx, C, admin);
    }
    $('#qxlQ').oninput = (e) => { V.q = e.target.value; draw(); };
    $('#qxlRe').onclick = () => vHist(body, ctx, C, admin);
    draw();
  }

  async function vCons(body, ctx, C) {
    const P = ctx.ui.panel;
    body.innerHTML = `<div class="${P}"><h2 class="qxl-h" style="margin-bottom:10px">Último ID por componente</h2><div class="qxl-tw"><table class="qxl-tbl"><thead><tr><th>Operación</th><th>Componente</th><th>Línea</th><th>Prefijo</th><th>Último ID</th><th>Próximo ID</th></tr></thead><tbody id="qxlCt"><tr><td colspan="6" class="qxl-muted">Cargando…</td></tr></tbody></table></div>
      <p class="qxl-muted">Validación y Devolución llevan un consecutivo por componente (Devolución con su propio prefijo); Secuencia, uno por componente y línea. Al llegar a 999 se pasa al siguiente prefijo (AA → AB).</p></div>`;
    let cons = [], rmax = {};
    try { const d = await sub(ctx.dir()); cons = await readCons(d); rmax = regMax(await loadAll(d)); } catch (e) {}
    const tr = (op, comp, lin, base) => { const cur = counterOf(cons, rmax, op, comp, lin, base); return `<tr><td>${op}</td><td>${esc(comp)}</td><td>${esc(lin || '—')}</td><td>${esc(cur.p)}</td><td><b>${cur.n ? formatId(cur.p, cur.n) : '—'}</b></td><td>${allocate(cur.p, cur.n, 1).ids[0]}</td></tr>`; };
    const seqKeys = new Set(); cons.filter((r) => r.Operacion === 'Secuencia').forEach((r) => seqKeys.add(`${r.Componente}|${r.Linea}`));
    Object.keys(rmax).filter((k) => k.startsWith('Secuencia|')).forEach((k) => { const [, c, l] = k.split('|'); seqKeys.add(`${c}|${l}`); });
    const base = (n) => (C.comps.find((c) => c.n === n) || {}).p || 'AA';
    body.querySelector('#qxlCt').innerHTML = C.comps.map((c) => tr('Validación', c.n, '', c.p)).join('') + C.comps.map((c) => tr('Devolución', c.n, '', c.pd)).join('') + [...seqKeys].sort().map((k) => { const [c, l] = k.split('|'); return tr('Secuencia', c, l, base(c)); }).join('');
  }

  G.QXLabels = { render, norm, DEF, reserve, reserveLinea, mark, fold, loadAll, regMax, counterOf, allocate, nextPrefix, formatId, code128, barcodeSVG, labelHTML, parseId, ord, _T: T, _V: V, DIRN, CONS };
})(typeof window !== 'undefined' ? window : globalThis);
