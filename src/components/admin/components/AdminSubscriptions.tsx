import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CreditCard, Mail, Eye, EyeOff, Loader2, X, Trash2 } from "lucide-react";
import { Client, ClientProject, AdminView } from "../types";
import { setDoc } from "firebase/firestore";

interface AdminSubscriptionsProps {
  clientProjects: ClientProject[];
  setClientProjects: React.Dispatch<React.SetStateAction<ClientProject[]>>;
  clients: Client[];
  subSearchQuery: string;
  setSubSearchQuery: (query: string) => void;
  subFilterStatus: "all" | "active" | "pending" | "cancelled";
  setSubFilterStatus: (status: "all" | "active" | "pending" | "cancelled") => void;
  setEditingClientProject: (project: ClientProject) => void;
  setView: (view: AdminView) => void;
  handleGenerateInvoiceFromSubscription: (project: ClientProject) => void;
  handleDeleteClientProject?: (id: string) => Promise<void>;
  showAdminToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  db: any;
  updateDoc: any;
  doc: any;
}

export function AdminSubscriptions({
  clientProjects,
  setClientProjects,
  clients,
  subSearchQuery,
  setSubSearchQuery,
  subFilterStatus,
  setSubFilterStatus,
  setEditingClientProject,
  setView,
  handleGenerateInvoiceFromSubscription,
  handleDeleteClientProject,
  showAdminToast,
  db,
  updateDoc,
  doc,
}: AdminSubscriptionsProps) {
  const [confirmingDeactivate, setConfirmingDeactivate] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [subFilterYear, setSubFilterYear] = useState<string>("all");

  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      yearsSet.add((currentYear - i).toString());
    }
    clientProjects.forEach((p) => {
      if (p.subscriptionPaidAt) {
        try {
          const y = new Date(p.subscriptionPaidAt).getFullYear().toString();
          if (y && y.length === 4) yearsSet.add(y);
        } catch (e) {}
      }
      if (p.createdAt) {
        try {
          let d: Date;
          if (typeof p.createdAt?.toDate === "function") {
            d = p.createdAt.toDate();
          } else {
            d = new Date(p.createdAt);
          }
          const y = d.getFullYear().toString();
          if (y && y.length === 4) yearsSet.add(y);
        } catch (e) {}
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [clientProjects]);

  const subscriptionProjects = clientProjects.filter((p) => {
    if (!p.hasSubscription) return false;
    if (subFilterYear === "all") return true;

    // Check subscriptionPaidAt
    if (p.subscriptionPaidAt) {
      try {
        const y = new Date(p.subscriptionPaidAt).getFullYear().toString();
        if (y === subFilterYear) return true;
      } catch (e) {}
    }

    // Check createdAt
    if (p.createdAt) {
      try {
        let d: Date;
        if (typeof p.createdAt?.toDate === "function") {
          d = p.createdAt.toDate();
        } else {
          d = new Date(p.createdAt);
        }
        const y = d.getFullYear().toString();
        if (y === subFilterYear) return true;
      } catch (e) {}
    }

    return false;
  });

  const activeSubsCount = subscriptionProjects.filter((p) => p.subscriptionPaid && !p.subscriptionCancelled).length;
  const cancelledSubsCount = subscriptionProjects.filter((p) => p.subscriptionCancelled).length;
  const pendingSubsCount = subscriptionProjects.filter((p) => !p.subscriptionPaid && !p.subscriptionCancelled).length;
  const totalSubsCount = subscriptionProjects.length;

  const estMRR = subscriptionProjects
    .filter((p) => p.subscriptionPaid && !p.subscriptionCancelled)
    .reduce((sum, p) => {
      const price = Number(p.subscriptionPrice || 0);
      if (p.subscriptionInterval === "yearly") {
        return sum + price / 12;
      }
      return sum + price;
    }, 0);

  const estARR = estMRR * 12;

  const totalChargedSoFar = subscriptionProjects.reduce((sum, p) => {
    const price = Number(p.subscriptionPrice || 0);
    const countVal = p.subscriptionPaidCountPriorCancellation;
    let timesPaid = 0;
    
    if (countVal !== undefined && countVal !== null && countVal !== "") {
      timesPaid = Number(countVal) || 0;
    } else {
      timesPaid = p.subscriptionPaid && !p.subscriptionCancelled ? 1 : 0;
    }
    
    return sum + (price * timesPaid);
  }, 0);

  const filteredSubs = subscriptionProjects.filter((p) => {
    const clientObj = clients.find((c) => c.id === p.clientId);
    const searchLower = subSearchQuery.toLowerCase();

    const matchesSearch =
      p.projectName.toLowerCase().includes(searchLower) ||
      (p.subscriptionTitle || "").toLowerCase().includes(searchLower) ||
      (clientObj?.fullName || "").toLowerCase().includes(searchLower) ||
      (clientObj?.email || "").toLowerCase().includes(searchLower) ||
      (clientObj?.companyName || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      subFilterStatus === "all" ||
      (subFilterStatus === "active" && p.subscriptionPaid && !p.subscriptionCancelled) ||
      (subFilterStatus === "pending" && !p.subscriptionPaid && !p.subscriptionCancelled) ||
      (subFilterStatus === "cancelled" && p.subscriptionCancelled);

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-subscriptions-content" className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zarco-cyan/10 border border-zarco-cyan/20">
            <CreditCard className="w-3 h-3 text-zarco-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">Recurring Billing</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Project <span className="text-zarco-cyan">Subscriptions</span>
          </h1>
          <p className="text-white/40 font-medium max-w-md">
            Manage active recurring support and maintenance plans linked to projects and customers.
          </p>
        </div>
      </div>

      {/* Quick Stats Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-[#080d0f] border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Active Subscriptions</span>
            <span className="text-2xl font-black text-zarco-cyan block">
              {activeSubsCount} <span className="text-xs text-white/40 font-normal">/ {totalSubsCount} total</span>
            </span>
          </div>
        </Card>
        <Card className="bg-[#080d0f] border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Est. Monthly Revenue (MRR)</span>
            <span className="text-2xl font-black text-green-400 block">
              €{estMRR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
        <Card className="bg-[#080d0f] border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Est. Annual Revenue (ARR)</span>
            <span className="text-2xl font-black text-white block">
              €{estARR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
        <Card className="bg-[#080d0f] border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Total Paid</span>
            <span className="text-2xl font-black text-[#5ce1e6] block">
              €{totalChargedSoFar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
        <Card className="bg-[#080d0f] border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Collection Rate</span>
            <span className="text-2xl font-black text-white/90 block">
              {totalSubsCount > 0 ? Math.round((activeSubsCount / totalSubsCount) * 100) : 0}%
            </span>
          </div>
        </Card>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search project or customer..."
              value={subSearchQuery}
              onChange={(e) => setSubSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-black/40 border-white/5 hover:border-white/10 rounded-xl text-xs uppercase tracking-wider text-white font-bold w-full sm:w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span className="text-[9px] font-black uppercase text-white/30 tracking-wider">Year:</span>
            <select
              value={subFilterYear}
              onChange={(e) => setSubFilterYear(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black text-zarco-cyan focus:outline-none focus:border-zarco-cyan h-10 uppercase"
            >
              <option value="all">ALL YEARS</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto self-stretch md:self-auto">
          <button
            onClick={() => setSubFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              subFilterStatus === "all" ? "bg-white/10 text-white shadow-md border border-white/5" : "text-white/40 hover:text-white"
            }`}
          >
            All ({totalSubsCount})
          </button>
          <button
            onClick={() => setSubFilterStatus("active")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              subFilterStatus === "active" ? "bg-green-500/10 text-green-400 shadow-md border border-green-500/10" : "text-white/40 hover:text-white"
            }`}
          >
            Active ({activeSubsCount})
          </button>
          <button
            onClick={() => setSubFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              subFilterStatus === "pending" ? "bg-orange-500/10 text-orange-400 shadow-md border border-orange-500/10" : "text-white/40 hover:text-white"
            }`}
          >
            Pending ({pendingSubsCount})
          </button>
          <button
            onClick={() => setSubFilterStatus("cancelled")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              subFilterStatus === "cancelled" ? "bg-red-500/10 text-red-500 shadow-md border border-red-500/10" : "text-white/40 hover:text-white"
            }`}
          >
            Cancelled ({cancelledSubsCount})
          </button>
        </div>
      </div>

      {/* List */}
      {filteredSubs.length === 0 ? (
        <Card className="bg-[#080d0f] border-white/5 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">No Subscriptions Found</h3>
          <p className="text-white/40 text-xs font-semibold max-w-sm mx-auto uppercase tracking-wider">
            No subscriptions match your search or filter status. Configure support subscriptions in your projects under Project Management.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubs.map((proj) => {
            const clientObj = clients.find((c) => c.id === proj.clientId);
            const nextRenewal = () => {
              const paidAt = proj.subscriptionPaidAt ? new Date(proj.subscriptionPaidAt) : new Date();
              if (proj.subscriptionInterval === "yearly") {
                paidAt.setFullYear(paidAt.getFullYear() + 1);
              } else {
                paidAt.setMonth(paidAt.getMonth() + 1);
              }
              return paidAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
            };

            return (
              <Card key={proj.id} className="bg-[#080d0f] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/10 transition-all text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* 1. Project & Client Info */}
                  <div className="lg:col-span-4 space-y-3">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#4fd1dc] bg-[#4fd1dc]/10 border border-[#4fd1dc]/20 px-2 py-0.5 rounded-full inline-block mb-1.5">
                        {proj.projectType}
                      </span>
                      <h3
                        className="text-lg font-black text-white hover:text-zarco-cyan cursor-pointer transition-colors"
                        onClick={() => {
                          setEditingClientProject(proj);
                          setView("client-project-form");
                        }}
                      >
                        {proj.projectName}
                      </h3>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1.5">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Customer Info</span>
                      {clientObj ? (
                        <div className="text-xs space-y-1 font-bold">
                          <span className="text-white block uppercase tracking-tight">{clientObj.fullName}</span>
                          {clientObj.companyName && (
                            <span className="text-white/60 block text-[10px] uppercase tracking-wider">{clientObj.companyName}</span>
                          )}
                          <span className="text-[#4fd1dc]/80 text-[10px] block font-mono tracking-normal">{clientObj.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No Client Linked</span>
                      )}
                    </div>
                  </div>

                  {/* 2. Subscription Details */}
                  <div className="lg:col-span-3 space-y-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Plan Title</span>
                      <span className="text-sm font-bold text-white block uppercase tracking-tight">{proj.subscriptionTitle || "Support Plan"}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Price & Cycle</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-white">€{Number(proj.subscriptionPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[9px] font-black text-zarco-cyan uppercase tracking-widest font-mono">/ {proj.subscriptionInterval || "monthly"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30 block">
                        Times Paid
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={proj.subscriptionPaidCountPriorCancellation ?? ""}
                          onChange={async (e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            try {
                              const projectRef = doc(db, "clientProjects", proj.id);
                              await updateDoc(projectRef, {
                                subscriptionPaidCountPriorCancellation: val,
                                updatedAt: new Date(),
                              });
                              setClientProjects((prev) =>
                                prev.map((p) =>
                                  p.id === proj.id
                                    ? { ...p, subscriptionPaidCountPriorCancellation: val }
                                    : p
                                )
                              );
                            } catch (err) {
                              console.error("Error updating paid count:", err);
                            }
                          }}
                          placeholder="0"
                          className="w-16 h-8 rounded-lg border border-white/10 bg-black/40 text-white font-mono text-xs text-center focus:outline-none focus:border-zarco-cyan"
                        />
                        <span className="text-[9px] font-medium text-white/40 uppercase tracking-tight">charges</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Dates & Status */}
                  <div className="lg:col-span-3 space-y-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Status</span>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            proj.subscriptionCancelled
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : proj.subscriptionPaid
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${proj.subscriptionCancelled ? "bg-red-400 animate-pulse" : proj.subscriptionPaid ? "bg-green-400 animate-pulse" : "bg-amber-500"}`} />
                          {proj.subscriptionCancelled 
                            ? (proj.subscriptionCancelledBy === 'customer' ? "Cancelled by Client" : "Cancelled by Admin") 
                            : proj.subscriptionPaid ? "Active & Paid" : "Unpaid / Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block">Last Payment</span>
                        <span className="text-[10px] font-bold text-white/80 font-mono block">
                          {proj.subscriptionPaidAt ? new Date(proj.subscriptionPaidAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block">Next Payment</span>
                        <span className="text-[10px] font-bold text-zarco-cyan font-mono block">{nextRenewal()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Controls */}
                  <div className="lg:col-span-2 flex flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    <Button
                      onClick={async () => {
                        try {
                          const projectRef = doc(db, "clientProjects", proj.id);
                          const newPaidStatus = !proj.subscriptionPaid;
                          const newPaidAt = newPaidStatus ? new Date().toISOString() : null;

                          await updateDoc(projectRef, {
                            subscriptionPaid: newPaidStatus,
                            subscriptionPaidAt: newPaidAt,
                            subscriptionCancelled: newPaidStatus ? false : (proj.subscriptionCancelled || false),
                            subscriptionCancelledBy: newPaidStatus ? null : (proj.subscriptionCancelledBy || null),
                            updatedAt: new Date(),
                          });

                          // Update State
                          setClientProjects((prev) =>
                            prev.map((p) => {
                              if (p.id === proj.id) {
                                return {
                                  ...p,
                                  subscriptionPaid: newPaidStatus,
                                  subscriptionPaidAt: newPaidStatus ? newPaidAt || undefined : undefined,
                                  subscriptionCancelled: newPaidStatus ? false : (p.subscriptionCancelled || false),
                                  subscriptionCancelledBy: newPaidStatus ? undefined : p.subscriptionCancelledBy,
                                };
                              }
                              return p;
                            })
                          );

                          showAdminToast(newPaidStatus ? "Subscription marked as Active & Paid!" : "Subscription marked as Unpaid.", newPaidStatus ? "success" : "warning");
                        } catch (err: any) {
                          console.error("Error toggling subscription paid status:", err);
                          showAdminToast("Failed to update subscription status.", "error");
                        }
                      }}
                      className={`w-full py-2.5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        proj.subscriptionPaid
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black hover:border-transparent"
                          : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500 hover:text-black hover:border-transparent"
                      }`}
                    >
                      {proj.subscriptionPaid ? "Mark Unpaid" : "Mark Paid"}
                    </Button>

                    <Button
                      onClick={() => {
                        setEditingClientProject(proj);
                        setView("client-project-form");
                      }}
                      className="w-full py-2.5 h-10 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5"
                    >
                      Edit Settings
                    </Button>

                    <Button
                      onClick={() => handleGenerateInvoiceFromSubscription(proj)}
                      className="w-full py-2.5 h-10 bg-zarco-cyan/10 hover:bg-zarco-cyan/20 text-zarco-cyan rounded-xl text-[9px] font-black uppercase tracking-widest border border-zarco-cyan/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      Create Bill
                    </Button>

                    {confirmingDeactivate === proj.id ? (
                      <div className="flex flex-col gap-2 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 w-full mt-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400 text-center block">
                          Are you sure you want to deactivate?
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              try {
                                const projectRef = doc(db, "clientProjects", proj.id);
                                await updateDoc(projectRef, {
                                  subscriptionPaid: false,
                                  subscriptionCancelled: true,
                                  subscriptionCancelledBy: 'admin',
                                  updatedAt: new Date(),
                                });

                                // Update State
                                setClientProjects((prev) =>
                                  prev.map((p) => {
                                    if (p.id === proj.id) {
                                      return {
                                        ...p,
                                        subscriptionPaid: false,
                                        subscriptionCancelled: true,
                                        subscriptionCancelledBy: 'admin',
                                      };
                                    }
                                    return p;
                                  })
                                );

                                showAdminToast("Subscription deactivated successfully.", "success");
                              } catch (err: any) {
                                console.error("Error deactivating subscription:", err);
                                showAdminToast("Failed to deactivate subscription.", "error");
                              } finally {
                                setConfirmingDeactivate(null);
                              }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[8px] h-8 rounded-lg cursor-pointer border-none"
                          >
                            Yes
                          </Button>
                          <Button
                            onClick={() => setConfirmingDeactivate(null)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[8px] h-8 rounded-lg cursor-pointer border-none"
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    ) : confirmingDelete === proj.id ? (
                      <div className="flex flex-col gap-2 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 w-full mt-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400 text-center block">
                          Delete subscription from project?
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              try {
                                const projectRef = doc(db, "clientProjects", proj.id);
                                
                                // Move to trash first
                                await setDoc(doc(db, "trash", "sub_" + proj.id), {
                                  originalId: proj.id,
                                  type: "subscription",
                                  name: `${proj.projectName || "Unnamed Project"} - Subscription`,
                                  details: `${proj.subscriptionTitle || "Support Plan"} (€${proj.subscriptionPrice || "0"}/${proj.subscriptionInterval || "monthly"})`,
                                  deletedAt: new Date().toISOString(),
                                  originalCollection: "clientProjects",
                                  data: {
                                    hasSubscription: true,
                                    subscriptionTitle: proj.subscriptionTitle || null,
                                    subscriptionDescription: proj.subscriptionDescription || null,
                                    subscriptionInterval: proj.subscriptionInterval || "monthly",
                                    subscriptionPrice: proj.subscriptionPrice || 0,
                                    subscriptionEnabled: proj.subscriptionEnabled ?? true,
                                    subscriptionPaid: proj.subscriptionPaid ?? false,
                                    subscriptionPaidAt: proj.subscriptionPaidAt || null,
                                    subscriptionCancelled: proj.subscriptionCancelled ?? false,
                                    subscriptionCancelledBy: proj.subscriptionCancelledBy || null,
                                    subscriptionFeatures: proj.subscriptionFeatures || [],
                                  }
                                });

                                await updateDoc(projectRef, {
                                  hasSubscription: false,
                                  subscriptionPaid: false,
                                  subscriptionCancelled: false,
                                  subscriptionPaidAt: null,
                                  updatedAt: new Date(),
                                });

                                // Update State
                                setClientProjects((prev) =>
                                  prev.map((p) => {
                                    if (p.id === proj.id) {
                                      return {
                                        ...p,
                                        hasSubscription: false,
                                        subscriptionPaid: false,
                                        subscriptionCancelled: false,
                                        subscriptionPaidAt: undefined,
                                      };
                                    }
                                    return p;
                                  })
                                );

                                showAdminToast("Subscription deleted successfully.", "success");
                              } catch (err: any) {
                                console.error("Error deleting subscription:", err);
                                showAdminToast("Failed to delete subscription.", "error");
                              } finally {
                                setConfirmingDelete(null);
                              }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[8px] h-8 rounded-lg cursor-pointer border-none"
                          >
                            Yes
                          </Button>
                          <Button
                            onClick={() => setConfirmingDelete(null)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[8px] h-8 rounded-lg cursor-pointer border-none"
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full gap-1">
                        {proj.subscriptionCancelled ? (
                          <Button
                            onClick={async () => {
                              try {
                                const projectRef = doc(db, "clientProjects", proj.id);
                                await updateDoc(projectRef, {
                                  subscriptionCancelled: false,
                                  subscriptionCancelledBy: null,
                                  subscriptionPaid: true,
                                  updatedAt: new Date(),
                                });

                                // Update State
                                setClientProjects((prev) =>
                                  prev.map((p) => {
                                    if (p.id === proj.id) {
                                      return {
                                        ...p,
                                        subscriptionCancelled: false,
                                        subscriptionCancelledBy: undefined,
                                        subscriptionPaid: true,
                                      };
                                    }
                                    return p;
                                  })
                                );

                                showAdminToast("Subscription reactivated successfully.", "success");
                              } catch (err: any) {
                                console.error("Error reactivating subscription:", err);
                                showAdminToast("Failed to reactivate subscription.", "error");
                              }
                            }}
                            className="w-full py-1.5 h-8 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-[8px] font-bold uppercase tracking-wider border border-green-500/20 mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setConfirmingDeactivate(proj.id);
                            }}
                            className="w-full py-1.5 h-8 bg-transparent text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-xl text-[8px] font-bold uppercase tracking-wider border border-transparent hover:border-red-500/20 mt-1"
                          >
                            Deactivate
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            setConfirmingDelete(proj.id);
                          }}
                          className="w-full py-1.5 h-8 bg-transparent text-red-500/30 hover:text-red-500 hover:bg-red-500/5 rounded-xl text-[8px] font-bold uppercase tracking-wider border border-transparent hover:border-red-500/20 mt-1 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500/55" />
                          Delete Subscription
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
