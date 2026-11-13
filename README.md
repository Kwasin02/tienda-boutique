# Tienda boutique con pedidos por WhatsApp

Tienda online de ropa: catálogo, variantes (talla y color), carrito persistente y checkout que abre WhatsApp con el pedido precargado. Incluirá panel administrativo protegido.

> **Estado:** Fase 4 de 8 (carrito y checkout por WhatsApp). Los productos marcados **DEMO** son contenido de demostración, no mercancía real.

## Requisitos

- Node.js 20.9 o superior y npm

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa los valores
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

## Variables de entorno

Ver [`.env.example`](.env.example). Ninguna credencial va en el código. `WHATSAPP_NUMBER` debe llevar solo dígitos con código de país; si está vacío, los botones de WhatsApp no se muestran.

## Estructura

```
app/            rutas (App Router), layout, 404, favicon
components/     ui/ (piezas genéricas) y tienda/ (header, footer, tarjetas)
services/       acceso al catálogo, configuración, formato, WhatsApp
models/         tipos y reglas de dominio (promociones, stock)
database/       datos DEMO; esquema y migraciones desde la Fase 5
styles/         tokens de la paleta y estilos globales
tests/          pruebas unitarias
public/         archivos estáticos y uploads/
```

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Vitest.

## Cómo funciona el pedido por WhatsApp

1. El carrito se guarda en el navegador (`localStorage`).
2. Al pulsar **Finalizar pedido por WhatsApp**, el servidor revisa cada producto contra el catálogo: precio actual, variante existente y stock. Si algo cambió, corrige el carrito y avisa al cliente.
3. Se muestra el mensaje exacto que se enviará y el botón **Abrir WhatsApp** (`https://wa.me/NUMERO?text=...`). El cliente revisa y envía; nada se envía solo.
