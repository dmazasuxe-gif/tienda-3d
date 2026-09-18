import React from 'react';
import { CategoryType, TechType } from '../types';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface CategoryFilterBarProps {
  currentCategory?: 'all' | CategoryType;
  selectedCategory?: 'all' | CategoryType;
  currentTechType?: 'all' | TechType;
  selectedTechType?: 'all' | TechType;
  onSelect?: (category: 'all' | CategoryType, techType: 'all' | TechType) => void;
  onSelectCategory?: (category: 'all' | CategoryType) => void;
  onSelectGender?: (techType: 'all' | TechType) => void;
  onOpenFilterDrawer?: () => void;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
  activeFiltersCount?: number;
  totalProductsCount?: number;
  sortBy?: string;
  onSortChange?: (sort: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'discount') => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (size: number) => void;
  startIndex?: number;
  endIndex?: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  currentCategory = 'all',
  selectedCategory,
  currentTechType = 'all',
  selectedTechType,
  onOpenFilterDrawer,
  onOpenFilters,
  activeFilterCount,
  activeFiltersCount,
  totalProductsCount = 0,
  sortBy = 'popular',
  onSortChange,
  itemsPerPage = 12,
  onItemsPerPageChange,
  startIndex = 0,
  endIndex = 0,
}) => {
  const cat = selectedCategory || currentCategory;
  const filterCount = activeFilterCount ?? activeFiltersCount ?? 0;

  const handleOpenDrawer = () => {
    if (onOpenFilterDrawer) onOpenFilterDrawer();
    else if (onOpenFilters) onOpenFilters();
  };

  let categoryLabel = 'TODO EL CATÁLOGO';
  if (cat === 'impresoras_3d') categoryLabel = 'IMPRESORAS 3D';
  else if (cat === 'filamentos') categoryLabel = 'FILAMENTOS';
  else if (cat === 'resinas') categoryLabel = 'RESINAS';
  else if (cat === 'upgrades') categoryLabel = 'UPGRADES';
  else if (cat === 'repuestos') categoryLabel = 'REPUESTOS';
  else if (cat === 'cortadoras_laser') categoryLabel = 'CORTADORAS LÁSER';
  else if (cat === 'routers_cnc') categoryLabel = 'ROUTERS CNC';

  return (
    <div className="space-y-4 mb-6">
      <div className="text-left pt-2">
        <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
          PRODUCTOS
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black uppercase tracking-tight font-sans">
          {categoryLabel}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-y border-zinc-200 text-xs text-zinc-600">
        <div className="font-normal text-zinc-500">
          Mostrando {totalProductsCount > 0 ? `${startIndex + 1}–${endIndex}` : '0'} de {totalProductsCount} resultados
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenDrawer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              filterCount > 0 
                ? 'bg-[#F0713D] text-white border-[#F0713D]' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
            }`}
            id="btn-open-filter-drawer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {filterCount > 0 && (
              <span className="ml-0.5 bg-white text-[#F0713D] px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {filterCount}
              </span>
            )}
          </button>

          {onItemsPerPageChange && (
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="appearance-none bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-full border border-zinc-200 outline-none cursor-pointer"
              >
                <option value={12}>12 por página</option>
                <option value={16}>16 por página</option>
                <option value={24}>24 por página</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {onSortChange && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="appearance-none bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-full border border-zinc-200 outline-none cursor-pointer"
                id="select-sort-by"
              >
                <option value="popular">Orden predeterminado</option>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: de menor a mayor</option>
                <option value="price_desc">Precio: de mayor a menor</option>
                <option value="discount">Mayor descuento</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
