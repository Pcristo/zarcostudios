import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trash2, RotateCcw, Loader2, Users, FolderRoot, Receipt } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

interface AdminTrashBinProps {
  trashItems: any[];
  setTrashItems: React.Dispatch<React.SetStateAction<any[]>>;
  loadingTrash: boolean;
  handleRestoreTrashItem: (item: any) => Promise<void>;
  handlePermanentDelete: (id: string) => Promise<void>;
  showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export function AdminTrashBin({
  trashItems,
  setTrashItems,
  loadingTrash,
  handleRestoreTrashItem,
  handlePermanentDelete,
  showAdminToast,
}: AdminTrashBinProps) {
  const [trashFilter, setTrashFilter] = useState<"all" | "client" | "project" | "bill">("all");
  const [trashConfirmingDelete, setTrashConfirmingDelete] = useState<string | null>(null);
  const [confirmingEmptyTrash, setConfirmingEmptyTrash] = useState(false);

  return (
    <div id="admin-trash-bin-content" className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="w-3 h-3 text-red-400" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Recycle Bin</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Deleted <span className="text-red-400">Items</span>
          </h1>
          <p className="text-white/40 text-[11px] font-medium max-w-md uppercase tracking-wider">
            Restore previously deleted clients, projects, or billing invoices, or delete them permanently.
          </p>
        </div>

        {trashItems.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {confirmingEmptyTrash ? (
              <div className="flex items-center gap-2 bg-red-500/10 p-1.5 rounded-xl border border-red-500/20">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-400 px-2">
                  Are you sure?
                </span>
                <button
                  onClick={async () => {
                    try {
                      const batchDeletes = trashItems.map(item => deleteDoc(doc(db, "trash", item.id)));
                      await Promise.all(batchDeletes);
                      setTrashItems([]);
                      setConfirmingEmptyTrash(false);
                      showAdminToast("Trash Bin emptied successfully!", "success");
                    } catch (error) {
                      try {
                        handleFirestoreError(error, OperationType.DELETE, "trash/all");
                      } catch (err) {
                        // error is already logged and alerted
                      }
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[8px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Yes, Empty
                </button>
                <button
                  onClick={() => setConfirmingEmptyTrash(false)}
                  className="bg-white/10 hover:bg-white/25 text-white font-black uppercase tracking-widest text-[8px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingEmptyTrash(true)}
                className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 font-black uppercase tracking-widest text-[9px] px-6 py-3 rounded-xl transition-all h-fit cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Empty Bin
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0a1114] border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setTrashFilter("all")}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trashFilter === "all" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"}`}
        >
          All ({trashItems.length})
        </button>
        <button
          onClick={() => setTrashFilter("client")}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trashFilter === "client" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"}`}
        >
          Clients ({trashItems.filter(item => item.type === "client").length})
        </button>
        <button
          onClick={() => setTrashFilter("project")}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trashFilter === "project" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"}`}
        >
          Projects ({trashItems.filter(item => item.type === "project").length})
        </button>
        <button
          onClick={() => setTrashFilter("bill")}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trashFilter === "bill" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white"}`}
        >
          Bills ({trashItems.filter(item => item.type === "bill").length})
        </button>
      </div>

      {/* Deleted Items Listing */}
      {loadingTrash ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      ) : trashItems.filter(item => trashFilter === "all" || item.type === trashFilter).length === 0 ? (
        <div className="border border-white/5 bg-[#0a1114]/50 rounded-[2rem] p-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-2">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-white text-lg font-black uppercase tracking-tight">Your bin is pristine</h3>
          <p className="text-white/30 text-xs max-w-xs leading-relaxed uppercase font-bold tracking-wider">No deleted items match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashItems
            .filter(item => trashFilter === "all" || item.type === trashFilter)
            .map((item) => {
              const iconColor = item.type === "client" ? "text-zarco-cyan bg-zarco-cyan/10 border-zarco-cyan/25" 
                              : item.type === "project" ? "text-zarco-purple bg-zarco-purple/10 border-zarco-purple/25" 
                              : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
              
              const itemIcon = item.type === "client" ? <Users className="w-4 h-4" />
                             : item.type === "project" ? <FolderRoot className="w-4 h-4" />
                             : <Receipt className="w-4 h-4" />;

              return (
                <Card key={item.id} className="bg-[#0a1114] border-white/5 rounded-[2rem] p-6 group hover:border-red-500/20 transition-all flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`p-2.5 rounded-2xl border ${iconColor}`}>
                        {itemIcon}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#9ca3af]/40 h-fit bg-white/5 border border-white/10 rounded-lg px-2 py-0.5">
                        {new Date(item.deletedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block tracking-widest">
                        {item.type} • {item.originalCollection}
                      </span>
                      <h4 className="text-white font-black text-sm uppercase tracking-tight line-clamp-1 block leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[9px] font-bold text-[#e5e7eb]/40 uppercase tracking-widest truncate mt-1">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6">
                    {trashConfirmingDelete === item.id ? (
                      <div className="flex-1 flex gap-2 items-center bg-red-500/10 p-1.5 rounded-xl border border-red-500/20 w-full justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400 px-2">
                          Permanent?
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[8px] px-3 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setTrashConfirmingDelete(null)}
                            className="bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[8px] px-3 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestoreTrashItem(item)}
                          className="flex-1 bg-[#0d171a] hover:bg-[#122226] text-zarco-cyan text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </button>
                        <button
                          onClick={() => setTrashConfirmingDelete(item.id)}
                          className="flex-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border border-red-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
