import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Eye,
  EyeOff,
  Send,
  Loader2,
  Trash2,
  X,
  Target as LangIcon,
  Save,
} from "lucide-react";
import { Subscriber, NewsletterSettings, CompanySettings } from "../types";

interface AdminSubscribersProps {
  newsletterSettings: NewsletterSettings;
  toggleNewsletterSection: (show: boolean) => Promise<void>;
  newsletterTab: "audience" | "archives";
  setNewsletterTab: (tab: "audience" | "archives") => void;
  subscribers: Subscriber[];
  archivedNewsletters: any[];
  fetchArchives: () => Promise<void>;
  setNewsletterForm: React.Dispatch<React.SetStateAction<{ subject: string; content: string; lang: string }>>;
  setEditingNewsletterId: (id: string | null) => void;
  setIsComposing: (composing: boolean) => void;
  fetchSubscribers: () => Promise<void>;
  loadingSubscribers: boolean;
  selectedEmails: string[];
  setSelectedEmails: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSubscriberStatus: (email: string, lang: "en" | "pt", currentStatus: boolean) => Promise<void>;
  deleteConfirm: { id: string; type: string; email?: string; lang?: string } | null;
  setDeleteConfirm: (confirm: { id: string; type: string; email?: string; lang?: string } | null) => void;
  isDeletingSubscriber: string | null;
  deleteSubscriber: (id: string, email: string, lang: string) => Promise<void>;
  deleteNewsletter: (id: string) => Promise<void>;
  isComposing: boolean;
  newsletterForm: { subject: string; content: string; lang: string };
  sendNewsletter: () => Promise<void>;
  saveNewsletter: (sendNow?: boolean) => Promise<void>;
  savingNewsletter: boolean;
  sendingNewsletter: boolean;
  isPreviewing: boolean;
  setIsPreviewing: (previewing: boolean) => void;
  companySettings: CompanySettings;
  loadDraft: (newsletter: any) => void;
  loadingArchives: boolean;
}

