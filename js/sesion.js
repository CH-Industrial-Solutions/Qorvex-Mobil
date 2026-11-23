/*! QORVEX MOBILE · © 2026 CH Industrial Solutions · Todos los derechos reservados. Ver LEGAL.md y LICENSE.txt. */
/* =====================================================================
   QORVEX MOBILE · v13 — Inicio de sesión / registro, usuarios únicos y aviso legal
   © 2026 CH Industrial Solutions · Ing. Carlos Alberto Hernández Hernández
   - Usuarios: los de Config_QORVEX.json (los mismos de QORVEX Motor).
     Roles: Administrador · Capturista · Validador. Cuenta maestra ADMIN.
   - Registrarse crea una cuenta PENDIENTE; un Administrador la aprueba.
   - Fondo del login: los wallpapers con marca CH (se elige en CONFIG).
   ===================================================================== */
(function () {
  const WALL = { 1: 'img/fondo-login-1.jpg', 2: 'img/fondo-login-2.jpg' };
  const LEGAL = "<div class=\"lg-doc\"><p class=\"lg-ver\">Versión 1.0 · 17 de noviembre de 2026</p><h4>1. Titular y contacto</h4><p>QORVEX (QORVEX Motor y QORVEX MOBILE) es un software desarrollado por <b>CH Industrial Solutions</b>, cuyo titular es <b>Ing. Carlos Alberto Hernández Hernández</b>.</p><p>Contacto: charliealberth290116@outlook.es · Tel. 81 1537 7033 · General Escobedo, Nuevo León, México.</p><h4>2. Propiedad intelectual y derechos de autor</h4><p>© 2026 CH Industrial Solutions. Todos los derechos reservados. El código fuente, el diseño de pantallas, la lógica de procesos, los textos, el nombre y el logotipo de QORVEX, así como la marca y el logotipo de CH Industrial Solutions, son propiedad de su titular y están protegidos por la Ley Federal del Derecho de Autor y la Ley Federal de Protección a la Propiedad Industrial.</p><p>Se concede a la organización usuaria una licencia de uso no exclusiva e intransferible, limitada a su operación interna. No se permite copiar, modificar, distribuir, vender, sublicenciar ni publicar el software o su código, total o parcialmente, sin autorización por escrito del titular.</p><p>Los logotipos de terceras empresas que el administrador cargue en CONFIGURACIÓN pertenecen a sus respectivos dueños; su uso es responsabilidad de la organización que los carga.</p><h4>3. Licencias de terceros</h4><p>QORVEX no incluye código de terceros, salvo una librería de código abierto para leer y escribir archivos de Excel:</p><p><b>xlsx-js-style</b> (basada en SheetJS Community Edition) · Licencia Apache 2.0. Se incluye su aviso y licencia completa en el código fuente (js/lib/LICENSE-xlsx-js-style.txt). Esta licencia permite su uso comercial y no otorga derechos sobre el resto de QORVEX.</p><p>No se usan fuentes, imágenes ni servicios externos: el programa funciona en el navegador y guarda la información en la carpeta que elija la organización.</p><h4>4. Protección de datos personales</h4><p>QORVEX trata únicamente datos personales de identificación laboral: número de empleado, nombre, puesto o rol, y el registro de las capturas que cada persona realiza (fecha, hora, turno, supervisor). No se recaban datos sensibles, financieros ni patrimoniales.</p><p>La organización que opera QORVEX es la <b>responsable</b> del tratamiento de esos datos ante sus trabajadores y debe contar con su propio <b>Aviso de Privacidad</b>, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente (publicada en el DOF el 20 de marzo de 2025) y su reglamento. CH Industrial Solutions actúa como desarrollador del software y no recibe ni almacena esos datos.</p><p>Finalidad: control de la operación (validación, secuencia, productividad por turno, supervisor y persona). Los titulares pueden ejercer sus derechos de acceso, rectificación, cancelación y oposición (ARCO) ante la organización responsable.</p><h4>5. Privacidad y confidencialidad</h4><p>La información de producción (jobs, contenedores, planes, metas y productividad) es confidencial y pertenece a la organización usuaria. Los usuarios se obligan a no divulgarla ni extraerla fuera de los fines de su trabajo.</p><p>QORVEX no envía información a internet ni a servidores de CH Industrial Solutions: los datos se guardan solo en la carpeta compartida que la organización conecta (por ejemplo, SharePoint u OneDrive de la empresa).</p><h4>6. Autenticación y control de usuarios</h4><p>Cada persona entra con su número de empleado y contraseña. Las contraseñas se guardan cifradas (SHA-256) y nunca en texto legible.</p><p>Roles: <b>Administrador</b> (todo, incluida CONFIGURACIÓN y usuarios), <b>Capturista</b> (trabaja en QORVEX Motor y QORVEX MOBILE, sin ajustes) y <b>Validador</b> (captura validación y secuencia en QORVEX MOBILE y exporta; no entra a QORVEX Motor).</p><p>El auto-registro deja la cuenta <b>pendiente</b> hasta que un Administrador la aprueba y le asigna rol. Existe una cuenta maestra de soporte (ADMIN); la organización es responsable de restringir quién la conoce.</p><p>Las cuentas son personales e intransferibles. Toda captura, corrección y duplicado queda registrado con el usuario, fecha y hora.</p><h4>7. Seguridad informática</h4><p>Se recomienda usar QORVEX solo en equipos de la empresa con Windows, navegador Chrome o Edge actualizado y sesión de Windows protegida; mantener la carpeta compartida con permisos solo para el personal autorizado y con historial de versiones activo.</p><p>Las capturas se guardan solo agregando líneas al final de archivos de texto; nada se borra ni se reescribe. QORVEX Motor genera respaldos antes de reemplazar archivos de Excel. Solo una persona a la vez puede editar en QORVEX Motor y el modo Editor se cierra tras 30 minutos sin movimiento.</p><p>La seguridad de la red, de los equipos, de la carpeta compartida y de las cuentas de Windows/Microsoft 365 corresponde a la organización usuaria.</p><h4>8. Términos de uso y responsabilidades</h4><p>Al iniciar sesión o registrarse, el usuario acepta estos términos. El software se entrega \"tal cual\"; CH Industrial Solutions realiza su mejor esfuerzo para su correcto funcionamiento, pero no garantiza que esté libre de errores.</p><p>La organización y sus usuarios son responsables de la veracidad de lo capturado, de revisar los resultados antes de tomar decisiones y de conservar respaldos. CH Industrial Solutions no será responsable por pérdidas, paros, multas o daños derivados del uso indebido, de fallas de equipos, de red o de la carpeta compartida, ni de cambios hechos al software por terceros.</p><p>Queda prohibido intentar vulnerar el control de acceso, alterar archivos de datos manualmente o usar el software para fines distintos a la operación autorizada.</p><h4>9. Propiedad de la información y bases de datos</h4><p>Los datos capturados y los archivos de la carpeta \"Data Base\" (TXT, Excel y Config_QORVEX.json) son propiedad de la organización usuaria. CH Industrial Solutions no tiene acceso a ellos salvo que la organización lo autorice para soporte.</p><p>La estructura de los archivos, sus columnas y la lógica de cruce forman parte de la propiedad intelectual de QORVEX.</p><h4>10. Cumplimiento normativo</h4><p>Marco aplicable de referencia: Ley Federal del Derecho de Autor; Ley Federal de Protección a la Propiedad Industrial; Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su reglamento; Ley Federal del Trabajo en lo relativo a la información del personal; y las políticas internas de la organización usuaria.</p><p>Este texto es una base informativa y <b>no sustituye la revisión de un abogado</b>. Antes de usar QORVEX con personal o en un entorno externo, la organización debe publicar su Aviso de Privacidad formal y validar estos términos con su área legal.</p><h4>11. Documentación, mantenimiento y trazabilidad</h4><p>El código fuente incluye README, este documento legal y el aviso de licencias de terceros. Cada versión se identifica con su número (por ejemplo, V 12) y fecha.</p><p>Trazabilidad: cada registro lleva ID, equipo (TAB1, TAB2, MOTOR), usuario, supervisor, fecha y hora, movimiento (Alta, Edición, Baja) y, en su caso, motivo de duplicado; las correcciones del Motor guardan el valor anterior y el nuevo; la configuración guarda quién y cuándo la cambió.</p><p>El mantenimiento, las mejoras y el soporte se acuerdan con CH Industrial Solutions por escrito.</p></div>";
  const FOOT = '© 2026 CH Industrial Solutions · Todos los derechos reservados';
  const PUESTO = { admin: 'Supervisor / Admin', capturista: 'Capturista', validador: 'Validador' };
  const wallN = () => { let n = 1; try { n = +(localStorage.getItem('qx_wall') || (S.cfg && S.cfg.wall) || 1); } catch (e) {} return n === 2 ? 2 : 1; };
  const cfgQ = () => (window.QX && QX.cfg) || null;

  function legalOpen() { modal({ title: 'Aviso legal, términos de uso y licencias', wide: true, body: LEGAL, buttons: [{ t: 'Cerrar', cls: 'primary', fn: () => true }] }); }
  window.QXlegal = legalOpen;

  /* V 13.05: sin cuenta fija. Se borra de esta tableta la cuenta ADMIN de versiones anteriores */
  const _loadAll = loadAll;
  window.loadAll = loadAll = function () {
    _loadAll();
    const n = S.users.length; S.users = S.users.filter((u) => u.emp !== MASTER && u.role !== 'master');
    if (S.users.length !== n) { try { localStorage.setItem(K.users, JSON.stringify(S.users)); } catch (e) { /* nada */ } }
  };

  /* ---------- Login / Registro con deslizador ---------- */
  window.renderLogin = renderLogin = function (prefill = '') {
    loadAll();
    app().innerHTML = `<div class="lg-page" style="background-image:url('${WALL[wallN()]}')">
      <div class="lg-card">
        <div class="lg-brand"><img src="${document.documentElement.dataset.theme === 'light' ? QM_L : QM_D}" alt="QORVEX" style="height:54px"><div class="lg-bt"><b>QORVEX MOBILE</b><small>Validación y Secuencia</small></div></div>
        <div class="lg-sw"><span class="lg-knob"></span><button type="button" class="on" data-p="0">Iniciar sesión</button><button type="button" data-p="1">Registrarse</button></div>
        <div class="lg-view"><div class="lg-track">
          <form class="lg-pane" id="fIn" autocomplete="off" novalidate>
            <h2>Bienvenido</h2><p class="muted">Ingresa tu número de empleado y contraseña.</p>
            <label>No. de empleado<input class="input" name="emp" value="${esc(prefill)}" autocomplete="username" placeholder="No. de empleado"></label>
            <label>Contraseña<input class="input" name="pw" type="password" autocomplete="current-password" placeholder="Contraseña"></label>
            <div class="lg-err" id="eIn"></div>
            <button class="btn primary xl" type="submit">INGRESAR</button>
            <p class="muted small">¿Olvidaste tu contraseña? Pide a un Administrador que te asigne una nueva.</p>
          </form>
          <form class="lg-pane" id="fUp" autocomplete="off" novalidate>
            <h2>Crear cuenta</h2><p class="muted">Quedará pendiente hasta que un Administrador la apruebe y te asigne rol.</p>
            <label>No. de empleado<input class="input" name="emp" maxlength="15" placeholder="Será tu usuario"></label>
            <label>Nombre completo<input class="input" name="name" maxlength="60"></label>
            <div class="lg-2"><label>Contraseña<input class="input" name="pw" type="password" autocomplete="new-password" placeholder="Mín. 4"></label><label>Confirmar<input class="input" name="pw2" type="password" autocomplete="new-password"></label></div>
            <label class="lg-chk"><input type="checkbox" name="ok"> Acepto el <a href="#" data-legal>aviso legal y los términos de uso</a></label>
            <div class="lg-err" id="eUp"></div>
            <button class="btn primary xl" type="submit">REGISTRARME</button>
          </form>
        </div></div>
        <div class="lg-foot"><a href="#" data-legal>Aviso legal · Términos · Privacidad</a><span>${esc(FOOT)}</span></div>
      </div></div>`;
    const pg = $('.lg-page'), fi = $('#fIn'), fu = $('#fUp');
    const go = (p) => { pg.classList.toggle('up', p === 1); $$('.lg-sw button').forEach((b) => b.classList.toggle('on', +b.dataset.p === p)); setTimeout(() => (p ? fu.emp : fi.emp).focus(), 320); };
    $$('.lg-sw button').forEach((b) => (b.onclick = () => go(+b.dataset.p)));
    $$('[data-legal]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); legalOpen(); }));
    [fi.emp, fu.emp].forEach((i) => i.addEventListener('input', () => { i.value = i.value.toUpperCase().replace(/\s/g, ''); }));
    fi.emp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fi.pw.focus(); } });
    (prefill ? fi.pw : fi.emp).focus();
    fi.onsubmit = async (e) => {
      e.preventDefault(); loadAll();
      const emp = norm(fi.emp.value), u = S.users.find((x) => x.emp === emp), err = $('#eIn'), pwv = fi.pw.value; err.textContent = '';
      if (emp === MASTER) { err.textContent = 'No. de empleado o contraseña incorrectos.'; return; }
      const pend = cfgQ() && (cfgQ().users || []).find((x) => String(x.emp).toUpperCase() === emp && x.status === 'pendiente');
      if (!u && pend) { err.textContent = 'Tu cuenta está pendiente: un Administrador debe aprobarla.'; return; }
      if (!u || !(await QXsec.pwOk(emp, pwv, u.pw))) { err.textContent = 'No. de empleado o contraseña incorrectos.'; fi.pw.value = ''; fi.pw.focus(); beep('err'); return; }
      if (!u.active) { err.textContent = 'Usuario desactivado. Consulta a un Supervisor / Admin.'; return; }
      if (window.QX && QX.dir) {
        const old = u.pw, adm = u.role === 'admin' || u.puesto === 'admin';
        (async () => {
          let ph = old;
          if (QXsec.isWeak(old)) ph = await QXsec.pwMake(emp, pwv);
          const m = await QXsec.readMaster(QX.dir);
          if (m && m.emp === emp && m.pw === old && ph !== old) await QXsec.writeMaster(QX.dir, { ...m, pw: ph });
          if (!m && adm) await QXsec.writeMaster(QX.dir, { emp, name: u.name, pw: ph }); // carpeta anterior: el primer Supervisor / Admin que entra es el Admin master
          if (ph !== old || (!m && adm)) await QXcfgEdit((c) => { const cu = (c.users || []).find((x) => String(x.emp).toUpperCase() === emp); if (cu && cu.pw === old) cu.pw = ph; });
        })().catch((x) => console.warn('cifrado', x));
      }
      const prevLast = u.last; u.last = Date.now(); save('users'); LOGIN_PREV = prevLast;
      ME = u; ssSet(SS.sess, { emp: u.emp });
      clearInterval(clockTimer);
      if (u.must) return renderChangePw(true);
      CAP = null; ssSet(SS.cap, null); TAB = 'cap';
      flashThen(() => showWelcome(u, renderShell, prevLast));
    };
    fu.onsubmit = async (e) => {
      e.preventDefault(); const er = $('#eUp'); er.textContent = '';
      const emp = fu.emp.value.trim().toUpperCase(), name = fu.name.value.trim(), pw = fu.pw.value;
      if (!window.QX || !QX.dir) return (er.textContent = 'Para registrarte, la tableta debe estar conectada a la carpeta Data Base.');
      if (!/^[A-Z0-9_-]{2,15}$/.test(emp)) return (er.textContent = 'Número de empleado: 2 a 15 letras o números.');
      if (emp === MASTER) return (er.textContent = 'Ese usuario está reservado.');
      if (name.length < 3) return (er.textContent = 'Escribe tu nombre completo.');
      if (pw.length < 4) return (er.textContent = 'La contraseña debe tener al menos 4 caracteres.');
      if (pw !== fu.pw2.value) return (er.textContent = 'Las contraseñas no coinciden.');
      if (!fu.ok.checked) return (er.textContent = 'Debes aceptar el aviso legal y los términos de uso.');
      try {
        const ph = await QXsec.pwMake(emp, pw); let first = false;
        await QXcfgEdit((c) => {
          if (c.users.some((x) => String(x.emp).toUpperCase() === emp)) throw new Error('Ese número de empleado ya está registrado.');
          first = !QX.master && !c.users.some((x) => x.role === 'admin' && x.status !== 'pendiente' && x.active !== false && x.pw);
          c.users.push({ emp, name, role: first ? 'admin' : 'validador', pw: ph, pwAt: Date.now(), must: false, active: true, status: first ? 'activo' : 'pendiente', created: Date.now(), by: `${first ? 'Configuración inicial' : 'Registro'} · QORVEX MOBILE ${devName()}` });
        });
        if (first && !(await QXsec.readMaster(QX.dir))) { await QXsec.writeMaster(QX.dir, { emp, name, pw: ph }); QX.master = await QXsec.readMaster(QX.dir); }
        fu.reset(); toast(first ? 'Admin master creado. Ya puedes iniciar sesión.' : 'Registro enviado. Un Supervisor / Admin debe aprobar tu cuenta.', 'ok', 7000); go(0); fi.emp.value = emp;
      } catch (x) { er.textContent = x.message || String(x); }
    };
  };

  /* ---------- CONFIG → Usuarios (misma lista que QORVEX Motor) ---------- */
  window.renderUsers = renderUsers = function () {
    const box = $('#cfgUsers'); if (!box) return;
    const c = cfgQ();
    if (!c || !window.QX || !QX.dir) { box.innerHTML = '<div class="panel"><div class="sec-head"><h2>Usuarios</h2></div><div class="banner warn"><div>Conecta la carpeta Data Base para administrar los usuarios (son los mismos de QORVEX Motor).</div></div></div>'; return; }
    const us = c.users || [], pend = us.filter((u) => u.status === 'pendiente').length;
    box.innerHTML = `<div class="panel"><div class="sec-head"><h2>Usuarios · QORVEX y QORVEX MOBILE</h2><span class="muted">Una sola lista para los dos programas</span>${pend ? `<span class="badge warn">${pend} solicitud(es)</span>` : ''}<span class="spacer"></span><button class="btn primary sm" id="uNew">+ Agregar usuario</button></div>
      <div class="table-wrap"><table class="t"><tr><th>No. empleado</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Activo</th><th></th></tr>
        ${us.map((u, i) => { const mst = QX.master && String(u.emp).toUpperCase() === QX.master.emp; return `<tr><td><b>${esc(u.emp)}</b></td><td>${esc(u.name)}${mst ? ' <span class="badge ok">👑 Admin master</span>' : ''}</td>
          <td><select class="input" data-ur="${i}" ${mst ? 'disabled' : ''}>${Object.entries(PUESTO).map(([k, t]) => `<option value="${k}" ${(u.role === k || (k === 'validador' && !PUESTO[u.role])) ? 'selected' : ''}>${t}</option>`).join('')}</select></td>
          <td>${u.status === 'pendiente' ? `<span class="badge warn">Pendiente</span> <button class="btn sm primary" data-uok="${i}">Aprobar</button>` : '<span class="badge ok">Activo</span>'}</td>
          <td><input type="checkbox" data-ua="${i}" ${u.active !== false ? 'checked' : ''} ${mst ? 'disabled' : ''}></td>
          <td style="white-space:nowrap">${mst ? '<span class="muted">Solo él cambia su contraseña</span>' : `<button class="btn sm" data-upw="${i}">Contraseña</button> <button class="btn sm danger" data-udel="${i}" title="${u.status === 'pendiente' ? 'Rechazar' : 'Quitar'}">${ICON.trash}</button>`}</td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Sin usuarios dados de alta.</td></tr>'}
      </table></div>
      <div class="muted" style="font-size:12.5px;margin-top:8px">Supervisor / Admin: todo, corrige cualquier captura y aparece en la lista de supervisores. Capturista y Validador: capturan y corrigen solo lo suyo.</div></div>
      <div class="panel"><div class="sec-head"><h2>Fondo del inicio de sesión</h2><span class="muted">Con marca CH · aplica a QORVEX y QORVEX MOBILE</span></div>
        <div class="walls-m">${[1, 2].map((n) => `<button type="button" class="wall-m ${wallN() === n ? 'on' : ''}" data-wall="${n}"><img src="${WALL[n]}" alt="Fondo ${n}"><span>Fondo ${n}</span></button>`).join('')}</div></div>`;
    const edit = async (fn, ok) => { try { await QXcfgEdit(fn); if (ok) toast(ok, 'ok'); } catch (e) { toast(e.message || String(e), 'err', 6000); } renderUsers(); };
    const at = (c2, i) => c2.users.find((x) => x.emp === us[i].emp);
    $$('[data-ur]', box).forEach((sel) => (sel.onchange = () => edit((c2) => { at(c2, +sel.dataset.ur).role = sel.value; }, 'Rol actualizado')));
    $$('[data-uok]', box).forEach((b) => (b.onclick = () => edit((c2) => { at(c2, +b.dataset.uok).status = 'activo'; }, 'Cuenta aprobada')));
    $$('[data-ua]', box).forEach((cb) => (cb.onchange = () => edit((c2) => { at(c2, +cb.dataset.ua).active = cb.checked; }, cb.checked ? 'Usuario activado' : 'Usuario desactivado')));
    $$('[data-udel]', box).forEach((b) => (b.onclick = async () => { const u = us[+b.dataset.udel]; if (!(await confirmBox(u.status === 'pendiente' ? 'Rechazar solicitud' : 'Quitar usuario', `<div>${esc(u.emp)} · ${esc(u.name)}</div>`, u.status === 'pendiente' ? 'Rechazar' : 'Quitar'))) return; edit((c2) => { c2.users = c2.users.filter((x) => x.emp !== u.emp); }, 'Listo'); }));
    $$('[data-upw]', box).forEach((b) => (b.onclick = () => {
      const u = us[+b.dataset.upw];
      modal({ title: `Contraseña · ${esc(u.emp)}`, body: '<div class="field"><label>Contraseña nueva (mín. 4)</label><input class="input" type="password" id="np"></div><label class="lg-chk" style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="nm" checked> Pedir que la cambie al entrar</label>',
        buttons: [{ t: 'Cancelar', fn: () => true }, { t: 'Asignar', cls: 'primary', fn: () => { const v = $('#np').value, m2 = $('#nm').checked; if (v.length < 4) { toast('Mínimo 4 caracteres', 'warn'); return false; } edit(async (c2) => { Object.assign(at(c2, +b.dataset.upw), { pw: await QXsec.pwMake(u.emp, v), pwAt: Date.now(), must: m2 }); }, 'Contraseña asignada'); return true; } }] });
    }));
    $('#uNew').onclick = () => modal({ title: 'Agregar usuario', body: `<div class="field"><label>No. de empleado</label><input class="input" id="nE" maxlength="15"></div><div class="field"><label>Nombre</label><input class="input" id="nN" maxlength="60"></div>
        <div class="field"><label>Rol</label><select class="input" id="nR">${Object.entries(PUESTO).map(([k, t]) => `<option value="${k}" ${k === 'validador' ? 'selected' : ''}>${t}</option>`).join('')}</select></div><div class="field"><label>Contraseña (mín. 4)</label><input class="input" type="password" id="nP"></div>`,
      buttons: [{ t: 'Cancelar', fn: () => true }, { t: 'Agregar', cls: 'primary', fn: () => {
        const emp = $('#nE').value.trim().toUpperCase(), name = $('#nN').value.trim(), pw = $('#nP').value, role = $('#nR').value;
        if (!/^[A-Z0-9_-]{2,15}$/.test(emp) || emp === MASTER) { toast('No. de empleado no válido', 'warn'); return false; }
        if (name.length < 3 || pw.length < 4) { toast('Completa nombre y contraseña (mín. 4)', 'warn'); return false; }
        edit(async (c2) => { if (c2.users.some((x) => String(x.emp).toUpperCase() === emp)) throw new Error('Ese número ya existe'); c2.users.push({ emp, name, role, pw: await QXsec.pwMake(emp, pw), pwAt: Date.now(), must: true, active: true, status: 'activo', created: Date.now(), by: `QORVEX MOBILE ${devName()}` }); }, 'Usuario agregado'); return true;
      } }] });
    $$('[data-wall]', box).forEach((b) => (b.onclick = () => edit((c2) => { c2.brand = c2.brand || {}; c2.brand.wall = +b.dataset.wall; }, 'Fondo actualizado')));
  };

  /* ---------- Pie con aviso legal ---------- */
  const _renderShell = renderShell;
  window.renderShell = renderShell = function () {
    _renderShell();
    const f = $('footer.app-foot') || $('footer');
    const html = `<div class="app-legal">${esc(FOOT)} · <a href="#" id="qLegal">Aviso legal</a></div>`;
    if (f) f.insertAdjacentHTML('beforeend', html); else ($('#main') || app()).insertAdjacentHTML('afterend', html);
    const a = $('#qLegal'); if (a) a.onclick = (e) => { e.preventDefault(); legalOpen(); };
  };

  const css = document.createElement('style');
  css.textContent = `
    .lg-page{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background-size:cover;background-position:center;background-color:#0A2E6E;overflow:auto}
    .lg-card{width:min(470px,100%);background:rgba(255,255,255,.95);color:#0B2A5B;border-radius:22px;box-shadow:0 24px 70px rgba(2,16,48,.45);padding:24px 26px 16px;display:flex;flex-direction:column;gap:14px}
    html[data-theme="dark"] .lg-card{background:rgba(7,20,48,.93);color:#E6F0FF;border:1px solid rgba(34,195,245,.25)}
    .lg-brand{display:flex;align-items:center;justify-content:center;gap:12px}.lg-bt{display:flex;flex-direction:column;line-height:1.1}.lg-bt b{letter-spacing:.12em}.lg-bt small{opacity:.7}
    .lg-sw{position:relative;display:grid;grid-template-columns:1fr 1fr;background:#E8EEF8;border-radius:999px;padding:4px}
    html[data-theme="dark"] .lg-sw{background:#0E2550}
    .lg-sw button{position:relative;z-index:1;border:0;background:transparent;font:inherit;font-weight:700;padding:11px 0;border-radius:999px;color:#4A6286;cursor:pointer;transition:color .25s}
    .lg-sw button.on{color:#fff}
    .lg-knob{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:999px;background:linear-gradient(90deg,#1E88FF,#22C3F5);transition:transform .32s cubic-bezier(.4,.1,.2,1)}
    .lg-page.up .lg-knob{transform:translateX(100%)}
    .lg-view{overflow:hidden}.lg-track{display:flex;width:200%;transition:transform .32s cubic-bezier(.4,.1,.2,1)}.lg-page.up .lg-track{transform:translateX(-50%)}
    .lg-pane{width:50%;display:flex;flex-direction:column;gap:10px;padding:2px;box-sizing:border-box}
    .lg-pane h2{margin:2px 0 0}.lg-pane p{margin:0}
    .lg-pane label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:600;min-width:0}
    .lg-pane .input{height:46px;font-size:16px;width:100%;box-sizing:border-box;min-width:0}
    html:not([data-theme="dark"]) .lg-pane .input{background:#fff;color:#0B2A5B;border:1px solid #C9DAF0}
    .lg-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .lg-pane label.lg-chk{flex-direction:row;align-items:center;gap:8px;font-weight:500}
    .lg-pane a,.lg-foot a{color:#1E88FF}
    .lg-err{min-height:18px;color:#C53030;font-size:13px;font-weight:600}html[data-theme="dark"] .lg-err{color:#FF8A8A}
    .lg-foot{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;opacity:.85;border-top:1px solid rgba(120,150,190,.25);padding-top:10px;text-align:center}
    .lg-doc{max-height:62vh;overflow:auto;padding-right:6px;font-size:14px;line-height:1.55}.lg-doc h4{margin:16px 0 4px}.lg-doc p{margin:0 0 8px}.lg-ver{opacity:.7;font-size:12px}
    .app-legal{font-size:11.5px;text-align:center;opacity:.75;padding:10px 0 14px}.app-legal a{color:inherit}
    .walls-m{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .wall-m{display:flex;flex-direction:column;gap:6px;border:2px solid rgba(120,150,190,.35);border-radius:12px;padding:6px;background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer}
    .wall-m.on{border-color:#22D3EE;box-shadow:0 0 0 3px rgba(34,211,238,.2)}.wall-m img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px}`;
  document.head.append(css);
})();
