import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ReCAPTCHA from 'react-google-recaptcha';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Newsletter() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showSection, setShowSection] = useState(true);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'newsletter'));
        if (settingsDoc.exists()) {
          setShowSection(settingsDoc.data().showSection !== false);
        }
      } catch (error) {
        console.error('Error fetching newsletter settings:', error);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    
    // Get recaptcha token - Disabled for now
    let token: string | undefined = undefined;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          lang: i18n.language.startsWith('pt') ? 'pt' : 'en',
          captchaToken: token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('newsletter.success'));
        setEmail('');
      } else {
        setStatus('error');
        if (response.status === 409) {
          setMessage(t('newsletter.already'));
        } else {
          setMessage(t('newsletter.error'));
        }
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage(t('newsletter.error'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  if (!showSection) {
    return null;
  }

  return (
    <section className="py-24 relative overflow-hidden bg-white/[0.02] border-y border-white/5">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 pointer-events-none"
          >
            <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-4 pointer-events-auto backdrop-blur-xl ${
              status === 'success' 
                ? 'bg-zarco-cyan/10 border-zarco-cyan/20 text-zarco-cyan' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="mt-1">
                {status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest">{status === 'success' ? 'Success' : 'Error'}</p>
                <p className="text-sm font-medium mt-1">{message}</p>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black uppercase tracking-tighter"
            >
              {t('newsletter.title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/40 font-bold uppercase tracking-widest text-[10px] max-w-md"
            >
              {t('newsletter.description')}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <Input
                type="email"
                placeholder={t('newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 h-12 px-6 rounded-full"
              />
              <Button 
                type="submit"
                disabled={status === 'loading'}
                className="bg-zarco-cyan hover:bg-zarco-cyan/90 text-black font-black uppercase tracking-widest text-[10px] rounded-full px-8 h-12 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? t('newsletter.loading') : (
                  <span className="flex items-center gap-2">
                    {t('newsletter.button')}
                    <Send className="w-3 h-3" />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Decorative details */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zarco-cyan/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-zarco-purple/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}
