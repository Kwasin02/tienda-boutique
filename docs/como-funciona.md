# Cómo funciona el código

Una guía en lenguaje simple para entender cada parte de la tienda. Léela con el código abierto al lado: cada sección dice qué archivo mirar.

---

## 1. La idea general en 30 segundos

La tienda es **una sola aplicación de Next.js** que hace tres cosas:

1. **Muestra páginas** (portada, catálogo, producto, carrito, contacto, panel).
2. **Guarda y lee datos** en una base de datos SQLite (un único archivo `.db`).
3. **Recibe acciones** del usuario (agregar producto, finalizar pedido, iniciar sesión) y las procesa en el servidor.

Piensa en un restaurante:

| Restaurante | Tienda |
|---|---|
| El salón donde se sienta el cliente | Las **páginas** (`app/`) |
| Los platos que se sirven | Los **componentes** visuales (`components/`) |
| La cocina, donde se prepara todo | Los **servicios** (`services/`) |
| La despensa | La **base de datos** (`database/`) |
| El portero que pide la reserva | El **login** y `proxy.ts` |

---

## 2. Mapa de carpetas

```
app/            Las páginas. Cada carpeta es una URL.
  (tienda)/     Páginas públicas: /, /catalogo, /producto/..., /carrito, /contacto
  admin/        Panel: /admin/login, /admin/productos, /admin/pedidos...
  uploads/      Entrega las fotos subidas desde el panel
components/     Piezas visuales reutilizables (botones, tarjetas, formularios)
services/       La "cocina": reglas del negocio (filtros, carrito, checkout, login)
models/         Qué forma tiene un producto y reglas simples (¿está en promoción?)
database/       Esquema de la base, migraciones, datos iniciales (seed)
styles/         Colores y fuentes de la marca
tests/          Pruebas automáticas
scripts/        Arranque en producción y copias de seguridad
```

> El paréntesis en `(tienda)` significa "grupo": organiza archivos **sin** cambiar la URL. `app/(tienda)/catalogo/page.tsx` responde en `/catalogo`, no en `/tienda/catalogo`.

---

## 3. Conceptos que aparecen en todo el código

**Componente de servidor** (por defecto en Next.js). Se ejecuta en el servidor, puede leer la base de datos y envía HTML ya armado al navegador. Ejemplo: `app/(tienda)/page.tsx` (la portada).

**Componente de cliente** (empieza con `"use client"`). Se ejecuta en el navegador y puede reaccionar a clics. Ejemplo: `components/tienda/ProductPurchase.tsx`, que cambia la talla seleccionada cuando haces clic.

**Server Action** (empieza con `"use server"`). Es una función que vive en el servidor pero se puede llamar desde un botón o formulario, como si fuera una función normal. Ejemplo: `prepareCheckout` en `app/(tienda)/carrito/actions.ts`.

**Regla de oro:** todo lo que importa (precios, stock, contraseñas) se decide **en el servidor**. El navegador es del cliente y puede ser modificado.

---

## 4. Diseño: colores, fuentes y piezas base

**Archivos:** `styles/globals.css`, `components/ui/`

- En `globals.css` están los colores con nombre propio: `marfil`, `arena`, `salvia`, `bosque` (verde oscuro) y `musgo` (gris verdoso para textos secundarios). Por eso en el código ves clases como `bg-marfil` o `text-bosque` (eso es **Tailwind CSS**: estilos escritos como clases).
- `components/ui/button.ts` define los tres estilos de botón (principal, secundario y de texto). Se reutilizan en toda la tienda para que todo se vea igual.
- `components/ui/Price.tsx` muestra el precio y, si hay promoción, el precio anterior tachado.
- Las fuentes (Cormorant Garamond para títulos e Inter para texto) se cargan en `app/layout.tsx`.

---

## 5. Cómo se arma una página: la portada

**Archivo:** `app/(tienda)/page.tsx`

1. La página pide datos a la "cocina": `getActiveBanner()`, `getFeaturedProducts()`, `getBestSellers()`...
2. Esas funciones están en `services/catalog.ts` y leen la base de datos.
3. Con los datos, la página arma el HTML: banner, colecciones y rejillas de productos (`ProductGrid`).

Las páginas **nunca hablan directo con la base de datos**: siempre pasan por `services/`. Así, si mañana cambias la base de datos, solo tocas los servicios.

---

## 6. La caché: por qué la tienda es rápida

**Archivo:** `services/catalog.ts`

