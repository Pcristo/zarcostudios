import React from "react";
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
  Code2,
  Globe,
  Languages,
  Upload,
  Github,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Project, AdminView, TECHNICAL_STACK } from "../types";

const categories = ["Portfolio", "College"];
const institutions = ["Code Institute", "Harvard University", "none"];

interface AdminPortfolioProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  projects: Project[];
  filteredProjects: Project[];
  adminProjectSearch: string;
  setAdminProjectSearch: (search: string) => void;
  projectConfirmingDelete: string | null;
  setProjectConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  formData: Partial<Project>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Project>>>;
  uploading: string | null;
  handleAddNewPortfolioProject: () => void;
  handleEdit: (project: Project) => void;
  handleDeleteProject: (id: string) => Promise<void>;
  handleSaveProject: (e: React.FormEvent) => Promise<void>;
  toggleStatusUpdate: (id: string, field: "isActive" | "isFeatured", current: boolean) => Promise<void>;
  handleFileUpload: (file: File, type: "main" | "gallery") => Promise<void>;
  addGalleryUrl: () => void;
  removeGalleryImage: (index: number) => void;
  toggleTech: (tech: string) => void;
  resetForm: () => void;
}

export function AdminPortfolio({
  view,
  setView,
  projects,
  filteredProjects,
  adminProjectSearch,
  setAdminProjectSearch,
  projectConfirmingDelete,
  setProjectConfirmingDelete,
  formData,
  setFormData,
  uploading,
  handleAddNewPortfolioProject,
  handleEdit,
  handleDeleteProject,
  handleSaveProject,
  toggleStatusUpdate,
  handleFileUpload,
  addGalleryUrl,
  removeGalleryImage,
  toggleTech,
  resetForm,
}: AdminPortfolioProps) {
  if (view === "create" || view === "edit") {
    return (
      <form onSubmit={handleSaveProject} className="max-w-4xl mx-auto pb-20 animate-fade-in">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              {view === "create" ? "Add Portfolio Project" : "Edit Project"}
            </h2>
            <p className="text-white/40 text-sm">
              Add a new bespoke digital experience to the Zarco Studios portfolio.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {view === "create" ? "Add Project" : "Update Project"}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <CardHeader className="px-0 pt-0 mb-8 border-b border-white/5 pb-6">
              <CardTitle className="text-xl font-bold uppercase tracking-tight text-white">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Project Name (EN)
                  </label>
                  <Input
                    required
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Neo Vision Rebrand"
                    className="bg-[#0c1417] border-white/10 rounded-xl px-6 py-4 h-14 focus-visible:ring-zarco-cyan transition-colors text-white"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Project Name (PT)
                  </label>
                  <Input
                    value={formData.titlePt || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, titlePt: e.target.value })
                    }
                    placeholder="Ex: Rebrand Neo Vision"
                    className="bg-[#0c1417] border-white/10 rounded-xl px-6 py-4 h-14 focus-visible:ring-zarco-cyan transition-colors text-white"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                  </div>
                </div>
                {formData.category === "College" && (
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      Institution
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.institution || "none"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution: e.target.value,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white/70 text-sm"
                      >
                        <option value="none">Select Institution</option>
                        {institutions.map((inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Short Description (EN)
                  </label>
                  <Input
                    value={formData.shortDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="A brief one-liner summarizing the project..."
                    className="bg-[#0c1417] border-white/10 rounded-xl px-6 py-4 h-14 focus-visible:ring-zarco-cyan transition-colors text-white"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Short Description (PT)
                  </label>
                  <Input
                    value={formData.shortDescriptionPt || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescriptionPt: e.target.value,
                      })
                    }
                    placeholder="Uma breve frase resumindo o projeto..."
                    className="bg-[#0c1417] border-white/10 rounded-xl px-6 py-4 h-14 focus-visible:ring-zarco-cyan transition-colors text-white"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-5 h-5 bg-[#0c1417] border-white/10 rounded-md accent-zarco-cyan cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveToggle"
                    className="text-[11px] font-bold uppercase tracking-widest text-white/40 cursor-pointer"
                  >
                    Live & Visible
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeaturedToggle"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-5 h-5 bg-[#0c1417] border-white/10 rounded-md accent-zarco-cyan cursor-pointer"
                  />
                  <label
                    htmlFor="isFeaturedToggle"
                    className="text-[11px] font-bold uppercase tracking-widest text-white/40 cursor-pointer"
                  >
                    Featured Project
                  </label>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-1">
                    Archive Year
                  </label>
                  <Input
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-xs text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Content */}
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <CardHeader className="px-0 pt-0 mb-8 border-b border-white/5 pb-6">
              <CardTitle className="text-xl font-bold uppercase tracking-tight text-white">
                Detailed Content
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      Full Description (EN)
                    </label>
                    <Code2 className="w-4 h-4 text-white/20" />
                  </div>
                  <textarea
                    value={formData.fullDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullDescription: e.target.value,
                      })
                    }
                    placeholder="Describe the creative process, challenges, and solutions..."
                    className="bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 min-h-[150px] focus:outline-none focus:border-zarco-cyan transition-colors resize-none text-white/70 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      Full Description (PT)
                    </label>
                    <Code2 className="w-4 h-4 text-white/20" />
                  </div>
                  <textarea
                    value={formData.fullDescriptionPt || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullDescriptionPt: e.target.value,
                      })
                    }
                    placeholder="Descreva o processo criativo, desafios e soluções..."
                    className="bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 min-h-[150px] focus:outline-none focus:border-zarco-cyan transition-colors resize-none text-white/70 text-sm"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      Client Goals & Outcomes (EN)
                    </label>
                    <Globe className="w-4 h-4 text-white/20" />
                  </div>
                  <textarea
                    value={formData.goals || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goals: e.target.value })
                    }
                    placeholder="What were the measurable results?"
                    className="bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 min-h-[120px] focus:outline-none focus:border-zarco-cyan transition-colors resize-none text-white/70 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                      Objetivos e Resultados (PT)
                    </label>
                    <Languages className="w-4 h-4 text-white/20" />
                  </div>
                  <textarea
                    value={formData.goalsPt || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalsPt: e.target.value })
                    }
                    placeholder="Quais foram os resultados mensuráveis?"
                    className="bg-[#0c1417] border border-white/10 rounded-xl px-6 py-4 min-h-[120px] focus:outline-none focus:border-zarco-cyan transition-colors resize-none text-white/70 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Assets */}
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <CardHeader className="px-0 pt-0 mb-8 border-b border-white/5 pb-6">
              <CardTitle className="text-xl font-bold uppercase tracking-tight text-white">Media Assets</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-12">
              {/* Main Cover Image */}
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                  Main Cover Image
                </label>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div
                      className="aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-[#0c1417] flex flex-col items-center justify-center gap-4 relative overflow-hidden group cursor-pointer hover:border-zarco-cyan/30 transition-all"
                      onClick={() =>
                        document.getElementById("mainImageInput")?.click()
                      }
                    >
                      {uploading === "main" ? (
                        <Loader2 className="w-8 h-8 text-zarco-cyan animate-spin" />
                      ) : formData.image ? (
                        <>
                          <img
                            src={formData.image}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <Upload className="w-8 h-8 text-white" />
                            <span className="text-[10px] font-bold uppercase tracking-widest ml-2">
                              Replace Image
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white/20" />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-1">
                              Upload Main Cover
                            </p>
                            <p className="text-[9px] text-white/20 uppercase tracking-widest">
                              or click to browse assets
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        id="mainImageInput"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "main")
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Manually provide URL instead
                    </p>
                    <Input
                      value={formData.image || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Paste image link (Unsplash, etc.)"
                      className="bg-[#0c1417] border-white/10 rounded-xl px-6 h-14 focus-visible:ring-zarco-cyan text-white"
                    />
                    <p className="text-[10px] text-white/30 italic">
                      High-res 1920x1080 recommended for best results on the
                      platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="flex flex-col gap-6 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Gallery Images
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addGalleryUrl}
                      className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white border-none"
                    >
                      Add URL
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(formData.gallery || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-2xl overflow-hidden bg-black relative group border border-white/5"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <div
                    className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-[#0c1417] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zarco-cyan/30 transition-all group"
                    onClick={() =>
                      document.getElementById("galleryInput")?.click()
                    }
                  >
                    {uploading === "gallery" ? (
                      <Loader2 className="w-6 h-6 text-zarco-cyan animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-white/20 group-hover:text-zarco-cyan transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                          Add Image
                        </span>
                      </>
                    )}
                    <input
                      id="galleryInput"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach((file) =>
                            handleFileUpload(file as File, "gallery"),
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links & Tech Stack */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <CardHeader className="px-0 pt-0 mb-8 border-b border-white/5 pb-6">
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-white">
                  External Links
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Live URL
                  </label>
                  <div className="flex items-center gap-3 bg-[#0c1417] border border-white/10 rounded-xl px-4 overflow-hidden focus-within:border-zarco-cyan">
                    <Globe className="w-4 h-4 text-white/20" />
                    <Input
                      value={formData.liveUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          liveUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.project-domain.com"
                      className="bg-transparent border-none focus-visible:ring-0 h-14 text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Repository (Optional)
                  </label>
                  <div className="flex items-center gap-3 bg-[#0c1417] border border-white/10 rounded-xl px-4 overflow-hidden focus-within:border-zarco-cyan">
                    <Github className="w-4 h-4 text-white/20" />
                    <Input
                      value={formData.repoUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          repoUrl: e.target.value,
                        })
                      }
                      placeholder="github.com/zarcostudio/..."
                      className="bg-transparent border-none focus-visible:ring-0 h-14 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
              <CardHeader className="px-0 pt-0 mb-8 border-b border-white/5 pb-6">
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-white">
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                {Object.entries(TECHNICAL_STACK).map(([category, techs]) => (
                  <div key={category} className="space-y-2 text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#4fd1dc] block mb-2 opacity-80">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => {
                        const isSelected = (formData.techStack || []).includes(tech);
                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => toggleTech(tech)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              isSelected
                                ? "bg-zarco-cyan text-black border-zarco-cyan shadow-[0_0_15px_rgba(79,209,220,0.3)]"
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                            }`}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 pt-12">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-12 py-8 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-12 py-8 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] group flex items-center"
            >
              {view === "create" ? "Add Project" : "Save Changes"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div id="admin-portfolio-content" className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter">
          Portfolio
        </h2>
        <Button
          onClick={handleAddNewPortfolioProject}
          className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Start New Project
        </Button>
      </div>

      {/* Admin Portfolio Search Bar */}
      {projects.length > 0 && (
        <div className="relative mb-8 max-w-md animate-fade-in">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={adminProjectSearch}
            onChange={(e) => setAdminProjectSearch(e.target.value)}
            placeholder="Search projects by title, year, company/institution..."
            className="w-full h-11 pl-12 pr-10 bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-zarco-cyan/50 focus:bg-white/[0.04] transition-all rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white placeholder-white/20 outline-none"
          />
          {adminProjectSearch && (
            <button
              onClick={() => setAdminProjectSearch("")}
              className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <ImageIcon className="w-12 h-12 text-white/10 mb-6" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white/40">
              No projects found
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-2">
              Start by creating your first bespoke experience
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/[0.01] flex flex-col items-center justify-center gap-4">
            <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">
              No projects match your search criteria.
            </p>
            <button
              onClick={() => setAdminProjectSearch("")}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="bg-[#0a1114] border-white/5 rounded-[2rem] overflow-hidden group hover:border-zarco-cyan/20 transition-all text-left"
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                <img
                  src={project.image}
                  alt=""
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() =>
                      toggleStatusUpdate(
                        project.id,
                        "isActive",
                        project.isActive ?? true,
                      )
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border ${
                      project.isActive !== false
                        ? "bg-green-500/20 border-green-500/30 text-green-500"
                        : "bg-red-500/20 border-red-500/30 text-red-500"
                    }`}
                  >
                    {project.isActive !== false ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      toggleStatusUpdate(
                        project.id,
                        "isFeatured",
                        project.isFeatured ?? false,
                      )
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border ${
                      project.isFeatured
                        ? "bg-zarco-cyan/20 border-zarco-cyan/30 text-zarco-cyan"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${project.isFeatured ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zarco-cyan mb-1">
                      {project.category}
                    </p>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white line-clamp-1">
                      {project.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-white/20">
                    {project.year}
                  </span>
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 py-4 border border-white/5 rounded-xl flex items-center justify-center gap-2"
                      onClick={() => handleEdit(project)}
                    >
                      <Settings className="w-4 h-4" />
                      Edit Project
                    </Button>

                    {projectConfirmingDelete === project.id ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-11 rounded-xl transition-all active:scale-95 border-none"
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProjectConfirmingDelete(null);
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
                          setProjectConfirmingDelete(project.id);
                        }}
                        className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 rounded-xl transition-colors h-auto flex items-center justify-center"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
