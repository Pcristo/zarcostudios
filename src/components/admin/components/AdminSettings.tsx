import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { CompanySettings, PricingSettings, NewsletterSettings, TestimonialsSettings } from "../types";

interface AdminSettingsProps {
  companySettings: CompanySettings;
  setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  loadingSettings: boolean;
  savingSettings: boolean;
  uploading: string | null;
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleQrCodeUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    method: "revolut" | "custom",
    customId?: string
  ) => Promise<void>;
  pricingSettings: PricingSettings;
  newsletterSettings: NewsletterSettings;
  testimonialsSettings: TestimonialsSettings;
  togglePricingSection: (show: boolean) => Promise<void>;
  toggleNewsletterSection: (show: boolean) => Promise<void>;
  toggleTestimonialsSection: (show: boolean) => Promise<void>;
  toggleWhatsappButton: (show: boolean) => Promise<void>;
  toggleTrustWidget: (show: boolean) => Promise<void>;
  toggleMaintenance: (show: boolean) => Promise<void>;
}

export function AdminSettings({
  companySettings,
  setCompanySettings,
  savingSettings,
  uploading,
  handleSaveSettings,
  handleLogoUpload,
  handleQrCodeUpload,
  pricingSettings,
  newsletterSettings,
  testimonialsSettings,
  togglePricingSection,
  toggleNewsletterSection,
  toggleTestimonialsSection,
  toggleWhatsappButton,
  toggleTrustWidget,
  toggleMaintenance,
}: AdminSettingsProps) {
  return (
    <div id="admin-settings-content" className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Agency Configuration
          </h2>
          <p className="text-white/40 text-sm italic uppercase tracking-widest">
            Manage your agency's legal details and billing information.
          </p>
        </div>
        <Button
          form="settings-form"
          type="submit"
          disabled={savingSettings || uploading !== null}
          className="bg-zarco-cyan text-black font-black uppercase tracking-widest text-[11px] px-8 py-6 rounded-xl hover:bg-zarco-cyan/90 transition-all border-none"
        >
          {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>

      <Card className="bg-[#080d0f] border-white/5 rounded-[2.5rem] p-10">
        <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-8">
          <div className="flex flex-col items-center justify-center mb-10 pb-10 border-b border-white/5">
            <div className="relative group">
              <label className="cursor-pointer block">
                <div className="w-32 h-32 rounded-3xl bg-[#0c1417] border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-zarco-cyan/50">
                  {companySettings.logoUrl ? (
                    <img 
                      src={companySettings.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-white/10 group-hover:text-zarco-cyan/50 transition-colors" />
                  )}
                  {uploading === "logo" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-zarco-cyan animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zarco-cyan rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-4 h-4 text-black" />
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6">
              Company Logo
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Company Name
              </label>
              <Input
                required
                value={companySettings.companyName || ""}
                onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="Zarco Studios"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                CRO Number
              </label>
              <Input
                value={companySettings.croNumber || ""}
                onChange={(e) => setCompanySettings({...companySettings, croNumber: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="Agency Registration ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Freelancer Name
              </label>
              <Input
                value={companySettings.freelancerName || ""}
                onChange={(e) => setCompanySettings({...companySettings, freelancerName: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="Professional Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Business Type
              </label>
              <Input
                value={companySettings.businessType || ""}
                onChange={(e) => setCompanySettings({...companySettings, businessType: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="Limited Company / Freelance"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Address Line 1
              </label>
              <Input
                value={companySettings.addressLine1 || ""}
                onChange={(e) => setCompanySettings({...companySettings, addressLine1: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="123 Creative St, Design Quarter"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Address Line 2
              </label>
              <Input
                value={companySettings.addressLine2 || ""}
                onChange={(e) => setCompanySettings({...companySettings, addressLine2: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="Suite 4B, 3rd Floor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Zip Code
              </label>
              <Input
                value={companySettings.zipCode || ""}
                onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="1234-567"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Billing Email
              </label>
              <Input
                type="email"
                value={companySettings.email || ""}
                onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="billing@zarco.studio"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                VAT Number / Tax ID
              </label>
              <Input
                value={companySettings.vatNumber || ""}
                onChange={(e) => setCompanySettings({...companySettings, vatNumber: e.target.value})}
                className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                placeholder="GB 123456789"
              />
            </div>
            <div className="grid grid-cols-2 gap-8 col-span-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  WhatsApp Number (EN)
                </label>
                <Input
                  value={companySettings.whatsappNumber || ""}
                  onChange={(e) => setCompanySettings({...companySettings, whatsappNumber: e.target.value})}
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  placeholder="+44 7000 000000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  WhatsApp Number (PT)
                </label>
                <Input
                  value={companySettings.whatsappNumberPT || ""}
                  onChange={(e) => setCompanySettings({...companySettings, whatsappNumberPT: e.target.value})}
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  placeholder="+351 900 000 000"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Invoice Numbering
              </h3>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sequential Auto-Generation</h4>
                <p className="text-[10px] text-white/40 uppercase font-medium tracking-tight">System automatically assigns the next sequential number</p>
              </div>
              <Button
                type="button"
                onClick={() => setCompanySettings({...companySettings, autoGenerateInvoices: !companySettings.autoGenerateInvoices})}
                className={`h-10 px-6 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  companySettings.autoGenerateInvoices 
                    ? "bg-zarco-cyan text-black shadow-lg shadow-zarco-cyan/20" 
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                {companySettings.autoGenerateInvoices ? "Active" : "Manual"}
              </Button>
            </div>

            <div className={`grid grid-cols-2 gap-8 transition-all duration-300 ${!companySettings.autoGenerateInvoices ? "opacity-50 scale-98" : ""}`}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Invoice Prefix
                </label>
                <Input
                  value={companySettings.invoicePrefix || "INV"}
                  onChange={(e) => setCompanySettings({...companySettings, invoicePrefix: e.target.value})}
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  placeholder="INV"
                />
                <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                  Applied as: {companySettings.invoicePrefix || "INV"}-{new Date().getFullYear()}-0001
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Next Sequence Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setCompanySettings({...companySettings, nextInvoiceNumber: 1})}
                    className="text-[9px] font-bold text-zarco-cyan uppercase tracking-widest hover:underline"
                  >
                    Reset to 0001
                  </button>
                </div>
                <Input
                  type="number"
                  value={companySettings.nextInvoiceNumber || 1}
                  onChange={(e) => setCompanySettings({...companySettings, nextInvoiceNumber: Number(e.target.value)})}
                  className="bg-[#0c1417] border-white/10 rounded-xl h-14"
                  placeholder="1"
                />
                <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                  The next sequential number to be assigned
                </p>
              </div>
            </div>
            {!companySettings.autoGenerateInvoices && (
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest text-center">
                  Manual Mode: You will need to enter the Invoice ID for each invoice manually.
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods Section */}
          <div className="pt-10 border-t border-white/5 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">💳</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">Payment Methods</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bank Transfer */}
              <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="text-lg">🏦</span>
                    </div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest opacity-80">Bank Transfer</label>
                  </div>
                  <input 
                    type="checkbox"
                    checked={companySettings.showBankDetails}
                    onChange={(e) => setCompanySettings({...companySettings, showBankDetails: e.target.checked})}
                    className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                  />
                </div>
                <div className="space-y-4 pt-2">
                  <textarea
                    value={companySettings.bankTransferDetails}
                    onChange={(e) => setCompanySettings({...companySettings, bankTransferDetails: e.target.value})}
                    placeholder="Bank Name: Zarco Bank&#10;IBAN: GB00 0000 0000 0000&#10;SWIFT: ABCDEFGH"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-32 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                  />
                  <p className="text-[9px] text-white/20 uppercase font-medium">Include IBAN, SWIFT, and Account Name</p>
                </div>
              </Card>

              {/* Revolut */}
              <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="text-xl">💸</span>
                    </div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest opacity-80">Revolut</label>
                  </div>
                  <input 
                    type="checkbox"
                    checked={companySettings.showRevolutDetails}
                    onChange={(e) => setCompanySettings({...companySettings, showRevolutDetails: e.target.checked})}
                    className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                  />
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Revolut Tag / Details</label>
                    <textarea
                      value={companySettings.revolutDetails}
                      onChange={(e) => setCompanySettings({...companySettings, revolutDetails: e.target.value})}
                      placeholder="Revolut Tag: @zarco.studio"
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Payment Link</label>
                    <Input 
                      value={companySettings.revolutLink}
                      onChange={(e) => setCompanySettings({...companySettings, revolutLink: e.target.value})}
                      placeholder="e.g. revolut.me/zarco"
                      className="bg-black/20 border-white/10 h-12 text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-2">
                      Revolut QR Code
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                        {companySettings.revolutQrCodeUrl ? (
                          <img src={companySettings.revolutQrCodeUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl opacity-20">🔲</span>
                        )}
                      </div>
                      <label className="h-10 px-4 bg-zarco-cyan/10 border border-zarco-cyan/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zarco-cyan/20 transition-all">
                        <Upload className="w-3 h-3 mr-2 text-zarco-cyan" />
                        <span className="text-[10px] font-black uppercase text-zarco-cyan tracking-widest">
                          {uploading === "qrcode" ? "Uploading..." : "Upload QR"}
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleQrCodeUpload(e, "revolut")}
                          disabled={uploading !== null}
                        />
                      </label>
                      {companySettings.revolutQrCodeUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCompanySettings({...companySettings, revolutQrCodeUrl: ""})}
                          className="text-red-500/40 hover:text-red-500 text-[8px] uppercase font-bold"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-white/20 uppercase font-medium">Revolut Business Tag, Link or QR Code</p>
                </div>
              </Card>

              {/* Custom Payment Providers */}
              {(companySettings.customPayments || []).map((payment) => (
                <Card key={payment.id} className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-4 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPayments = (companySettings.customPayments || []).filter(p => p.id !== payment.id);
                        setCompanySettings({...companySettings, customPayments: newPayments});
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <span className="text-xl">🛠️</span>
                      </div>
                      <div className="space-y-1">
                        <Input 
                          value={payment.name}
                          onChange={(e) => {
                            const newPayments = companySettings.customPayments?.map(p => 
                              p.id === payment.id ? { ...p, name: e.target.value } : p
                            );
                            setCompanySettings({...companySettings, customPayments: newPayments});
                          }}
                          placeholder="Provider Name (e.g. Stripe)"
                          className="bg-transparent border-none p-0 h-auto text-xs font-bold text-white uppercase tracking-widest focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={payment.show}
                      onChange={(e) => {
                        const newPayments = companySettings.customPayments?.map(p => 
                          p.id === payment.id ? { ...p, show: e.target.checked } : p
                        );
                        setCompanySettings({...companySettings, customPayments: newPayments});
                      }}
                      className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan"
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Payment Details</label>
                      <textarea
                        value={payment.details}
                        onChange={(e) => {
                          const newPayments = companySettings.customPayments?.map(p => 
                            p.id === payment.id ? { ...p, details: e.target.value } : p
                          );
                          setCompanySettings({...companySettings, customPayments: newPayments});
                        }}
                        placeholder="e.g. Account Number or Instructions"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-zarco-cyan text-sm text-white/70"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">External Link</label>
                      <Input 
                        value={payment.link}
                        onChange={(e) => {
                          const newPayments = companySettings.customPayments?.map(p => 
                            p.id === payment.id ? { ...p, link: e.target.value } : p
                          );
                          setCompanySettings({...companySettings, customPayments: newPayments});
                        }}
                        placeholder="e.g. stripe.com/pay/xyz"
                        className="bg-black/20 border-white/10 h-12 text-sm"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-2">
                        Provider QR Code
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                          {payment.qrCodeUrl ? (
                            <img src={payment.qrCodeUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xl opacity-20">🔲</span>
                          )}
                        </div>
                        <label className="h-10 px-4 bg-zarco-cyan/10 border border-zarco-cyan/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zarco-cyan/20 transition-all">
                          <Upload className="w-3 h-3 mr-2 text-zarco-cyan" />
                          <span className="text-[10px] font-black uppercase text-zarco-cyan tracking-widest">
                            {uploading === `custom_qrcode_${payment.id}` ? "Uploading..." : "Upload QR"}
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleQrCodeUpload(e, "custom", payment.id)}
                            disabled={uploading !== null}
                          />
                        </label>
                        {payment.qrCodeUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPayments = companySettings.customPayments?.map(p => 
                                p.id === payment.id ? { ...p, qrCodeUrl: "" } : p
                              );
                              setCompanySettings({...companySettings, customPayments: newPayments});
                            }}
                            className="text-red-500/40 hover:text-red-500 text-[8px] uppercase font-bold"
                          >
                            Remove QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add Another Button */}
              <button
                type="button"
                onClick={() => {
                  const newPayment = {
                    id: Date.now().toString(),
                    name: "Custom Provider",
                    details: "",
                    link: "",
                    qrCodeUrl: "",
                    show: true
                  };
                  setCompanySettings({
                    ...companySettings,
                    customPayments: [...(companySettings.customPayments || []), newPayment]
                  });
                }}
                className="border-2 border-dashed border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-zarco-cyan/20 hover:bg-zarco-cyan/5 transition-all text-white/20 hover:text-zarco-cyan group"
              >
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Add Another Provider</span>
              </button>
            </div>
          </div>

          {/* Trust Integrations */}
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⭐</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">Trust Integrations</h3>
            </div>

            <Card className="bg-[#0c1417] border-white/10 p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest block opacity-80">Trust Widget Script / HTML Code</label>
                    <p className="text-[9px] text-white/30 uppercase font-medium mt-0.5">Embed Google, Trustpilot, or custom rating HTML/script code</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Show on Home Page</span>
                  <input 
                    type="checkbox"
                    checked={companySettings.showTrustWidget}
                    onChange={(e) => setCompanySettings({...companySettings, showTrustWidget: e.target.checked})}
                    className="w-4 h-4 rounded border-white/10 bg-black/20 accent-zarco-cyan cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={companySettings.trustWidgetCode}
                  onChange={(e) => setCompanySettings({...companySettings, trustWidgetCode: e.target.value})}
                  placeholder={`e.g. <div class="trustpilot-widget" data-locale="en-GB" data-template-id="...">...</div>`}
                  className="w-full bg-black/25 border border-white/10 rounded-2xl p-6 h-40 focus:outline-none focus:border-zarco-cyan text-xs text-white/70 font-mono leading-relaxed"
                />
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Copy and paste the raw HTML or embed script code provided by Trustpilot, Google Reviews, or any other platform here. It will render cleanly right after the Hero section on your landing page.
                </p>
              </div>
            </Card>
          </div>
        </form>
      </Card>

      <div className="mt-16 mb-8">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">System Configuration</h2>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-2 italic">Live Environment & Section Visibility Controls</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-zarco-cyan/10 flex items-center justify-center">
                <Eye className="w-7 h-7 text-zarco-cyan" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Public Visibility</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Toggle key homepage sections results in real-time</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Pricing</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Control visibility of investment plans</p>
              </div>
              <Button
                onClick={() => togglePricingSection(pricingSettings.showSection)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  pricingSettings.showSection 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {pricingSettings.showSection ? "Visible" : "Hidden"}
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Newsletter</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle subscriber active features</p>
              </div>
              <Button
                onClick={() => toggleNewsletterSection(newsletterSettings.showSection)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  newsletterSettings.showSection 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {newsletterSettings.showSection ? "Visible" : "Hidden"}
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Reviews</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Manage client review visibility</p>
              </div>
              <Button
                onClick={() => toggleTestimonialsSection(testimonialsSettings.showSection)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  testimonialsSettings.showSection 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {testimonialsSettings.showSection ? "Visible" : "Hidden"}
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">WhatsApp</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle live support widget</p>
              </div>
              <Button
                onClick={() => toggleWhatsappButton(companySettings.showWhatsappButton || false)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  companySettings.showWhatsappButton 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {companySettings.showWhatsappButton ? "Visible" : "Hidden"}
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Trust Widget</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle trust badges section</p>
              </div>
              <Button
                onClick={() => toggleTrustWidget(companySettings.showTrustWidget || false)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  companySettings.showTrustWidget 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {companySettings.showTrustWidget ? "Visible" : "Hidden"}
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-3">Maintenance</h4>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Toggle maintenance landing page</p>
              </div>
              <Button
                onClick={() => toggleMaintenance(companySettings.showMaintenance || false)}
                className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  companySettings.showMaintenance 
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 font-black" 
                    : "bg-green-500/10 text-green-500 border border-green-500/20"
                }`}
              >
                {companySettings.showMaintenance ? "Maintenance ON" : "Normal Mode"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zarco-cyan/5 border border-zarco-cyan/10 rounded-[2rem] p-8">
            <h4 className="text-[10px] font-black text-zarco-cyan uppercase tracking-widest mb-4">Branding Integrity</h4>
            <p className="text-[11px] text-white/40 leading-relaxed italic">
              This information will be automatically reflected on all generated invoices. Ensure accuracy to maintain professional standards.
            </p>
          </Card>
          <Card className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Tax Compliance</h4>
            <p className="text-[11px] text-white/40 leading-relaxed italic">
              VAT and Tax IDs are required for European and International transactions. Updates are logged for financial auditing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
