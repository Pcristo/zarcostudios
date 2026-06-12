import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export function Privacy() {
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
              {t('legal.privacy')}
            </h1>
            <p className="text-zarco-cyan font-mono text-xs tracking-[0.3em] uppercase">
              {t('legal.last_updated')}: May 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-white/70">
            {isPt ? (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">1. Introdução</h2>
                  <p>
                    A Zarco Studios respeita a sua privacidade e está empenhada em proteger os seus dados pessoais. Esta política de privacidade irá informá-lo sobre como cuidamos dos seus dados pessoais quando visita o nosso website e informa-o sobre os seus direitos de privacidade e como a lei o protege.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">2. Dados que recolhemos</h2>
                  <p>
                    Podemos recolher, utilizar, armazenar e transferir diferentes tipos de dados pessoais sobre si, incluindo: Despacho de identidade, Dados de contacto, Dados técnicos e Dados de utilização.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">3. Como utilizamos os seus dados</h2>
                  <p>
                    Apenas utilizaremos os seus dados pessoais quando a lei nos permitir. Mais comummente, utilizaremos os seus dados pessoais nas seguintes circunstâncias:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Para registá-lo como um novo cliente.</li>
                    <li>Para processar e entregar o seu pedido.</li>
                    <li>Para gerir a nossa relação consigo.</li>
                    <li>Para melhorar o nosso website, produtos/serviços, marketing ou relações com os clientes.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">4. Segurança de Dados</h2>
                  <p>
                    Implementámos medidas de segurança apropriadas para evitar que os seus dados pessoais sejam acidentalmente perdidos, utilizados ou acedidos de forma não autorizada, alterados ou divulgados.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">1. Introduction</h2>
                  <p>
                    Zarco Studios respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">2. The Data We Collect</h2>
                  <p>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Technical Data, and Usage Data.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">3. How We Use Your Data</h2>
                  <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To register you as a new customer.</li>
                    <li>To process and deliver your order.</li>
                    <li>To manage our relationship with you.</li>
                    <li>To improve our website, products/services, marketing or customer relationships.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">4. Data Security</h2>
                  <p>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
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
