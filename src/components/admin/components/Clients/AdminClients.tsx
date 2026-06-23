import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Users,
  Instagram,
  Facebook,
  Linkedin,
  Loader2,
  X,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import { Client, ClientProject, Invoice, AdminView } from "../../types";
import { normalizeStatus } from "../../utils/helpers";

interface AdminClientsProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  clients: Client[];
  loadingClients: boolean;
  savingClient: boolean;
  editingClient: Client | null;
  setEditingClient: React.Dispatch<React.SetStateAction<Client | null>>;
  clientProjects: ClientProject[];
  invoices: Invoice[];
  clientConfirmingDelete: string | null;
  setClientConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  handleViewClient: (client: Client) => void;
  handleEditClient: (client: Client) => void;
  handleAddClient: () => void;
  handleDeleteClient: (id: string) => Promise<void>;
  handleSaveClient: (e: React.FormEvent) => Promise<void>;
  handleAddClientProject: (client: Client) => void;
  INDUSTRIES: string[];
  BUSINESS_TYPES: string[];
}

export function AdminClients({
  view,
  setView,
  clients,
  loadingClients,
  savingClient,
  editingClient,
  setEditingClient,
  clientProjects,
  invoices,
  clientConfirmingDelete,
  setClientConfirmingDelete,
  handleViewClient,
  handleEditClient,
  handleAddClient,
  handleDeleteClient,
  handleSaveClient,
  handleAddClientProject,
  INDUSTRIES,
  BUSINESS_TYPES,
}: AdminClientsProps) {
  if (view === "clients-list") {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              Client Relations
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Manage your elite clientele and business identity database.
            </p>
          </div>
          <Button
            onClick={handleAddClient}
            className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
          >
            Add New Client
          </Button>
        </div>

        <div className="grid gap-6">
          {loadingClients ? (
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                Retrieving Client Database...
              </h3>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <Users className="w-12 h-12 text-white/10 mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                No clients registered
              </h3>
              <Button
                onClick={handleAddClient}
                className="bg-white/5 border border-white/10 text-white/60 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10"
              >
                Onboard First Client
              </Button>
            </div>
          ) : (
            clients.map((client) => {
              const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
              let totalSpent = 0;
              let totalTax = 0;
              let netTotal = 0;
              let isOverdue = false;
              let isPending = false;
              let isAllPaid = false;

              if (clientInvoices.length > 0) {
                isOverdue = clientInvoices.some(inv => normalizeStatus(inv.status) === 'UNPAID');
                isPending = clientInvoices.some(inv => {
                  const s = normalizeStatus(inv.status);
                  return s !== 'PAID' && s !== 'VOID' && s !== 'DRAFT';
                });
                isAllPaid = clientInvoices.every(inv => {
                  const s = normalizeStatus(inv.status);
                  return s === 'PAID' || s === 'VOID';
                });

                const paidInvoices = clientInvoices.filter(inv => normalizeStatus(inv.status) === 'PAID');
                totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                totalTax = paidInvoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0);
                netTotal = totalSpent - totalTax;
              }

              return (
                <Card
                  key={client.id}
                  onClick={() => handleViewClient(client)}
                  className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all cursor-pointer relative overflow-hidden"
                >
                  {isOverdue && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                      Overdue Payment
                    </div>
                  )}
                  {!isOverdue && isPending && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-zarco-cyan text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                      Financial Pending
                    </div>
                  )}
                  {!isOverdue && !isPending && isAllPaid && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                      All Paid
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-10 flex-1">
                      <div className="flex flex-col min-w-[200px]">
                        <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                          {client.industry || "General"}
                        </span>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
                          {client.fullName}
                        </h3>
                        <p className="text-sm font-bold text-white/30 uppercase tracking-tighter">
                          {client.companyName}
                        </p>
                        <div
                          className="flex gap-3 mt-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.websiteUrl && (
                            <a
                              href={
                                client.websiteUrl.startsWith("http")
                                  ? client.websiteUrl
                                  : `https://${client.websiteUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                          {client.instagramUrl && (
                            <a
                              href={
                                client.instagramUrl.startsWith("http")
                                  ? client.instagramUrl
                                  : `https://instagram.com/${client.instagramUrl.replace("@", "")}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {client.facebookUrl && (
                            <a
                              href={
                                client.facebookUrl.startsWith("http")
                                  ? client.facebookUrl
                                  : `https://facebook.com/${client.facebookUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}
                          {client.linkedinUrl && (
                            <a
                              href={
                                client.linkedinUrl.startsWith("http")
                                  ? client.linkedinUrl
                                  : `https://linkedin.com/in/${client.linkedinUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 transition-all"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="h-16 w-px bg-white/5" />
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                          Financial Yield
                        </span>
                        <div className="space-y-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-zarco-cyan leading-none">
                              € {totalSpent.toLocaleString()}
                            </span>
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Gross</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white/60 leading-none">
                              € {netTotal.toLocaleString()}
                            </span>
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Tax Off</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-red-500/60 leading-none">
                              € {totalTax.toLocaleString()}
                            </span>
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Tax</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-16 w-px bg-white/5" />
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                          Contact Details
                        </span>
                        <span className="text-xs font-medium text-white/60 mb-1">
                          {client.email}
                        </span>
                        <span className="text-xs font-medium text-white/40 mb-1">
                          {client.phone}
                        </span>
                        {client.whatsapp && (
                          <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                            WhatsApp Active
                          </span>
                        )}
                      </div>
                      <div className="h-16 w-px bg-white/5" />
                      <div className="flex-1 max-w-[300px]">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 block">
                          Business Description
                        </span>
                        <p className="text-[11px] text-white/40 line-clamp-3 leading-relaxed mb-3">
                          {client.description || "No description provided."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-black text-white/30 uppercase tracking-widest border border-white/5">
                            {client.businessType}
                          </span>
                          {client.city && (
                            <span className="px-2.5 py-0.5 bg-white/5 rounded text-[9px] font-black text-white/30 uppercase tracking-widest border border-white/5">
                              {client.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex flex-col gap-3 items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="ghost"
                          onClick={() => handleEditClient(client)}
                          className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border border-white/5 rounded-xl flex items-center justify-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          Manage Profile
                        </Button>
                        
                        {clientConfirmingDelete === client.id ? (
                          <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-11 rounded-xl transition-all active:scale-95"
                            >
                              Confirm
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setClientConfirmingDelete(null);
                              }}
                              className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-3 h-11 border border-white/5 rounded-xl transition-all"
                            >
                              X
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClientConfirmingDelete(client.id);
                            }}
                            className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
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

  if (view === "clients-view" && editingClient) {
    const associatedProjects = clientProjects.filter(p => p.clientId === editingClient.id);
    const associatedInvoices = invoices.filter(i => i.clientId === editingClient.id);

    return (
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              Client Profile
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              A comprehensive view of the high-end business identity.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setView("clients-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
            >
              Back to List
            </Button>
            <Button
              onClick={() => handleAddClientProject(editingClient)}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start New Project
            </Button>
            <Button
              onClick={() => setView("clients-form")}
              className="bg-white/5 text-white/60 font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/10 border border-white/5 transition-all"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-zarco-cyan/10 flex items-center justify-center text-4xl mb-6 border border-zarco-cyan/20">
                👤
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                {editingClient.fullName}
              </h3>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                {editingClient.companyName}
              </p>

              <div className="w-full space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between text-left">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    Industry
                  </span>
                  <span className="text-xs font-bold text-zarco-cyan uppercase">
                    {editingClient.industry || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-left">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    Type
                  </span>
                  <span className="text-xs font-bold text-white/60 uppercase">
                    {editingClient.businessType || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                {editingClient.websiteUrl && (
                  <a
                    href={
                      editingClient.websiteUrl.startsWith("http")
                        ? editingClient.websiteUrl
                        : `https://${editingClient.websiteUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 border border-white/5 transition-all"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </a>
                )}
                {editingClient.instagramUrl && (
                  <a
                    href={
                      editingClient.instagramUrl.startsWith("http")
                        ? editingClient.instagramUrl
                        : `https://instagram.com/${editingClient.instagramUrl.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 border border-white/5 transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {editingClient.facebookUrl && (
                  <a
                    href={
                      editingClient.facebookUrl.startsWith("http")
                        ? editingClient.facebookUrl
                        : `https://facebook.com/${editingClient.facebookUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 border border-white/5 transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {editingClient.linkedinUrl && (
                  <a
                    href={
                      editingClient.linkedinUrl.startsWith("http")
                        ? editingClient.linkedinUrl
                        : `https://linkedin.com/in/${editingClient.linkedinUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-zarco-cyan hover:bg-zarco-cyan/10 border border-white/5 transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10 lg:col-span-2">
            <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-6 border-b border-white/5 pb-4">
              General / Contact Details
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm mb-6">
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                  Email Address
                </span>
                <span className="text-white font-medium">{editingClient.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                  Phone Number
                </span>
                <span className="text-white font-medium">{editingClient.phone}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                  Tax VAT ID
                </span>
                <span className="text-white font-medium">{editingClient.vatNumber || "Not Provided"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                  Region/City
                </span>
                <span className="text-white font-medium">{editingClient.city || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                  Business Bio / Identity Notes
                </span>
                <p className="text-white/60 text-xs leading-relaxed">
                  {editingClient.description || "No description / biography details added."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (view === "clients-form" && editingClient) {
    return (
      <form onSubmit={handleSaveClient} className="max-w-5xl mx-auto pb-20">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              {editingClient.id.startsWith("client-temp-")
                ? "👤 Onboard Client"
                : "👤 Manage Profile"}
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Building a complete business identity for bespoke collaboration.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setView("clients-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={savingClient}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {savingClient ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Complete Profile"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <span className="text-xl">🧠</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Identity
                </h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Full Name
                  </label>
                  <Input
                    required
                    value={editingClient.fullName || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Johnathan Doe"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Company Name
                  </label>
                  <Input
                    required
                    value={editingClient.companyName || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Neo Vision Ltd."
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <span className="text-xl">🏢</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Business Info
                </h3>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Business Type
                    </label>
                    <div className="relative">
                      <select
                        value={editingClient.businessType}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            businessType: e.target.value,
                          })
                        }
                        className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:border-zarco-cyan focus:outline-none"
                      >
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Industry Sector
                    </label>
                    <div className="relative">
                      <select
                        value={editingClient.industry}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            industry: e.target.value,
                          })
                        }
                        className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:border-zarco-cyan focus:outline-none"
                      >
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Vat ID (NIF / TAX ID)
                  </label>
                  <Input
                    value={editingClient.vatNumber || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        vatNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. PT 512345678"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Contact details Card */}
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6 pb-4 border-b border-white/5">
              📞 Client Connections & Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Principal Email Address
                </label>
                <Input
                  required
                  type="email"
                  value={editingClient.email || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  placeholder="name@company.com"
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Direct Phone Number
                </label>
                <Input
                  required
                  value={editingClient.phone || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  placeholder="+351 912 345 678"
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Primary Website URL
                </label>
                <Input
                  value={editingClient.websiteUrl || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                  placeholder="www.clientwebsite.com"
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  City / Location
                </label>
                <Input
                  required
                  value={editingClient.city || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                  placeholder="Lisbon"
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Business Bio Description
              </label>
              <textarea
                value={editingClient.description || ""}
                onChange={(e) => setEditingClient({ ...editingClient, description: e.target.value })}
                placeholder="A brief overview of the client's business, target market, or organizational goals..."
                className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-zarco-cyan min-h-[120px]"
              />
            </div>
          </Card>
        </div>
      </form>
    );
  }

  return null;
}
