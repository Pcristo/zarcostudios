import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  X,
  Star,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  ChevronDown,
  Upload,
  Loader2,
  Check,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Client, Invoice, AdminView, InvoiceItem } from "../../types";
import { normalizeStatus } from "../../utils/helpers";

interface AdminBillingProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  clients: Client[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  loadingInvoices: boolean;
  savingInvoice: boolean;
  editingInvoice: Invoice | null;
  setEditingInvoice: React.Dispatch<React.SetStateAction<Invoice | null>>;
  
  // States info
  analyticsYear: string;
  setAnalyticsYear: (year: string) => void;
  analyticsMonth: string;
  setAnalyticsMonth: (month: string) => void;
  billingTypeFilter: "all" | "project" | "subscription";
  setBillingTypeFilter: (filter: "all" | "project" | "subscription") => void;
  invoiceSearchQuery: string;
  setInvoiceSearchQuery: (query: string) => void;
  invoiceStatusFilter: string;
  setInvoiceStatusFilter: (filter: string) => void;
  invoiceConfirmingDelete: string | null;
  setInvoiceConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Handlers
  handleAddInvoice: () => void;
  handleEditInvoice: (inv: Invoice) => void;
  handleDeleteInvoice: (id: string) => Promise<void>;
  handleSaveInvoice: (e: React.FormEvent) => Promise<void>;
  handleGeneratePDF: (inv: Invoice) => void;
  handleViewInvoiceDetails: (inv: Invoice) => void;
}

