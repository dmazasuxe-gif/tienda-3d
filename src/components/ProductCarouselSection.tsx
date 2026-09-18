import React, { useRef } from 'react';
import { Product, StoreSettings } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselSectionProps {
  title: string;
  products: Product[];
  settings: StoreSettings;
  onOpenProduct: (product: Product) => void;
  onViewAll?: () => void;
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  products,
  settings,
  onOpenProduct,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header with Title and Nav Arrows */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase font-sans">
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors cursor-pointer mr-2"
            >
              Ver Todo
            </button>
          )}

          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-all cursor-pointer shadow-2xs"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-all cursor-pointer shadow-2xs"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Row Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-3"
      >
        {products.map((product) => {
          const discountPercent =
            product.originalPrice && product.originalPrice > product.price
              ? Math.round(
                  ((product.originalPrice - product.price) / product.originalPrice) * 100
                )
              : 0;

          return (
            <div
              key={product.id}
              onClick={() => onOpenProduct(product)}
              className="min-w-[180px] sm:min-w-[240px] max-w-[260px] flex flex-col group cursor-pointer shrink-0"
            >
              {/* Product Image Card */}
              <div className="relative aspect-square w-full bg-[#f4f4f5] group-hover:bg-[#ededf0] rounded-2xl p-4 sm:p-5 flex items-center justify-center transition-all duration-300">
                {/* Discount or New badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    -{discountPercent}%
                  </div>
                )}
                {product.isNew && discountPercent === 0 && (
                  <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    NUEVO
                  </div>
                )}

                {/* Sneaker/Apparel Image */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Title & Price Below Container */}
              <div className="pt-3 text-center space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-black line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-zinc-400 line-through font-normal">
                      {settings.currencySymbol} {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-black font-extrabold">
                    {settings.currencySymbol} {product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
