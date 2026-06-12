import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after some time or when page is ready.
    // For this example, we'll use a fixed timeout to ensure the animation is visible.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Background Radial Light Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulsing deep blue core */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[120px]"
            />
            {/* Spinning light beams or glows */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zarco-cyan/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-[80px]" />
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center">
            {/* Spinning Blue Circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 rounded-full border-2 border-transparent border-t-zarco-cyan border-r-zarco-cyan/30"
            />
            
            {/* Another Spinning Ring (different direction) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 rounded-full border border-transparent border-b-blue-500/50 border-l-blue-500/10"
            />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.05, 1],
                opacity: 1 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="z-10 w-48 h-48 flex items-center justify-center p-4"
            >
              <img 
                src="/images/logos/zarco_logo_vertical_2_upscayl_5x_upscayl-standard-4x_upscayl_5x_upscayl-standard_no_bg.png" 
                alt="Zarco Studios" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
          
          {/* Subtle Progress Line at bottom */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-zarco-cyan to-transparent opacity-50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
