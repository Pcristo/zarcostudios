import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export function Terms() {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language === 'pt';

  return (
    <div className="pt-40 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              {t('legal.terms')}
            </h1>
            <p className="text-zarco-cyan font-mono text-xs tracking-[0.3em] uppercase">
              {t('legal.last_updated')}: May 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-white/70">
            {isPt ? (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">1. Aceitação dos Termos</h2>
                  <p>
                    Ao aceder e utilizar este website, aceita estar vinculado por estes Termos e Condições, todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de quaisquer leis locais aplicáveis.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">2. Licença de Utilização</h2>
                  <p>
                    É concedida permissão para descarregar temporariamente uma cópia dos materiais no website da Zarco Studios apenas para visualização transitória pessoal e não comercial.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">3. Isenção de Responsabilidade</h2>
                  <p>
                    Os materiais no website da Zarco Studios são fornecidos "como estão". A Zarco Studios não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">4. Lei Aplicável</h2>
                  <p>
                    Qualquer reclamação relativa ao website da Zarco Studios será regida pelas leis de Portugal, sem olhar para o seu conflito de disposições legais.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using this website, you are agreeing to be bound by these Terms and Conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">2. Use License</h2>
                  <p>
                    Permission is granted to temporarily download one copy of the materials on Zarco Studios' website for personal, non-commercial transitory viewing only.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">3. Disclaimer</h2>
                  <p>
                    The materials on Zarco Studios' website are provided on an 'as is' basis. Zarco Studios makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">4. Governing Law</h2>
                  <p>
                    Any claim relating to Zarco Studios' website shall be governed by the laws of Portugal without regard to its conflict of law provisions.
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
