// Seed: crea tallas, colores, categorías y banner base, y el primer administrador.
// Cada bloque solo se crea si su tabla está VACÍA: nunca recrea lo que borraste desde el panel.
// Por eso es seguro ejecutarlo en cada arranque del servidor (lo hace scripts/start.sh).
//
// Productos de DEMOSTRACIÓN: solo con la tabla de productos vacía y SEED_DEMO distinto de "0".
// Uso: npm run db:seed        (SEED_DEMO=0 npm run db:seed para no cargarlos)

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
  if ((await db.size.count()) === 0) {
    await db.size.createMany({ data: SIZES.map((name, i) => ({ name, sortOrder: i })) });
  }
  if ((await db.color.count()) === 0) {
    await db.color.createMany({ data: Object.entries(COLORS).map(([name, hex]) => ({ name, hex })) });
  }
  if ((await db.category.count()) === 0) {
    await db.category.createMany({ data: demoCategories.map((c, i) => ({ ...c, sortOrder: i })) });
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

  if (process.env.SEED_DEMO !== "0" && (await db.product.count()) === 0) {
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
