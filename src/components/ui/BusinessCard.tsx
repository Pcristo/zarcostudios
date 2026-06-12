import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Globe, Mail, Phone, ExternalLink, Copy, Check, Linkedin, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";

// Premium vector QR Code generator to simulate authentic data matrix dots
function QrCodeSVG({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 29 29" 
      className={className} 
      fill="currentColor"
    >
      {/* Position Detection Patterns (Corners) */}
      {/* Top-Left */}
      <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" />
      {/* Top-Right */}
      <path d="M22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3z" />
      {/* Bottom-Left */}
      <path d="M0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" />

      {/* Alignment & Small Structural Points */}
      <rect x="22" y="22" width="5" height="5" />
      <rect x="23" y="23" width="3" height="3" fill="#0d1112" />
      <rect x="24" y="24" width="1" height="1" />

      {/* Timing Patterns */}
      <path d="M8 2h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm4 0h1v1h-1zm2 0h1v1h-1zM2 8h1v1H2zm0 2h1v1H2zm0 2h1v1H2zm0 4h1v1H2zm0 2h1v1H2z" />

      {/* Simulated Data Blocks */}
      <path d="M9 9h2v1H9zm3 0h1v2h-1zm2 0h3v1h-3zm4 0h2v1h-2zm1 2h1v3h-1zm-4 1h2v1h-2zm-3 1h2v2h-2zm9 0h2v1h-2zm-7 2h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm2 1h1v2h-1zm-6 1h2v1h-2zm-3 1h2v1h-2zm5 1h2v1h-2zm4 0h1v2h-1zm-8 2h2v1h-2zm3 0h1v1h-1zm2 0h1v1h-1zm-7 1h1v1h-1zm3 1h1v1h-1" />
    </svg>
  );
}

