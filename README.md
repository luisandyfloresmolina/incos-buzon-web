# Buzón de quejas anónimo · INCOS

Sistema del ecosistema **SIA-INCOS** donde la comunidad educativa presenta quejas
anónimas con evidencia liviana, recibe un código de seguimiento y las autoridades
las gestionan de forma trazable. **La privacidad del denunciante es el requisito
principal.**

Stack: **Cloudflare Workers + D1 (SQLite) + KV (o R2) + Turnstile**, frontend
estático sin dependencias. Costo: **$0** en el plan gratuito.

---

## 1. Reglas de privacidad que el código respeta

| Regla | Cómo se cumple |
|---|---|
| Sin nombre, correo ni teléfono del denunciante | El formulario no los pide y la tabla `buz_quejas` no tiene columnas para ellos |
| Sin IP ni datos del navegador | No se lee `request.cf`, no se registra `CF-Connecting-IP` y `observability.enabled = false` |
| Sin hora exacta | `fecha_envio` es `YYYY-MM-DD`; no se guarda hora de la queja |
| Código irrecuperable | Se muestra una vez y solo se guarda su **SHA-256** |
| Código fuera de la URL | La consulta siempre va por `POST` en el cuerpo (no queda en historial ni referrer) |
| Adjuntos sin metadatos | Se reescriben los segmentos del JPEG/PNG y se descartan EXIF, XMP, IPTC, comentarios y fechas |
| Sin nombre original del archivo | Se guarda como `evidencia.jpg` / `evidencia.png` con ruta aleatoria |
| Anti-spam sin identificar | Turnstile + límite en la Cache API del borde con hash de sal diaria; nunca en D1 |
| El denunciado no recibe su queja | La derivación salta a la persona señalada por `persona_id` |
| El administrador no lee el texto | `GET /api/admin/queja/:id` responde siempre **403**. Puede revisar las imágenes de evidencia (pestaña *Evidencias*), nunca la descripción |

### Límites honestos (deben decirse en la defensa)

- Cloudflare, como dueño del borde, técnicamente ve la IP del visitante. **La
  aplicación no la persiste ni la expone**, pero no se puede prometer anonimato
  frente al proveedor ni frente a un relato muy detallado.
- En un instituto pequeño, el texto de la queja puede delatar a quien escribe.
  El formulario lo advierte y el manual debe repetirlo.

---

## 2. Requisitos

- Node.js 20 o superior
- Cuenta gratuita de Cloudflare (`wrangler login`)

```bash
npm install
Copy-Item .dev.vars.example .dev.vars   # PowerShell
```

## 3. Puesta en marcha 

Abrir  https://incos-buzon-web.incos-buzon.workers.dev.

### Pruebas automatizadas

Con el servidor en marcha, en otra terminal:

```bash
npm run pruebas
# o contra el despliegue:
BASE=https://tu-dominio.pages.dev node scripts/pruebas.mjs
```

Cubre 30+ verificaciones: anonimato, exclusión del denunciado, EXIF, permisos,
auditoría y CRUD administrativo.

Para empezar de cero (borra quejas y cuentas locales):

```powershell
Remove-Item -Recurse -Force .wrangler
npm run db:local
npm run seed:local
```

Cuentas creadas por `npm run seed`:

| Rol | Correo | Clave |
|---|---|---|
| ADMIN_TECNICO | `admin@buzon.incos` | `BuzonAdmin2026*` |
| COMITE | `comite@buzon.incos` | `BuzonComite2026*` |

Autoridades de prueba (SIA, noviembre 2026; la clave inicial es el mismo código):

| Cuenta | Clave | Persona | Cargo |
|---|---|---|---|
| `DOC-003` | `DOC-003` | Isabel Antelo Urquiza | Rector |
| `DOC-047` | `DOC-047` | Saira Semo Rivero | Académico |
| `DOC-001` | `DOC-001` | Ramón Villmark Alborta Tejada | Docente, **sin** rol BUZON (debe recibir 403) |

> **Autoridades:** ingresan en el **acceso único** `/` con su **CI del SIA**
> (por ejemplo, `DOC-003`), no con correo. Las cuentas locales
> `admin@buzon.incos` y `comite@buzon.incos` también entran por `/` con su
> correo. El sistema detecta el rol y muestra la bandeja de autoridades o el
> panel administrativo; no hay dos puertas separadas.

La cuenta de servicio del Buzón usa `DOC-003`; cuando el SIA entregue una
cuenta de servicio dedicada, reemplácela con `wrangler secret put SIA_CLAVE`
y actualice `SIA_USUARIO` en `wrangler.jsonc`.

> **Si el SIA reinicia su base:** los códigos de cuenta y los IDs de cargo
> pueden cambiar. Actualice `SIA_USUARIO`/`SIA_CLAVE`, revise las reglas de
> derivación en **Administración** y fuerce una recarga de la caché llamando
> a `/api/config` o enviando una queja. La caché de autoridades se reemplaza
> completa en cada consulta exitosa al SIA.

