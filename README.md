# Tienda boutique con pedidos por WhatsApp

Tienda online de ropa: catálogo, variantes (talla y color), carrito persistente y checkout que abre WhatsApp con el pedido precargado. Incluirá panel administrativo protegido.

> **Estado:** Fase 6 de 8 (panel administrativo). Los productos marcados **DEMO** son contenido de demostración, no mercancía real.

## Requisitos

- Node.js 20.9 o superior y npm

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa los valores
npm run db:migrate           # crea la base de datos SQLite
npm run db:seed              # tallas, colores, categorías, admin y productos DEMO
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run db:migrate` | Aplica/crea migraciones en desarrollo |
| `npm run db:deploy` | Aplica migraciones en producción |
| `npm run db:seed` | Carga datos base (con `SEED_DEMO=0` omite los productos DEMO) |

## Variables de entorno

Ver [`.env.example`](.env.example). Ninguna credencial va en el código. `WHATSAPP_NUMBER` debe llevar solo dígitos con código de país; si está vacío, los botones de WhatsApp no se muestran.

## Estructura

```
app/(tienda)/   páginas públicas: inicio, catálogo, producto, carrito, contacto
app/admin/      panel administrativo (login y secciones)
app/uploads/    entrega de las fotos subidas
proxy.ts        primera barrera de acceso a /admin
components/     ui/ (piezas genéricas), tienda/ y admin/ (formularios)
services/       catálogo, checkout, pedidos, auth, subidas, validación de formularios
models/         tipos y reglas de dominio (promociones, stock)
database/       esquema Prisma, migraciones, cliente, seed y datos DEMO
styles/         tokens de la paleta y estilos globales
tests/          pruebas unitarias
public/         archivos estáticos y uploads/
```

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 (SQLite / PostgreSQL) · Zod · Vitest.

## Panel administrativo (`/admin`)

Acceso con el correo y la contraseña de `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` (los crea `npm run db:seed`). **Cambia la contraseña en Ajustes tras el primer acceso.**

| Sección | Qué permite |
|---|---|
| Pedidos | Buscar por código (`P-XXXXXX`), filtrar por estado y cambiarlo (pendiente, confirmado, entregado, cancelado) |
| Productos | Crear, editar, ocultar y eliminar; precio y precio anterior (promoción); destacado / más vendido; stock por talla y color; fotos |
| Categorías, Tallas y colores | Altas, cambios, orden y borrado (no se borra lo que está en uso) |
| Banners | Texto, enlace, imagen y orden del banner de portada |
| Ajustes | Sobre la tienda, correo, dirección, redes, horarios, preguntas frecuentes y cambio de contraseña |

Los cambios se ven en la tienda al instante (se invalida la caché del catálogo).

**Seguridad del panel**
- Contraseñas con scrypt; sesión en cookie `httpOnly` firmada con HMAC (`SESSION_SECRET`), 8 horas.
- Cambiar la contraseña cierra las sesiones abiertas en otros dispositivos.
- 5 intentos de acceso fallidos por IP cada 15 minutos.
- `proxy.ts` bloquea `/admin` sin cookie y cada página y acción vuelve a verificar la sesión.
- Fotos: solo JPG, PNG o WebP verificados por su contenido, máximo `MAX_UPLOAD_MB` MB, nombre aleatorio. Se guardan en `storage/uploads` (o `UPLOAD_DIR`) y se sirven en `/uploads/...`.

## Cómo funciona el pedido por WhatsApp

1. El carrito se guarda en el navegador (`localStorage`).
2. Al pulsar **Finalizar pedido por WhatsApp**, el servidor revisa cada producto contra el catálogo: precio actual, variante existente y stock. Si algo cambió, corrige el carrito y avisa al cliente.
3. Se registra el pedido en la base de datos con un código (`P-XXXXXX`, estado *pendiente*) que también va en el mensaje, para ubicarlo luego en el panel.
4. Se muestra el mensaje exacto que se enviará y el botón **Abrir WhatsApp** (`https://wa.me/NUMERO?text=...`). El cliente revisa y envía; nada se envía solo.
