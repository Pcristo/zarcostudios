import { isAssetExpiringSoon } from "./dates";
import { ClientProject } from "../types/project";

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

export const getProjectExpiringAssetsCount = (proj: ClientProject) => {
  let count = 0;
  if (proj.domainName && isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)) {
    count++;
  }
  if (proj.hosts) {
    proj.hosts.forEach((h) => {
      if (h.domainName && isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)) {
        count++;
      }
    });
  }
  return count;
};

export const getProjectUnreadExpiringAssetsCount = (proj: ClientProject, seenExpiringAssetIds: string[]) => {
  let count = 0;
  if (proj.domainName && isAssetExpiringSoon(proj.domainExpiration, proj.isHostingFree, proj.showDomainExpiration)) {
    const assetId = `${proj.id}-${proj.domainName}`;
    if (!seenExpiringAssetIds.includes(assetId)) {
      count++;
    }
  }
  if (proj.hosts) {
    proj.hosts.forEach((h) => {
      if (h.domainName && isAssetExpiringSoon(h.domainExpiration, h.isHostingFree, h.showDomainExpiration)) {
        const assetId = `${proj.id}-${h.domainName}`;
        if (!seenExpiringAssetIds.includes(assetId)) {
          count++;
        }
      }
    });
  }
  return count;
};
