import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Github, Calendar, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  titlePt?: string;
  category: string;
  institution?: string;
  image: string;
  year: string;
  techStack?: string[];
  gallery?: string[];
  shortDescription?: string;
  shortDescriptionPt?: string;
  fullDescription?: string;
  fullDescriptionPt?: string;
  goals?: string;
  goalsPt?: string;
  liveUrl?: string;
  repoUrl?: string;
}

export function ProjectDetails({ projectId }: { projectId: string }) {
  const { t, i18n } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const isPt = i18n.language === 'pt';

  useEffect(() => {
    async function fetchProject() {
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'project');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
    window.scrollTo(0, 0);
  }, [projectId]);

  const getTitle = (p: Project) => (isPt && p.titlePt) ? p.titlePt : p.title;
  const getShortDesc = (p: Project) => (isPt && p.shortDescriptionPt) ? p.shortDescriptionPt : p.shortDescription;
  const getFullDesc = (p: Project) => (isPt && p.fullDescriptionPt) ? p.fullDescriptionPt : p.fullDescription;
  const getGoals = (p: Project) => (isPt && p.goalsPt) ? p.goalsPt : p.goals;

  if (loading) {
    return (
      <div className="pt-40 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zarco-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-white/40 uppercase tracking-widest font-bold">Project not found</p>
        <button 
          onClick={() => window.location.hash = '#work'}
          className="text-zarco-cyan uppercase tracking-widest font-bold text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Work
        </button>
      </div>
    );
  }

  const renderInstitutionBadge = (institution?: string) => {
    if (!institution || institution === 'none') return null;
    const logos: Record<string, string> = {
      'Code Institute': '/images/logos/code-institute-logo.png',
      'Harvard University': '/images/logos/Harvard_University_coat_of_arms150px.png'
    };
    const logo = logos[institution];

    return (
      <div className="w-12 h-12 rounded-full bg-white backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-2xl">
        {logo ? (
          <img src={logo} alt={institution} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
        ) : (
          <GraduationCap className="w-6 h-6 text-black" />
        )}
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.location.hash = '#work'}
          className="group mb-12 flex items-center gap-3 text-white/40 hover:text-zarco-cyan transition-colors"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-zarco-cyan transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest">{isPt ? 'Voltar ao Portfólio' : 'Back to Portfolio'}</span>
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column: Visuals */}
          <div className="w-full lg:w-3/5 space-y-12">
            <div>
              {(() => {
                const images = [
                  project.image,
                  ...(project.gallery?.filter(img => !!img && img.trim() !== '') || [])
                ].filter(Boolean);

                if (images.length === 0) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-video rounded-[10px] py-3 px-6 overflow-hidden border border-white/10 bg-[#0f0d0e] flex items-center justify-center text-white/20"
                    >
                      No Image Selected
                    </motion.div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-video rounded-[10px] py-3 px-6 border border-white/10 bg-[#0f0d0e] group"
                    >
                      <div className="w-full h-full overflow-hidden rounded-[10px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.img 
                            key={currentImageIdx}
                            src={images[currentImageIdx]} 
                            alt={`${getTitle(project)} - Image ${currentImageIdx + 1}`} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-contain rounded-[10px]"
                            referrerPolicy="no-referrer"
                          />
                        </AnimatePresence>
                      </div>

                      {/* Navigation Arrows (Only if multiple images exist) */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Previous image"
                            id="carousel-prev"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Next image"
                            id="carousel-next"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Badges / Info Overlay */}
                      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
                        {images.length > 1 ? (
                          <span className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-white/90">
                            {currentImageIdx + 1} / {images.length}
                          </span>
                        ) : <div />}
                        <div className="pointer-events-auto">
                          {project.category?.toLowerCase() === 'college' && renderInstitutionBadge(project.institution)}
                        </div>
                      </div>

                      {/* Dot Page Indicators */}
                      {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              id={`carousel-dot-${idx}`}
                              type="button"
                              onClick={() => setCurrentImageIdx(idx)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentImageIdx ? 'w-6 bg-zarco-cyan' : 'w-1.5 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Thumbnail Selector list */}
                    {images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            id={`carousel-thumb-${idx}`}
                            type="button"
                            onClick={() => setCurrentImageIdx(idx)}
                            className={`relative aspect-video w-24 rounded-[10px] overflow-hidden border-2 transition-all flex-shrink-0 ${
                              idx === currentImageIdx ? 'border-zarco-cyan scale-95 opacity-100 shadow-xl' : 'border-transparent opacity-40 hover:opacity-80'
                            }`}
                          >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-[8px]" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {getFullDesc(project) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-8">
                  {isPt ? 'Mergulho Profundo' : 'Deep Dive'}
                </h4>
                <div className="text-white/80 leading-relaxed text-base space-y-4">
                  {getFullDesc(project).split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {getGoals(project) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-[3rem] border border-white/10 bg-gradient-to-br from-zarco-cyan/5 to-transparent"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zarco-cyan mb-8">
                  {isPt ? 'Objetivos e Resultados' : 'Goals & Outcomes'}
                </h4>
                <div className="text-white/80 leading-relaxed text-base space-y-4">
                  {getGoals(project).split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-40 h-fit space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 text-zarco-cyan font-bold tracking-[0.3em] text-[10px] uppercase">
                <span>{project.category}</span>
                {project.category?.toLowerCase() === 'college' && project.institution && project.institution !== 'none' && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{project.institution}</span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.year}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">
                {getTitle(project)}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">{isPt ? 'O Conceito' : 'The Concept'}</h4>
              <p className="text-white/60 leading-relaxed text-lg italic font-medium">
                {getShortDesc(project) || 'No concept description available.'}
              </p>
            </motion.div>

            {project.techStack && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Tech Stack</h4>
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="px-5 py-3 bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/70 border border-white/5">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-8 flex flex-col gap-4"
            >
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-6 bg-zarco-cyan text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all text-sm uppercase tracking-widest shadow-lg shadow-zarco-cyan/20"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Live Site
                </a>
              )}
              {project.repoUrl && (
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-6 bg-white/5 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-sm uppercase tracking-widest border border-white/10"
                >
                  <Github className="w-5 h-5" />
                  View Repository
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
