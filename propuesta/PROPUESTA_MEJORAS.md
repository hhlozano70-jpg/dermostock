# Propuesta de Mejoras — Silaomarket on line

**Fecha:** 4 de octubre de 2026
**Alcance:** análisis del código fuente en `dermostock/src` (React 19 + Vite 8 + Tailwind 4 + Express)
**Restricción:** esta propuesta no modifica ningún archivo del proyecto. Es un documento de diagnóstico y plan de trabajo.

---

## 1. Resumen ejecutivo

La aplicación está funcional y con un modelo de negocio claro (carrito consolidado multi-negocio con Hub Central en Silao). Los mayores retos actuales no son de funcionalidad sino de **peso inicial de la app, mantenibilidad del código de filtros y accesibilidad/SEO**. Hay mejoras de bajo riesgo que pueden aplicarse en una sola sesión y otras estratégicas que conviene planear por fases.

| Área | Estado | Prioridad |
|---|---|---|
| Funcionalidad core (carrito, pedidos, roles) | Sólida | — |
| Rendimiento (carga inicial) | Degradable con el catálogo | **Alta** |
| Mantenibilidad (lógica de categorías) | Riesgo alto de bugs silenciosos | **Alta** |
| Accesibilidad | Parcial | Media |
| SEO local | Básico | Media |
| Experiencia visual | Correcta, mejorable | Baja |

---

## 2. Hallazgos del diagnóstico (con evidencia en código)

### 2.1 Rendimiento — todo se carga de golpe
- `App.tsx` importa y monta **13 modales/drawers de forma persistente** (Carrito, Vista rápida, Edición, Sincronización, Ajustes, Escáner, Auth, Encargo, Folleto, Manual, Comercios, Rastreo, Recibo). Ninguno usa `React.lazy`.
- Dependencias pesadas incluidas en el bundle inicial: `recharts` (gráficas de Reportes y Finanzas), `html5-qrcode` (escáner), `qrcode` (códigos QR).
- **Impacto:** el cliente de la tienda descarga código de reportes administrativos que jamás usará. Con catálogos grandes, la primera visita se vuelve lenta (mala conversión en móviles con datos limitados, el público objetivo de Silao).

### 2.2 Mantenibilidad — lógica de categorías duplicada y con IDs quemados
- `Storefront.tsx` contiene ~130 líneas de reglas de filtrado con IDs de comercio **hardcodeados** (`merch-abarrotes`, `merch-cadena-fria`, `merch-cerrajeria-silao`, etc.) repetidas en **dos lugares distintos**: una para comercios (`activeCategoryMerchants`) y otra para productos (`filteredProducts`).
- Dar de alta un comercio nuevo exige editar estas listas a mano; si las dos copias se desincronizan, la pestaña muestra comercios pero no productos (o viceversa) — un bug silencioso que el usuario percibe como "la app no sirve".

### 2.3 Renderizado — catálogo completo sin paginación
- `filteredProducts.map(...)` pinta **todos** los productos filtrados de una vez, sin paginación, "cargar más" ni virtualización. Hoy funciona con el catálogo de ejemplo; con cientos de productos el scroll y los re-renders se degradan.

### 2.4 Accesibilidad
- Las tarjetas de comercio usan `<div onClick>` (sin `role="button"`, sin `tabIndex`, sin manejo de teclado): usuarios de teclado/lectores de pantalla no pueden seleccionar comercio.
- El buscador no tiene `<label>` ni `aria-label`.
- Contraste de algunos textos pequeños (`text-[10px] text-slate-400`) está por debajo de WCAG AA.

### 2.5 SEO local (clave para un negocio de Silao)
- Faltan: `og:image`, datos estructurados **JSON-LD** (`LocalBusiness` / `Store` con dirección del Hub), `canonical`, y meta de geolocalización. La búsqueda local ("súper a domicilio Silao") es el canal de adquisición más barato y hoy no se aprovecha.

### 2.6 Detalles de calidad
- `ProductCard` usa `setTimeout` sin limpieza al desmontar (fuga menor).
- Cada tarjeta recalcula `merchants.find()` y `checkMerchantOperatingStatus()` en cada render; memoizable.
- `index.html` carga fuentes de Google sin `display=swap` explícito en todas (sí lo tiene) — ok, pero el logo JPG se usa como favicon (pesado, sin versiones PNG/ICO).

---

## 3. Plan de mejoras propuesto

### Fase 1 — Quick wins (1 sesión, bajo riesgo, alto impacto)
1. **División de código (code splitting)** con `React.lazy` + `Suspense` para: `ReportsDashboard`, `FinancialDashboard`, `HubOrdersManager`, `BarcodeScannerModal` (arrastra `html5-qrcode`), `MerchantsManager`, `UserManualModal` y `BrochureModal`. Solo el rol admin negocia esos chunks.
2. **Extraer la lógica de categorías a un único módulo** (`utils/categoryRules.ts`) con una tabla de reglas declarativa, usada tanto para comercios como para productos. Elimina la duplicación y los IDs quemados pasan a una sola lista.
3. **Paginación o "Cargar más"** en el catálogo (renderizar de 24 en 24).
4. **Corregir a11y de tarjetas de comercio**: convertir a `<button>` real; `aria-label` en buscador.
5. **SEO:** JSON-LD `LocalBusiness` + `og:image` + `canonical` en `index.html`.

**Resultado esperado:** primera carga ligera (solo tienda + carrito), sin cambios visibles para el usuario, y menos superficie de bug en filtros.

### Fase 2 — Experiencia y rendimiento (1–2 sesiones)
6. **Skeletons** mientras cargan imágenes de producto (ya existe `ProductVisual`; agregar placeholder con shimmer).
7. **Memoización** en `ProductCard` (`React.memo` + `useMemo` para precio y horario del comercio).
8. **Pulido visual del hero:** menos texto, jerarquía más clara, badge de envío $25 como elemento prominente, CTA único principal ("Armar mi carrito") con el folleto/manual al footer.
9. **Favicon moderno** (PNG 32/180px + maskable icon para móvil).
10. **Persistencia del carrito** en `localStorage` (si aún no existe — verificar `InventoryContext`).

### Fase 3 — Estratégicas (semanas, decidir con datos)
11. **PWA instalable** (manifest + service worker): para clientes recurrentes, "agregar a pantalla de inicio" convierte la web en app sin tiendas.
12. **Checkout por WhatsApp** como alternativa de pago/confirmación (flujo natural en México; el catálogo ya tiene cultura WhatsApp).
13. **Panel de comercio**: notificaciones de pedido nuevas (hoy el comercio debe abrir la pestaña).
14. **Búsqueda con sinónimos/abreviaturas locales** ("refa" → refacciones, "agua" → aguas frescas).

---

## 4. Lo que NO tocaría (está bien así)

- El modelo de roles (cliente / negocio / admin) y los guards del router en `App.tsx` — correctos y defensivos.
- La paleta verde/ámbar con identidad de Silao (Cristo Rey, orgullo local) — es diferenciador, no un defecto.
- Las utilidades de negocio (`pricing`, `operatingHours`, `deliveryFee`) — bien encapsuladas.

---

## 5. Estimaciones

| Fase | Esfuerzo estimado | Riesgo |
|---|---|---|
| 1 — Quick wins | 2–4 h | Bajo |
| 2 — UX/rendimiento | 3–6 h | Bajo-Medio |
| 3 — Estratégicas | Por definir | Medio |

---

## 6. Siguiente paso sugerido

Aprobar la Fase 1 y aplicarla en una copia de trabajo, dejando el proyecto original intacto hasta validar.
