import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { MousePointer2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-zarco-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/videos/desktop/Web_development_studio_backgrou_video_720px.mp4" type="video/mp4" />
        </video>
        {/* Linear Gradient Overlay as requested */}
        <div className="absolute inset-0 bg-gradient-to-b from-zarco-black via-transparent to-zarco-black" />
        <div className="absolute inset-0 bg-zarco-black/20" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold"
          >
            {t('hero.badge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter uppercase"
          >
            {t('hero.title1')} <br />
            <span className="text-glow-cyan text-zarco-cyan">{t('hero.title2')}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-4"
          >
            <a href="#contact">
              <Button className="px-10 py-7 bg-zarco-cyan text-black font-black rounded-full hover:bg-zarco-cyan/90 transition-all shadow-[0_0_30px_rgba(79,209,220,0.4)] border-none text-sm uppercase tracking-widest">
                {t('hero.cta')}
              </Button>
            </a>
            <Button variant="outline" className="px-10 py-7 bg-white/5 border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
              {t('hero.secondary')}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zarco-cyan/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
