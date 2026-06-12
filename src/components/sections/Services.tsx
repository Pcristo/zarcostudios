import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Palette, Layers, Monitor, 
  CheckCircle, Globe, TrendingUp,
  Code2, Smartphone, Wrench,
  MonitorCheck, Rocket, Layout,
  Building2, ShoppingCart, Calendar
} from 'lucide-react';

export function Services() {
  const { t } = useTranslation();

  const originalServices = [
    {
      id: 'web',
      icon: <Building2 className="w-10 h-10" />,
      title: t('services.web.title'),
      desc: t('services.web.desc'),
    },
    {
      id: 'design',
      icon: <ShoppingCart className="w-10 h-10" />,
      title: t('services.design.title'),
      desc: t('services.design.desc'),
    },
    {
      id: 'ai',
      icon: <Calendar className="w-10 h-10" />,
      title: t('services.ai.title'),
      desc: t('services.ai.desc'),
    },
  ];

  const serviceCategories = [
    {
      id: 'web-design',
      title: t('services.categories.web_design.title'),
      mainIcon: <Layout className="w-8 h-8" />,
      items: [
        { icon: <Palette className="w-5 h-5" />, label: t('services.categories.web_design.customized') },
        { icon: <Layers className="w-5 h-5" />, label: t('services.categories.web_design.dynamic') },
        { icon: <Monitor className="w-5 h-5" />, label: t('services.categories.web_design.responsive') },
      ]
    },
    {
      id: 'web-solutions',
      title: t('services.categories.web_solutions.title'),
      mainIcon: <Rocket className="w-8 h-8" />,
      items: [
        { icon: <CheckCircle className="w-5 h-5" />, label: t('services.categories.web_solutions.credibility') },
        { icon: <Globe className="w-5 h-5" />, label: t('services.categories.web_solutions.presence') },
        { icon: <TrendingUp className="w-5 h-5" />, label: t('services.categories.web_solutions.opportunities') },
      ]
    },
    {
      id: 'apps-design',
      title: t('services.categories.apps_design.title'),
      mainIcon: <MonitorCheck className="w-8 h-8" />,
      items: [
        { icon: <Code2 className="w-5 h-5" />, label: t('services.categories.apps_design.development') },
        { icon: <Smartphone className="w-5 h-5" />, label: t('services.categories.apps_design.compatibility') },
        { icon: <Wrench className="w-5 h-5" />, label: t('services.categories.apps_design.maintenance') },
      ]
    }
  ];

  return (
    <section id="services" className="py-32 bg-transparent relative z-10 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">{t('services.title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {originalServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass p-10 rounded-[3rem] group hover:border-zarco-cyan/30 transition-all relative overflow-hidden flex flex-col h-full border border-white/5"
            >
              <div className="text-zarco-cyan mb-10 group-hover:scale-110 transition-transform origin-left">
                {service.icon}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 group-hover:text-zarco-cyan transition-colors">{service.title}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">{t('services.bespoke_solutions')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {serviceCategories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass p-10 rounded-[3rem] group hover:border-zarco-cyan/30 transition-all relative overflow-hidden flex flex-col h-full border border-white/5"
            >
              <div className="text-zarco-cyan mb-8 p-4 bg-zarco-cyan/5 w-fit rounded-2xl group-hover:scale-110 transition-transform origin-left">
                {category.mainIcon}
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tight mb-10 group-hover:text-zarco-cyan transition-colors">
                {category.title}
              </h3>

              <div className="space-y-6 mt-auto">
                {category.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group/item">
                    <div className="text-white/20 group-hover/item:text-zarco-cyan transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 group-hover/item:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
