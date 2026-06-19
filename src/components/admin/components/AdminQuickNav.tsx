import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, FolderRoot, Users, Receipt, Settings } from "lucide-react";
import { PricingSettings, NewsletterSettings, TestimonialsSettings, AdminView } from "../types";

interface AdminQuickNavProps {
  setView: (view: AdminView) => void;
  pricingSettings: PricingSettings;
  newsletterSettings: NewsletterSettings;
  testimonialsSettings: TestimonialsSettings;
  togglePricingSection: (show: boolean) => Promise<void>;
  toggleNewsletterSection: (show: boolean) => Promise<void>;
  toggleTestimonialsSection: (show: boolean) => Promise<void>;
}

export function AdminQuickNav({
  setView,
  pricingSettings,
  newsletterSettings,
  testimonialsSettings,
  togglePricingSection,
  toggleNewsletterSection,
  toggleTestimonialsSection,
}: AdminQuickNavProps) {
  return (
    <div id="admin-quick-nav-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight ml-2">Quick Navigation</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Portfolio", icon: FolderRoot, view: "portfolio-list" },
            { label: "Clients", icon: Users, view: "clients-list" },
            { label: "Billing", icon: Receipt, view: "billing-list" },
            { label: "Settings", icon: Settings, view: "settings" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.view as any)}
              className="group p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-zarco-cyan/20 hover:bg-zarco-cyan/5 transition-all text-left"
            >
              <item.icon className="w-6 h-6 text-white/20 group-hover:text-zarco-cyan transition-colors mb-4" />
              <span className="block text-sm font-black text-white/40 group-hover:text-white uppercase tracking-widest leading-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight ml-2">Service Status</h2>
        <div className="space-y-4">
          {[
            { label: "Pricing List", status: pricingSettings.showSection, toggle: togglePricingSection },
            { label: "Subscribers", status: newsletterSettings.showSection, toggle: toggleNewsletterSection },
            { label: "Client Reviews", status: testimonialsSettings.showSection, toggle: toggleTestimonialsSection },
          ].map((item) => (
            <div
              key={item.label}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {item.status ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none mb-1">{item.label}</h4>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${item.status ? "text-green-500/60" : "text-red-500/60"}`}>
                    {item.status ? "Publicly Visible" : "Hidden from Users"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => item.toggle(item.status)}
                className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  item.status
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                    : "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white"
                }`}
              >
                {item.status ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
