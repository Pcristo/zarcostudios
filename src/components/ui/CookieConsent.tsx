import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Cookie, X, Check, Shield, BarChart3, Target, ChevronLeft } from 'lucide-react';

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<'main' | 'customize'>('main');
  const [options, setOptions] = useState({
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    const consent = localStorage.getItem('zarco-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = (type: 'all' | 'none' | 'custom') => {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      preferences: type === 'all' 
        ? { necessary: true, analytics: true, marketing: true }
        : type === 'none'
          ? { necessary: true, analytics: false, marketing: false }
          : { necessary: true, ...options }
    };
    
    localStorage.setItem('zarco-cookie-consent', JSON.stringify(data));
    setIsVisible(false);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-md"
            onClick={() => setIsVisible(false)}
          />

          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-zarco-gray border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl pointer-events-auto relative overflow-hidden group"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-zarco-cyan/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zarco-cyan/10 border border-zarco-cyan/20 flex items-center justify-center text-zarco-cyan shadow-[0_0_15px_rgba(79,209,220,0.1)]">
                      <Cookie className="w-6 h-6" />
                    </div>
                    {mode === 'customize' && (
                      <button 
                        onClick={() => setMode('main')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t('cookie_consent.back')}
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {mode === 'main' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
                        {t('legal.consent.title')}
                      </h3>
                      <p className="text-white/50 text-[14px] leading-relaxed font-medium">
                        {t('legal.consent.description')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleSave('all')}
                        className="group relative w-full py-5 bg-zarco-cyan text-black font-black uppercase tracking-widest text-[12px] rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-zarco-cyan/20"
                      >
                        <Check className="w-5 h-5" />
                        {t('legal.consent.acceptAll')}
                      </button>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSave('none')}
                          className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl transition-all border border-white/5"
                        >
                          {t('legal.consent.declineAll')}
                        </button>
                        <button
                          onClick={() => setMode('customize')}
                          className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl transition-all border border-white/5"
                        >
                          {t('legal.consent.customize')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                        {t('legal.consent.customize')}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Necessary */}
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <Shield className="w-5 h-5 text-zarco-cyan" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-white">{t('legal.consent.categories.necessary')}</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{t('cookie_consent.always_active')}</span>
                          </div>
                        </div>
                        <div className="w-10 h-5 bg-zarco-cyan/20 rounded-full flex items-center px-1">
                          <div className="w-3 h-3 bg-zarco-cyan rounded-full translate-x-5" />
                        </div>
                      </div>

                      {/* Analytics */}
                      <button 
                        onClick={() => toggleOption('analytics')}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all w-full text-left ${
                          options.analytics ? 'bg-white/[0.04] border-white/10' : 'bg-transparent border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <BarChart3 className={`w-5 h-5 ${options.analytics ? 'text-zarco-cyan' : 'text-white/40'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-white">{t('legal.consent.categories.analytics')}</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{t('cookie_consent.metrics_performance')}</span>
                          </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                          options.analytics ? 'bg-zarco-cyan' : 'bg-white/10'
                        }`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            options.analytics ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </button>

                      {/* Marketing */}
                      <button 
                        onClick={() => toggleOption('marketing')}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all w-full text-left ${
                          options.marketing ? 'bg-white/[0.04] border-white/10' : 'bg-transparent border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Target className={`w-5 h-5 ${options.marketing ? 'text-zarco-cyan' : 'text-white/40'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-white">{t('legal.consent.categories.marketing')}</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{t('cookie_consent.ad_targeting')}</span>
                          </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                          options.marketing ? 'bg-zarco-cyan' : 'bg-white/10'
                        }`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            options.marketing ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => handleSave('custom')}
                      className="w-full py-5 bg-zarco-cyan text-black font-black uppercase tracking-widest text-[12px] rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-zarco-cyan/20"
                    >
                      {t('legal.consent.save')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

