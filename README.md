# QORVEX MOBILE · Validación y Secuencia (V 13)

© 2026 CH Industrial Solutions · Ing. Carlos Alberto Hernández Hernández · Todos los derechos reservados. Ver LEGAL.md, LICENSE.txt y TERCEROS.txt.

Publicado en GitHub Pages: https://charliealberth2805-svg.github.io/Qorvex-Mobile/

## Uso
- Chrome o Edge en tableta o PC con Windows. Primera vez: elegir **TAB1** o **TAB2** (después solo lo cambia un Administrador) → conectar la carpeta **Data Base**.
- **Iniciar sesión / Registrarse** con deslizador. Cuenta maestra: **ADMIN / admin2026**.
- Se elige supervisor antes de capturar. Capturas en `Validacion_TAB1_aaaa-mm.txt` / `Secuencia_TAB1_aaaa-mm.txt`.
- Usuarios, turnos, metas, supervisores y fondo del login vienen de `Config_QORVEX.json` (misma lista que QORVEX Motor).

## Estructura
- Todo el programa está en `index.html` (incluye xlsx-js-style, Apache 2.0; licencia en `js/lib/`).

QORVEX (Motor): https://charliealberth2805-svg.github.io/QORVEX/


## Etiquetas 6 × 4
Pestaña **ETIQUETAS** (misma en QORVEX y QORVEX MOBILE): genera, imprime, reimprime y anula etiquetas de Validación, Secuencia y Línea. Registro en TXT dentro de `Data Base/Etiquetas/`; los consecutivos se reservan con candado para que dos equipos nunca saquen el mismo ID. Código compartido: `js/etiquetas.js` (en MOBILE va incluido dentro de `index.html`). Código de barras Code 128 propio, sin librerías externas.
