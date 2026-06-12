import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [showPricing, setShowPricing] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleHashChange = () => setCurrentHash(window.location.hash);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    
    // Check pricing visibility
    async function checkPricing() {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShowPricing(docSnap.data().showPricing !== false);
        }
      } catch (e) {
        console.error("Pricing check failed, defaulting to visible", e);
      }
    }
    checkPricing();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { name: t('nav.home'), href: '#' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.portfolio'), href: '#work' },
    { name: t('nav.services'), href: '#services' },
    ...(showPricing ? [{ name: t('nav.pricing'), href: '#pricing' }] : []),
    { name: t('nav.contact'), href: '#contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-zarco-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto px-6 grid grid-cols-2 min-[1050px]:grid-cols-3 items-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <a href="#" className="hover:brightness-110 transition-all cursor-pointer">
            <img 
              src="/images/logos/zarco_logo_web_developmet_no_bg300px_no_bg.png" 
              alt="Zarco Studios" 
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </a>
        </motion.div>

        {/* Desktop Nav - Centered */}
        <div className="hidden min-[1050px]:flex items-center justify-center gap-8">
          {navItems.map((item, i) => {
            const isActive = (item.href === '#' && (currentHash === '' || currentHash === '#')) || 
                           (item.href !== '#' && currentHash === item.href);
            return (
              <motion.a
                key={item.name || i}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-[12px] font-bold tracking-widest uppercase transition-all pb-1 border-b-2 ${
                  isActive 
                    ? 'text-zarco-cyan border-zarco-cyan' 
                    : 'text-white/50 border-transparent hover:text-white'
                }`}
              >
                {item.name}
              </motion.a>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <button 
              onClick={() => changeLanguage('en')} 
              className={`transition-colors cursor-pointer ${i18n.language === 'en' ? 'text-zarco-cyan' : 'text-white/50 hover:text-white'}`}
            >
              EN
            </button>
            <span className="text-white/10">|</span>
            <button 
              onClick={() => changeLanguage('pt')} 
              className={`transition-colors cursor-pointer ${i18n.language === 'pt' ? 'text-zarco-cyan' : 'text-white/50 hover:text-white'}`}
            >
              PT
            </button>
          </div>

          <a href="#contact" className="max-[500px]:hidden">
            <Button className="bg-zarco-cyan hover:bg-zarco-cyan/90 text-black rounded-full px-8 py-2.5 h-auto text-[12px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,209,220,0.3)] border-none">
              {t('nav.start_project')}
            </Button>
          </a>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="min-[1050px]:hidden text-zarco-white ml-2">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-[1050px]:hidden absolute top-full left-0 right-0 bg-zarco-gray border-t border-white/5 px-6 py-8 shadow-2xl"
        >
          <div className="flex flex-col gap-6 text-center">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold uppercase tracking-widest hover:text-zarco-cyan transition-colors"
              >
                {item.name}
              </a>
            ))}
            <div className="flex justify-center gap-6 pt-4 border-t border-white/5">
               <button onClick={() => {changeLanguage('en'); setMobileMenuOpen(false);}} className={i18n.language === 'en' ? 'text-zarco-cyan font-bold' : 'text-white/40'}>EN</button>
               <button onClick={() => {changeLanguage('pt'); setMobileMenuOpen(false);}} className={i18n.language === 'pt' ? 'text-zarco-cyan font-bold' : 'text-white/40'}>PT</button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
