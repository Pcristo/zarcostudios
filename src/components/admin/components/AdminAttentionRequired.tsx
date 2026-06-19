import React from "react";
import { Card } from "@/components/ui/card";
import { Star, MessageSquare, Globe, X } from "lucide-react";
import { Review, FeedbackAlert, ExpiringAsset, ClientProject, AdminView } from "../types";

// Note: To be secure and avoid any missing fields in types, we extend the prop declarations
interface AdminAttentionRequiredProps {
  newReviewsCount: number;
  newFeedbackCount: number;
  expiringAssetsCount: number;
  unreadReviews: Review[];
  unreadFeedbacks: FeedbackAlert[];
  unreadExpiringAssets: ExpiringAsset[];
  seenReviewIds: string[];
  setSeenReviewIds: React.Dispatch<React.SetStateAction<string[]>>;
  seenFeedbackIds: string[];
  setSeenFeedbackIds: React.Dispatch<React.SetStateAction<string[]>>;
  seenExpiringAssetIds: string[];
  setSeenExpiringAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  clientProjects: ClientProject[];
  setView: (view: AdminView) => void;
  setEditingClientProject: (project: ClientProject) => void;
}

export function AdminAttentionRequired({
  newReviewsCount,
  newFeedbackCount,
  expiringAssetsCount,
  unreadReviews,
  unreadFeedbacks,
  unreadExpiringAssets,
  seenReviewIds,
  setSeenReviewIds,
  seenFeedbackIds,
  setSeenFeedbackIds,
  seenExpiringAssetIds,
  setSeenExpiringAssetIds,
  clientProjects,
  setView,
  setEditingClientProject,
}: AdminAttentionRequiredProps) {
  const hasAlerts = unreadReviews.length > 0 || unreadFeedbacks.length > 0 || unreadExpiringAssets.length > 0;

  if (!hasAlerts) return null;

  return (
    <Card className="bg-red-500/[0.01] border border-red-500/15 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden text-left">
      <span className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-red-500/5 blur-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Attention Required ({newReviewsCount + newFeedbackCount + expiringAssetsCount} New Alerts)
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              // Mark all unread reviews as seen
              const reviewIds = unreadReviews.map((r) => r.id);
              if (reviewIds.length > 0) {
                const updated = Array.from(new Set([...seenReviewIds, ...reviewIds]));
                setSeenReviewIds(updated);
                localStorage.setItem("zarco_seen_review_ids", JSON.stringify(updated));
              }
              // Mark all unread feedbacks as seen
              const fbIds = unreadFeedbacks.map((fb) => fb.id);
              if (fbIds.length > 0) {
                const updated = Array.from(new Set([...seenFeedbackIds, ...fbIds]));
                setSeenFeedbackIds(updated);
                localStorage.setItem("zarco_seen_feedback_ids", JSON.stringify(updated));
              }
              // Mark all unread expiring assets as seen
              const expiringIds = unreadExpiringAssets.map((asset) => `${asset.projectId}-${asset.assetName}`);
              if (expiringIds.length > 0) {
                const updated = Array.from(new Set([...seenExpiringAssetIds, ...expiringIds]));
                setSeenExpiringAssetIds(updated);
                localStorage.setItem("zarco_seen_expiring_asset_ids", JSON.stringify(updated));
              }
            }}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            Acknowledge All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Unapproved Reviews segment */}
        {unreadReviews.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-black tracking-widest text-[#4fd1dc] flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              Pending Public Testimonials ({unreadReviews.length})
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {unreadReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-[#0a1114]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider text-left">{r.name}</span>
                    <span className="text-[9px] font-mono text-white/40 block mt-0.5 uppercase tracking-widest text-left">{r.companyName}</span>
                    <p className="text-[11px] text-white/50 italic mt-1 line-clamp-1 text-left">"{r.reviewTextEn || r.reviewTextPt}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView("reviews-list");
                      }}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zarco-cyan/15 text-zarco-cyan border border-zarco-cyan/25 hover:bg-zarco-cyan hover:text-black transition-all cursor-pointer"
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...seenReviewIds, r.id];
                        setSeenReviewIds(updated);
                        localStorage.setItem("zarco_seen_review_ids", JSON.stringify(updated));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unread Client Feedbacks segment */}
        {unreadFeedbacks.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-black tracking-widest text-[#4fd1dc] flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-zarco-cyan" />
              New Customer Feedback Logs ({unreadFeedbacks.length})
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {unreadFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-2xl bg-[#0a1114]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider text-left">{fb.project.projectName}</span>
                    <span className="text-[9px] font-mono text-white/50 block mt-0.5 uppercase tracking-widest text-left">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                    <p className="text-[11px] text-white/40 italic mt-1 line-clamp-1 text-left">"{fb.text}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClientProject(fb.project);
                        setView("client-project-form");
                      }}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zarco-cyan/15 text-zarco-cyan border border-zarco-cyan/25 hover:bg-zarco-cyan hover:text-black transition-all cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...seenFeedbackIds, fb.id];
                        setSeenFeedbackIds(updated);
                        localStorage.setItem("zarco_seen_feedback_ids", JSON.stringify(updated));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiring Domains/Assets segment */}
        {unreadExpiringAssets.length > 0 && (
          <div className="space-y-3 col-span-1 lg:col-span-2 border-t border-white/[0.05] pt-6 first:border-0 first:pt-0">
            <div className="text-[10px] uppercase font-black tracking-widest text-[#ef4444] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 animate-pulse text-red-500" />
              Expiring Managed Assets / Domains ({unreadExpiringAssets.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-left">
              {unreadExpiringAssets.map((asset, idx) => {
                const proj = clientProjects.find((p) => p.id === asset.projectId);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#0a1114]/80 border border-red-500/10 hover:border-red-500/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="text-left flex items-start gap-2.5">
                      <span className="flex h-2 w-2 relative mt-1 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block uppercase tracking-wider text-left max-w-[200px] truncate" title={asset.assetName}>
                          {asset.assetName}
                        </span>
                        <span className="text-[9px] font-mono text-white/50 block mt-0.5 uppercase tracking-widest text-left">
                          Project: {asset.projectName}
                        </span>
                        <span
                          className={`text-[10px] font-bold block mt-1 uppercase ${
                            asset.daysRemaining <= 0 ? "text-red-500 font-black" : asset.daysRemaining <= 7 ? "text-red-400" : "text-yellow-500"
                          }`}
                        >
                          {asset.daysRemaining < 0
                            ? `Expired ${Math.abs(asset.daysRemaining)} Days Ago!`
                            : asset.daysRemaining === 0
                            ? "Expires Today!"
                            : `Expires in ${asset.daysRemaining} Days (${new Date(asset.expirationDate).toLocaleDateString()})`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (proj) {
                            setEditingClientProject(proj);
                            setView("client-project-form");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      >
                        Manage Asset
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const assetId = `${asset.projectId}-${asset.assetName}`;
                          const updated = [...seenExpiringAssetIds, assetId];
                          setSeenExpiringAssetIds(updated);
                          localStorage.setItem("zarco_seen_expiring_asset_ids", JSON.stringify(updated));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Dismiss alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
