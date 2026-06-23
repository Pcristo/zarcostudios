import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  Eye,
  EyeOff,
  LayoutList,
  Grid3X3,
  Plus,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Linkedin,
  Upload,
} from "lucide-react";
import { Review, TestimonialsSettings, AdminView } from "../../types";

interface AdminReviewsProps {
  view: AdminView;
  setView: React.Dispatch<React.SetStateAction<AdminView>>;
  reviews: Review[];
  editingReview: Review | null;
  setEditingReview: React.Dispatch<React.SetStateAction<Review | null>>;
  loadingReviews: boolean;
  savingReview: boolean;
  testimonialsSettings: TestimonialsSettings;
  toggleTestimonialsSection: (show: boolean) => Promise<void>;
  toggleTestimonialsDisplayMode: (mode: "grid" | "carousel") => Promise<void>;
  toggleReviewStatus: (id: string, currentShow: boolean) => Promise<void>;
  handleSaveReview: (data: Partial<Review>) => Promise<void>;
  handleDeleteReview: (id: string) => Promise<void>;
  uploadToCloudinary: (file: File, folderName?: string) => Promise<string>;
  showAdminToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export function AdminReviews({
  view,
  setView,
  reviews,
  editingReview,
  setEditingReview,
  loadingReviews,
  savingReview,
  testimonialsSettings,
  toggleTestimonialsSection,
  toggleTestimonialsDisplayMode,
  toggleReviewStatus,
  handleSaveReview,
  handleDeleteReview,
  uploadToCloudinary,
  showAdminToast,
}: AdminReviewsProps) {
  const [reviewConfirmingDelete, setReviewConfirmingDelete] = useState<string | null>(null);

  if (view === "reviews-form") {
    return (
      <ReviewForm
        review={editingReview}
        onSave={handleSaveReview}
        onCancel={() => setView("reviews-list")}
        saving={savingReview}
        uploadToCloudinary={uploadToCloudinary}
        showAdminToast={showAdminToast}
      />
    );
  }

  return (
    <div id="admin-reviews-list-content" className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zarco-cyan/10 border border-zarco-cyan/20">
            <Star className="w-3 h-3 text-zarco-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zarco-cyan">Testimonials Module</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Client <span className="text-zarco-cyan">Reviews</span>
          </h1>
          <p className="text-white/40 font-medium max-w-md">
            Manage client testimonials and toggle the visibility of the section on the homepage.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-4 p-4 bg-[#0a1114] border border-white/5 rounded-2xl w-fit">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${testimonialsSettings.showSection ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {testimonialsSettings.showSection ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Homepage Visibility</p>
                  <p className={`text-xs font-black uppercase tracking-widest ${testimonialsSettings.showSection ? "text-green-500" : "text-red-500"}`}>
                    Section is {testimonialsSettings.showSection ? "Currently Live" : "Now Hidden"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => toggleTestimonialsSection(testimonialsSettings.showSection)}
                className={`ml-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  testimonialsSettings.showSection 
                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" 
                    : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {testimonialsSettings.showSection ? "Disable Component" : "Enable Component"}
              </Button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#0a1114] border border-white/5 rounded-2xl w-fit">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zarco-cyan/10">
                  {testimonialsSettings.displayMode === 'carousel' ? <LayoutList className="w-5 h-5 text-zarco-cyan" /> : <Grid3X3 className="w-5 h-5 text-zarco-cyan" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Display Layout</p>
                  <p className="text-xs font-black uppercase tracking-widest text-zarco-cyan">
                    {testimonialsSettings.displayMode === 'carousel' ? "Carousel Mode" : "Grid Mode"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => toggleTestimonialsDisplayMode(testimonialsSettings.displayMode)}
                className="ml-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zarco-cyan/20 text-zarco-cyan hover:bg-zarco-cyan hover:text-black transition-all"
              >
                Switch to {testimonialsSettings.displayMode === 'carousel' ? "Grid" : "Carousel"}
              </Button>
            </div>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingReview(null);
            setView("reviews-form");
          }}
          className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:scale-105 active:scale-95 transition-all border-none flex items-center gap-2 shadow-[0_10px_30px_rgba(0,183,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add New Review
        </Button>
      </div>

      {loadingReviews ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0a1114] border border-white/5 rounded-[2.5rem]">
          <Loader2 className="w-12 h-12 text-zarco-cyan animate-spin mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Loading reviews data...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-[#0a1114] border border-white/5 rounded-[2.5rem]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">No reviews found</h3>
          <p className="text-white/30 text-sm max-w-xs mx-auto">Start building trust by adding your first client testimonial.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-[#0a1114] border-white/5 rounded-[2rem] p-8 group hover:border-zarco-cyan/20 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 ring-2 ring-white/10">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-black uppercase tracking-tight">{review.name}</h4>
                      {review.linkedInUsername && (
                        <Linkedin className="w-3 h-3 text-white/20" />
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{review.companyName}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                    review.lang === 'en' ? 'bg-blue-500/10 text-blue-500' :
                    review.lang === 'pt' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {review.lang === 'both' ? 'Hybrid' : review.lang}
                  </span>
                  <button 
                    onClick={() => toggleReviewStatus(review.id, review.show)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${review.show ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  >
                    {review.show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 italic text-white/60 text-sm mb-8 relative">
                <span className="absolute -top-4 -left-2 text-4xl text-zarco-cyan/20 font-black">"</span>
                <p className="line-clamp-4 leading-relaxed">
                  {review.reviewTextEn || review.reviewTextPt}
                </p>
              </div>

              <div className="flex gap-2 pt-6 border-t border-white/5">
                <Button
                  onClick={() => {
                    setEditingReview(review);
                    setView("reviews-form");
                  }}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] h-11"
                  variant="outline"
                >
                  Edit Review
                </Button>
                <Button
                  onClick={() => setReviewConfirmingDelete(review.id)}
                  className="w-11 h-11 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-xl flex items-center justify-center p-0"
                  variant="outline"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviewConfirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="bg-[#0a1114] border-red-500/20 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white text-center mb-2">Delete Review?</h3>
            <p className="text-white/40 text-center text-sm font-medium mb-8 leading-relaxed">
              This action is permanent and cannot be undone. Are you sure you want to delete this testimonial?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setReviewConfirmingDelete(null)}
                className="bg-white/5 text-white/40 hover:text-white rounded-xl py-6 font-black uppercase tracking-widest text-[10px] border-none hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDeleteReview(reviewConfirmingDelete);
                  setReviewConfirmingDelete(null);
                }}
                className="bg-red-600 text-white rounded-xl py-6 font-black uppercase tracking-widest text-[10px] border-none hover:bg-red-700 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReviewForm({
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
    <div className="max-w-4xl mx-auto animate-fade-in">
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
                    Username only, e.g. 'pedrocristo' from linkedin.com/in/pedrocristo
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
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
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
                      setFormData({
                        ...formData,
                        companyName: e.target.value,
                      })
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
                      onClick={() =>
                        setFormData({ ...formData, lang: l as any })
                      }
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
