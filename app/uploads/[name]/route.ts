import { readFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_TYPES, SAFE_NAME, UPLOAD_DIR, type ImageExt } from "@/services/uploads";

// Sirve las fotos subidas desde el panel (están fuera de public/ porque public/ solo incluye
// lo que existe al compilar).
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[name]">) {
  const { name } = await params;
  if (!SAFE_NAME.test(name)) return new Response("No encontrado", { status: 404 });
  try {
    const file = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(file, {
      headers: {
        "Content-Type": IMAGE_TYPES[name.split(".").pop() as ImageExt],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
