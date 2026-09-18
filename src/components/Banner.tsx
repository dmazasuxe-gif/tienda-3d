import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreSettings } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerProps {
  settings: StoreSettings;
}

export const Banner: React.FC<BannerProps> = ({ settings }) => {
  const slides = settings.runwaySlides && settings.runwaySlides.length > 0 
    ? settings.runwaySlides 
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds per slide
    
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-zinc-900 overflow-hidden group">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentIndex].imageUrl}
            alt={`Promotional slide ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Editorial Luxury Overlay Text & Button */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white pointer-events-none px-4 text-center">
        <span className="text-sm tracking-[0.3em] uppercase mb-4 opacity-90 font-medium">Nueva Colección</span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-widest mb-8 uppercase drop-shadow-md">
          {settings.storeName || 'MQ3D'}
        </h2>
        <a 
          href="#coleccion"
          className="pointer-events-auto border border-white text-white bg-transparent hover:bg-white hover:text-black px-8 py-3 rounded-sm font-medium tracking-[0.15em] uppercase text-sm transition-all duration-300"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' });
          }}
        >
          Explorar Colección
        </a>
      </div>

      {/* Navigation Controls (Visible on hover on desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 hidden sm:flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 hidden sm:flex"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-1.5 bg-white' 
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80 cursor-pointer'
                }`}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
