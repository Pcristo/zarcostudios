import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="py-20 bg-transparent relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 items-start">
          <div className="col-span-2 lg:col-span-2 order-last lg:order-first pt-8 lg:pt-0 border-t border-white/5 lg:border-t-0 flex flex-col items-center lg:items-start text-center lg:text-left">
            <a href="#" className="inline-block mb-6">
              <img 
                src="/images/logos/zarco_logo_vertical_2_upscayl_5x_upscayl-standard-4x_upscayl_5x_upscayl-standard_no_bg.png" 
                alt="Zarco Studios" 
                className="w-24 h-auto"
                referrerPolicy="no-referrer"
              />
            </a>
            <p className="text-white/30 text-[11px] font-bold tracking-widest uppercase">
              {t('legal.copyright')}
            </p>
          </div>

          <div className="flex flex-col gap-8 order-1 lg:order-none">
            <h4 className="text-zarco-cyan text-[11px] font-bold uppercase tracking-[0.2em]">{t('Navigation')}</h4>
            <ul className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <li><a href="#" className="hover:text-zarco-cyan transition-colors">{t('nav.home')}</a></li>
              <li><a href="#services" className="hover:text-zarco-cyan transition-colors">{t('nav.services')}</a></li>
              <li><a href="#work" className="hover:text-zarco-cyan transition-colors">{t('nav.portfolio')}</a></li>
              <li><a href="#about" className="hover:text-zarco-cyan transition-colors">{t('nav.about')}</a></li>
              <li><a href="#contact" className="hover:text-zarco-cyan transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-8 order-2 lg:order-none">
            <h4 className="text-zarco-cyan text-[11px] font-bold uppercase tracking-[0.2em]">{t('Socials')}</h4>
            <ul className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <li><a href="https://www.facebook.com/zarcostudios" target="_blank" rel="noopener noreferrer" className="hover:text-zarco-cyan transition-colors">Facebook</a></li>
              <li><a href="https://www.linkedin.com/in/pedro-cristo/" target="_blank" rel="noopener noreferrer" className="hover:text-zarco-cyan transition-colors">LinkedIn</a></li>
              <li><a href="https://github.com/PedroCristo" target="_blank" rel="noopener noreferrer" className="hover:text-zarco-cyan transition-colors">GitHub</a></li>
              <li className="pt-4"><a href="#login" className="text-[9px] text-white/10 hover:text-white transition-colors">{t('login.title')}</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-8 order-3 lg:order-none">
            <h4 className="text-zarco-cyan text-[11px] font-bold uppercase tracking-[0.2em]">Legal</h4>
            <ul className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <li><a href="#privacy" className="hover:text-zarco-cyan transition-colors">{t('legal.privacy')}</a></li>
              <li><a href="#cookies" className="hover:text-zarco-cyan transition-colors">{t('legal.cookies')}</a></li>
              <li><a href="#terms" className="hover:text-zarco-cyan transition-colors">{t('legal.terms')}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
