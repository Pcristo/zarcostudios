import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Upload, Linkedin, Star } from "lucide-react";
import { Review } from "../../types/pricing";

export function ReviewForm({
  review,
  onSave,
  onCancel,
  saving,
  uploadToCloudinary,
  showAdminToast,
}: {
  review: Review | null;
  onSave: (data: Partial<Review>) => void;
  onCancel: () => void;
  saving: boolean;
  uploadToCloudinary: (file: File, folderName?: string) => Promise<string>;
  showAdminToast: (message: string, type?: "success" | "error" | "warning") => void;
}) {
  const [formData, setFormData] = useState<Partial<Review>>(
    review || {
      name: "",
      companyName: "",
      avatar: "",
      reviewTextEn: "",
      reviewTextPt: "",
      lang: "both",
      show: true,
      rating: 5,
      linkedInUsername: "",
    }
  );
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "portfolio/reviews");
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      showAdminToast("Avatar upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            {review ? "Edit" : "Add"}{" "}
            <span className="text-zarco-cyan text-glow">Review</span>
          </h2>
          <p className="text-white/40 text-sm italic uppercase tracking-widest">
            {review
              ? "Modify the existing client testimonial."
              : "Add a new client review to build trust and social proof."}
          </p>
        </div>
      </div>

      <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <div className="flex flex-col items-center justify-center p-8 bg-[#0c1417] rounded-3xl border border-white/5">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-zarco-cyan/50 ring-4 ring-white/5">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Plus className="w-8 h-8 text-white/20" />
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-zarco-cyan animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zarco-cyan rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="w-3 h-3 text-black" />
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4">
                  Client Avatar
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-[#0c1417] border border-white/5 rounded-2xl">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">
                      Public Visibility
                    </h4>
                    <p
                      className={`text-xs font-black uppercase tracking-widest ${
                        formData.show ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formData.show ? "Currently Active" : "Currently Hidden"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, show: !formData.show })
                    }
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.show
                        ? "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {formData.show ? "Disable" : "Enable"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Avatar URL (Manual)
                  </label>
                  <Input
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    LinkedIn Username
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.linkedInUsername || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedInUsername: e.target.value,
                        })
                      }
                      className="bg-[#0c1417] border-white/10 rounded-xl h-14 pl-12"
                      placeholder="e.g. johnsmith"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <Linkedin className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[9px] text-white/20 mt-1 italic">
                    Username only, e.g. 'pedrocristo' from
                    linkedin.com/in/pedrocristo
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Order
                  </label>
                  <Input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="0"
                  />
                  <p className="text-[9px] text-white/20 mt-1 italic">
                    Lower numbers show first on the homepage.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Rating
                  </label>
                  <div className="flex gap-2 p-2 bg-[#0c1417] rounded-xl border border-white/10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-2 transition-all hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            formData.rating && formData.rating >= star
                              ? "text-zarco-cyan fill-zarco-cyan"
                              : "text-white/10"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Client Name
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Company Name
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                    placeholder="e.g. TechFlow Solutions"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Display Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["en", "pt", "both"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setFormData({ ...formData, lang: l as any })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.lang === l
                          ? "bg-zarco-cyan/20 border-zarco-cyan/50 text-zarco-cyan"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {l === "both" ? "Hybrid" : l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Review Text (English)
                </label>
                <textarea
                  required
                  value={formData.reviewTextEn}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewTextEn: e.target.value })
                  }
                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-zarco-cyan focus:outline-none min-h-[120px] resize-none"
                  placeholder="The international version of the testimonial..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Texto da Avaliação (Português)
                </label>
                <textarea
                  value={formData.reviewTextPt}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewTextPt: e.target.value })
                  }
                  className="w-full bg-[#0c1417] border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-zarco-cyan focus:outline-none min-h-[120px] resize-none"
                  placeholder="A versão em português do testemunho..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="bg-transparent border-white/10 text-white/60 font-bold uppercase tracking-widest text-[11px] rounded-xl px-12 py-6 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl px-12 py-6 hover:bg-zarco-cyan/90 border-none transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : review ? (
                "Update Review"
              ) : (
                "Save Review"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
