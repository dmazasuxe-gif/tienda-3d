import React from 'react';
import { CategoryType, TechType } from '../types';

interface CategoryCardsSectionProps {
  onSelectCategory: (category: CategoryType | 'all', techType: TechType | 'all') => void;
}

const CATEGORY_CARDS = [
  {
    title: 'IMPRESORAS 3D',
    category: 'impresoras_3d' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'FILAMENTOS',
    category: 'filamentos' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'RESINAS',
    category: 'resinas' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'UPGRADES',
    category: 'upgrades' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'REPUESTOS',
    category: 'repuestos' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'CORTADORAS LÁSER',
    category: 'cortadoras_laser' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'ROUTERS CNC',
    category: 'routers_cnc' as CategoryType,
    imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80',
  }
];

export const CategoryCardsSection: React.FC<CategoryCardsSectionProps> = ({
  onSelectCategory,
}) => {
  return (
    <section className="py-10 max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {CATEGORY_CARDS.map((card) => (
          <div
            key={card.title}
            onClick={() => onSelectCategory(card.category, 'all')}
            className="group cursor-pointer flex-shrink-0 w-32 md:w-48 lg:w-56 flex flex-col snap-start"
          >
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-zinc-900 shadow-sm border border-zinc-800">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-0 right-0 px-2 text-center">
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase drop-shadow-md">
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
