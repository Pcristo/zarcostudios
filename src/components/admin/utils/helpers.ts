export const normalizeStatus = (statusStr: string | undefined): string => {
  const s = (statusStr || "").toUpperCase();
  if (s === "DRAFT") return "DRAFT";
  if (s === "SENT" || s === "PENDING") return "PENDING";
  if (s === "PAID") return "PAID";
  if (s === "OVERDUE" || s === "UNPAID") return "UNPAID";
  if (s === "CANCELLED" || s === "VOID") return "VOID";
  if (s === "DUPLICATE") return "DUPLICATE";
  return s || "DRAFT";
};

export const sanitizeId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9-_]/g, "");
};
