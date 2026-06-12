import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Plan {
  id: string;
  nameEn: string;
  namePt: string;
  price: number;
  priceSuffixEn: string;
  priceSuffixPt: string;
  descriptionEn: string;
  descriptionPt: string;
  buttonTextEn: string;
  buttonTextPt: string;
  servicesEn: string[];
  servicesPt: string[];
  show: boolean;
  isHighlighted: boolean;
  discountPercentage: number;
  periodicity: string;
  order: number;
}

export function Pricing() {
  const { i18n, t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(true);

  const isPt = i18n.language.startsWith('pt');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch visibility
        const settingsDoc = await getDoc(doc(db, 'settings', 'pricing'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setShowPricing(data.showSection !== false && data.showPricing !== false);
        }

        // Fetch plans
        const plansSnapshot = await getDocs(collection(db, 'pricing'));

        if (plansSnapshot.empty) {
          // Fallback if DB is empty
          const defaults: Plan[] = [
            { 
              id: 'hourly', 
              nameEn: 'Hourly', 
              namePt: 'Por Hora', 
              price: 65, 
              priceSuffixEn: '/ Ex VAT', 
              priceSuffixPt: '/ Sem IVA', 
              descriptionEn: 'Pay only for the time you need— no long-term commitment.',
              descriptionPt: 'Pague apenas pelo tempo que necessita— sem compromissos a longo prazo.',
              buttonTextEn: 'Enquire Now',
              buttonTextPt: 'Pedir Orçamento',
              servicesEn: ['Website updates or fixes', 'No ongoing commitment', 'Fast turnaround on small tasks'],
              servicesPt: ['Atualizações ou correções', 'Sem compromisso contínuo', 'Entrega rápida de pequenas tarefas'],
              show: true,
              isHighlighted: false,
              discountPercentage: 0,
              periodicity: 'Hourly',
              order: 0
            },
            { 
              id: 'monthly', 
              nameEn: 'Monthly', 
              namePt: 'Mensal', 
              price: 2250, 
              priceSuffixEn: '/ Ex VAT', 
              priceSuffixPt: '/ Sem IVA',
              descriptionEn: 'Ideal if you need help throughout the month on new or ongoing projects.',
              descriptionPt: 'Ideal se precisar de ajuda ao longo do mês em projetos novos ou em curso.',
              buttonTextEn: 'Enquire Now',
              buttonTextPt: 'Pedir Orçamento',
              servicesEn: ['Priority Site Support', 'Ongoing Site Updates', 'New Features Monthly'],
              servicesPt: ['Suporte Prioritário', 'Atualizações Contínuas', 'Novas Funcionalidades'],
              show: true,
              isHighlighted: true,
              discountPercentage: 0,
              periodicity: 'Monthly',
              order: 1
            },
            { 
              id: 'project', 
              nameEn: 'Project', 
              namePt: 'Projeto', 
              price: 0, 
              priceSuffixEn: 'Custom', 
              priceSuffixPt: 'Sob Consulta',
              descriptionEn: 'Tailored website projects designed for real business growth.',
              descriptionPt: 'Projetos de websites personalizados criados para o crescimento real do negócio.',
              buttonTextEn: 'Enquire Now',
              buttonTextPt: 'Pedir Orçamento',
              servicesEn: ['Premium Website Build', '24/7 Support', 'Strategy-Led Approach'],
              servicesPt: ['Construção Premium', 'Suporte 24/7', 'Abordagem Estratégica'],
              show: true,
              isHighlighted: false,
              discountPercentage: 0,
              periodicity: 'One Time',
              order: 2
            },
          ];
          setPlans(defaults);
        } else {
          const plansData = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Plan[];
          setPlans(plansData.filter(p => p.show !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zarco-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!showPricing) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zarco-black relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <header className="text-center mb-24 max-w-2xl mx-auto space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zarco-cyan text-[11px] font-black uppercase tracking-[0.4em]"
          >
            {t('investment.title')}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-[0.9]"
          >
            {isPt ? <>Planos de <br /> Preços</> : <>Pricing <br /> Plans</>}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-medium"
          >
            {t('investment.desc')}
          </motion.p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const isHighlighted = plan.isHighlighted;
            const basePrice = plan.price;
            const discount = plan.discountPercentage;
            const finalPrice = basePrice * (1 - discount / 100);
            
            const name = isPt ? plan.namePt : plan.nameEn;
            const suffix = isPt ? plan.priceSuffixPt : plan.priceSuffixEn;
            const description = isPt ? plan.descriptionPt : plan.descriptionEn;
            const buttonText = isPt ? plan.buttonTextPt : plan.buttonTextEn;
            const services = isPt ? plan.servicesPt : plan.servicesEn;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group rounded-[3rem] p-10 flex flex-col h-full border ${
                  isHighlighted 
                    ? 'bg-[#b6e8ff] text-black border-[#b6e8ff] shadow-[0_0_50px_rgba(182,232,255,0.15)] scale-105 z-10' 
                    : 'bg-white/[0.02] text-white border-white/5 hover:border-white/10'
                }`}
              >
                {/* Highlight Badge */}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                    {t('investment.popular')}
                  </div>
                )}

                <div className="mb-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-[12px] font-black uppercase tracking-[0.3em] ${isHighlighted ? 'text-black/60' : 'text-zarco-cyan'}`}>
                      {name}
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isHighlighted ? 'bg-black/10 text-black/60' : 'bg-white/5 text-white/30'}`}>
                      {plan.periodicity}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight leading-none">
                      {plan.price === 0 ? (isPt ? 'Sob Consulta' : 'Custom') : `€${finalPrice.toFixed(0)}`}
                    </span>
                    {plan.price !== 0 && (
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${isHighlighted ? 'text-black/40' : 'text-white/30'}`}>
                        {suffix}
                      </span>
                    )}
                  </div>
                  {discount > 0 && plan.id !== 'project' && (
                    <div className="flex gap-2 items-center mt-4">
                      <span className={`text-sm line-through ${isHighlighted ? 'text-black/30' : 'text-white/20'}`}>€{basePrice}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isHighlighted ? 'bg-black/10 text-black' : 'bg-zarco-cyan text-black'}`}>
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  <p className={`mt-6 text-sm font-medium leading-relaxed ${isHighlighted ? 'text-black/70' : 'text-white/40'}`}>
                    {description}
                  </p>
                </div>

                <div className="flex-1 space-y-5 mb-12">
                  {services && services.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-4">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlighted ? 'text-green-600' : 'text-green-400'}`} />
                      <span className={`text-sm font-bold tracking-tight uppercase ${isHighlighted ? 'text-black/80' : 'text-white/70'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <a href="#contact" className="mt-auto">
                  <Button 
                    className={`w-full py-7 rounded-2xl font-black uppercase tracking-widest text-xs transition-all group ${
                      isHighlighted 
                        ? 'bg-black text-white hover:bg-black/80' 
                        : 'bg-white/5 text-white hover:bg-zarco-cyan hover:text-black border border-white/5'
                    }`}
                  >
                    {buttonText || 'Enquire Now'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
