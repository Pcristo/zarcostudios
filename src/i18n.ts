import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        translation: {
          nav: {
            home: 'Home',
            portfolio: 'Portfolio',
            services: 'Services',
            pricing: 'Pricing',
            about: 'About',
            contact: 'Contact',
            start_project: 'Start Project',
          },
          hero: {
            badge: 'Digital Craftsmanship',
            title1: 'Custom Websites That',
            title2: 'Grow Your Business',
            subtitle: 'Digital craftsmanship for high-value brands. We merge cinematic minimalism with robust engineering to elevate your digital presence.',
            cta: 'Start a Project',
            secondary: 'View Portfolio',
          },
          services: {
            title: 'Core Expertise',
            bespoke_solutions: 'Bespoke Solutions',
            categories: {
              web_design: {
                title: 'Web Design',
                customized: 'Customized Template Design',
                dynamic: 'Dynamic Website Design',
                responsive: 'Responsive Website Design',
              },
              web_solutions: {
                title: 'Web Solutions',
                credibility: 'Better Business Credibility',
                presence: 'Enhanced Online Presence',
                opportunities: 'Increased Opportunities',
              },
              apps_design: {
                title: 'Apps Design',
                development: 'Full Stack Development',
                compatibility: 'Multi Device Compatibility',
                maintenance: 'Website Maintenance',
              },
            },
            web: {
              title: 'Corporate & Business',
              desc: 'Bespoke digital platforms that establish industry authority and communicate complex value propositions with striking clarity.'
            },
            design: {
              title: 'E-commerce Experiences',
              desc: 'High-conversion, visually stunning online stores designed to elevate the modern shopping experience beyond generic templates.'
            },
            ai: {
              title: 'Booking Systems',
              desc: 'Frictionless reservation flows integrated seamlessly into premium interfaces, turning casual browsers into committed clients.'
            }
          },
          edge: {
            badge: 'The Edge',
            title: 'What we can do for you',
            desc: 'We build clear and well-structured digital experiences focused on performance, usability, and real results.',
            feat1: 'We develop scalable platforms designed to grow with your project and handle increased traffic without compromising performance.',
            feat2: 'Optimized loading times to ensure fast response across all devices and locations.',
            feat3: 'Modern interactive interfaces built with a strong focus on user experience and technical stability.',
          },
          work: {
            title: 'Portfolio',
            view_archive: 'View Archive',
            view: 'View Case Study',
            explore: 'Explore all'
          },
          testimonials: {
            badge: 'Testimonials',
            title: 'What our clients <span class="text-zarco-cyan text-glow">say</span>',
            subtitle: 'Real stories from the brands we\'ve helped elevate. We build long-term partnerships through consistent delivery and technical excellence.'
          },
          newsletter: {
            title: 'Stay in the loop',
            description: 'Subscribe to our newsletter for the latest design insights and studio updates.',
            placeholder: 'your@email.com',
            button: 'Subscribe',
            loading: 'Subscribing...',
            success: 'Thanks for subscribing!',
            error: 'Something went wrong. Please try again.',
            already: 'This email is already subscribed.'
          },
          about: {
            developer: "Hello there! I’m Pedro. I’d love to help you with your next project.",
            intro1: "I am a Full Stack Developer graduate from Code Institute Dublin, with a strong foundation in graphic design and modern web technologies.",
            intro2: "Over the past three years, I have focused on building practical, real-world development skills through both formal education and continuous self-learning across platforms such as Udemy, Codecademy, and Scrimba. I also hold a Microsoft certification in Introduction to Programming Using HTML and CSS from Solas College, and successfully completed CS50's Web Programming with Python and JavaScript by Harvard University.",
            intro3: "I specialize in designing and developing fast, responsive, and conversion-focused web applications. My approach combines clean design, strong technical execution, and a focus on user experience to deliver high-quality digital products.",
            intro4: "I am particularly interested in building solutions that help businesses establish a strong online presence and improve their digital performance. I enjoy working on projects where design and functionality come together to create meaningful user experiences.",
            intro5: "I work directly with clients to turn ideas into fully functional, modern web solutions.",
            highlight: "Direct communication. Zero friction. Exceptional results.",
            arsenal: "The Arsenal",
            approach: "Work Approach",
            no_layers: {
              title: "No Middle Layers",
              desc: "You speak directly to the engineer building your product. No account managers, no lost translations. Pure execution from concept to deployment."
            },
            comm: {
              title: "Fast Communication",
              desc: "Agile iterations with rapid response times. Issues are identified and resolved swiftly, keeping the momentum of the build continuously moving forward."
            },
            custom: {
              title: "Custom Solutions",
              desc: "Off-the-shelf templates limit potential. Every architecture is designed specifically for your business logic, ensuring maximum scalability and unique brand presence."
            },
            build_cta: "Let's build your project.",
            build_btn: "START THE CONVERSATION"
          },
          contact: {
            title: "Let's talk about your <span class='text-zarco-cyan drop-shadow-[0_0_15px_rgba(79,209,220,0.5)]'>project,</span>",
            subtitle: "Every project is unique. Share your vision with us and we will create a tailored digital solution built around your needs.",
            labels: {
              inbox: "DIRECT INBOX",
              connect: "INSTANT CONNECT",
              socials: "SOCIALS"
            },
            fields: {
              name: "FULL NAME",
              company: "COMPANY NAME",
              email: "EMAIL ADDRESS",
              phone: "PHONE NUMBER",
              interest: "AREA OF INTEREST",
              budget: "ESTIMATED BUDGET (OPTIONAL)",
              details: "PROJECT DETAILS",
              details_placeholder: "Briefly describe your objectives, timeline, and current challenges...",
              budget_placeholder: "Select a range"
            },
            interests: {
              web: "WEB PLATFORM",
              ecommerce: "E-COMMERCE",
              creative: "CREATIVE DIRECTION",
              other: "OTHER"
            },
            btn: "TRANSMIT PROTOCOL"
          },
          login: {
            title: "Studio Control",
            subtitle: "Authorized personnel only.",
            email: "Email Address",
            password: "Password",
            btn: "Access Studio Control"
          },
          legal: {
            title: "Legal",
            privacy: "Privacy Policy",
            cookies: "Cookie Policy",
            terms: "Terms & Conditions",
            last_updated: "Last Updated",
            copyright: "© 2026 ZARCO STUDIOS. DIGITAL CRAFTSMANSHIP. ALL RIGHTS RESERVED",
            consent: {
              title: "Digital Privacy",
              description: "We use cookies to refine your digital experience and enhance our studio's performance. Customize your preferences or accept all protocols.",
              acceptAll: "Accept All",
              declineAll: "Decline All",
              customize: "Customize",
              save: "Save Preferences",
              categories: {
                necessary: "Necessary",
                analytics: "Analytics",
                marketing: "Marketing"
              }
            }
          },
          investment: {
            title: "Investment",
            subtitle: "Pricing Plans",
            desc: "Transparent and flexible solutions tailored to your digital ambitions.",
            popular: "Popular Choose",
          },
          cookie_consent: {
            back: "Back",
            always_active: "Always active",
            metrics_performance: "Metrics & performance",
            ad_targeting: "Ad targeting",
          },
          404: {
            title: "Lost in space?",
            description: "The page you are looking for doesn't exist or has been moved to another dimension.",
            back_home: "Back to Reality"
          }
        },
      },
      pt: {
        translation: {
          nav: {
            home: 'Início',
            portfolio: 'Portfólio',
            services: 'Serviços',
            pricing: 'Preços',
            about: 'Sobre',
            contact: 'Contacto',
            start_project: 'Iniciar Projeto',
          },
          hero: {
            badge: 'Artesanato Digital',
            title1: 'Websites Personalizados que',
            title2: 'Aumentam o seu Negócio',
            subtitle: 'Artesanato digital para marcas de alto valor. Fundimos minimalismo cinematográfico com engenharia robusta para elevar a sua presença digital.',
            cta: 'Iniciar um Projeto',
            secondary: 'Ver Portfólio',
          },
          services: {
            title: 'Especialização Principal',
            bespoke_solutions: 'Soluções por Medida',
            categories: {
              web_design: {
                title: 'Web Design',
                customized: 'Design de Templates Personalizados',
                dynamic: 'Design de Websites Dinâmicos',
                responsive: 'Design de Websites Responsivos',
              },
              web_solutions: {
                title: 'Soluções Web',
                credibility: 'Melhor Credibilidade de Negócio',
                presence: 'Presença Online Melhorada',
                opportunities: 'Mais Oportunidades',
              },
              apps_design: {
                title: 'Design de Aplicações',
                development: 'Desenvolvimento Full Stack',
                compatibility: 'Compatibilidade Multi-Dispositivo',
                maintenance: 'Manutenção de Websites',
              },
            },
            web: {
              title: 'Corporativo & Negócios',
              desc: 'Plataformas digitais sob medida que estabelecem autoridade no setor e comunicam propostas de valor complexas com clareza impressionante.'
            },
            design: {
              title: 'Experiências E-commerce',
              desc: 'Lojas online de alta conversão e visualmente deslumbrantes, projetadas para elevar a experiência de compra moderna além dos modelos genéricos.'
            },
            ai: {
              title: 'Sistemas de Reserva',
              desc: 'Fluxos de reserva sem atrito integrados perfeitamente em interfaces premium, transformando navegadores casuais em clientes comprometidos.'
            }
          },
          edge: {
            badge: 'Vantagem Competitiva',
            title: 'O que podemos fazer por si',
            desc: 'Construímos experiências digitais claras e bem estruturadas, focadas em desempenho, usabilidade e resultados reais.',
            feat1: 'Desenvolvemos plataformas escaláveis, concebidas para crescer com o seu projeto e suportar volumes crescentes de tráfego sem comprometer o desempenho.',
            feat2: 'Tempos de carregamento otimizados para garantir uma resposta rápida em qualquer dispositivo e localização.',
            feat3: 'Interfaces interativas modernas, concebidas com um forte foco na experiência do utilizador e na estabilidade técnica.',
          },
          work: {
            title: 'Portfólio',
            view_archive: 'Ver Arquivo',
            view: 'Ver Caso de Estudo',
            explore: 'Ver mais'
          },
          testimonials: {
            badge: 'Testemunhos',
            title: 'O que dizem os nossos <span class="text-zarco-cyan text-glow">clientes</span>',
            subtitle: 'Histórias reais das marcas que ajudámos a elevar. Construímos parcerias de longo prazo através de entregas consistentes e excelência técnica.'
          },
          newsletter: {
            title: 'Fique a par de tudo',
            description: 'Subscreva a nossa newsletter para receber as últimas novidades e atualizações do estúdio.',
            placeholder: 'seu@email.com',
            button: 'Subscrever',
            loading: 'A subscrever...',
            success: 'Obrigado por se inscrever!',
            error: 'Algo correu mal. Por favor, tente novamente.',
            already: 'Este e-mail já está inscrito.'
          },
          about: {
            developer: "Olá! Sou o Pedro. Gostaria de ajudá-lo com o seu próximo projeto.",
            intro1: "Sou um Desenvolvedor Full Stack graduado pelo Code Institute Dublin, com uma sólida base em design gráfico e tecnologias web modernas.",
            intro2: "Ao longo dos últimos três anos, foquei-me no desenvolvimento de competências práticas e do mundo real, tanto através de educação formal como de autoaprendizagem contínua em plataformas como Udemy, Codecademy e Scrimba. Detenho também uma certificação Microsoft em Introdução à Programação usando HTML e CSS pelo Solas College, e completei com sucesso o CS50's Web Programming with Python and JavaScript da Harvard University.",
            intro3: "Especializei-me no design e desenvolvimento de aplicações web rápidas, responsivas e focadas na conversão. A minha abordagem combina design limpo, execução técnica forte e um foco na experiência do utilizador para entregar produtos digitais de alta qualidade.",
            intro4: "Tenho um interesse particular em construir soluções que ajudem as empresas a estabelecer uma presença online forte e a melhorar o seu desempenho digital. Gosto de trabalhar em projetos onde o design e a funcionalidade se unem para criar experiências de utilizador significativas.",
            intro5: "Trabalho diretamente com os clientes para transformar ideias em soluções web modernas e totalmente funcionais.",
            highlight: "Comunicação direta. Zero fricção. Resultados excecionais.",
            arsenal: "O Arsenal",
            approach: "Abordagem de Trabalho",
            no_layers: {
              title: "Sem Camadas Intermédias",
              desc: "Fala diretamente com o engenheiro que está a construir o seu produto. Sem gestores de conta, sem traduções perdidas. Execução pura do conceito à implementação."
            },
            comm: {
              title: "Comunicação Rápida",
              desc: "Iterações ágeis com tempos de resposta rápidos. Os problemas são identificados e resolvidos prontamente, mantendo o ímpeto da construção em movimento contínuo."
            },
            custom: {
              title: "Soluções Personalizadas",
              desc: "Modelos pré-fabricados limitam o potencial. Cada arquitetura é desenhada especificamente para a sua lógica de negócio, garantindo máxima escalabilidade e presença de marca única."
            },
            build_cta: "Vamos construir o seu projeto.",
            build_btn: "INICIAR A CONVERSAR"
          },
          contact: {
            title: "Vamos falar sobre o seu <span class='text-zarco-cyan drop-shadow-[0_0_15px_rgba(79,209,220,0.5)]'>projeto,</span>",
            subtitle: "Cada projeto é único. Partilhe a sua visão connosco e criaremos uma solução digital à medida, construída de acordo com as suas necessidades.",
            labels: {
              inbox: "INBOX DIRETO",
              connect: "LIGAÇÃO INSTANTÂNEA",
              socials: "REDES SOCIAIS"
            },
            fields: {
              name: "NOME COMPLETO",
              company: "NOME DA EMPRESA",
              email: "ENDEREÇO DE EMAIL",
              phone: "NÚMERO DE TELEFONE",
              interest: "ÁREA DE INTERESSE",
              budget: "ORÇAMENTO ESTIMADO (OPCIONAL)",
              details: "DETALHES DO PROJETO",
              details_placeholder: "Descreva brevemente os seus objetivos, cronograma e desafios atuais...",
              budget_placeholder: "Selecione um intervalo"
            },
            interests: {
              web: "PLATAFORMA WEB",
              ecommerce: "E-COMMERCE",
              creative: "DIREÇÃO CRIATIVA",
              other: "OUTRO"
            },
            btn: "TRANSMITIR PROTOCOLO"
          },
          login: {
            title: "Controlo de Estúdio",
            subtitle: "Apenas pessoal autorizado.",
            email: "Endereço de Email",
            password: "Palavra-passe",
            btn: "Aceder ao Controlo de Estúdio"
          },
          legal: {
            title: "Legal",
            privacy: "Política de Privacidade",
            cookies: "Política de Cookies",
            terms: "Termos e Condições",
            last_updated: "Última Atualização",
            copyright: "© 2026 ZARCO STUDIOS. ARTESANATO DIGITAL. TODOS OS DIREITOS RESERVADOS",
            consent: {
              title: "Privacidade Digital",
              description: "Utilizamos cookies para refinar a sua experiência digital e melhorar o desempenho do nosso estúdio. Personalize as suas preferências ou aceite todos os protocolos.",
              acceptAll: "Aceitar Todos",
              declineAll: "Recusar Todos",
              customize: "Personalizar",
              save: "Guardar Preferências",
              categories: {
                necessary: "Necessários",
                analytics: "Analíticos",
                marketing: "Marketing"
              }
            }
          },
          investment: {
            title: "Investimento",
            subtitle: "Planos de Preços",
            desc: "Soluções transparentes e flexíveis criadas à medida das suas ambições digitais.",
            popular: "Escolha Popular",
          },
          cookie_consent: {
            back: "Voltar",
            always_active: "Sempre ativo",
            metrics_performance: "Métricas e desempenho",
            ad_targeting: "Segmentação de anúncios",
          },
          404: {
            title: "Perdido no espaço?",
            description: "A página que procura não existe ou foi movida para outra dimensão.",
            back_home: "Voltar à Realidade"
          }
        },
      },
    },
  });

export default i18n;
