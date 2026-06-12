import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[12rem] md:text-[18rem] font-bold text-white/5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-zarco-cyan tracking-tight"
            >
              {t('404.title', 'Lost in space?')}
            </motion.p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/60 text-lg md:text-xl max-w-md mx-auto"
        >
          {t('404.description', 'The page you are looking for doesn\'t exist or has been moved to another dimension.')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => window.location.hash = ''}
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zarco-cyan hover:text-black transition-all duration-300 mx-auto"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {t('404.back_home', 'Back to Reality')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
