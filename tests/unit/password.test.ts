import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/services/auth/password";

describe("contraseñas", () => {
  it("verifica la correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("una-clave-segura");
    expect(hash).not.toContain("una-clave-segura");
    expect(await verifyPassword("una-clave-segura", hash)).toBe(true);
    expect(await verifyPassword("otra-clave-segura", hash)).toBe(false);
  });
  it("genera hashes distintos para la misma clave (sal aleatoria)", async () => {
    expect(await hashPassword("una-clave-segura")).not.toBe(await hashPassword("una-clave-segura"));
  });
  it("rechaza claves cortas y hashes mal formados", async () => {
    await expect(hashPassword("corta")).rejects.toThrow();
    expect(await verifyPassword("x", "basura")).toBe(false);
  });
});
