/*! QORVEX · © 2026 CH Industrial Solutions · Todos los derechos reservados. Software propietario: prohibida su copia, modificación o distribución sin autorización por escrito. Ver LEGAL.md y LICENSE.txt. */
/* =====================================================================
   qxsec.js — seguridad compartida por QORVEX (Motor) y QORVEX MOBILE
   - Contraseñas: PBKDF2-SHA256 con sal por usuario (formato p2$iter$sal$huella).
     Las huellas anteriores (SHA-256) se siguen aceptando y se cambian solas
     al formato nuevo cuando el usuario entra.
   - Sello de Config_QORVEX.json: si alguien edita el archivo a mano
     (por ejemplo, para darse rol de Supervisor/Admin) el sello ya no coincide
     y QORVEX lo avisa (no bloquea).
     Protege contra ediciones con el Bloc de notas; la protección de fondo
     son los permisos de la carpeta en SharePoint.
   - Admin master: el primer Supervisor / Admin de la carpeta. Su contraseña
     cifrada vive en Data Base\Seguridad\admin_master.json.
   - TXT de capturas: cada renglón nuevo lleva un código encadenado al
     anterior (v1:xxxxxxxxxxxx). Si se borra o cambia un renglón, se detecta.
   ===================================================================== */
(function (G) {
  'use strict';
  const enc = new TextEncoder();
  const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const b64 = (u8) => { let s = ''; u8.forEach((c) => { s += String.fromCharCode(c); }); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(String(s || '')), (c) => c.charCodeAt(0));
  const sha = async (v) => hex(await crypto.subtle.digest('SHA-256', typeof v === 'string' ? enc.encode(v) : v));
  const ITER = 120000;
  async function pbk(pw, salt, iter) {
    const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, k, 256));
  }

  /* ---------- Contraseñas ---------- */
  async function pwMake(emp, pw) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return `p2$${ITER}$${b64(salt)}$${hex(await pbk(`${String(emp).toUpperCase()}|${pw}`, salt, ITER))}`;
  }
  async function pwOk(emp, pw, stored) {
    stored = String(stored || ''); emp = String(emp || '').toUpperCase();
    if (!stored || !pw) return false;
    if (stored.startsWith('p2$')) { const [, it, s, h] = stored.split('$'); return hex(await pbk(`${emp}|${pw}`, unb64(s), +it || ITER)) === h; }
    return (await sha(`vm|${emp}|${pw}`)) === stored; // formato anterior
  }
  const isWeak = (s) => !!s && !String(s).startsWith('p2$');

  /* ---------- Sello de Config_QORVEX.json ---------- */
  const PEPPER = 'QORVEX|CH-Industrial-Solutions|sello-config|v1';
  function canon(v) {
    if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
    if (v && typeof v === 'object') return `{${Object.keys(v).filter((k) => k !== 'sello' && v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
    return JSON.stringify(v === undefined ? null : v);
  }
  async function seal(cfg) {
    const k = await crypto.subtle.importKey('raw', enc.encode(PEPPER), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return `s1:${hex(await crypto.subtle.sign('HMAC', k, enc.encode(canon(cfg))))}`;
  }
  const SEEN = 'qx_sello_visto';
  function seen(mark) { try { if (mark) localStorage.setItem(SEEN, '1'); return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  /** 'ok' sellado y correcto · 'sin' archivo anterior sin sello · 'mal' modificado fuera de QORVEX */
  async function sealCheck(cfg) {
    if (!cfg) return 'sin';
    if (!cfg.sello) return seen() ? 'mal' : 'sin';
    const ok = (await seal(cfg)) === cfg.sello; if (ok) seen(true);
    return ok ? 'ok' : 'mal';
  }

  /* ---------- Admin master (el primero que entra en la carpeta) ----------
     Data Base\Seguridad\admin_master.json guarda su No. de empleado, nombre y la huella
     cifrada de su contraseña. Es la fuente de verdad de esa cuenta: aunque alguien edite
     Config_QORVEX.json, el Admin master conserva su rol y su contraseña. Solo él la cambia. */
  const SEG = 'Seguridad', MF = 'admin_master.json';
  async function segDir(dir, create) { try { return await dir.getDirectoryHandle(SEG, { create: !!create }); } catch (e) { return null; } }
  async function readMaster(dir) {
    const d = dir && (await segDir(dir, false)); if (!d) return null;
    try { const m = JSON.parse((await (await (await d.getFileHandle(MF)).getFile()).text()).replace(/^\uFEFF/, '')); return m && m.emp && m.pw ? { ...m, emp: String(m.emp).toUpperCase() } : null; } catch (e) { return null; }
  }
  async function writeMaster(dir, m) {
    const d = await segDir(dir, true); const fh = await d.getFileHandle(MF, { create: true }); const w = await fh.createWritable();
    const o = { emp: String(m.emp).toUpperCase(), name: m.name, pw: m.pw, since: m.since || new Date().toISOString(), updated: new Date().toISOString(), nota: 'Admin master de QORVEX. No edites ni borres este archivo.' };
    try { await w.write(JSON.stringify(o, null, 2)); await w.close(); } catch (e) { try { await w.abort(); } catch (x) { /* nada */ } throw e; }
    return o;
  }
  /** Aplica el Admin master a la lista de usuarios (rol, activo y contraseña). Devuelve true si cambió algo */
  function enforceMaster(users, m) {
    if (!m || !Array.isArray(users)) return false;
    let u = users.find((x) => String(x.emp || '').toUpperCase() === m.emp), ch = false;
    if (!u) { users.unshift({ emp: m.emp, name: m.name, role: 'admin', pw: m.pw, pwAt: 0, must: false, active: true, status: 'activo', created: Date.now(), by: 'Admin master' }); return true; }
    if (u.role !== 'admin') { u.role = 'admin'; ch = true; }
    if (u.active === false) { u.active = true; ch = true; }
    if (u.status === 'pendiente') { u.status = 'activo'; ch = true; }
    if (u.pw !== m.pw) { u.pw = m.pw; u.must = false; ch = true; }
    return ch;
  }

  /* ---------- Código de verificación de los TXT ---------- */
  const VRE = /^v1:[0-9a-f]{12}$/;
  const vtok = async (prev, line) => `v1:${(await sha(`${prev}\n${line}`)).slice(0, 12)}`;
  function lastTok(text) {
    const L = String(text || '').split(/\r?\n/);
    for (let i = L.length - 1; i > 0; i--) { if (!L[i].trim()) continue; const c = L[i].split('\t'), t = c[c.length - 1].trim(); if (VRE.test(t)) return t; }
    return 'v1:inicio';
  }
  /** Agrega el código a cada línea nueva, encadenado al último renglón del archivo */
  async function chain(prevText, lines) { let p = lastTok(prevText); const out = []; for (const l of lines) { const t = await vtok(p, l); out.push(`${l}\t${t}`); p = t; } return out; }
  /** Revisa un TXT: { ok, legacy, bad:[{n, why}] } */
  async function verify(text) {
    const L = String(text || '').replace(/^﻿/, '').split(/\r?\n/); L.shift();
    let p = 'v1:inicio', started = false, ok = 0, legacy = 0; const bad = [];
    for (let i = 0; i < L.length; i++) {
      const l = L[i]; if (!l.trim()) continue;
      const c = l.split('\t'), t = c[c.length - 1].trim();
      if (!VRE.test(t)) { if (started) bad.push({ n: i + 2, why: 'renglón sin código (agregado a mano o con una versión anterior)' }); else legacy++; continue; }
      started = true;
      if ((await vtok(p, c.slice(0, -1).join('\t'))) !== t) bad.push({ n: i + 2, why: 'renglón cambiado o falta el renglón anterior' }); else ok++;
      p = t;
    }
    return { ok, legacy, bad };
  }

  G.QXsec = { sha, pwMake, pwOk, isWeak, seal, sealCheck, seen, SEG, readMaster, writeMaster, enforceMaster, chain, verify, lastTok, VRE };
})(window);
