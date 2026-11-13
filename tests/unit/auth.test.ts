import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/services/auth/rate-limit";
import { createToken, passwordFingerprint, readToken } from "@/services/auth/token";

const SECRET = "s".repeat(40);
const payload = { uid: 1, pv: passwordFingerprint("hash"), exp: Date.now() + 60_000 };

describe("token de sesión", () => {
  it("acepta un token válido", () => {
    expect(readToken(createToken(payload, SECRET), SECRET)).toMatchObject({ uid: 1 });
  });
  it("rechaza tokens alterados, con otra clave o vencidos", () => {
    const token = createToken(payload, SECRET);
    const [data, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, uid: 2 })).toString("base64url");
    expect(readToken(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(readToken(`${data}.x${sig}`, SECRET)).toBeNull();
    expect(readToken(token, "otra".repeat(10))).toBeNull();
    expect(readToken(createToken({ ...payload, exp: Date.now() - 1 }, SECRET), SECRET)).toBeNull();
    expect(readToken("basura", SECRET)).toBeNull();
    expect(readToken(undefined, SECRET)).toBeNull();
  });
  it("la huella cambia al cambiar la contraseña", () => {
    expect(passwordFingerprint("a")).not.toBe(passwordFingerprint("b"));
  });
});

describe("límite de intentos", () => {
  it("bloquea tras el máximo y se libera al pasar la ventana", () => {
    const rl = createRateLimiter(2, 1000);
    rl.hit("ip", 0);
    expect(rl.isBlocked("ip", 10)).toBe(false);
    rl.hit("ip", 20);
    expect(rl.isBlocked("ip", 30)).toBe(true);
    expect(rl.isBlocked("ip", 2000)).toBe(false);
  });
});
