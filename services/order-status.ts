export const ORDER_STATUSES = {
  pendiente: { label: "Pendiente", className: "bg-arena" },
  confirmado: { label: "Confirmado", className: "bg-salvia/50" },
  entregado: { label: "Entregado", className: "bg-bosque text-marfil" },
  cancelado: { label: "Cancelado", className: "bg-red-50 text-red-900" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export const statusInfo = (s: string) => ORDER_STATUSES[s as OrderStatus] ?? ORDER_STATUSES.pendiente;