export function AdminBilling({
  view,
  setView,
  clients,
  invoices,
  setInvoices,
  loadingInvoices,
  savingInvoice,
  editingInvoice,
  setEditingInvoice,
  
  analyticsYear,
  setAnalyticsYear,
  analyticsMonth,
  setAnalyticsMonth,
  billingTypeFilter,
  setBillingTypeFilter,
  invoiceSearchQuery,
  setInvoiceSearchQuery,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  invoiceConfirmingDelete,
  setInvoiceConfirmingDelete,
  
  handleAddInvoice,
  handleEditInvoice,
  handleDeleteInvoice,
  handleSaveInvoice,
  handleGeneratePDF,
  handleViewInvoiceDetails,
}: AdminBillingProps) {

  if (view === "billing-summary") {
    // Basic billing intelligence math
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => normalizeStatus(inv.status) === 'PAID');
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingCollection = totalInvoiced - totalCollected;

    return (
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              Financial Analytics
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Revenue breakdown by month and year.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Year</label>
              <select 
                value={analyticsYear}
                onChange={(e) => setAnalyticsYear(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-white/60 focus:outline-none focus:border-zarco-cyan h-12"
              >
                {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Month</label>
              <select 
                value={analyticsMonth}
                onChange={(e) => setAnalyticsMonth(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-white/60 focus:outline-none focus:border-zarco-cyan h-12"
              >
                <option value="All">ALL MONTHS</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={billingTypeFilter}
                onChange={(e) => setBillingTypeFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-zarco-cyan focus:outline-none focus:border-zarco-cyan h-12"
              >
                <option value="all">ALL PAYMENTS</option>
                <option value="project">PROJECT PAYMENTS</option>
                <option value="subscription">SUBSCRIPTIONS</option>
              </select>
            </div>
            <Button
              onClick={() => setView("billing-list")}
              className="bg-white/5 border border-white/10 text-white hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all font-black uppercase tracking-widest text-[9px] px-8 h-12 rounded-xl mt-auto"
            >
              Invoices Register
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-[#080d0f] border border-white/5 rounded-[2.5rem] p-8 text-center">
            <TrendingUp className="w-8 h-8 text-white/20 mx-auto mb-4" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-2">Gross Total Invoiced</span>
            <span className="text-3xl font-black text-white">€ {totalInvoiced.toLocaleString()}</span>
          </Card>
          <Card className="bg-[#080d0f] border border-white/5 rounded-[2.5rem] p-8 text-center">
            <Check className="w-8 h-8 text-green-500/20 mx-auto mb-4" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-2">Collected Revenue</span>
            <span className="text-3xl font-black text-green-500">€ {totalCollected.toLocaleString()}</span>
          </Card>
          <Card className="bg-[#080d0f] border border-white/5 rounded-[2.5rem] p-8 text-center">
            <Loader2 className="w-8 h-8 text-zarco-cyan/20 mx-auto mb-4" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-2">Outstanding Arrears</span>
            <span className="text-3xl font-black text-zarco-cyan">€ {pendingCollection.toLocaleString()}</span>
          </Card>
        </div>
      </div>
    );
  }

  if (view === "billing-list") {
    const filteredInvoices = invoices.filter(inv => {
      const client = clients.find(c => c.id === inv.clientId);
      const invoiceNo = inv.invoiceNumber || "";
      const query = invoiceSearchQuery.toLowerCase();
      
      const textMatches = 
        invoiceNo.toLowerCase().includes(query) ||
        (client?.fullName || "").toLowerCase().includes(query) ||
        (client?.companyName || "").toLowerCase().includes(query);

      const statusMatches = invoiceStatusFilter === "all" || normalizeStatus(inv.status) === invoiceStatusFilter.toUpperCase();

      return textMatches && statusMatches;
    });

    return (
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              Financial Registry
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Manage client billing records, invoice numbers, tax forms, and recurring cycles.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setView("billing-summary")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-8 h-14 hover:bg-white/5"
            >
              Analytics Dashboard
            </Button>
            <Button
              onClick={handleAddInvoice}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 h-14 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none flex items-center gap-2 shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Issue New Invoice
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              placeholder="Search invoices by client name or invoice tracking number..."
              className="w-full h-11 pl-12 pr-10 bg-[#0a1114] border border-white/5 hover:border-white/10 focus:border-zarco-cyan/50 transition-all rounded-xl text-xs font-bold uppercase tracking-wider text-white"
            />
          </div>
          <select
            value={invoiceStatusFilter}
            onChange={(e) => setInvoiceStatusFilter(e.target.value)}
            className="bg-[#0a1114] border border-white/5 rounded-xl px-4 text-xs font-black uppercase tracking-widest text-white/60 focus:outline-none focus:border-zarco-cyan h-11"
          >
            <option value="all">ALL INVOICES</option>
            <option value="paid">PAID ONLY</option>
            <option value="unpaid">UNPAID ONLY</option>
            <option value="draft">DRAFT ONLY</option>
          </select>
        </div>

        <div className="grid gap-4">
          {loadingInvoices ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-zarco-cyan animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading invoice register...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No matching invoices found.</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const client = clients.find(c => c.id === inv.clientId);
              return (
                <Card
                  key={inv.id}
                  onClick={() => handleViewInvoiceDetails(inv)}
                  className="bg-[#0a1114] border-white/5 hover:border-zarco-cyan/20 p-6 flex justify-between items-center transition-all cursor-pointer rounded-2xl"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase text-zarco-cyan tracking-widest block mb-1">
                      {inv.invoiceNumber} • {inv.issueDate}
                    </span>
                    <h3 className="text-lg font-black uppercase text-white mb-0.5">
                      {client ? client.fullName : "Unknown Client"}
                    </h3>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">
                      {client ? client.companyName : "No Company"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-lg font-black text-white block">
                        € {inv.amount.toLocaleString()}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        normalizeStatus(inv.status) === 'PAID' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {normalizeStatus(inv.status)}
                      </span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => handleEditInvoice(inv)}
                        className="py-2 px-4 text-[10px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border border-white/5 rounded-xl"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleGeneratePDF(inv)}
                        className="py-2 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                      >
                        PDF
                      </Button>
                      {invoiceConfirmingDelete === inv.id ? (
                        <div className="flex gap-2 animate-in fade-in duration-300">
                          <Button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 h-10 rounded-xl"
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setInvoiceConfirmingDelete(null)}
                            className="text-white/40 text-[9px] font-bold px-2 h-10 border border-white/5 rounded-xl"
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => setInvoiceConfirmingDelete(inv.id)}
                          className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (view === "billing-form" && editingInvoice) {
    return (
      <form onSubmit={handleSaveInvoice} className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">
              📝 Issue Invoice Form
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Set precise financial figures, item descriptions, and tax rates.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setView("billing-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-8 h-14 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={savingInvoice}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-8 h-14 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] flex items-center justify-center"
            >
              {savingInvoice ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Issue Registry"
              )}
            </Button>
          </div>
        </div>

        <Card className="bg-[#080d0f] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Associate Client Account
              </label>
              <select
                value={editingInvoice.clientId}
                onChange={(e) => setEditingInvoice({ ...editingInvoice, clientId: e.target.value })}
                className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-zarco-cyan"
              >
                <option value="">Select an on-boarded client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.companyName})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Invoice Number Tracking
              </label>
              <Input
                required
                value={editingInvoice.invoiceNumber || ""}
                onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })}
                placeholder="e.g. INVOICE-2026-004"
                className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Total Amount Due (€)
              </label>
              <Input
                required
                type="number"
                value={editingInvoice.amount || ""}
                onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) })}
                placeholder="e.g. 1500"
                className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Issue Date (DD/MM/YYYY)
              </label>
              <Input
                required
                value={editingInvoice.issueDate || ""}
                onChange={(e) => setEditingInvoice({ ...editingInvoice, issueDate: e.target.value })}
                placeholder="23/06/2026"
                className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Payment Status
              </label>
              <select
                value={editingInvoice.status}
                onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-zarco-cyan"
              >
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="DRAFT">DRAFT</option>
                <option value="VOID">VOID</option>
              </select>
            </div>
          </div>
        </Card>
      </form>
    );
  }

  return null;
}
