/*! QORVEX MOBILE · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/*! QORVEX · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/* =====================================================================
   QORVEX MOBILE · V 13.05 — Seguridad
   - Carpeta nueva: el primer registro es el Admin master (Data Base\Seguridad).
   - Config_QORVEX.json modificado fuera de QORVEX: se avisa (no bloquea).
   - Cierre de sesión por inactividad (CONFIG del Motor → Seguridad).
   ===================================================================== */
(function () {
  'use strict';
  const SEC = window.QXsec;
  const TAMPER = 'Config_QORVEX.json fue modificado fuera de QORVEX. Un Supervisor / Admin debe revisar usuarios y roles en QORVEX (PC) → CONFIG y guardar para volver a sellarla.';
  const cfgQ = () => (window.QX && QX.cfg) || null;
  const needsFirst = () => !!(window.QX && QX.dir) && !QX.master && !((cfgQ() && cfgQ().users) || []).some((u) => u.role === 'admin' && u.status !== 'pendiente' && u.active !== false && u.pw);

  /* ---------- Inicio de sesión: aviso de alteración y configuración inicial ---------- */
  const _renderLogin = renderLogin;
  window.renderLogin = renderLogin = function (prefill = '') {
    _renderLogin(prefill);
    const fi = $('#fIn'), fu = $('#fUp'); if (!fi) return;
    const help = fi.querySelector('p.muted.small');
    if (help) help.textContent = '¿Olvidaste tu contraseña? Pide a un Supervisor / Admin que te asigne una nueva.';
    if (window.QX && QX.sealBad) fi.querySelector('p.muted').insertAdjacentHTML('afterend', `<div class="lg-note">⚠ ${TAMPER}</div>`);
    else if (needsFirst()) {
      fi.querySelector('p.muted').insertAdjacentHTML('afterend', '<div class="lg-note">Carpeta nueva: el primero en registrarse será el <b>Admin master</b> (Supervisor / Admin).</div>');
      if (fu) { fu.querySelector('h2').textContent = 'Configuración inicial'; fu.querySelector('p.muted').innerHTML = 'Carpeta nueva: esta cuenta será el <b>Admin master</b> (primer Supervisor / Admin).'; }
    }
  };
  /* Sin usuarios en la tableta: el mismo inicio de sesión (con registro del primer Supervisor / Admin) */
  window.renderSetup = renderSetup = function () { renderLogin(); };

  /* ---------- Cierre de sesión por inactividad ---------- */
  let last = Date.now(), warn = null;
  ['pointerdown', 'keydown', 'touchstart', 'input', 'wheel'].forEach((ev) => document.addEventListener(ev, () => { last = Date.now(); if (warn) { warn.close(); warn = null; } }, true));
  setInterval(() => {
    if (!ME) { last = Date.now(); return; }
    const c = cfgQ(), min = c && c.mobile && c.mobile.idleMin != null ? +c.mobile.idleMin : 15;
    if (!min) return;
    const idle = Date.now() - last, lim = min * 60000;
    if (idle >= lim) {
      if (pendingCount() > 0) { if (!warn) warn = modal({ title: 'Lecturas sin enviar', body: `<div class="banner warn">Hay <b>${pendingCount()}</b> lectura(s) sin SUBMIT. La sesión sigue abierta para que no se pierdan: toca <b>SUBMIT</b> o <b>Salir</b>.</div>`, buttons: [{ t: 'Entendido', cls: 'primary' }] }); return; }
      if (warn) { warn.close(); warn = null; }
      document.querySelectorAll('.modal-bg').forEach((m) => m.remove());
      logout(); toast(`Sesión cerrada por ${min} min sin uso`, 'info', 7000); last = Date.now();
    } else if (idle >= lim - 60000 && !warn) {
      warn = modal({ title: 'Sesión por cerrarse', body: '<div class="banner info">Tu sesión se cerrará en <b>1 minuto</b> por falta de uso.</div>', buttons: [{ t: 'Sigo aquí', cls: 'primary', fn: () => { last = Date.now(); warn = null; } }] });
    }
  }, 10000);

  const css = document.createElement('style');
  css.textContent = `.lg-key{display:block;text-align:center;font-size:13px;font-weight:700;margin-top:2px;text-decoration:none;color:#1E88FF}
    .lg-note{background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.35);border-radius:10px;padding:8px 10px;font-size:13px}`;
  document.head.append(css);
})();
