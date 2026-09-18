import React, { useMemo } from 'react';
import { StoreSettings, Product } from '../types';

interface CategoryCardsSectionProps {
  products: Product[];
  settings: StoreSettings;
  onSelectCategory: (category: string, techType: string) => void;
}

export const CategoryCardsSection: React.FC<CategoryCardsSectionProps> = ({
  products,
  settings,
  onSelectCategory,
}) => {
  // Generate active category cards dynamically
  const activeCategories = useMemo(() => {
    const cards = [];
    for (const cat of (settings.categories || [])) {
      const catProducts = products.filter(p => p.category === cat);
      if (catProducts.length > 0) {
        // Use the first product's first image as the category background
        const firstImage = catProducts.find(p => p.images && p.images.length > 0)?.images[0];
        cards.push({
          title: cat.replace(/_/g, ' '), // format label beautifully
          category: cat,
          imageUrl: firstImage || 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&auto=format&fit=crop&q=80',
        });
      }
    }
    return cards;
  }, [products, settings.categories]);

  if (activeCategories.length === 0) return null;

  return (
    <section className="py-10 max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {activeCategories.map((card) => (
          <div
            key={card.title}
            onClick={() => onSelectCategory(card.category, 'all')}
            className="group cursor-pointer flex-shrink-0 w-36 sm:w-48 md:w-56 flex flex-col snap-start"
          >
            <div className="relative aspect-square sm:aspect-[4/5] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100 shadow-sm border border-zinc-200">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-0 right-0 px-3 text-center">
                <h3 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow-md">
                  {card.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
