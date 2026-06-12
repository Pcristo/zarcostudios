import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Quote, Star, ImageIcon, Loader2, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';

interface Review {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  reviewTextEn: string;
  reviewTextPt: string;
  lang: "en" | "pt" | "both";
  show: boolean;
  order: number;
  rating: number;
  linkedInUsername?: string;
}

export function Testimonials() {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showSection, setShowSection] = useState(true);
  const [displayMode, setDisplayMode] = useState<"grid" | "carousel">("grid");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isPt = i18n.language === 'pt';

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const settingsRef = doc(db, 'settings', 'testimonials');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setShowSection(data.showSection ?? true);
          setDisplayMode(data.displayMode ?? "grid");
        }

        const q = query(collection(db, 'reviews'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];

        const filtered = data.filter(r => {
          if (!r.show) return false;
          if (r.lang === 'both') return true;
          return r.lang === (isPt ? 'pt' : 'en');
        });

        setReviews(filtered);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'reviews/settings');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isPt]);

  useEffect(() => {
    if (displayMode === 'carousel' && reviews.length > 1) {
      timerRef.current = setInterval(nextSlide, 8000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayMode, reviews.length]);

  if (!showSection || (reviews.length === 0 && !loading)) return null;

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-[#040809]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-zarco-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zarco-cyan/10 border border-zarco-cyan/20 backdrop-blur-md"
          >
            <Star className="w-3.5 h-3.5 text-zarco-cyan animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zarco-cyan">
              {t('testimonials.badge')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[0.9]"
            dangerouslySetInnerHTML={{ __html: t('testimonials.title') }}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {t('testimonials.subtitle')}
          </motion.p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-zarco-cyan animate-spin" />
          </div>
        ) : displayMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-zarco-cyan/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full p-10 rounded-[2.5rem] bg-[#0c1417]/40 border border-white/5 backdrop-blur-sm group-hover:border-zarco-cyan/20 transition-all duration-500 overflow-hidden">
                  <Quote className="absolute -top-4 -right-4 w-24 h-24 text-white/[0.02] -rotate-12 transition-transform group-hover:scale-110 duration-700" />
                  
                  <div className="flex flex-col h-full">
                    <div className="flex-1 mb-10">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'text-zarco-cyan fill-zarco-cyan' : 'text-white/10'}`} 
                          />
                        ))}
                      </div>
                      
                      <div className="relative">
                        <span className="absolute -top-2 -left-2 text-4xl text-zarco-cyan/20 font-black leading-none italic">"</span>
                        <p className="text-white/70 text-lg font-medium leading-relaxed italic relative z-10 indent-4">
                          {isPt ? (review.reviewTextPt || review.reviewTextEn) : (review.reviewTextEn || review.reviewTextPt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-zarco-cyan/20 flex-shrink-0 bg-white/5 group-hover:ring-zarco-cyan/40 transition-all">
                        {review.avatar ? (
                          <img 
                            src={review.avatar} 
                            alt={review.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-black uppercase tracking-tight group-hover:text-zarco-cyan transition-colors">
                            {review.name}
                          </h4>
                          {review.linkedInUsername && (
                            <a 
                              href={`https://linkedin.com/in/${review.linkedInUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/20 hover:text-zarco-cyan transition-colors"
                            >
                              <Linkedin className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                          {review.companyName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto relative group">
             <AnimatePresence mode="wait">
                <motion.div
                  key={reviews[activeIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative py-8 md:py-12 px-12 md:px-20 rounded-[3rem] bg-[#0c1417]/60 border border-white/5 backdrop-blur-md overflow-hidden text-center min-h-[400px] flex flex-col justify-center"
                >
                  <Quote className="absolute top-10 right-10 w-32 h-32 text-white/[0.02] -rotate-12" />
                  
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < (reviews[activeIndex].rating || 5) ? 'text-zarco-cyan fill-zarco-cyan text-glow' : 'text-white/5'}`} 
                        />
                      ))}
                    </div>

                    <div className="relative mb-10">
                      <span className="absolute -top-6 -left-6 text-6xl text-zarco-cyan/20 font-black italic">"</span>
                      <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed italic relative z-10 max-w-2xl mx-auto opacity-90">
                        {isPt ? (reviews[activeIndex].reviewTextPt || reviews[activeIndex].reviewTextEn) : (reviews[activeIndex].reviewTextEn || reviews[activeIndex].reviewTextPt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-zarco-cyan/20 bg-white/5 shadow-2xl">
                        {reviews[activeIndex].avatar ? (
                          <img 
                            src={reviews[activeIndex].avatar} 
                            alt={reviews[activeIndex].name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <h4 className="text-xl font-black uppercase tracking-tight text-white">
                            {reviews[activeIndex].name}
                          </h4>
                          {reviews[activeIndex].linkedInUsername && (
                            <a 
                              href={`https://linkedin.com/in/${reviews[activeIndex].linkedInUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/20 hover:text-zarco-cyan transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-2">
                          {reviews[activeIndex].companyName}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
             </AnimatePresence>

             {/* Carousel Nav */}
             {reviews.length > 1 && (
               <>
                 <button 
                   onClick={prevSlide}
                   className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-zarco-cyan hover:text-black hover:border-zarco-cyan transition-all hidden md:flex"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={nextSlide}
                   className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-zarco-cyan hover:text-black hover:border-zarco-cyan transition-all hidden md:flex"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>

                 <div className="flex justify-center gap-2 mt-10">
                    {reviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`transition-all duration-500 rounded-full h-1.5 ${i === activeIndex ? 'w-8 bg-zarco-cyan' : 'w-1.5 bg-white/10 hover:bg-white/30'}`}
                      />
                    ))}
                 </div>
               </>
             )}
          </div>
        )}

        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5 }}
           className="mt-24 text-center"
        >
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-zarco-cyan/20 to-transparent w-full max-w-4xl opacity-30" />
        </motion.div>
      </div>
    </section>
  );
}
