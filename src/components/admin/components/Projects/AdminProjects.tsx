import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  X,
  Settings,
  Trash2,
  Code2,
  Globe,
  Loader2,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";
import { Client, ClientProject, Invoice, AdminView, Host, PrototypeEntry } from "../../types";
import { isAssetExpiringSoon } from "../../utils/dates";

interface AdminProjectsProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  clientProjects: ClientProject[];
  setClientProjects: React.Dispatch<React.SetStateAction<ClientProject[]>>;
  clients: Client[];
  invoices: Invoice[];
  loadingClientProjects: boolean;
  savingClientProject: boolean;
  editingClientProject: ClientProject | null;
  setEditingClientProject: React.Dispatch<React.SetStateAction<ClientProject | null>>;
  editingClient: Client | null;
  setEditingClient: React.Dispatch<React.SetStateAction<Client | null>>;
  adminClientProjectSearch: string;
  setAdminClientProjectSearch: (search: string) => void;
  clientProjectConfirmingDelete: string | null;
  setClientProjectConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Handlers
  handleAddNewManagedProject: () => void;
  handleViewClientProject: (p: ClientProject) => void;
  handleEditClientProject: (p: ClientProject) => void;
  handleDeleteClientProject: (id: string) => Promise<void>;
  handleSaveClientProject: (e: React.FormEvent) => Promise<void>;
  handleUnsubscribeClientProject: (p: ClientProject) => void;
  
  // Cloudinary Upload
  uploadToCloudinary: (file: File, folderName?: string) => Promise<string>;
  
  // UI Control
  setShowFullDescModal: (show: boolean) => void;
}