## 3.1 Entradas del sistema

El sistema tiene **un solo acceso para el personal** y dos entradas públicas
que se reparten por QR:

| Entrada | URL | Para quién |
|---|---|---|
| Acceso único del personal | `/` | Autoridades, administración y comité |
| Enviar queja | `/queja` | Denunciantes, solo mediante QR |
| Consultar seguimiento | `/consulta` | Denunciantes, solo mediante QR |

En `/` hay un único formulario. Si la persona escribe su CI del SIA, entra a la
bandeja de autoridades; si escribe su correo local, entra al panel
administrativo. No hay que elegir entre *Autoridades* y *Administración*.

Los enlaces a *Enviar queja* y *Consultar* no aparecen en `/`: se llega
exclusivamente por los códigos QR que se generan en **Administración → Códigos
QR** (con la dirección real del sitio) y se imprimen en el instituto.

> **Nota de seguridad:** ocultar los enlaces ordena la experiencia, pero no es un
> control de acceso. Cualquiera que conozca `/queja` puede abrirlo. Si se
> necesita restringir de verdad, habría que añadir un enlace secreto rotativo
> validado en el servidor.

---

## 4. Despliegue

El sistema ya está publicado en Cloudflare:

| Recurso | Valor |
|---|---|
| URL pública | `https://incos-buzon-web.incos-buzon.workers.dev` |
| Base D1 | `buzon-incos` (`032ed9c1-2708-4f3f-8359-c425ff49ffc4`) |
| Turnstile | widget "Buzon INCOS" |
| Secretos | ver `SECRETOS_PRODUCCION.txt` (no compartir) |

Para una instalación desde cero en otra cuenta:

```bash
# Crear recursos (una sola vez)
npx wrangler login
npx wrangler d1 create buzon-incos
npx wrangler kv namespace create buzon-adjuntos   # almacenamiento gratis, sin tarjeta

# Pegar el database_id que devuelve el comando en wrangler.jsonc

# Secretos
npx wrangler secret put SIA_CLAVE
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ANON_SALT
npx wrangler secret put TURNSTILE_SECRET

# Migrar y publicar
npm run db:migrar
npm run seed
npm run deploy
```

Para Turnstile: crear un widget con
`npx wrangler turnstile widget create "Buzon INCOS" --domain <hostname> --mode managed`
y poner la *site key* en `wrangler.jsonc` → `vars.TURNSTILE_SITE_KEY`. Si no se
configura, el captcha se omite (solo aceptable en desarrollo).

### Ver la base de datos

- Panel: **Cloudflare → Storage & Databases → D1 → `buzon-incos` → Console**.
- Terminal: `npm run ver-db -- --remote` (pide confirmación) o
  `npm run ver-db -- buz_quejas --remote`.
- Respaldo: `npx wrangler d1 export buzon-incos --remote --output=respaldo.sql`.

> **Almacenamiento de evidencias:** las imágenes se guardan en **KV**
> (`ADJUNTOS_KV`), que es gratis y no requiere tarjeta. El código también admite
> **R2** si algún día se activa: basta con descomentar `r2_buckets` en
> `wrangler.jsonc` (binding `ADJUNTOS`); el sistema usa R2 primero y KV como
> respaldo. KV tiene consistencia eventual (la imagen puede tardar unos segundos
> en verse desde otro centro de datos); R2 es inmediato.

---

## 5. Variables de entorno