```ts
export async function getAllProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  ...
}
```

- `"use cache"` le dice a Next.js: *guarda el resultado y no vuelvas a preguntar a la base cada vez*.
- `cacheTag("catalogo")` le pone una **etiqueta** a ese resultado guardado.
- Cuando guardas algo en el panel, se llama `updateTag("catalogo")`: eso **tira a la basura** todo lo guardado con esa etiqueta, y la próxima visita lee los datos nuevos.

Resultado: la tienda va rápida y los cambios del panel se ven al instante.

**Excepción importante:** `getProductsForCheckout()` **no** usa caché, porque al finalizar un pedido necesitamos el precio y el stock exactos de ese momento.

---

## 7. El catálogo: búsqueda y filtros

**Archivos:** `services/catalog-filters.ts`, `app/(tienda)/catalogo/page.tsx`, `components/tienda/CatalogFilters.tsx`

1. Los filtros viajan en la URL: `/catalogo?categoria=vestidos&talla=M&orden=precio-asc`. Así se pueden compartir por enlace.
2. `parseFilters()` lee la URL **con desconfianza**: recorta textos largos, ignora números negativos y, si el orden no es uno de los permitidos, usa el de por defecto.
3. `applyFilters()` recorre los productos y se queda con los que cumplen todo.
4. `normalize()` quita tildes y mayúsculas, para que "algodon" encuentre "Algodón".

El formulario de filtros es un formulario HTML normal con `method GET`: funciona incluso sin JavaScript.

---

## 8. La ficha de producto: tallas, colores y stock

**Archivo:** `components/tienda/ProductPurchase.tsx` (componente de cliente)

- Guarda en memoria (con `useState`) la talla, el color y la cantidad elegidos.
- `stockOf(talla, color)` suma el stock de las variantes que coinciden. Con eso:
  - tacha las tallas y colores agotados;
  - muestra "Últimas 2 unidades";
  - no deja subir la cantidad por encima del stock.
- Al pulsar **Agregar al carrito**, primero valida: si falta el color o la talla, muestra un mensaje y no agrega nada.
- El botón **Consultar por WhatsApp** arma un enlace `wa.me` con el nombre del producto y la talla elegida.

---

## 9. El carrito

**Archivo:** `services/cart.ts`

El carrito se guarda en `localStorage` (un pequeño almacén del navegador), por eso sobrevive a recargar la página.

El archivo tiene dos partes:

1. **Funciones puras** (fáciles de probar): `addToCart`, `setQuantity`, `removeFromCart`, `cartTotal`. Reciben una lista y devuelven una lista nueva. Por ejemplo, si agregas el mismo vestido en la misma talla dos veces, suma la cantidad en vez de duplicar la línea, y nunca pasa del stock ni de 10 unidades.
2. **El "store"** (`useCart`): conecta esas funciones con React. Cuando el carrito cambia, todos los componentes que lo usan (la página del carrito y el contador del header) se actualizan solos.

`parseStoredCart()` revisa lo que hay en `localStorage` y **descarta** cualquier cosa rara, porque el usuario puede editarlo a mano.

---

## 10. El checkout por WhatsApp (la parte más importante)

**Archivos:** `app/(tienda)/carrito/actions.ts`, `services/checkout.ts`, `services/orders.ts`, `services/whatsapp.ts`

Cuando el cliente pulsa **Finalizar pedido por WhatsApp**:

1. El navegador envía el carrito al servidor (`prepareCheckout`).
2. **Límite de abuso:** si esa IP ya preparó 10 pedidos en la última hora, se detiene.
3. **`validateCart()` no confía en nada del navegador.** Por cada línea:
   - busca el producto en la base;
   - comprueba que la talla y el color existan;
   - usa el **precio de la base**, no el del navegador;
   - ajusta la cantidad al stock real.

   Si algo cambió, devuelve la lista de avisos ("El precio cambió", "Solo quedan 2...") y el cliente revisa antes de seguir.
4. **`registerOrder()`** guarda el pedido como *pendiente* con un código como `P-GVQHM9`. El código usa letras y números que no se confunden entre sí (sin 0/O ni 1/I).
5. **`buildOrderMessage()`** arma el texto: productos numerados, talla, color, cantidad × precio, subtotal y total.
6. **`whatsappLink()`** crea `https://wa.me/NUMERO?text=MENSAJE` con el mensaje codificado para URL.
7. La página muestra el mensaje y el botón **Abrir WhatsApp**. El cliente revisa y envía él mismo.

