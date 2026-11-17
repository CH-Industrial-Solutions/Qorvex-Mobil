# QORVEX — Aviso legal, términos de uso y licencias

_Versión 1.0 · 17 de noviembre de 2026_

## 1. Titular y contacto

QORVEX (QORVEX Motor y QORVEX MOBILE) es un software desarrollado por **CH Industrial Solutions**, cuyo titular es **Ing. Carlos Alberto Hernández Hernández**.

Contacto: charliealberth290116@outlook.es · Tel. 81 1537 7033 · General Escobedo, Nuevo León, México.

## 2. Propiedad intelectual y derechos de autor

© 2026 CH Industrial Solutions. Todos los derechos reservados. El código fuente, el diseño de pantallas, la lógica de procesos, los textos, el nombre y el logotipo de QORVEX, así como la marca y el logotipo de CH Industrial Solutions, son propiedad de su titular y están protegidos por la Ley Federal del Derecho de Autor y la Ley Federal de Protección a la Propiedad Industrial.

Se concede a la organización usuaria una licencia de uso no exclusiva e intransferible, limitada a su operación interna. No se permite copiar, modificar, distribuir, vender, sublicenciar ni publicar el software o su código, total o parcialmente, sin autorización por escrito del titular.

Los logotipos de terceras empresas que el administrador cargue en CONFIGURACIÓN pertenecen a sus respectivos dueños; su uso es responsabilidad de la organización que los carga.

## 3. Licencias de terceros

QORVEX no incluye código de terceros, salvo una librería de código abierto para leer y escribir archivos de Excel:

**xlsx-js-style** (basada en SheetJS Community Edition) · Licencia Apache 2.0. Se incluye su aviso y licencia completa en el código fuente (js/lib/LICENSE-xlsx-js-style.txt). Esta licencia permite su uso comercial y no otorga derechos sobre el resto de QORVEX.

No se usan fuentes, imágenes ni servicios externos: el programa funciona en el navegador y guarda la información en la carpeta que elija la organización.

## 4. Protección de datos personales

QORVEX trata únicamente datos personales de identificación laboral: número de empleado, nombre, puesto o rol, y el registro de las capturas que cada persona realiza (fecha, hora, turno, supervisor). No se recaban datos sensibles, financieros ni patrimoniales.

La organización que opera QORVEX es la **responsable** del tratamiento de esos datos ante sus trabajadores y debe contar con su propio **Aviso de Privacidad**, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente (publicada en el DOF el 20 de marzo de 2025) y su reglamento. CH Industrial Solutions actúa como desarrollador del software y no recibe ni almacena esos datos.

Finalidad: control de la operación (validación, secuencia, productividad por turno, supervisor y persona). Los titulares pueden ejercer sus derechos de acceso, rectificación, cancelación y oposición (ARCO) ante la organización responsable.

## 5. Privacidad y confidencialidad

La información de producción (jobs, contenedores, planes, metas y productividad) es confidencial y pertenece a la organización usuaria. Los usuarios se obligan a no divulgarla ni extraerla fuera de los fines de su trabajo.

QORVEX no envía información a internet ni a servidores de CH Industrial Solutions: los datos se guardan solo en la carpeta compartida que la organización conecta (por ejemplo, SharePoint u OneDrive de la empresa).

## 6. Autenticación y control de usuarios

Cada persona entra con su número de empleado y contraseña. Las contraseñas se guardan cifradas (SHA-256) y nunca en texto legible.

Roles: **Administrador** (todo, incluida CONFIGURACIÓN y usuarios), **Capturista** (trabaja en QORVEX Motor y QORVEX MOBILE, sin ajustes) y **Validador** (captura validación y secuencia en QORVEX MOBILE y exporta; no entra a QORVEX Motor).

El auto-registro deja la cuenta **pendiente** hasta que un Administrador la aprueba y le asigna rol. Existe una cuenta maestra de soporte (ADMIN); la organización es responsable de restringir quién la conoce.

Las cuentas son personales e intransferibles. Toda captura, corrección y duplicado queda registrado con el usuario, fecha y hora.

## 7. Seguridad informática

Se recomienda usar QORVEX solo en equipos de la empresa con Windows, navegador Chrome o Edge actualizado y sesión de Windows protegida; mantener la carpeta compartida con permisos solo para el personal autorizado y con historial de versiones activo.

Las capturas se guardan solo agregando líneas al final de archivos de texto; nada se borra ni se reescribe. QORVEX Motor genera respaldos antes de reemplazar archivos de Excel. Solo una persona a la vez puede editar en QORVEX Motor y el modo Editor se cierra tras 30 minutos sin movimiento.

La seguridad de la red, de los equipos, de la carpeta compartida y de las cuentas de Windows/Microsoft 365 corresponde a la organización usuaria.

## 8. Términos de uso y responsabilidades

Al iniciar sesión o registrarse, el usuario acepta estos términos. El software se entrega "tal cual"; CH Industrial Solutions realiza su mejor esfuerzo para su correcto funcionamiento, pero no garantiza que esté libre de errores.

La organización y sus usuarios son responsables de la veracidad de lo capturado, de revisar los resultados antes de tomar decisiones y de conservar respaldos. CH Industrial Solutions no será responsable por pérdidas, paros, multas o daños derivados del uso indebido, de fallas de equipos, de red o de la carpeta compartida, ni de cambios hechos al software por terceros.

Queda prohibido intentar vulnerar el control de acceso, alterar archivos de datos manualmente o usar el software para fines distintos a la operación autorizada.

## 9. Propiedad de la información y bases de datos

Los datos capturados y los archivos de la carpeta "Data Base" (TXT, Excel y Config_QORVEX.json) son propiedad de la organización usuaria. CH Industrial Solutions no tiene acceso a ellos salvo que la organización lo autorice para soporte.

La estructura de los archivos, sus columnas y la lógica de cruce forman parte de la propiedad intelectual de QORVEX.

## 10. Cumplimiento normativo

Marco aplicable de referencia: Ley Federal del Derecho de Autor; Ley Federal de Protección a la Propiedad Industrial; Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su reglamento; Ley Federal del Trabajo en lo relativo a la información del personal; y las políticas internas de la organización usuaria.

Este texto es una base informativa y **no sustituye la revisión de un abogado**. Antes de usar QORVEX con personal o en un entorno externo, la organización debe publicar su Aviso de Privacidad formal y validar estos términos con su área legal.

## 11. Documentación, mantenimiento y trazabilidad

El código fuente incluye README, este documento legal y el aviso de licencias de terceros. Cada versión se identifica con su número (por ejemplo, V 12) y fecha.

Trazabilidad: cada registro lleva ID, equipo (TAB1, TAB2, MOTOR), usuario, supervisor, fecha y hora, movimiento (Alta, Edición, Baja) y, en su caso, motivo de duplicado; las correcciones del Motor guardan el valor anterior y el nuevo; la configuración guarda quién y cuándo la cambió.

El mantenimiento, las mejoras y el soporte se acuerdan con CH Industrial Solutions por escrito.
