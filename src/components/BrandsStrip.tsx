import React from 'react';
import { StoreSettings, StoreBrand } from '../types';
import { DEFAULT_STORE_BRANDS } from '../data/initialData';
import { BRAND_SVGS } from '../data/brandLogos';

interface BrandsStripProps {
  settings?: StoreSettings;
  brands?: StoreBrand[];
  onSelectBrand?: (brand: string) => void;
}

export const BrandsStrip: React.FC<BrandsStripProps> = ({ 
  settings, 
  brands: propBrands, 
  onSelectBrand 
}) => {
  const allBrands: StoreBrand[] = propBrands || settings?.brands || DEFAULT_STORE_BRANDS;
  const activeBrands = allBrands.filter((b) => b.isActive !== false);

  if (activeBrands.length === 0) {
    return null;
  }

  // Duplicate activeBrands enough times so the marquee loop is seamless across all screen widths
  const marqueeItems = [...activeBrands, ...activeBrands, ...activeBrands, ...activeBrands];

  return (
    <section 
      className="py-6 sm:py-8 border-y border-zinc-200 bg-white relative overflow-hidden select-none" 
      id="section-brands-runway"
    >
      {/* Elegant Infinite Gliding Runway */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Smooth Gradient Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Continuous Gliding Track */}
        <div className="animate-brand-runway flex items-center gap-10 sm:gap-16 md:gap-20 py-2">
          {marqueeItems.map((brand, idx) => {
            const uniqueKey = `${brand.id || brand.name}-${idx}`;
            const effectiveLogo = (brand.logoUrl && !brand.logoUrl.includes('upload.wikimedia.org'))
              ? brand.logoUrl
              : (BRAND_SVGS[brand.name] || brand.logoUrl);

            return (
              <button
                key={uniqueKey}
                type="button"
                onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                className="flex items-center justify-center shrink-0 hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer group px-3 py-1.5 focus:outline-none"
                title={`Ver calzado y productos ${brand.name}`}
              >
                {effectiveLogo ? (
                  <img
                    src={effectiveLogo}
                    alt={brand.name}
                    className="h-9 sm:h-11 md:h-13 max-w-[130px] sm:max-w-[160px] md:max-w-[190px] object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (BRAND_SVGS[brand.name] && e.currentTarget.src !== BRAND_SVGS[brand.name]) {
                        e.currentTarget.src = BRAND_SVGS[brand.name];
                      } else {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline-block';
                        }
                      }
                    }}
                  />
                ) : null}

                {/* Text Fallback in crisp typography */}
                <span
                  className={`${
                    effectiveLogo ? 'hidden' : 'inline-block'
                  } text-lg sm:text-2xl font-black tracking-tight text-zinc-900 group-hover:text-black font-sans uppercase select-none`}
                >
                  {brand.label || brand.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