**Pregunta típica de entrevista:** *"¿Qué pasa si alguien cambia el precio en el navegador a $1?"* → Nada: el servidor recalcula el precio desde la base de datos (paso 3). Hay una prueba que lo comprueba en `tests/unit/checkout.test.ts`.

---

## 11. La base de datos

**Archivos:** `database/schema.prisma`, `database/migrations/`, `database/client.ts`, `database/seed.ts`

- **Prisma** es un ORM: te deja trabajar con la base usando código TypeScript en vez de escribir SQL. Por ejemplo, `db.product.findMany({ where: { active: true } })`.
- **`schema.prisma`** describe las tablas: `Product`, `Variant` (talla + color + stock), `Category`, `Size`, `Color`, `ProductImage`, `Banner`, `Order`, `OrderItem`, `AdminUser`, `StoreSettings`.
- **Migraciones:** cada vez que cambia el esquema, Prisma genera un archivo SQL en `database/migrations/`. Así la base de producción se actualiza paso a paso sin perder datos.
- **`OrderItem` copia** el nombre y el precio del producto. Si mañana cambias el precio o borras el producto, el pedido viejo sigue mostrando lo que se pidió.
- **`seed.ts`** llena la base la primera vez: tallas, colores, categorías, banner, el primer administrador y, en desarrollo, los productos DEMO. Solo llena tablas **vacías**, así nunca recrea algo que borraste.

---

## 12. El panel: login y sesión

**Archivos:** `services/auth/password.ts`, `services/auth/token.ts`, `services/auth/session.ts`, `proxy.ts`, `app/admin/login/actions.ts`

**Contraseñas (`password.ts`).** Nunca se guarda la contraseña, sino un **hash** hecho con `scrypt`: una "huella" de la que no se puede recuperar la contraseña. Para verificar, se calcula la huella de lo que escribió el usuario y se compara. Cada hash lleva una **sal** aleatoria, por eso dos contraseñas iguales dan huellas distintas.

**Sesión (`token.ts` y `session.ts`).** Al entrar, el servidor crea un "pase" con:
- el id del administrador;
- una huella corta de su contraseña;
- la hora de expiración (8 horas).

Ese pase se **firma con HMAC** usando `SESSION_SECRET`. La firma es como un sello: si alguien cambia una letra del pase, el sello ya no coincide y se rechaza. El pase se guarda en una cookie `httpOnly`, que JavaScript del navegador no puede leer.

Como el pase incluye la huella de la contraseña, **cambiar la contraseña invalida todos los pases anteriores**.

**Protección en dos capas:**
1. `proxy.ts` se ejecuta antes de cada página `/admin`: si no hay cookie, redirige al login.
2. `requireAdmin()` se llama al inicio de **cada página y cada acción** del panel y verifica el pase de verdad (firma, expiración, usuario).

**Límite de intentos (`rate-limit.ts`).** Tras 5 contraseñas incorrectas desde la misma IP, se bloquea 15 minutos.

---

## 13. El panel: formularios y productos

**Archivos:** `components/admin/forms.tsx`, `services/admin-forms.ts`, `app/admin/(panel)/productos/`

- **`AdminForm`** es el formulario base del panel: envía los datos a una Server Action y muestra el mensaje de éxito o error. También evita que los campos se vacíen si hay un error.
- **`admin-forms.ts`** valida los datos con **Zod** (una librería para describir cómo debe ser un dato). Por ejemplo: el precio debe ser un número entero entre 0 y 100 millones, y el precio anterior debe ser mayor que el precio actual.
- **Stock por variante:** el formulario muestra una tabla talla × color. Casilla vacía = esa combinación no existe; 0 = existe pero está agotada.
- **`saveProduct()`** guarda todo dentro de una **transacción**: o se guarda todo (producto, variantes y fotos) o no se guarda nada. Al final llama `updateTag("catalogo")` para que la tienda muestre el cambio al instante.

---

## 14. Las fotos

**Archivos:** `services/uploads.ts`, `app/uploads/[name]/route.ts`

1. Se revisan los **primeros bytes** del archivo, no la extensión. Cada formato de imagen empieza con una firma conocida (por ejemplo, un JPG empieza con `FF D8 FF`). Así, un archivo malicioso renombrado a `.jpg` se rechaza.
2. Se limita el tamaño (5 MB) y la cantidad (5 por envío).
3. Se guarda con un nombre aleatorio (`3f2b8c1e-....webp`), nunca con el nombre original.
4. La ruta `/uploads/...` solo entrega archivos cuyo nombre tenga ese formato exacto. Eso impide trucos como `/uploads/../../.env.local`.

