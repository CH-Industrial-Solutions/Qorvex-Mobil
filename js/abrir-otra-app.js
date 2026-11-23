/*! QORVEX · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/* Abrir la otra app de QORVEX en su propia ventana. Instalado en la PC (file://) usa la copia local; por enlace usa la dirección web. */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-qxapp]');if(!a)return;e.preventDefault();
var url=location.protocol==='file:'?new URL(a.getAttribute('data-local'),location.href).href:a.href;
var w=window.open(url,a.getAttribute('data-qxapp'),'popup=yes,width='+Math.min(screen.availWidth,1600)+',height='+Math.min(screen.availHeight-40,950));
if(w){try{w.focus();}catch(_){}}else{window.open(url,'_blank');}});
