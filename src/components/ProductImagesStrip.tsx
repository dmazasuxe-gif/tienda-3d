import React from 'react';
import { StoreSettings } from '../types';

interface ProductImagesStripProps {
  settings?: StoreSettings;
}

export const ProductImagesStrip: React.FC<ProductImagesStripProps> = ({ settings }) => {
  const activeImages = settings?.productStripImages || [];

  if (activeImages.length === 0) {
    return null;
  }

  // Duplicate enough times so the marquee loop is seamless
  const marqueeItems = [...activeImages, ...activeImages, ...activeImages, ...activeImages, ...activeImages];

  return (
    <section 
      className="py-6 sm:py-8 border-y border-zinc-200 bg-white relative overflow-hidden select-none" 
      id="section-product-images-runway"
    >
      {/* Elegant Infinite Gliding Runway */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Smooth Gradient Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Continuous Gliding Track */}
        <div 
          className="animate-brand-runway flex items-center gap-10 sm:gap-16 md:gap-20 py-2"
          style={{ animationDuration: settings?.productStripSpeed ? `${settings.productStripSpeed}s` : undefined }}
        >
          {marqueeItems.map((imageUrl, idx) => (
            <div
              key={`${imageUrl}-${idx}`}
              className="flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer group px-3 py-1.5 focus:outline-none"
            >
              <img
                src={imageUrl}
                alt={`Producto Strip ${idx}`}
                className="h-20 sm:h-24 md:h-32 w-auto max-w-[200px] object-cover rounded-md opacity-90 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
