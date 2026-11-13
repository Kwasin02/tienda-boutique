import { describe, expect, it } from "vitest";
import { detectImageType, SAFE_NAME } from "@/services/uploads";

const bytes = (...xs: number[]) => new Uint8Array(xs);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("validación de imágenes", () => {
  it("reconoce JPEG, PNG y WebP por su contenido", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(detectImageType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("webp");
  });
  it("rechaza otros archivos aunque se llamen .jpg", () => {
    expect(detectImageType(bytes(...ascii("<svg onload=alert(1)>")))).toBeNull();
    expect(detectImageType(bytes(...ascii("%PDF-1.7")))).toBeNull();
    expect(detectImageType(bytes())).toBeNull();
  });
  it("solo acepta nombres generados por la tienda", () => {
    expect(SAFE_NAME.test("3f2b8c1e-1d2a-4b5c-9d8e-0123456789ab.webp")).toBe(true);
    expect(SAFE_NAME.test("../../.env.local")).toBe(false);
    expect(SAFE_NAME.test("foto.svg")).toBe(false);
  });
});