export function AdminProjects({
  view,
  setView,
  clientProjects,
  setClientProjects,
  clients,
  invoices,
  loadingClientProjects,
  savingClientProject,
  editingClientProject,
  setEditingClientProject,
  editingClient,
  setEditingClient,
  adminClientProjectSearch,
  setAdminClientProjectSearch,
  clientProjectConfirmingDelete,
  setClientProjectConfirmingDelete,
  
  // Handlers
  handleAddNewManagedProject,
  handleViewClientProject,
  handleEditClientProject,
  handleDeleteClientProject,
  handleSaveClientProject,
  handleUnsubscribeClientProject,
  
  // Cloudinary
  uploadToCloudinary,
  
  setShowFullDescModal,
}: AdminProjectsProps) {

  const getYear = (startDateStr: string) => {
    if (!startDateStr) return "2026";
    return startDateStr.split("-")[0] || "2026";
  };

  if (view === "managed-projects-list") {
    const filteredProjects = clientProjects.filter(p => {
      if (!adminClientProjectSearch) return true;
      const q = adminClientProjectSearch.toLowerCase();
      const client = clients.find(c => c.id === p.clientId);
      const projYear = getYear(p.startDate);
      return (
        p.projectName.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (client?.fullName || '').toLowerCase().includes(q) ||
        (client?.companyName || '').toLowerCase().includes(q) ||
        projYear.includes(q)
      );
    });

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              Project Management
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Global oversight of all active client projects and deliverables.
            </p>
          </div>
          <Button
            onClick={handleAddNewManagedProject}
            className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Start New Project
          </Button>
        </div>

        {clientProjects.length > 0 && !loadingClientProjects && (
          <div className="relative mb-8 max-w-md">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={adminClientProjectSearch}
              onChange={(e) => setAdminClientProjectSearch(e.target.value)}
              placeholder="Search projects by name, status, client or year..."
              className="w-full h-11 pl-12 pr-10 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-zarco-cyan/50 focus:bg-white/[0.04] transition-all rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white placeholder-white/20 outline-none"
            />
            {adminClientProjectSearch && (
              <button
                onClick={() => setAdminClientProjectSearch('')}
                className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="grid gap-6">
          {loadingClientProjects ? (
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
                Retrieving Project Databases...
              </h3>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <Settings className="w-12 h-12 text-white/10 mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
                No active projects found
              </h3>
              <Button
                onClick={handleAddNewManagedProject}
                className="bg-white/5 border border-white/10 text-white/60 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10"
              >
                Launch First Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const client = clients.find((c) => c.id === project.clientId);
              const projectYear = getYear(project.startDate);
              return (
                <Card
                  key={project.id}
                  onClick={() => handleViewClientProject(project)}
                  className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-10 flex-1">
                      <div className="flex flex-col min-w-[200px]">
                        <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                          {projectYear} • {project.projectType}
                        </span>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
                          {project.projectName}
                        </h3>
                        <p className="text-sm font-bold text-white/30 truncate max-w-[250px]">
                          Client: {client ? `${client.fullName} (${client.companyName})` : "Standard Space"}
                        </p>
                      </div>
                      <div className="h-16 w-px bg-white/5" />
                      <div className="flex flex-col min-w-[120px]">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                          Status State
                        </span>
                        <span
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-center self-start ${
                            project.status === "Completed"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : project.status === "Development"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse"
                              : project.status === "Planning"
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="h-16 w-px bg-white/5" />
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">
                          Asset Expiry Tracking
                        </span>
                        {project.domainExpiration ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-bold text-white/70">
                              {project.domainExpiration}
                            </span>
                            <span className={`text-[8px] font-black uppercase ${
                              isAssetExpiringSoon(project.domainExpiration) ? 'text-red-500 animate-pulse' : 'text-green-500'
                            }`}>
                              {isAssetExpiringSoon(project.domainExpiration) ? 'Renewal Required' : 'Active'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">No assets registered</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => handleEditClientProject(project)}
                        className="py-3 px-6 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border border-white/5 rounded-xl flex items-center justify-center gap-2"
                      >
                        Edit Workspace
                      </Button>
                      {clientProjectConfirmingDelete === project.id ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClientProject(project.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-11 rounded-xl transition-all"
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setClientProjectConfirmingDelete(null);
                            }}
                            className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-3 h-11 border border-white/5 rounded-xl"
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
                            setClientProjectConfirmingDelete(project.id);
                          }}
                          className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
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

  // Visualizing individual client project detailed workspace
  if (view === "client-project-view" && editingClientProject && editingClient) {
    const isHostingRegistered = editingClientProject.hosts && editingClientProject.hosts.length > 0;
    const isPrototypingActive = editingClientProject.prototypesList && editingClientProject.prototypesList.length > 0;
    const projectYear = getYear(editingClientProject.startDate);

    return (
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-zarco-cyan/5 border border-zarco-cyan/10 flex items-center justify-center text-3xl">
              📁
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    editingClientProject.status === "Completed"
                      ? "bg-green-500/20 text-green-500"
                      : editingClientProject.status === "Development"
                      ? "bg-blue-500/20 text-blue-500 animate-pulse"
                      : editingClientProject.status === "Planning"
                      ? "bg-purple-500/20 text-purple-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {editingClientProject.status}
                </span>
                <span className="text-white/30 text-xs font-bold uppercase tracking-wider">
                  {projectYear} • {editingClientProject.projectType}
                </span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-1">
                {editingClientProject.projectName}
              </h2>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                Workspace representing {editingClient.fullName} ({editingClient.companyName})
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setView("managed-projects-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-8 py-6 hover:bg-white/5"
            >
              Back to List
            </Button>
            <Button
              onClick={() => handleUnsubscribeClientProject(editingClientProject)}
              className="bg-zinc-800 text-zinc-300 border border-zinc-700 font-black uppercase tracking-widest text-[11px] rounded-xl px-6 py-6 hover:bg-zinc-700/80 transition-all flex items-center gap-2"
            >
              Unsubscribe Sub
            </Button>
            <Button
              onClick={() => handleEditClientProject(editingClientProject)}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-8 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              Edit Workspace details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Prototypes section */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                <Code2 className="w-5 h-5 text-zarco-cyan" />
                Prototype Builds & Sandboxes
              </h3>
              {isPrototypingActive ? (
                <div className="space-y-4">
                  {editingClientProject.prototypesList?.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0c1417]/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:border-zarco-cyan/25 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zarco-cyan">
                            Prototype build #{idx + 1}
                          </span>
                        </div>
                        <h4 className="text-lg font-black uppercase text-white mb-1">
                          {p.title}
                        </h4>
                      </div>
                      <a
                        href={p.embedHtml}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 text-white/50 hover:text-zarco-cyan hover:bg-zarco-cyan/10 rounded-xl transition-all border border-white/5"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0c1417]/20 border-2 border-dashed border-white/5 rounded-[2rem] py-16 text-center">
                  <span className="text-3xl mb-4 block">🤖</span>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    No sandboxes or draft links uploaded yet.
                  </p>
                </div>
              )}
            </Card>

            {/* Hosting servers section */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                <Globe className="w-5 h-5 text-zarco-cyan" />
                Live Host Servers & Production Details
              </h3>
              {isHostingRegistered ? (
                <div className="space-y-4">
                  {editingClientProject.hosts?.map((h, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0c1417]/40 border border-white/5 rounded-2xl p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-black uppercase text-white">
                          {h.domainProvider || "Production Hosting Server"}
                        </h4>
                        <a
                          href={h.providerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white/5 hover:bg-zarco-cyan/10 text-white/50 hover:text-zarco-cyan text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border border-white/5"
                        >
                          Access Panel
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-white/60">
                        <div>
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                            Domain Address
                          </span>
                          <span className="text-white font-medium">{h.domainName || "Not added"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0c1417]/20 border-2 border-dashed border-white/5 rounded-[2rem] py-16 text-center">
                  <span className="text-3xl mb-4 block">🌐</span>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    No production hosts registered for this project.
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-8 lg:col-span-1">
            {/* Project Details side-panel */}
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <h3 className="text-base font-bold uppercase tracking-widest text-white border-b border-white/5 pb-4 mb-6">
                Deliverable Spec Sheet
              </h3>
              <div className="space-y-6 text-xs text-white/50">
                <div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                    Development Stack
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingClientProject.techStack?.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white/5 text-zarco-cyan border border-white/5 rounded text-[8px] font-black uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                    Contract/Asset Expiration Date
                  </span>
                  <span className="text-white font-black text-sm">
                    {editingClientProject.domainExpiration || "No Expiry Tracked"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Client project editing and creation form views
  if (view === "client-project-form" && editingClientProject) {
    const projectYear = getYear(editingClientProject.startDate);
    return (
      <form onSubmit={handleSaveClientProject} className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              📁 Project Details
            </h2>
            <p className="text-white/40 text-sm italic uppercase tracking-widest">
              Set precise specs, prototype directories, sandboxes, and cloud environments.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setView("managed-projects-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={savingClientProject}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {savingClientProject ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Workspace"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Project Title / Identity Name
                  </label>
                  <Input
                    required
                    value={editingClientProject.projectName || ""}
                    onChange={(e) => setEditingClientProject({ ...editingClientProject, projectName: e.target.value })}
                    placeholder="E.g. Zenith E-Commerce Redesign"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Associate Client Account
                  </label>
                  <div className="relative">
                    <select
                      value={editingClientProject.clientId}
                      onChange={(e) => setEditingClientProject({ ...editingClientProject, clientId: e.target.value })}
                      className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-zarco-cyan"
                    >
                      <option value="">Select an on-boarded Client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.companyName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Production Category
                  </label>
                  <Input
                    required
                    value={editingClientProject.projectType || ""}
                    onChange={(e) => setEditingClientProject({ ...editingClientProject, projectType: e.target.value })}
                    placeholder="Web App Development"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Delivery Year
                  </label>
                  <Input
                    required
                    value={projectYear}
                    onChange={(e) => setEditingClientProject({ ...editingClientProject, startDate: `${e.target.value}-01-01` })}
                    placeholder="2026"
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Current Status Stage
                  </label>
                  <select
                    value={editingClientProject.status}
                    onChange={(e) => setEditingClientProject({ ...editingClientProject, status: e.target.value as any })}
                    className="w-full h-14 px-4 bg-[#0c1417] border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-zarco-cyan"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Development">Development</option>
                    <option value="Completed">Completed</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    );
  }

  return null;
}
