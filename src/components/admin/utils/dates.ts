export const parseFlexibleDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Try standard Date parsing first
  let d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = trimmed.split(/[-/.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      if (parts[0].length === 4) {
        d = new Date(p0, p1 - 1, p2);
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 4) {
        if (p1 <= 12) {
          d = new Date(p2, p1 - 1, p0);
        } else if (p0 <= 12) {
          d = new Date(p2, p0 - 1, p1);
        } else {
          d = new Date(p2, p1 - 1, p0);
        }
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 2) {
        const year = p2 + 2000;
        if (p1 <= 12) {
          d = new Date(year, p1 - 1, p0);
        } else if (p0 <= 12) {
          d = new Date(year, p0 - 1, p1);
        } else {
          d = new Date(year, p1 - 1, p0);
        }
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  return null;
};

export const isAssetExpiringSoon = (
  expirationDate: string | undefined,
  isFree?: boolean | string,
  showExp?: boolean | string
): boolean => {
  if (!expirationDate) return false;

  const isFreeBool = isFree === true || String(isFree).toLowerCase() === "true";
  const showExpBool = showExp === true || String(showExp).toLowerCase() === "true";
  if (isFreeBool && !showExpBool) return false;

  const exp = parseFlexibleDate(expirationDate);
  if (!exp || isNaN(exp.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Expiring within 30 days or already expired
  return diffDays <= 30;
};

export const getRenewalTheme = (expirationDate: string, isFree?: boolean): string => {
  if (!expirationDate) return "text-white/20";

  const exp = parseFlexibleDate(expirationDate);
  if (!exp || isNaN(exp.getTime())) return "text-white/20";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30)
    return "text-white font-bold bg-red-600 px-2 py-0.5 rounded border border-red-500 uppercase tracking-tighter animate-pulse";

  return "text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-tighter font-black";
};
