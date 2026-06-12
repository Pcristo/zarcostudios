import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, ExternalLink, Github, Calendar, GraduationCap } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  titlePt?: string;
  category: string;
  institution?: string;
  image: string;
  year: string;
  isFeatured?: boolean;
  isActive?: boolean;
  techStack?: string[];
  gallery?: string[];
  shortDescription?: string;
  shortDescriptionPt?: string;
  fullDescription?: string;
  fullDescriptionPt?: string;
  liveUrl?: string;
  repoUrl?: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Pulse Dashboard',
    category: 'SaaS / Web App',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1551288049-bbda4833effb?q=80&w=2070&auto=format&fit=crop',
    techStack: ['React', 'D3.js', 'TypeScript', 'Firebase'],
    fullDescription: 'An enterprise-grade analytics dashboard focusing on real-time data visualization and user behavior tracking.'
  },
  {
    id: '2',
    title: 'Booking Engine',
    category: 'Travel / Booking',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop',
    techStack: ['Next.js', 'Tailwind', 'JavaScript', 'PostgreSQL'],
    fullDescription: 'Custom multi-device booking platform with automated scheduling and payment integration.'
  },
  {
    id: '3',
    title: 'E-commerce UI',
    category: 'Retail / Design',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
    techStack: ['Three.js', 'Tailwind', 'TypeScript', 'Shopify'],
    fullDescription: 'Immersive 3D shopping experience with complex product customizations and smooth transitions.'
  },
];

function getCategorizedTechStack(techStack?: string[]): string[] {
  if (!techStack || techStack.length === 0) return [];

  const programmingLanguages = [
    'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'kotlin', 'swift', 'rust', 'c'
  ];

  const backendTech = [
    'node.js', 'node', 'express', 'django', 'flask', 'spring boot', 'laravel', 'rails', 'firebase', 'firestore', 'supabase', 'postgresql', 'postgres', 'mongodb', 'mongo', 'mysql', 'sqlite', 'graphql', 'aws', 'docker', 'google cloud', 'gcp', 'sql', 'prisma', 'stripe', 'redis', 'appwrite', 'shopify'
  ];

  const languages: string[] = [];
  const backend: string[] = [];
  const frontend: string[] = [];

  techStack.forEach(t => {
    const lower = t.toLowerCase().trim();
    if (programmingLanguages.includes(lower)) {
      languages.push(t);
    } else if (backendTech.includes(lower)) {
      backend.push(t);
    } else {
      frontend.push(t);
    }
  });

  const selectedFrontend = frontend.slice(0, 2);
  const selectedLanguage = languages.slice(0, 1);
  const selectedBackend = backend.slice(0, 1);

  // Combine them: 2 frontend, 1 language, 1 backend
  const result: string[] = [];
  selectedFrontend.forEach(x => result.push(x));
  selectedLanguage.forEach(x => result.push(x));
  selectedBackend.forEach(x => result.push(x));

  // If we still have fewer than 4 total and have original items left, let's backfill
  const used = new Set(result);
  for (const t of techStack) {
    if (result.length >= 4) break;
    if (!used.has(t)) {
      result.push(t);
      used.add(t);
    }
  }

  return result;
}