export function BusinessCard() {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language?.startsWith('pt');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic 3D tilt effect on hover using framer motion mouse track
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { damping: 20, stiffness: 150 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const relativeX = (mouseX / width) - 0.5;
    const relativeY = (mouseY / height) - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* 3D Wrapper Container */}
      <div 
        className="relative group perspective-1000 mb-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ 
            rotateX, 
            rotateY, 
            transformStyle: "preserve-3d",
            backgroundImage: "url('/images/suport/zarco studios_buissens_card_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
          className="w-full rounded-[2.5rem] border border-white/10 p-1 sm:p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden transition-shadow hover:shadow-[0_40px_80px_-15px_rgba(79,209,220,0.15)] flex flex-col [@media(min-width:700px)]:aspect-[1.58/1]"
        >
          {/* Glowing Ambient Backdrop Follower */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(79,209,220,0.08)_0%,transparent_50%)] pointer-events-none z-0" />

          {/* Core Content Body */}
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative z-10" style={{ transform: "translateZ(30px)" }}>
            
            {/* TOP PORTION */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start h-full">
              {/* Top Left Branding */}
              <div className="md:col-span-12 flex flex-col justify-between h-full gap-4">
                <div>
                  <div className="flex items-center">
                    <img 
                      src="/images/logos/zarco_logo_web_developmet_no_bg300px_no_bg.png" 
                      alt="Zarco Studios" 
                      className="h-[58px] w-auto object-contain select-none pointer-events-none drop-shadow-[0_0_15px_rgba(79,209,220,0.25)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Website URI */}
                <div className="flex items-center mt-4 sm:mt-6 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 w-fit">
                  <a 
                    href="https://zarcostudios.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group/web hover:text-[#4fd1dc] transition-colors"
                  >
                    <Globe className="w-4 h-4 text-white/50 group-hover/web:text-[#4fd1dc] transition-all" />
                    <span className="text-xs font-semibold text-white/70 tracking-wide font-mono">
                      zarcostudios.com
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* BOTTOM PORTION - Floating Glass Card Wrapper */}
            <div 
              className="mt-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xl relative"
              style={{ transform: "translateZ(15px)" }}
            >
              {/* Outer Glow Highlight */}
              <div className="absolute inset-px rounded-[1.70rem] border border-white/5 bg-transparent pointer-events-none" />

              {/* Left Column: Holder Identity */}
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <h3 className="text-white text-2xl font-black uppercase tracking-tight">
                  PEDRO CRISTO
                </h3>
                <span className="text-white/40 uppercase font-bold text-[10px] tracking-widest font-mono">
                  {isPt ? "DESENVOLVEDOR WEB" : "WEB DEVELOPER"}
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <a 
                    href="https://www.linkedin.com/in/pedro-cristo/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#4fd1dc]/80 hover:text-white transition-colors w-fit group/li bg-white/5 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg"
                  >
                    <Linkedin className="w-3 h-3 text-[#4fd1dc] group-hover/li:text-white transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-wider font-sans">
                      LinkedIn
                    </span>
                  </a>
                  <a 
                    href="https://www.facebook.com/zarcostudios" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#4fd1dc]/80 hover:text-white transition-colors w-fit group/fb bg-white/5 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg"
                  >
                    <Facebook className="w-3 h-3 text-[#4fd1dc] group-hover/fb:text-white transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-wider font-sans">
                      Facebook
                    </span>
                  </a>
                </div>
              </div>

              {/* Right Column: Contact Details & Action Handles */}
              <div className="md:col-span-7 flex flex-wrap md:flex-nowrap items-end justify-between gap-4">
                <div className="space-y-3.5 flex-1 min-w-[200px]">
                  {/* Email contact row */}
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform">
                    <div className="w-6 h-6 rounded-lg bg-[#4fd1dc]/10 flex items-center justify-center mr-3 shrink-0">
                      <span className="text-xs font-black text-[#4fd1dc]">@</span>
                    </div>
                    <span className="text-white/80 hover:text-white transition-colors text-xs font-mono font-medium truncate select-all">
                      info@zarcostudios.com
                    </span>
                  </div>

                  {/* Ireland Phone */}
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform">
                    <div className="flex items-center mr-2.5">
                      <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center mr-3 shrink-0">
                        <Phone className="w-3 h-3 text-[#4fd1dc]" />
                      </div>
                      <span className="text-white/80 transition-colors text-xs font-mono font-medium">
                        +353 899596466
                      </span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest bg-white/5 px-2 py-0.5 rounded font-sans border border-white/5 shrink-0">
                      Ireland
                    </span>
                  </div>

                  {/* Portugal Phone */}
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform">
                    <div className="flex items-center mr-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 shrink-0">
                        <Phone className="w-3 h-3 text-[#4fd1dc]" />
                      </div>
                      <span className="text-white/80 transition-colors text-xs font-mono font-medium">
                        +351 964486091
                      </span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest bg-white/5 px-2 py-0.5 rounded font-sans border border-white/5 shrink-0">
                      Portugal
                    </span>
                  </div>

                  {/* WhatsApp contact */}
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-400 fill-current">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.82 1.45 5.48 0 9.95-4.47 9.95-9.95 0-2.64-1.03-5.12-2.89-6.98-1.86-1.86-4.35-2.89-6.99-2.89-5.49 0-9.95 4.47-9.95 9.95 0 1.79.47 3.53 1.37 5.02L1.87 22.1l4.777-1.254h-.001zM17.41 14.12c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.14-.57-1.92-1.03-2.67-2.33-.2-.35.2-.33.57-1.07.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.6-.5-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.07 1.05-1.07 2.56s1.09 2.97 1.24 3.17c.15.2 2.15 3.28 5.21 4.6 1.83.79 2.65.88 3.61.74.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/>
                      </svg>
                    </div>
                    <span className="text-white/80 transition-colors text-xs font-mono font-medium">
                      +353 899596466
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE ACTIONS / RELATED LINKS AT THE BOTTOM */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-[#4fd1dc] uppercase tracking-widest">
            {isPt ? "Portal de Ligação e Ação Rápida" : "Quick Connect & Action Portal"}
          </span>
          {copiedText && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5"
            >
              <Check className="w-3 h-3" />
              {isPt ? "Copiado " : "Copied "}
              {copiedText === "Email" ? "Email" : 
               copiedText === "Ireland Phone" ? (isPt ? "Telefone Irlanda" : "Ireland Phone") :
               copiedText === "WhatsApp Web URI" ? (isPt ? "Link do WhatsApp" : "WhatsApp Link") :
               copiedText === "Portugal Phone" ? (isPt ? "Telefone Portugal" : "Portugal Phone") : copiedText}!
            </motion.span>
          )}
        </div>

        {/* Action Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Email button */}
          <div className="flex flex-col gap-1.5">
            <a 
              href="mailto:info@zarcostudios.com"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] hover:bg-[#4fd1dc]/10 border border-white/5 hover:border-[#4fd1dc]/30 text-white hover:text-[#4fd1dc] transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
            <button
              onClick={() => handleCopy("info@zarcostudios.com", "Email")}
              className="text-[9px] text-white/30 hover:text-white/60 font-mono tracking-wider font-semibold text-center hover:underline focus:outline-none flex items-center justify-center gap-1"
            >
              <Copy className="w-2.5 h-2.5" /> {isPt ? "Copiar Email" : "Copy Email"}
            </button>
          </div>

          {/* Ireland line */}
          <div className="flex flex-col gap-1.5">
            <a 
              href="tel:+353899596466"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] hover:bg-[#4fd1dc]/10 border border-white/5 hover:border-[#4fd1dc]/30 text-white hover:text-[#4fd1dc] transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isPt ? "Ligar IE" : "IE Call"}</span>
            </a>
            <button
              onClick={() => handleCopy("+353899596466", "Ireland Phone")}
              className="text-[9px] text-white/30 hover:text-white/60 font-mono tracking-wider font-semibold text-center hover:underline focus:outline-none flex items-center justify-center gap-1"
            >
              <Copy className="w-2.5 h-2.5" /> {isPt ? "Copiar Número" : "Copy Call Number"}
            </button>
          </div>

          {/* WhatsApp Direct */}
          <div className="flex flex-col gap-1.5">
            <a 
              href="https://wa.me/353899596466"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#10b981]/5 hover:bg-[#10b981]/15 border border-[#10b981]/10 hover:border-[#10b981]/30 text-emerald-400 hover:text-emerald-300 transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12.003 21.003a9 9 0 0 1-4.832-1.403l-.347-.206-3.585.941.957-3.493-.226-.359C2.7 14.73 2.001 12.502 2.003 10.155 2.009 4.654 6.5 1.157 12 1.157c5.5-.002 10 4.498 10 10s-4.5 10-10 10l.003-.154z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => handleCopy("https://wa.me/353899596466", "WhatsApp Web URI")}
              className="text-[9px] text-white/30 hover:text-white/60 font-mono tracking-wider font-semibold text-center hover:underline focus:outline-none flex items-center justify-center gap-1"
            >
              <Copy className="w-2.5 h-2.5" /> {isPt ? "Copiar Link WA" : "Copy WA Link"}
            </button>
          </div>

          {/* Portugal Call */}
          <div className="flex flex-col gap-1.5">
            <a 
              href="tel:+351964486091"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] hover:bg-[#4fd1dc]/10 border border-white/5 hover:border-[#4fd1dc]/30 text-white hover:text-[#4fd1dc] transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isPt ? "Ligar PT" : "PT Call"}</span>
            </a>
            <button
              onClick={() => handleCopy("+351964486091", "Portugal Phone")}
              className="text-[9px] text-white/30 hover:text-white/60 font-mono tracking-wider font-semibold text-center hover:underline focus:outline-none flex items-center justify-center gap-1"
            >
              <Copy className="w-2.5 h-2.5" /> {isPt ? "Copiar Número" : "Copy Call Number"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
