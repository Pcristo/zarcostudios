import React from "react";
import { Card } from "@/components/ui/card";
import { FolderRoot, LayoutDashboard, Users, Receipt } from "lucide-react";

interface AdminStatsGridProps {
  projectsCount: number;
  clientProjectsCount: number;
  clientsCount: number;
  invoicesCount: number;
}

export function AdminStatsGrid({
  projectsCount,
  clientProjectsCount,
  clientsCount,
  invoicesCount,
}: AdminStatsGridProps) {
  return (
    <div id="admin-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
      <Card className="bg-[#0a1114] border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <FolderRoot className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center mb-8">
            <FolderRoot className="w-6 h-6 text-zarco-cyan" />
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter">{projectsCount}</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Total Projects</p>
        </div>
      </Card>

      <Card className="bg-[#0a1114] border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <LayoutDashboard className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center mb-8">
            <LayoutDashboard className="w-6 h-6 text-zarco-cyan" />
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter">{clientProjectsCount}</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Managed Client Deliveries</p>
        </div>
      </Card>

      <Card className="bg-[#0a1114] border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center mb-8">
            <Users className="w-6 h-6 text-zarco-cyan" />
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter">{clientsCount}</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Onboarded Elite Clients</p>
        </div>
      </Card>

      <Card className="bg-[#0a1114] border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Receipt className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center mb-8">
            <Receipt className="w-6 h-6 text-zarco-cyan" />
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter">{invoicesCount}</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Financial Statements</p>
        </div>
      </Card>
    </div>
  );
}
