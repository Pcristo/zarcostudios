import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

export function WhatsAppButton() {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState<{
    whatsappNumber?: string;
    whatsappNumberPT?: string;
    showWhatsappButton?: boolean;
  }>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'company-legal'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          whatsappNumber: data.whatsappNumber,
          whatsappNumberPT: data.whatsappNumberPT,
          showWhatsappButton: data.showWhatsappButton,
        });
      }
    });

    // Show with delay
    const timer = setTimeout(() => setIsVisible(true), 2000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  const currentLang = i18n.language.startsWith('pt') ? 'pt' : 'en';
  const activeNumber = currentLang === 'pt' ? settings.whatsappNumberPT : settings.whatsappNumber;

  if (!settings.showWhatsappButton || !activeNumber) return null;

  const messages = {
    en: "Hi, I’d like to know more about Zarco Studios. Could you send me some information?",
    pt: "Olá, gostaria de saber mais sobre o Zarco Studios. Podem enviar-me algumas informações?",
  };

  const prefilledText = encodeURIComponent(messages[currentLang as keyof typeof messages]);
  const whatsappUrl = `https://wa.me/${activeNumber.replace(/[^0-9]/g, '')}?text=${prefilledText}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          className="fixed bottom-[49px] right-6 z-[45]"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg shadow-green-500/20 hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden"
            aria-label="Contact on WhatsApp"
          >
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* WhatsApp Icon */}
            <svg 
              className="w-7 h-7 text-white drop-shadow-md fill-current relative z-10" 
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.119.553 4.185 1.604 6.01L0 24l6.117-1.604a11.845 11.845 0 005.93 1.587h.005c6.632 0 12.03-5.392 12.033-12.03a11.78 11.78 0 00-3.483-8.503z"/>
            </svg>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="bg-zarco-gray border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Chatea con nosotros</span>
              </div>
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
