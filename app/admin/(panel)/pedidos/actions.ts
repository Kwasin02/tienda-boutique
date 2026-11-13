"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { ORDER_STATUSES } from "@/services/order-status";

export async function updateOrderStatus(fd: FormData) {
  await requireAdmin();
  const code = String(fd.get("code") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!(status in ORDER_STATUSES)) return;
  await db.order.update({ where: { code }, data: { status } }).catch(() => null);
  revalidatePath("/admin/pedidos");
}
