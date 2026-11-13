// Subida de fotos desde el panel. Se valida el contenido real del archivo (bytes iniciales),
// no solo la extensión o el tipo que declara el navegador. Se guardan con nombre aleatorio.

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "storage/uploads");
export const MAX_FILES_PER_UPLOAD = 5;
const maxBytes = () => Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024;

export const IMAGE_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
export type ImageExt = keyof typeof IMAGE_TYPES;

/** Reconoce JPEG, PNG y WebP por su firma binaria. */
export function detectImageType(b: Uint8Array): ImageExt | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((x, i) => b[i] === x)) return "png";
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

/** Solo nombres generados por nosotros: evita rutas tipo ../../ */
export const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** Toma los archivos de un campo del formulario; ignora los vacíos (input sin selección). */
export function filesFrom(formData: FormData, field: string) {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
}

/** Valida y guarda. Devuelve las URLs públicas o lanza un Error con mensaje para el usuario. */
export async function saveImages(files: File[]): Promise<string[]> {
  if (files.length > MAX_FILES_PER_UPLOAD) throw new Error(`Sube como máximo ${MAX_FILES_PER_UPLOAD} fotos a la vez.`);
  const prepared: { name: string; bytes: Uint8Array }[] = [];
  for (const file of files) {
    if (file.size > maxBytes()) throw new Error(`"${file.name}" pesa más de ${process.env.MAX_UPLOAD_MB || 5} MB.`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = detectImageType(bytes);
    if (!ext) throw new Error(`"${file.name}" no es una imagen JPG, PNG o WebP válida.`);
    prepared.push({ name: `${randomUUID()}.${ext}`, bytes });
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  for (const p of prepared) await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, p.name), p.bytes);
  return prepared.map((p) => `/uploads/${p.name}`);
}

export async function deleteImage(url: string) {
  const name = url.replace(/^\/uploads\//, "");
  if (!SAFE_NAME.test(name)) return;
  await unlink(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name)).catch(() => {}); // si ya no existe, no pasa nada
}
