import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export function WhatWeDo() {
  const { t } = useTranslation();

  const features = [
    t('edge.feat1'),
    t('edge.feat2'),
    t('edge.feat3'),
  ];

  return (
    <section className="py-32 bg-transparent relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block self-start px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold"
            >
              {t('edge.badge')}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter"
            >
              {t('edge.title')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-white/60 text-lg leading-relaxed"
            >
              {t('edge.desc')}
            </motion.p>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 group"
                >
                  <CheckCircle2 className="w-5 h-5 text-zarco-cyan group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold text-sm tracking-wide leading-relaxed">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Graphic */}
          <div className="w-full lg:w-1/2 relative">
             <div className="aspect-square relative flex items-center justify-center p-8">
                {/* Stylized container for the design's graphics */}
                <div className="absolute inset-0 bg-zarco-gray rounded-[2.5rem] overflow-hidden border border-white/5">
                   {/* Gradient wave pattern simulation */}
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zarco-cyan via-transparent to-transparent" />
                </div>

                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 1 }}
                   className="relative z-10 w-full h-full border border-white/5 rounded-[2rem] flex items-center justify-center overflow-hidden p-12 bg-[#05090a]/40 backdrop-blur-3xl"
                >
                   {/* Zarco Logo Image */}
                   <img 
                      src="/images/logos/Z_zarco_no_bg.png" 
                      alt="Zarco Logo" 
                      referrerPolicy="no-referrer"
                      className="w-4/5 h-4/5 object-contain max-h-[280px] select-none pointer-events-none drop-shadow-[0_0_40px_rgba(79,209,220,0.25)]"
                   />
                   
                   {/* Animated glow */}
                   <motion.div 
                      animate={{ 
                        opacity: [0.15, 0.35, 0.2, 0.35, 0.15],
                        scale: [1, 1.15, 0.95, 1.1, 1],
                        backgroundColor: ["#4fd1dc", "#00f2fe", "#38bdf8", "#0ea5e9", "#4fd1dc"]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full blur-[100px] -z-10"
                   />
                   <motion.div 
                      animate={{ 
                        opacity: [0.1, 0.25, 0.15, 0.25, 0.1],
                        scale: [1.1, 0.9, 1.2, 1, 1.1],
                        backgroundColor: ["#0284c7", "#4fd1dc", "#00c6ff", "#00f2fe", "#0284c7"]
                      }}
                      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-10 inset-y-10 rounded-full blur-[120px] -z-10"
                   />
                </motion.div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
