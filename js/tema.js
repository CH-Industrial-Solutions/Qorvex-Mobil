/*! QORVEX MOBILE · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/* Modo BLACK / WHITE: solo cambia colores, se recuerda en este equipo */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-tsw]'); if (!b) return;
  var th = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = th;
  try { localStorage.setItem('qorvex_theme', th); } catch (x) {}
});
