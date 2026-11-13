// Seed: crea tallas, colores, categorías base y el primer administrador.
// Con SEED_DEMO=1 (por defecto en desarrollo) añade productos de DEMOSTRACIÓN marcados como tales.
// Es idempotente: se puede ejecutar varias veces sin duplicar datos.
//
// Uso: npm run db:seed        (o SEED_DEMO=0 npm run db:seed para no cargar productos demo)

import { hashPassword } from "../services/auth/password";
import { db } from "./client";
import { demoCategories, demoProducts } from "./demo-data";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS: Record<string, string> = {
  Arena: "#E8E2D7",
  Salvia: "#A8B5A0",
  "Verde oscuro": "#333B35",
  Blanco: "#FFFFFF",
  Marfil: "#F8F6F0",
};

async function main() {
  for (const [i, name] of SIZES.entries()) {
    await db.size.upsert({ where: { name }, update: {}, create: { name, sortOrder: i } });
  }
  for (const [name, hex] of Object.entries(COLORS)) {
    await db.color.upsert({ where: { name }, update: {}, create: { name, hex } });
  }
  for (const [i, c] of demoCategories.entries()) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, sortOrder: i } });
  }

  if ((await db.banner.count()) === 0) {
    await db.banner.create({
      data: {
        eyebrow: "Nueva temporada",
        title: "Prendas serenas para vestir cada día",
        subtitle: "Elige tu talla y color, arma tu pedido y confírmalo con nosotros por WhatsApp.",
      },
    });
  }

  if (process.env.SEED_DEMO !== "0") {
    for (const p of demoProducts) {
      if (await db.product.findUnique({ where: { slug: p.slug } })) continue;
      const category = await db.category.findUniqueOrThrow({ where: { slug: p.categorySlug } });
      const sizes = await db.size.findMany();
      const colors = await db.color.findMany();
      await db.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          categoryId: category.id,
          featured: p.featured,
          bestSeller: p.bestSeller,
          demo: true,
          createdAt: new Date(p.createdAt),
          variants: {
            create: p.variants.map((v) => ({
              stock: v.stock,
              sizeId: sizes.find((s) => s.name === v.size)!.id,
              colorId: colors.find((c) => c.name === v.color)!.id,
            })),
          },
        },
      });
    }
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (email && password && !(await db.adminUser.findUnique({ where: { email } }))) {
    await db.adminUser.create({ data: { email, passwordHash: await hashPassword(password) } });
    console.log(`Administrador creado: ${email}`);
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
