# Tienda boutique con pedidos por WhatsApp

Tienda online de ropa: catálogo, variantes (talla y color), carrito persistente y checkout que abre WhatsApp con el pedido precargado. Incluirá panel administrativo protegido.

> **Estado:** Fase 3 de 8 (catálogo con filtros y detalle de producto con variantes). Los productos marcados **DEMO** son contenido de demostración, no mercancía real.

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