export function Portfolio({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { t, i18n } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const isPt = i18n.language === 'pt';

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        // Always filter for active projects in public view
        let finalData = data.filter(p => p.isActive !== false);

        if (finalData.length === 0) {
          // Fallback to mock projects if DB is empty
          setProjects(featuredOnly ? mockProjects.slice(0, 3) : mockProjects);
        } else {
          if (featuredOnly) {
            const featured = finalData.filter(p => p.isFeatured);
            if (featured.length === 0) {
              setProjects(finalData.slice(0, 3));
            } else {
              setProjects(featured);
            }
          } else {
            setProjects(finalData);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'projects');
        setProjects(featuredOnly ? mockProjects.slice(0, 3) : mockProjects);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [featuredOnly]);

  const isWorkArchive = typeof window !== 'undefined' && (window.location.hash === '#work' || window.location.hash === '#work-archive');

  const getTitle = (p: Project) => (isPt && p.titlePt) ? p.titlePt : p.title;
  const getShortDesc = (p: Project) => (isPt && p.shortDescriptionPt) ? p.shortDescriptionPt : p.shortDescription;
  const getFullDesc = (p: Project) => (isPt && p.fullDescriptionPt) ? p.fullDescriptionPt : p.fullDescription;

  const renderInstitutionBadge = (institution?: string, className?: string) => {
    if (!institution || institution === 'none') return null;

    // Mapping for institution logos
    const logos: Record<string, string> = {
      'Code Institute': '/images/logos/code-institute-logo.png',
      'Harvard University': '/images/logos/Harvard_University_coat_of_arms150px.png'
    };

    const logo = logos[institution];

    return (
      <div className={className || "absolute top-6 right-6 z-20"}>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-2xl">
          {logo ? (
            <img src={logo} alt={institution} className="w-6 h-6 md:w-8 md:h-8 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <GraduationCap className="w-6 h-6 text-black" />
          )}
        </div>
      </div>
    );
  };

  const portfolioProjects = projects.filter(p => !p.category || p.category.toLowerCase() !== 'college');
  const collegeProjects = projects.filter(p => p.category && p.category.toLowerCase() === 'college');

  const renderProjectCard = (project: Project, index: number) => (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseEnter={() => setHoveredId(project.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => window.location.hash = `#project/${project.id}`}
      className="group cursor-pointer flex flex-col gap-6"
    >
      <div className="relative aspect-[19/11] overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/5">
        {project.image ? (
          <motion.img
            src={project.image}
            alt={getTitle(project)}
            animate={{ scale: hoveredId === project.id ? 1.05 : 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
            No Image Selected
          </div>
        )}
        
        {project.category?.toLowerCase() === 'college' && renderInstitutionBadge(project.institution)}

        {/* Visual Accent Tags */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
           {project.techStack && project.techStack.length > 0 ? (
             getCategorizedTechStack(project.techStack).map((tech, idx) => (
                <span key={idx} className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white/80 border border-white/5">{tech}</span>
             ))
           ) : (
             <>
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white/80 border border-white/5">Design</span>
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white/80 border border-white/5">Web</span>
             </>
           )}
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-zarco-cyan transition-colors">{getTitle(project)}</h3>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">{project.category}</p>
            {project.category?.toLowerCase() === 'college' && project.institution && project.institution !== 'none' && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <p className="text-[11px] text-zarco-cyan/60 uppercase tracking-widest font-bold">{project.institution}</p>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-zarco-cyan group-hover:bg-zarco-cyan/10 transition-all">
           <ArrowUpRight className="w-5 h-5 text-zarco-cyan" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <section id="work" className={`py-32 bg-zarco-black relative overflow-hidden ${isWorkArchive ? 'min-h-[70vh]' : ''}`}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">{t('work.title')}</h2>
          {!isWorkArchive && (
            <motion.button 
              whileHover={{ x: 5 }}
              onClick={() => window.location.hash = '#work-archive'}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zarco-cyan hover:brightness-110 transition-all group"
            >
              {t('work.view_archive')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {projects.length === 0 && !loading ? (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-white/20 font-bold uppercase tracking-widest text-sm">No projects found in the database.</p>
           </div>
        ) : (
          <div className="space-y-32">
            {/* Portfolio Grid */}
            {portfolioProjects.length > 0 && (
              <div className="grid md:grid-cols-3 gap-8 text-zarco-white">
                {portfolioProjects.map((project, i) => renderProjectCard(project, i))}
              </div>
            )}

            {/* College Projects Section */}
            {collegeProjects.length > 0 && (
              <div className="space-y-20">
                <div className="pt-20 border-t border-white/5">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                    {isPt ? 'Projetos Académicos' : 'College Projects'}
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-zarco-white">
                  {collegeProjects.map((project, i) => renderProjectCard(project, i))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
