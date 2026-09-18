import React, { useRef } from 'react';
import { Product, StoreSettings } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LiquidationSectionProps {
  products: Product[];
  settings: StoreSettings;
  onOpenProduct: (product: Product) => void;
  onViewAllDiscounts: () => void;
}

export const LiquidationSection: React.FC<LiquidationSectionProps> = ({
  products,
  settings,
  onOpenProduct,
  onViewAllDiscounts,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter products with discounts
  const saleProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  const displayProducts = saleProducts.length > 0 ? saleProducts : products.slice(0, 6);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Left Column: Heading & CTA */}
        <div className="lg:col-span-3 space-y-4 text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase font-sans">
            EN LIQUIDACIÓN
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Descubre más de todos los productos que tenemos con ofertas para ti.
          </p>
          <button
            onClick={onViewAllDiscounts}
            className="inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            id="btn-ver-descuentos"
          >
            VER DESCUENTOS
          </button>
        </div>

        {/* Right Column: Carousel with Controls */}
        <div className="lg:col-span-9 relative">
          
          {/* Slider Arrow Buttons */}
          <div className="hidden sm:flex items-center gap-2 absolute -top-12 right-0 z-10">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-zinc-300 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-all cursor-pointer shadow-xs"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-zinc-300 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-all cursor-pointer shadow-xs"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
          >
            {displayProducts.map((product) => {
              const discountPercent =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(
                      ((product.originalPrice - product.price) / product.originalPrice) * 100
                    )
                  : 15;

              return (
                <div
                  key={product.id}
                  onClick={() => onOpenProduct(product)}
                  className="min-w-[190px] sm:min-w-[220px] max-w-[220px] flex flex-col group cursor-pointer shrink-0"
                >
                  {/* Card Image Container */}
                  <div className="relative aspect-square w-full bg-[#f4f4f5] group-hover:bg-[#ededf0] rounded-2xl p-4 flex items-center justify-center transition-all duration-300">
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-black text-white text-[11px] font-black w-9 h-9 rounded-full flex items-center justify-center shadow-xs">
                      -{discountPercent}%
                    </div>

                    {/* Centered Product Photo */}
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
                      {product.originalPrice && (
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
        </div>

      </div>
    </section>
  );
};
