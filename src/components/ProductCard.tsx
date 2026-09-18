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
      className="group flex flex-col cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative border border-zinc-100"
      onClick={() => onClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-[#F0713D] text-white text-[11px] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && !hasDiscount && (
            <span className="bg-[#F0713D] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              NUEVO
            </span>
          )}
        </div>

        {/* Brand Badge */}
        <div className="absolute top-3 right-3 z-10">
           <span className="text-xs font-bold text-zinc-500 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md">
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
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-900 leading-tight mb-3 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between">
           {/* Status Badge */}
           {isOutOfStock ? (
             <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
               Agotado
             </span>
           ) : (
             <span className="bg-[#F0713D] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
               En Stock
             </span>
           )}

           {/* Price */}
           <div className="flex flex-col items-end">
             {hasDiscount && (
               <span className="text-xs text-zinc-400 line-through font-medium">
                 {settings.currencySymbol} {product.originalPrice?.toLocaleString()}
               </span>
             )}
             <span className="text-lg font-black text-[#F0713D]">
               {settings.currencySymbol} {product.price.toLocaleString()}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};
