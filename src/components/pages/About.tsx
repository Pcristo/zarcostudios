import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Layers, MessageSquare, Compass, ArrowRight } from 'lucide-react';
import { BusinessCard } from '@/components/ui/BusinessCard';

export function About() {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language === 'pt' || i18n.language?.startsWith('pt');

  const arsenal = [
    'HTML / CSS / JS',
    'React & Next.js',
    'Node.js',
    'Python & Django',
    'Firebase',
    'MongoDB',
    'Tailwind CSS',
    'UI/UX Engineering',
    'SEO Optimization',
    'Web Performance'
  ];

  const approach = [
    {
      icon: <Layers className="w-6 h-6 text-zarco-cyan" />,
      title: t('about.no_layers.title'),
      desc: t('about.no_layers.desc')
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-zarco-cyan" />,
      title: t('about.comm.title'),
      desc: t('about.comm.desc')
    },
    {
      icon: <Compass className="w-6 h-6 text-zarco-cyan" />,
      title: t('about.custom.title'),
      desc: t('about.custom.desc')
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="mb-24 max-w-[90%]">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6 text-white"
          >
            {t('about.developer')}
          </motion.h1>
        </div>

        {/* Intro Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[10/11] relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02]"
          >
            <picture className="w-full h-full block">
              <source media="(max-width: 1023px)" srcSet="/images/tablet/pedro_zarco_image_tablet_1.jpg" />
              <img 
                src="/images/desktop/pedro_zarco_image_1.jpg" 
                alt="Pedro Cristo - Web Developer" 
                className="w-full h-full object-cover object-top opacity-80"
                referrerPolicy="no-referrer"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-zarco-black via-transparent to-transparent" />
          </motion.div>

          <div className="flex flex-col gap-8">
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/70 leading-relaxed"
            >
              {t('about.intro1')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/70 leading-relaxed"
            >
              {t('about.intro2')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/70 leading-relaxed"
            >
              {t('about.intro3')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/70 leading-relaxed"
            >
              {t('about.intro4')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/70 leading-relaxed"
            >
              {t('about.intro5')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl font-black text-zarco-cyan tracking-tight"
            >
              {t('about.highlight')}
            </motion.p>
          </div>
        </div>

        {/* Dynamic Digital Identity Business Card */}
        <div className="mb-40">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
              {isPt ? 'Cartão de Visita Interativo' : 'Interactive Business Card'}
            </h3>
          </div>
          <BusinessCard />
        </div>

        {/* The Arsenal */}
        <div className="mb-40">
          <h3 className="text-4xl font-black uppercase tracking-tight mb-12">{t('about.arsenal')}</h3>
          <div className="flex flex-wrap gap-4">
            {arsenal.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-zarco-cyan hover:bg-zarco-cyan/10 hover:border-zarco-cyan transition-all cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Work Approach */}
        <div className="mb-40">
          <h3 className="text-center text-4xl font-black uppercase tracking-tight mb-20">{t('about.approach')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
             {approach.map((item, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 viewport={{ once: true }}
                 className="glass p-10 rounded-[2rem] flex flex-col gap-6 group hover:border-zarco-cyan/30 transition-all"
               >
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                 </div>
                 <h4 className="text-xl font-bold uppercase tracking-tight group-hover:text-zarco-cyan transition-colors">{item.title}</h4>
                 <p className="text-white/40 text-sm leading-relaxed">
                    {item.desc}
                 </p>
               </motion.div>
             ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20 relative overflow-hidden rounded-[4rem] bg-white/[0.02] border border-white/5">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative z-10 flex flex-col items-center gap-10"
           >
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                {t('about.build_cta')}
              </h2>
              <a href="#contact">
                <Button className="px-12 py-8 bg-zarco-cyan text-black font-black rounded-full hover:bg-zarco-cyan/90 transition-all shadow-[0_0_30px_rgba(79,209,220,0.4)] border-none text-[13px] uppercase tracking-[0.2em]">
                  {t('about.build_btn')}
                </Button>
              </a>
           </motion.div>
           
           {/* Background Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zarco-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
