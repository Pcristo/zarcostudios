import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, FormEvent } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function Contact() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState(() => {
    try {
      const stored = sessionStorage.getItem("autofill_contact");
      if (stored) {
        const parsed = JSON.parse(stored);
        sessionStorage.removeItem("autofill_contact");
        return {
          name: parsed.name || "",
          company: parsed.company || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          details: "",
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: "",
      company: "",
      email: "",
      phone: "",
      details: "",
    };
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showToast, setShowToast] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (siteKey && !captchaToken) {
      alert("Please complete the reCAPTCHA before submitting.");
      return;
    }

    setStatus("loading");

    try {
      // ✅ BLOCK if captcha missing
      if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaToken) {
        setStatus("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      if (response.ok) {
        setStatus("success");

        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          details: "",
        });

        setCaptchaToken(null);
        recaptchaRef.current?.reset();
      } else {
        setStatus("error");
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error("Contact error:", error);
      setStatus("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  return (
    <section
      id="contact"
      className="margin-top-0-1250px py-32 bg-zarco-black relative overflow-hidden"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 pointer-events-none"
          >
            <div
              className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-4 pointer-events-auto backdrop-blur-xl ${
                status === "success"
                  ? "bg-zarco-cyan/10 border-zarco-cyan/20 text-zarco-cyan"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <div className="mt-1">
                {status === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest">
                  {status === "success" ? "Success" : "Error"}
                </p>
                <p className="text-sm font-medium mt-1">
                  {status === "success"
                    ? "Message sent successfully!"
                    : "An error occurred. Please try again."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24">
          {/* Left Side: Info */}
          <div className="info-container flex flex-col">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8"
              dangerouslySetInnerHTML={{ __html: t("contact.title") }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-white/60 text-lg leading-relaxed max-w-md mb-16"
            >
              {t("contact.subtitle")}
            </motion.p>

            <div className="space-y-10">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  <Mail className="w-4 h-4 text-zarco-cyan" />
                  <span>Email</span>
                </div>

                <a
                  href="mailto:info@zarcostudios.com"
                  className="text-lg md:text-xl font-black uppercase tracking-tight hover:text-zarco-cyan transition-colors break-all"
                >
                  info@zarcostudios.com
                </a>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  <Phone className="w-4 h-4 text-zarco-cyan" />
                  <span>Phone</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <a
                      href="tel:+353899596466"
                      className="text-xl md:text-2xl font-bold uppercase tracking-tight hover:text-zarco-cyan transition-colors"
                    >
                      (Ireland) +353 899596466
                    </a>
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <a
                      href="tel:+351964486091"
                      className="text-xl md:text-2xl font-bold uppercase tracking-tight hover:text-zarco-cyan transition-colors"
                    >
                      (Portugal) +351 964486091
                    </a>
                    <span className="text-[10px] text-white/40 font-mono">
                      {i18n.language?.startsWith("pt")
                        ? "(Chamada para a rede fixa nacional)"
                        : "(Call to national landline network)"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Locations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  <MapPin className="w-4 h-4 text-zarco-cyan" />
                  <span>Locations</span>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/60">
                    <span className="text-zarco-cyan">Ireland</span> Mather
                    South, Mount Merrion, Dublin - 4
                  </p>
                  <p className="text-sm font-bold uppercase tracking-widest text-white/60">
                    <span className="text-zarco-cyan">Portugal</span> Rua dos
                    Caçadores, Sintra 2710 - 095
                  </p>
                </div>
              </motion.div>

              {/* Socials */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-6 pt-4"
              >
                <a
                  href="https://www.linkedin.com/in/pedro-cristo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-zarco-cyan/10 hover:border-zarco-cyan/50 hover:text-zarco-cyan transition-all"
                >
                  <Linkedin className="w-6 h-6" />
                </a>

                <a
                  href="https://github.com/PedroCristo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-zarco-cyan/10 hover:border-zarco-cyan/50 hover:text-zarco-cyan transition-all"
                >
                  <Github className="w-6 h-6" />
                </a>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-10 md:p-16 rounded-[3rem] border border-white/5 bg-white/[0.01]"
          >
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    {t("contact.fields.name")}
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/40 text-xl font-bold"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    {t("contact.fields.company")}
                  </label>
                  <Input
                    type="text"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/40 text-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    {t("contact.fields.email")}
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/40 text-xl font-bold"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    {t("contact.fields.phone")}
                  </label>
                  <Input
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/40 text-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                  {t("contact.fields.details")}
                </label>
                <textarea
                  required
                  placeholder={t("contact.fields.details_placeholder")}
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus:outline-none focus:border-zarco-cyan transition-colors placeholder:text-white/40 text-lg font-bold min-h-[150px] resize-none"
                />
              </div>

              {/* Visible Checkbox ReCAPTCHA */}
              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                <div className="flex justify-start">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    theme="dark"
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                </div>
              )}

              <div className="flex justify-end pt-8">
                <Button
                  type="submit"
                  disabled={
                    status === "loading" ||
                    (!!import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaToken)
                  }
                  className="px-10 py-8 bg-zarco-cyan text-black font-black rounded-2xl flex items-center gap-4 hover:bg-zarco-cyan/90 transition-all shadow-[0_0_30px_rgba(79,209,220,0.4)] border-none text-[13px] uppercase tracking-[0.2em] group disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t("contact.btn")}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-zarco-cyan/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    </section>
  );
}
