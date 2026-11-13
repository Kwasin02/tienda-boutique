import { expect, test } from "@playwright/test";

test.describe("tienda", () => {
  test("portada con banner, productos DEMO y cabeceras de seguridad", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(res?.headers()["x-frame-options"]).toBe("DENY");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Prendas serenas");
    await expect(page.getByText("DEMO").first()).toBeVisible();
  });

  test("búsqueda sin tildes y filtros del catálogo", async ({ page }) => {
    await page.goto("/catalogo?q=algodon");
    await expect(page.getByRole("link", { name: "Camisa de algodón" })).toBeVisible();
    await expect(page.getByText("1 producto", { exact: false })).toBeVisible();

    await page.goto("/catalogo?categoria=abrigos&orden=precio-asc");
    const names = await page.locator("article h3").allTextContents();
    expect(names).toEqual(["Chaqueta ligera", "Abrigo de lana"]);

    await page.goto("/catalogo?q=zzzz");
    await expect(page.getByRole("heading", { name: "Ningún producto coincide" })).toBeVisible();
  });

  test("no deja agregar sin talla y respeta el stock", async ({ page }) => {
    await page.goto("/producto/pantalon-recto-demo");
    await page.getByRole("button", { name: "Agregar al carrito" }).click();
    await expect(page.getByText("Elige una talla para continuar.")).toBeVisible();

    await page.getByRole("button", { name: "M", exact: true }).click();
    await expect(page.getByText("Últimas 2 unidades.")).toBeVisible();
    for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Sumar uno" }).click();
    await expect(page.getByLabel("Cantidad")).toHaveValue("2");
    await page.getByRole("button", { name: "Agregar al carrito" }).click();
    await expect(page.getByText("Agregado al carrito.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Carrito, 2 artículos/ })).toBeVisible();
  });

  test("carrito persistente y checkout por WhatsApp con pedido registrado", async ({ page }) => {
    await page.goto("/producto/vestido-midi-lino-demo");
    await page.getByRole("button", { name: "Arena" }).click();
    await page.getByRole("button", { name: "S", exact: true }).click();
    await page.getByRole("button", { name: "Agregar al carrito" }).click();

    await page.goto("/carrito");
    await page.reload(); // sobrevive a la recarga
    await expect(page.getByRole("heading", { name: "Vestido midi de lino" })).toBeVisible();
    await page.getByRole("button", { name: "Finalizar pedido por WhatsApp" }).click();

    const link = page.getByRole("link", { name: "Abrir WhatsApp" });
    await expect(link).toBeVisible();
    const href = (await link.getAttribute("href"))!;
    expect(href).toMatch(/^https:\/\/wa\.me\/570000000000\?text=/);
    const message = decodeURIComponent(href.split("text=")[1]);
    expect(message).toMatch(/Pedido #P-[A-Z2-9]{6}/);
    expect(message).toContain("Talla: S · Color: Arena");
    expect(message).toMatch(/Total: \$\s96\.000/);
  });

  test("vaciar carrito pide confirmación", async ({ page }) => {
    await page.goto("/producto/blusa-seda-demo");
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Agregar al carrito" }).click();
    await page.goto("/carrito");
    await page.getByRole("button", { name: "Vaciar carrito" }).click();
    await page.getByRole("button", { name: "Sí, vaciar" }).click();
    await expect(page.getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
  });

  test("404 para páginas y productos inexistentes", async ({ page }) => {
    expect((await page.goto("/no-existe"))?.status()).toBe(404);
    // Next.js puede responder 200 la primera vez (streaming) pero siempre con la página 404 y noindex.
    await page.goto(`/producto/no-existe-${test.info().project.name}`);
    await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("panel", () => {
  test("sin sesión redirige al login y rechaza credenciales incorrectas", async ({ page }) => {
    await page.goto("/admin/productos");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.getByLabel("Correo").fill("e2e@tienda.local");
    await page.getByLabel("Contraseña").fill("incorrecta-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
  });

  test("login, pedido registrado y cierre de sesión", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill("e2e@tienda.local");
    await page.getByLabel("Contraseña").fill("e2e-clave-de-prueba");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("heading", { name: "Hola" })).toBeVisible();

    await page.goto("/admin/pedidos");
    await expect(page.getByText(/^P-[A-Z2-9]{6}$/).first()).toBeVisible();

    // Un producto creado en el panel aparece en la tienda sin recompilar.
    const name = `Producto nuevo ${test.info().project.name}`;
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Nombre", { exact: true }).fill(name);
    await page.locator('select[name="categoryId"]').selectOption({ label: "Vestidos" });
    await page.getByLabel("Precio (COP)").fill("88000");
    await page.getByLabel("Stock talla M, color Arena").fill("3");
    await page.getByRole("button", { name: "Crear producto" }).click();
    await expect(page.getByText("Producto creado.")).toBeVisible();
    await page.goto(`/producto/producto-nuevo-${test.info().project.name}`);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await page.goto("/catalogo?categoria=vestidos");
    await expect(page.getByRole("link", { name })).toBeVisible();

    await page.goto("/admin");
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test("sin scroll horizontal en ninguna página (móvil)", async ({ page }) => {
  test.skip(test.info().project.name !== "movil", "Solo aplica a pantallas pequeñas");
  for (const path of ["/", "/catalogo", "/producto/vestido-midi-lino-demo", "/carrito", "/contacto", "/admin/login", "/no-existe"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `scroll horizontal en ${path}`).toBeLessThanOrEqual(0);
  }
});