| Variable | Tipo | Uso |
|---|---|---|
| `SIA_URL` | var | Base del SIA (`https://sia-incos-api-production.up.railway.app`) |
| `SIA_USUARIO` / `SIA_CLAVE` | var / secreto | Cuenta de servicio para consultar cargos sin sesión de autoridad |
| `SESSION_SECRET` | secreto | Firma HMAC de las cuentas locales |
| `ANON_SALT` | secreto | Sal del límite anti-spam efímero |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` | var / secreto | Captcha |
| `PBKDF2_ITERACIONES` | opcional | Iteraciones de hash local (por defecto 15000 por el CPU del plan gratuito) |

> **Nota técnica:** el plan gratuito de Workers limita el CPU por petición. Con
> plan pagado se recomienda `PBKDF2_ITERACIONES=600000`.

> **Detalle de integración:** el JWKS del SIA publica el campo `n` con la clave
> SPKI completa en base64 (no con el módulo RSA crudo que exige el estándar JWK).
> `src/lib/sia.ts` detecta ese formato y lo importa como SPKI; si algún día lo
> corrigen, sigue funcionando por la ruta estándar. Conviene avisar al equipo del
> SIA: cualquier librería JWT estándar fallará con su JWKS actual.

---

## 6. Modelo de datos

Todas las tablas usan prefijo `buz_` y snake_case en español.

| Tabla | Contenido |
|---|---|
| `buz_categorias` | Catálogo editable |
| `buz_reglas_derivacion` | Histórico de cadenas por categoría; ya no decide el destino |
| `buz_quejas` | Queja: hash del código, categoría, descripción, estado, fecha (sin hora), límite |
| `buz_derivaciones` | Derivación vigente e histórica (`REGLA`, `EXCLUSION`, `ESCALAMIENTO`) |
| `buz_historial_estados` | Una fila por cambio de estado, nunca se edita |
| `buz_adjuntos` | Nombre genérico, ruta, tamaño, SHA-256 y MIME |
| `buz_mensajes` | Mensajes denunciante ↔ autoridad |
| `buz_usuarios` | Solo cuentas locales (ADMIN_TECNICO, COMITE) |
| `buz_auditoria` | Uso del sistema, nunca contenido de quejas |
| `buz_parametros` | Plazo (5 días), máximo de adjuntos (3), tamaño (2 MB) |
| `buz_cache_autoridades` | Caché de lectura del SIA; nunca decide permisos |

Campos `cargo_id` y `persona_id` apuntan al SIA **sin llave foránea**, y solo se
guardan identificadores; nombres y cargos son caché de lectura.

---

## 7. Derivación única y asignación

1. El denunciante elige una categoría (solo para clasificar) y, opcionalmente,
   un cargo involucrado.
2. **Todas las quejas se derivan a la Rectora**, sin importar la categoría.
3. Si la queja señala a la Rectora, se entrega al Académico; si también señala
   al Académico, al siguiente cargo de autoridad disponible. La comparación es
   por `persona_id`, no por el nombre del cargo.
4. La Rectora ve **todas** las quejas y puede asignarlas manualmente a otra
   autoridad desde el detalle de la queja.
5. La autoridad asignada ve la queja en su bandeja. La Rectora sigue viendo
   todas, incluso las que ya asignó.
6. La categoría no cambia el destino: se conserva para estadísticas.
7. Al cerrar una queja ya no admite mensajes, cambios de estado ni reasignación.

> El escalamiento automático por categoría quedó reemplazado por la asignación
> manual de la Rectora. La tabla `buz_reglas_derivacion` se conserva por
> compatibilidad, pero ya no decide el destino.

---

## 8. Rutas principales

**Acceso único**
- `POST /api/auth/entrar` — detecta autoridad SIA o cuenta local
- `GET /api/auth/perfil` — sesión actual y rol
- `POST /api/auth/salir` — cierra ambas cookies

**Público**
- `GET /api/config` — categorías, cargos y parámetros
- `POST /api/quejas` — envío anónimo (multipart)
- `POST /api/consulta` — estado por código
- `POST /api/consulta/mensaje` — mensaje del denunciante
- `GET /api/estado` — salud

**Autoridades** (cookie `buz_sia`, JWT del SIA validado con JWKS en cada petición)
- `POST /api/auth/sia` (compatibilidad)
- `GET /api/autoridad/bandeja` — la Rectora ve todas; las demás, las asignadas
- `GET /api/autoridad/queja/:id`
- `POST /api/autoridad/queja/:id/asignar` — solo la Rectora
- `PATCH /api/autoridad/queja/:id/estado`
- `POST /api/autoridad/queja/:id/mensaje`
- `GET /api/autoridad/adjunto/:id`

**Cuentas locales** (cookie `buz_local` firmada)
- `POST /api/auth/local` (compatibilidad)
- `GET/POST/PATCH/DELETE /api/admin/categorias…`
- `GET/PUT /api/admin/reglas/:categoriaId`
- `GET/POST/PATCH /api/admin/usuarios…`
- `GET/PATCH /api/admin/parametros`
- `GET /api/admin/auditoria` (ADMIN + COMITE)
- `GET /api/admin/estadisticas` (ADMIN + COMITE)
- `GET /api/admin/queja/:id` → **403 siempre**

---

## 9. Pruebas de privacidad (checklist de la guía)

- [ ] El formulario no tiene campos de nombre, correo ni teléfono.
- [ ] Ninguna tabla guarda IP, user-agent ni hora exacta de la queja.
- [ ] `SELECT * FROM buz_quejas` no contiene el código en claro.
- [ ] Una queja contra el Académico se deriva a la Rectora.
- [ ] Una queja contra la Rectora se deriva al Académico.
- [ ] La Rectora ve todas las quejas; las demás autoridades solo las asignadas.
- [ ] La Rectora puede asignar una queja desde el detalle.
- [ ] ADMIN_TECNICO recibe 403 en `GET /api/admin/queja/1`.
- [ ] El JPEG guardado en KV/R2 no tiene EXIF (`exiftool` o similar).
- [ ] La URL nunca contiene el código de seguimiento.

---

## 10. Decisiones pendientes con la Dirección

1. Confirmar que la Rectora es el destino único y que ella asigna el resto.
2. Plazo de atención (propuesta: 5 días).
3. Lista definitiva de categorías.
4. Tamaño máximo de adjuntos (propuesta: 2 MB).
5. Servicio de correo para avisos genéricos (no implementado: no envía contenido).
6. Cuenta de servicio dedicada del SIA (hoy se usa `DOC-003`).
