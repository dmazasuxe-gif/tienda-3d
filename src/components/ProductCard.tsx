import React, { useMemo } from 'react';
import { Product, StoreSettings } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  settings: StoreSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, settings }) => {
  const isOutOfStock = product.stock <= 0;
  
  // Calculate discount
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Use the first image or a placeholder
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  return (
    <div 
      className="group flex flex-col cursor-pointer bg-white transition-all duration-400 hover:shadow-sm hover:-translate-y-1 relative border border-transparent hover:border-zinc-200 rounded-sm"
      onClick={() => onClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {hasDiscount && (
            <span className="bg-[#111111] text-white text-[10px] font-medium px-2 py-1 tracking-widest uppercase">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && !hasDiscount && (
            <span className="bg-white border border-[#111111] text-[#111111] text-[10px] font-medium px-2 py-1 tracking-widest uppercase">
              NUEVO
            </span>
          )}
        </div>

        {/* Brand Badge */}
        <div className="absolute top-4 right-4 z-10">
           <span className="text-[10px] font-medium tracking-widest uppercase text-zinc-500 bg-white/90 backdrop-blur-md px-2 py-1">
             {product.brand}
           </span>
        </div>

        {/* Primary Image */}
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-500 ease-in-out ${product.images?.length > 1 ? 'group-hover:opacity-0' : ''}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Secondary Image (Hover) */}
        {product.images?.length > 1 && (
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
      </div>

      {/* Info Container */}
      <div className="pt-4 pb-2 px-2 flex flex-col flex-grow items-center text-center">
        
        {/* Title */}
        <h3 className="text-sm font-medium text-zinc-800 leading-snug mb-3 min-h-[40px] tracking-wide">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-col items-center gap-2">
           {/* Price */}
           <div className="flex items-center gap-3">
             {hasDiscount && (
               <span className="text-xs text-zinc-400 line-through">
                 {settings.currencySymbol} {product.originalPrice?.toLocaleString()}
               </span>
             )}
             <span className="text-lg font-serif text-[#111111]">
               {settings.currencySymbol} {product.price.toLocaleString()}
             </span>
           </div>

           {/* Status Badge */}
           {isOutOfStock ? (
             <span className="text-red-500 text-[10px] font-medium tracking-widest uppercase mt-1">
               Agotado
             </span>
           ) : (
             <span className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase mt-1">
               En Stock
             </span>
           )}
        </div>
      </div>
    </div>
  );
};