---

## 15. Seguridad general

**Archivo:** `next.config.ts`

Cada respuesta incluye **cabeceras de seguridad**, instrucciones que el navegador obedece:

- **Content-Security-Policy:** solo permite cargar scripts, estilos e imágenes del propio sitio.
- **X-Frame-Options: DENY:** ninguna otra web puede mostrar la tienda dentro de un marco (evita engaños tipo *clickjacking*).
- **nosniff, Referrer-Policy, Permissions-Policy:** reducen lo que el navegador adivina o comparte.

Además, React **escapa** automáticamente el texto que muestra: si alguien escribe `<script>` en un campo, se ve como texto y no se ejecuta.

---

## 16. Pruebas automáticas

**Carpetas:** `tests/unit/`, `tests/e2e/`

- **Unitarias (Vitest, `npm test`):** prueban funciones sueltas, sin navegador. Ejemplo: *"si el carrito trae precio $1, el checkout usa el precio real"*.
- **De punta a punta (Playwright, `npm run test:e2e`):** abren un navegador de verdad, en escritorio y en móvil, y hacen lo que haría un cliente: buscar, elegir talla, agregar, finalizar el pedido, entrar al panel. Usan una base de datos aparte para no tocar tus datos.

---

## 17. Despliegue

**Archivos:** `Dockerfile`, `scripts/start.sh`, `scripts/backup.mts`

- **Docker** empaqueta la app con todo lo que necesita, para que funcione igual en cualquier servidor.
- Todo lo que cambia (base de datos, fotos y copias) vive en `/data`, un **volumen**: un disco que se conserva aunque el servidor se reinicie o se actualice.
- **`start.sh`** se ejecuta en cada arranque: aplica migraciones, crea los datos base si la base está vacía, compila la app con los datos reales y la inicia.
- **`npm run db:backup`** copia la base de datos y conserva las 14 copias más recientes.

---

## 18. Preguntas de entrevista que deberías poder responder

1. **¿Por qué el precio no se toma del carrito?** Porque el carrito vive en el navegador y se puede modificar. El servidor recalcula todo (sección 10).
2. **¿Cómo guardas las contraseñas?** Con un hash `scrypt` con sal; nunca en texto plano (sección 12).
3. **¿Cómo sabes que una sesión es válida?** Por la firma HMAC, la expiración y que el usuario exista con la misma contraseña (sección 12).
4. **¿Por qué SQLite y no PostgreSQL?** Una boutique cabe en un solo servidor, y SQLite es simple y barato. Si hiciera falta escalar, Prisma permite cambiar a PostgreSQL con pocos cambios: el proveedor en `schema.prisma`, el adaptador en `database/client.ts` y nuevas migraciones.
5. **¿Cómo se actualiza la tienda cuando cambias un producto?** Con `updateTag`, que invalida la caché del catálogo (sección 6).
6. **¿Qué es una Server Action?** Una función del servidor que se llama desde un formulario o botón (sección 3).
7. **¿Qué parte fue lo más difícil?** Buena respuesta honesta: las particularidades de Next.js 16 con la caché y la sesión, y que el build fallaba con la tienda vacía (se detectó al probar la imagen Docker).

---

## 19. Ejercicios para practicar (y sumar commits propios)

Hazlos tú, sin IA, en una rama nueva. Cada uno toca una parte distinta del código:

1. **Fácil:** agrega la talla "XXL" desde el panel y crea un producto que la use. *(Panel, sin código.)*
2. **Fácil:** cambia el texto "Últimas N unidades" para que aparezca con 5 o menos. *(`ProductPurchase.tsx`)*
3. **Medio:** agrega el orden "Nombre A–Z" al catálogo. *(`catalog-filters.ts` + una prueba en `tests/unit/catalog-filters.test.ts`)*
4. **Medio:** muestra el código de pedido también en la página del carrito, encima del mensaje. *(`CartView.tsx`)*
5. **Avanzado:** agrega un campo opcional "Tu nombre" en el carrito y súmalo al mensaje de WhatsApp. *(`CartView.tsx`, `actions.ts`, `checkout.ts` + prueba)*

Después de cada uno: `npm test`, `npm run lint` y, si quieres, `npm run test:e2e`.
