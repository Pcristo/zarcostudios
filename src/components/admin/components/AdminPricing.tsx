import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  X,
  ChevronDown,
} from "lucide-react";
import { PricingPlan, PricingSettings, AdminView } from "../types";

interface AdminPricingProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  pricingPlans: PricingPlan[];
  loading: boolean;
  savingPricing: boolean;
  pricingSettings: PricingSettings;
  editingPlan: PricingPlan | null;
  setEditingPlan: React.Dispatch<React.SetStateAction<PricingPlan | null>>;
  planConfirmingDelete: string | null;
  setPlanConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddPlan: () => void;
  handleEditPlan: (plan: PricingPlan) => void;
  handleDeletePlan: (id: string) => Promise<void>;
  handleSavePlan: (e: React.FormEvent) => Promise<void>;
  togglePricingSection: (show: boolean) => Promise<void>;
  handleSeedDefaultPlans: () => Promise<void>;
}

export function AdminPricing({
  view,
  setView,
  pricingPlans,
  loading,
  savingPricing,
  pricingSettings,
  editingPlan,
  setEditingPlan,
  planConfirmingDelete,
  setPlanConfirmingDelete,
  handleAddPlan,
  handleEditPlan,
  handleDeletePlan,
  handleSavePlan,
  togglePricingSection,
  handleSeedDefaultPlans,
}: AdminPricingProps) {
  if (view === "pricing-form" && editingPlan) {
    return (
      <form onSubmit={handleSavePlan} className="max-w-5xl mx-auto pb-20 animate-fade-in">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              {editingPlan.id.startsWith("plan-") &&
              !pricingPlans.find((p) => p.id === editingPlan.id)
                ? "Create Pricing Plan"
                : "Edit Pricing Plan"}
            </h2>
            <p className="text-white/40 text-sm">
              Configure your plan details, features, and multi-language
              support.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setView("pricing-list")}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={savingPricing}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {savingPricing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Plan"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-white/60">
                  Display plan publicly
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPlan({
                      ...editingPlan,
                      show: !editingPlan.show,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingPlan.show ? "bg-zarco-cyan" : "bg-white/10"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingPlan.show ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-white/60">
                  Highlight as featured
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPlan({
                      ...editingPlan,
                      isHighlighted: !editingPlan.isHighlighted,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingPlan.isHighlighted ? "bg-zarco-cyan" : "bg-white/10"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingPlan.isHighlighted ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* EN Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zarco-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">
                    English Content
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Plan Name
                      </label>
                      <Input
                        required
                        value={editingPlan.nameEn}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            nameEn: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Price Suffix
                      </label>
                      <Input
                        value={editingPlan.priceSuffixEn}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            priceSuffixEn: e.target.value,
                          })
                        }
                        placeholder="/ Ex VAT"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Description
                    </label>
                    <textarea
                      value={editingPlan.descriptionEn}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          descriptionEn: e.target.value,
                        })
                      }
                      className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[80px] text-sm text-white focus:outline-none focus:border-zarco-cyan"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Button Text
                    </label>
                    <Input
                      value={editingPlan.buttonTextEn}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          buttonTextEn: e.target.value,
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Services / Features
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPlan({
                            ...editingPlan,
                            servicesEn: [...editingPlan.servicesEn, ""],
                          })
                        }
                        className="text-zarco-cyan text-[10px] font-black uppercase hover:underline"
                      >
                        + Add Service
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingPlan.servicesEn.map((service, sIndex) => (
                        <div key={sIndex} className="flex gap-2">
                          <Input
                            value={service}
                            onChange={(e) => {
                              const newServices = [
                                ...editingPlan.servicesEn,
                              ];
                              newServices[sIndex] = e.target.value;
                              setEditingPlan({
                                ...editingPlan,
                                servicesEn: newServices,
                              });
                            }}
                            className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPlan({
                                ...editingPlan,
                                servicesEn: editingPlan.servicesEn.filter(
                                  (_, i) => i !== sIndex,
                                ),
                              })
                            }
                            className="p-2 text-white/20 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PT Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Portuguese Content
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Nome do Plano
                      </label>
                      <Input
                        value={editingPlan.namePt}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            namePt: e.target.value,
                          })
                        }
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Sufixo de Preço
                      </label>
                      <Input
                        value={editingPlan.priceSuffixPt}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            priceSuffixPt: e.target.value,
                          })
                        }
                        placeholder="/ Sem IVA"
                        className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Descrição
                    </label>
                    <textarea
                      value={editingPlan.descriptionPt}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          descriptionPt: e.target.value,
                        })
                      }
                      className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 min-h-[80px] text-sm text-white focus:outline-none focus:border-zarco-cyan"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Texto do Botão
                    </label>
                    <Input
                      value={editingPlan.buttonTextPt}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          buttonTextPt: e.target.value,
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-12 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/30 uppercase">
                        Serviços / Funcionalidades
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPlan({
                            ...editingPlan,
                            servicesPt: [...editingPlan.servicesPt, ""],
                          })
                        }
                        className="text-white/40 text-[10px] font-black uppercase hover:underline"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingPlan.servicesPt.map((service, sIndex) => (
                        <div key={sIndex} className="flex gap-2">
                          <Input
                            value={service}
                            onChange={(e) => {
                              const newServices = [
                                ...editingPlan.servicesPt,
                              ];
                              newServices[sIndex] = e.target.value;
                              setEditingPlan({
                                ...editingPlan,
                                servicesPt: newServices,
                              });
                            }}
                            className="bg-[#0c1417] border-white/10 rounded-xl h-10 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPlan({
                                ...editingPlan,
                                servicesPt: editingPlan.servicesPt.filter(
                                  (_, i) => i !== sIndex,
                                ),
                              })
                            }
                            className="p-2 text-white/20 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-end mt-12 pt-8 border-t border-white/5">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Base Price (€)
                    </label>
                    <Input
                      type="number"
                      required
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          price: Number(e.target.value),
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Discount (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingPlan.discountPercentage}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          discountPercentage: Number(e.target.value),
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Periodicity
                    </label>
                    <div className="relative border-none">
                      <select
                        value={editingPlan.periodicity}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            periodicity: e.target.value,
                          })
                        }
                        className="w-full bg-[#0c1417] border border-white/10 rounded-xl px-4 h-14 focus:outline-none focus:border-zarco-cyan appearance-none text-white text-xs"
                      >
                        {[
                          "Hourly",
                          "Monthly",
                          "Yearly",
                          "One Time",
                          "2 Years",
                          "One Time Purchase",
                        ].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      value={editingPlan.order}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          order: Number(e.target.value),
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 p-6 bg-zarco-cyan/5 rounded-2xl border border-zarco-cyan/10">
                <p className="text-[10px] font-bold text-white/40 uppercase mb-2">
                  Preview Final Price
                </p>
                <p className="text-3xl font-black text-white leading-none">
                  €
                  {(
                    editingPlan.price *
                    (1 - editingPlan.discountPercentage / 100)
                  ).toFixed(0)}
                  <span className="text-xs text-white/30 ml-2">
                    {editingPlan.priceSuffixEn}
                  </span>
                </p>
                {editingPlan.discountPercentage > 0 && (
                  <p className="text-[10px] font-bold text-zarco-cyan uppercase mt-2">
                    -{editingPlan.discountPercentage}% APPLIED
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </form>
    );
  }

  return (
    <div id="admin-pricing-list-content" className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Pricing Management
          </h2>
          <p className="text-white/40 text-sm">
            Review and manage your service tiers and pricing visibility.
          </p>
        </div>
        <Button
          onClick={handleAddPlan}
          className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
        >
          Create New Plan
        </Button>
      </div>

      <div className="bg-[#0a1114] border border-white/5 rounded-[2rem] p-6 mb-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pricingSettings.showSection ? "bg-green-500/10" : "bg-red-500/10"}`}>
            {pricingSettings.showSection ? (
              <Eye className="w-6 h-6 text-green-500" />
            ) : (
              <EyeOff className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Homepage Visibility</p>
            <p className={`text-base font-black uppercase tracking-widest ${pricingSettings.showSection ? "text-green-500" : "text-red-500"}`}>
              Section is {pricingSettings.showSection ? "Currently Live" : "Now Hidden"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => togglePricingSection(pricingSettings.showSection)}
          className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${
            pricingSettings.showSection 
              ? "bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" 
              : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
          }`}
        >
          {pricingSettings.showSection ? "Disable Component" : "Enable Component"}
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-6" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 italic">
              Syncing Pricing Data...
            </h3>
          </div>
        ) : pricingPlans.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <Settings className="w-12 h-12 text-white/10 mb-6" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white/40 mb-6">
              No plans configured
            </h3>
            <Button
              onClick={handleSeedDefaultPlans}
              className="bg-zarco-cyan/10 text-zarco-cyan border border-zarco-cyan/20 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-zarco-cyan/20"
            >
              Seed Default Plans to Database
            </Button>
          </div>
        ) : (
          pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all ${!plan.show ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-10 flex-1">
                  <div className="flex flex-col min-w-[200px]">
                    <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-1">
                      {plan.periodicity}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">
                      {plan.nameEn}
                    </h3>
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed max-w-sm mb-3">
                      {plan.descriptionEn}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.servicesEn.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-bold text-white/20 uppercase tracking-tighter border border-white/5 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                      {plan.servicesEn.length > 3 && (
                        <span className="text-[9px] font-bold text-white/20 uppercase">
                          +{plan.servicesEn.length - 3} More
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-16 w-px bg-white/5" />
                  <div className="flex flex-col min-w-[120px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
                      Base Price
                    </span>
                    <span className="text-xl font-bold text-white">
                      €{plan.price}
                    </span>
                    <span className="text-[10px] text-white/30 font-medium">
                      {plan.priceSuffixEn}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {plan.discountPercentage > 0 && (
                      <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                          -{plan.discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                    {plan.isHighlighted && (
                      <div className="px-3 py-1 bg-zarco-cyan/10 rounded-full border border-zarco-cyan/20">
                        <span className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest">
                          Featured
                        </span>
                      </div>
                    )}
                    {!plan.show && (
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleEditPlan(plan)}
                    className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-zarco-cyan hover:text-white hover:bg-zarco-cyan/10 border-none"
                  >
                    Manage Plan
                  </Button>
                  
                  {planConfirmingDelete === plan.id ? (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 h-10 rounded-xl transition-all active:scale-95"
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPlanConfirmingDelete(null);
                        }}
                        className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 h-10 rounded-xl transition-all"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        console.log("Delete button clicked for pricing plan:", plan.id);
                        e.preventDefault();
                        e.stopPropagation();
                        setPlanConfirmingDelete(plan.id);
                      }}
                      className="text-white/30 hover:text-white hover:bg-red-500 h-10 w-10 flex items-center justify-center transition-all rounded-xl border border-white/5 active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
