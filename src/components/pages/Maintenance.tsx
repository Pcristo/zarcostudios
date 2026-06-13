import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Mail, Globe } from 'lucide-react';

export function Maintenance() {
  const { t, i18n } = useTranslation();

  const isPt = i18n.language?.startsWith('pt');

  const title = isPt 
    ? 'Estamos em Manutenção' 
    : 'We Are Under Maintenance';

  const subtitle = isPt 
    ? 'Estamos a atualizar o nosso estúdio para lhe proporcionar uma experiência ainda melhor. Voltaremos a estar online muito brevemente.' 
    : 'We are currently upgrading our studio systems to bring you an even better experience. We will be back online shortly.';

  const badgeText = isPt 
    ? 'Modo de Manutenção Ativo' 
    : 'Maintenance Mode Active';

  const contactText = isPt 
    ? 'Contacto' 
    : 'Contact';

  const defaultLogo = "/images/logos/zarco_logo_web_developmet_no_bg300px_no_bg.png";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-zarco-black relative overflow-hidden text-white selection:bg-zarco-cyan/30">
      {/* Background visual art elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zarco-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-zarco-purple/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="text-center space-y-12 max-w-xl mx-auto relative z-10 flex flex-col justify-center items-center">
        {/* Brand Logo Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center items-center"
        >
          <img 
            src={defaultLogo} 
            alt="Zarco Studios Logo" 
            className="max-h-[110px] w-auto h-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Maintenance Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>{badgeText}</span>
        </motion.div>

        {/* Core content information card */}
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white animate-fade-in"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50 text-xs md:text-sm max-w-md mx-auto leading-relaxed uppercase tracking-wider"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Language Selector and Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-6 border-t border-white/5 w-full max-w-xs space-y-6"
        >
          {/* Language Toggle buttons */}
          <div className="flex items-center justify-center gap-4">
            <Globe className="w-3.5 h-3.5 text-white/30" />
            <div className="flex bg-white/[0.03] border border-white/5 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                  !isPt 
                    ? "bg-zarco-cyan text-black font-black" 
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('pt')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                  isPt 
                    ? "bg-zarco-cyan text-black font-black" 
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                PT
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase font-black tracking-widest">
            <Mail className="w-3.5 h-3.5" />
            <span className="text-white/40">{contactText}:</span>
            <a href="mailto:info@zarcostudios.com" className="hover:text-zarco-cyan text-white/60 font-semibold transition-colors">
              info@zarcostudios.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
