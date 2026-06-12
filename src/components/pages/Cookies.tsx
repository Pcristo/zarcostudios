import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export function Cookies() {
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
              {t('legal.cookies')}
            </h1>
            <p className="text-zarco-cyan font-mono text-xs tracking-[0.3em] uppercase">
              {t('legal.last_updated')}: May 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-white/70">
            {isPt ? (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">O que são Cookies?</h2>
                  <p>
                    Cookies são pequenos ficheiros de texto que são descarregados para o seu computador ou dispositivo móvel quando visita um website. Estes permitem que o website reconheça o seu dispositivo e armazene algumas informações sobre as suas preferências ou ações passadas.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Como utilizamos Cookies?</h2>
                  <p>
                    A Zarco Studios utiliza cookies para melhorar a sua experiência de navegação, analisar o tráfego do website e personalizar o conteúdo. Alguns cookies são essenciais para o funcionamento do site, enquanto outros ajudam-nos a perceber como os visitantes interagem com o conteúdo.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Tipos de Cookies que utilizamos</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Estritamente Necessários:</strong> Essenciais para a navegação e utilização das funcionalidades do site.</li>
                    <li><strong>Desempenho:</strong> Recolhem informação anónima sobre como os visitantes utilizam o site.</li>
                    <li><strong>Funcionalidade:</strong> Permitem que o site se lembre de escolhas feitas pelo utilizador (como o idioma).</li>
                  </ul>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">What are Cookies?</h2>
                  <p>
                    Cookies are small text files that are downloaded to your computer or mobile device when you visit a website. They allow the website to recognize your device and store some information about your preferences or past actions.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">How we use Cookies?</h2>
                  <p>
                    Zarco Studios uses cookies to improve your browsing experience, analyze website traffic, and personalize content. Some cookies are essential for the site to function, while others help us understand how visitors interact with content.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Types of Cookies we use</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Strictly Necessary:</strong> Essential for browsing and using the features of the site.</li>
                    <li><strong>Performance:</strong> Collect anonymous information about how visitors use the site.</li>
                    <li><strong>Functionality:</strong> Allow the site to remember choices made by the user (such as language).</li>
                  </ul>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