export function AdminSubscribers({
  newsletterSettings,
  toggleNewsletterSection,
  newsletterTab,
  setNewsletterTab,
  subscribers,
  archivedNewsletters,
  fetchArchives,
  setNewsletterForm,
  setEditingNewsletterId,
  setIsComposing,
  fetchSubscribers,
  loadingSubscribers,
  selectedEmails,
  setSelectedEmails,
  toggleSubscriberStatus,
  deleteConfirm,
  setDeleteConfirm,
  isDeletingSubscriber,
  deleteSubscriber,
  deleteNewsletter,
  isComposing,
  newsletterForm,
  sendNewsletter,
  saveNewsletter,
  savingNewsletter,
  sendingNewsletter,
  isPreviewing,
  setIsPreviewing,
  companySettings,
  loadDraft,
  loadingArchives,
}: AdminSubscribersProps) {
  return (
    <div id="admin-subscribers-content" className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zarco-cyan/10 border border-zarco-cyan/20">
            <Mail className="w-3 h-3 text-zarco-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">Newsletter Center</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Newsletter <span className="text-zarco-cyan">Audience</span>
          </h1>
          <p className="text-white/40 font-medium max-w-md">
            Manage your subscribers and broadcast newsletters to your community.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-4 p-4 bg-[#0a1114] border border-white/5 rounded-2xl w-fit">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    newsletterSettings.showSection ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  {newsletterSettings.showSection ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Homepage Visibility</p>
                  <p className={`text-xs font-black uppercase tracking-widest ${newsletterSettings.showSection ? "text-green-500" : "text-red-500"}`}>
                    Section is {newsletterSettings.showSection ? "Currently Live" : "Now Hidden"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => toggleNewsletterSection(newsletterSettings.showSection)}
                className={`ml-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  newsletterSettings.showSection
                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {newsletterSettings.showSection ? "Hide from Home" : "Show on Home"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit mt-4">
            <button
              onClick={() => setNewsletterTab("audience")}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                newsletterTab === "audience" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"
              }`}
            >
              Subscribers ({subscribers.length})
            </button>
            <button
              onClick={() => {
                setNewsletterTab("archives");
                fetchArchives();
              }}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                newsletterTab === "archives" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"
              }`}
            >
              Archives ({archivedNewsletters.length})
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setNewsletterForm({ subject: "", content: "", lang: "en" });
              setEditingNewsletterId(null);
              setIsComposing(true);
            }}
            className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:scale-105 active:scale-95 transition-all border-none flex items-center gap-2 shadow-[0_10px_30px_rgba(0,183,255,0.2)]"
          >
            <Send className="w-4 h-4" />
            Compose Broadcast
          </Button>
          <Button
            onClick={fetchSubscribers}
            disabled={loadingSubscribers}
            variant="outline"
            className="bg-white/5 border-white/10 text-white/60 font-bold uppercase tracking-widest text-[10px] rounded-xl px-8 h-12 hover:bg-white/10"
          >
            {loadingSubscribers ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Refresh List
          </Button>
          <Button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                "Email,Language,Subscribed At\n" +
                subscribers.map((s) => `${s.email},${s.lang},${s.subscribedAt?.toDate?.() || new Date(s.subscribedAt)}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "subscribers.csv");
              document.body.appendChild(link);
              link.click();
            }}
            className="bg-zarco-cyan/10 text-zarco-cyan font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/20 transition-all border border-zarco-cyan/20"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {newsletterTab === "audience" ? (
        <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/10 bg-white/5"
                      checked={subscribers.length > 0 && selectedEmails.length === subscribers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmails(subscribers.map((s) => s.email));
                        } else {
                          setSelectedEmails([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Email Address</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Language</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Subscription Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] w-32">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-white/20 uppercase text-xs font-bold tracking-widest">
                      No subscribers found yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s) => (
                    <tr
                      key={`${s.lang}-${s.id}`}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${
                        selectedEmails.includes(s.email) ? "bg-zarco-cyan/5" : ""
                      }`}
                    >
                      <td className="px-4 py-6">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/10 bg-white/5 accent-zarco-cyan"
                          checked={selectedEmails.includes(s.email)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmails((prev) => [...prev, s.email]);
                            } else {
                              setSelectedEmails((prev) => prev.filter((email) => email !== s.email));
                            }
                          }}
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-white/40 group-hover:text-zarco-cyan transition-colors" />
                          </div>
                          <span className="text-sm font-bold text-white/80">{s.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                            s.lang === "pt" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {s.lang === "pt" ? "Portuguese" : "English"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-white/40 font-medium">
                        {s.subscribedAt?.toDate?.().toLocaleDateString() || new Date(s.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            s.active !== false ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {s.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button
                          onClick={() => toggleSubscriberStatus(s.email, s.lang as "en" | "pt", s.active !== false)}
                          title={s.active !== false ? "Deactivate" : "Activate"}
                          className={`p-2 rounded-lg transition-colors ${
                            s.active !== false ? "text-white/40 hover:text-red-500 hover:bg-red-500/10" : "text-white/40 hover:text-green-500 hover:bg-green-500/10"
                          }`}
                        >
                          {s.active !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: s.id, type: "subscriber", email: s.email, lang: s.lang })}
                          disabled={isDeletingSubscriber === s.id}
                          className="p-3 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                          title="Delete Subscriber"
                        >
                          {isDeletingSubscriber === s.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-white/[0.03] border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingArchives ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse" />)
            ) : archivedNewsletters.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <Mail className="w-12 h-12 text-white/5 mx-auto" />
                <p className="text-white/20 font-black uppercase tracking-widest text-sm">No archives found</p>
              </div>
            ) : (
              archivedNewsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  onClick={() => loadDraft(newsletter)}
                  className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-zarco-cyan/30 transition-all group cursor-pointer hover:bg-white/[0.08]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        newsletter.status === "sent" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {newsletter.status}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ id: newsletter.id, type: "newsletter", email: newsletter.subject });
                      }}
                      className="p-2 text-white/20 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{newsletter.subject}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-1">
                      <LangIcon className="w-3 h-3" /> {newsletter.lang}
                    </span>
                    {newsletter.createdAt && (
                      <span>{newsletter.createdAt.toDate?.().toLocaleDateString() || new Date(newsletter.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="bg-[#0a1114] border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Confirm Deletion</h3>
                <p className="text-white/40 text-sm">
                  Are you sure you want to delete <span className="text-white font-bold">{deleteConfirm.email}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-white/5 border-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (deleteConfirm.type === "subscriber") {
                      deleteSubscriber(deleteConfirm.id, deleteConfirm.email!, deleteConfirm.lang!);
                    } else {
                      deleteNewsletter(deleteConfirm.id);
                    }
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl border-none"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-[#0a1114] border-white/5 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">Compose Newsletter</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsComposing(false);
                  setEditingNewsletterId(null);
                }}
                className="text-white/20 hover:text-white transition-colors animate-fade-in"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendNewsletter();
              }}
              className="space-y-6 text-left"
            >
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Target Recipients</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewsletterForm({ ...newsletterForm, lang: "all" })}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      newsletterForm.lang === "all"
                        ? "bg-zarco-cyan/20 border-zarco-cyan/50 text-zarco-cyan shadow-[0_0_20px_rgba(0,183,255,0.1)]"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    All Subscribers
                  </button>
                  <button
                    type="button"
                    disabled={selectedEmails.length === 0}
                    onClick={() => setNewsletterForm({ ...newsletterForm, lang: "selected" })}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all relative ${
                      newsletterForm.lang === "selected"
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    }`}
                  >
                    Selected ({selectedEmails.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewsletterForm({ ...newsletterForm, lang: "en" })}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      newsletterForm.lang === "en" ? "bg-blue-500/20 border-blue-500/50 text-blue-500" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    English Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewsletterForm({ ...newsletterForm, lang: "pt" })}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      newsletterForm.lang === "pt" ? "bg-orange-500/20 border-orange-500/50 text-orange-500" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Portuguese Only
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Subject Line</label>
                <Input
                  required
                  value={newsletterForm.subject}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                  placeholder="e.g. Exciting New Updates from Zarco Studios!"
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Newsletter Content (HTML Supported)</label>
                  <span className="text-[8px] font-black uppercase text-zarco-cyan bg-zarco-cyan/10 px-2 py-0.5 rounded">HTML Mode</span>
                </div>
                <textarea
                  required
                  value={newsletterForm.content}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                  placeholder="<h1>Welcome</h1><p>Check out our latest projects...</p>"
                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-6 h-64 focus:outline-none focus:border-zarco-cyan transition-colors text-sm text-white/70 font-mono"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setIsComposing(false);
                    setEditingNewsletterId(null);
                  }}
                  variant="outline"
                  className="flex-1 bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl h-14 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsPreviewing(true)}
                  className="px-6 bg-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-xl h-14 hover:bg-white/20 border-none animate-fade-in"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => saveNewsletter(false)}
                  disabled={savingNewsletter}
                  className="flex-1 bg-white/5 text-white/60 font-black uppercase tracking-widest text-[11px] rounded-xl h-14 hover:bg-white/10 border border-white/10"
                >
                  {savingNewsletter ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={sendingNewsletter}
                  className="flex-[2] bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl h-14 hover:scale-105 transition-all border-none shadow-[0_10px_30px_rgba(0,183,255,0.2)]"
                >
                  {sendingNewsletter ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Broadcast
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isPreviewing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 animate-slide-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl relative p-8 md:p-12">
            <button
              onClick={() => setIsPreviewing(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-black"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-[600px] mx-auto text-black">
              {companySettings?.logoUrl ? (
                <div className="text-center mb-10">
                  <img src={companySettings.logoUrl} alt="Logo" className="max-h-[60px] mx-auto" />
                </div>
              ) : (
                <div className="text-center mb-10 text-2xl font-black uppercase tracking-tighter">ZARCO STUDIOS</div>
              )}

              <div className="bg-[#f9f9f9] p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-black uppercase tracking-tight mb-6">{newsletterForm.subject || "Subject Placeholder"}</h1>
                <div
                  className="prose prose-sm max-w-none text-gray-600 text-left"
                  dangerouslySetInnerHTML={{ __html: newsletterForm.content || "<p>Compose your content to see it here...</p>" }}
                />
              </div>

              <div className="mt-12 text-center text-[#999] text-[10px] font-medium uppercase tracking-widest space-y-2">
                <p>
                  {newsletterForm.lang === "pt"
                    ? "Recebeu este e-mail porque se inscreveu nas atualizações do Zarco Studios."
                    : "You are receiving this because you subscribed to Zarco Studios updates."}
                </p>
                <p>{newsletterForm.lang === "pt" ? "© 2026 Zarco Studios. Todos os direitos reservados." : "© 2026 Zarco Studios. All rights reserved."}</p>
                <p className="pt-4 underline cursor-pointer">{newsletterForm.lang === "pt" ? "Remover subscrição" : "Unsubscribe"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
