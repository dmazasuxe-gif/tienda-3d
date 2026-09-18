import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterState, ProductColor, StoreSettings } from '../types';
import { X, RotateCcw, Check, CheckSquare, Square, SlidersHorizontal } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableBrands: string[];
  availableSizes: string[];
  availableColors: ProductColor[];
  settings: StoreSettings;
  totalFilteredCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  availableBrands,
  availableSizes,
  availableColors,
  settings,
  totalFilteredCount
}) => {
  const toggleSize = (size: string) => {
    const exists = filters.selectedSizes.includes(size);
    const updated = exists
      ? filters.selectedSizes.filter((s) => s !== size)
      : [...filters.selectedSizes, size];
    onUpdateFilters({ selectedSizes: updated });
  };

  const toggleColor = (colorName: string) => {
    const exists = filters.selectedColors.includes(colorName);
    const updated = exists
      ? filters.selectedColors.filter((c) => c !== colorName)
      : [...filters.selectedColors, colorName];
    onUpdateFilters({ selectedColors: updated });
  };

  const toggleBrand = (brand: string) => {
    const exists = filters.selectedBrands.includes(brand);
    const updated = exists
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    onUpdateFilters({ selectedBrands: updated });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop tap to close */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={onClose} 
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white border-l border-zinc-200 h-full flex flex-col shadow-2xl z-10 text-zinc-900"
          >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-black" />
              <span>Filtros Avanzados</span>
            </h2>
            <p className="text-xs text-zinc-500">Refina por talla, color, marca y precio</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar filtros"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm">
          
          {/* 1. Tallas Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-black text-xs uppercase tracking-wider">
                Talla EUR
              </label>
              {filters.selectedSizes.length > 0 && (
                <span className="text-[11px] text-zinc-500 font-bold">
                  {filters.selectedSizes.length} seleccionadas
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isSelected = filters.selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`min-w-10 h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black font-black shadow-xs'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Colores Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-black text-xs uppercase tracking-wider">
                Colores
              </label>
              {filters.selectedColors.length > 0 && (
                <span className="text-[11px] text-zinc-500 font-bold">
                  {filters.selectedColors.length} seleccionados
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableColors.map((color) => {
                const isSelected = filters.selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 border-black text-black font-bold ring-1 ring-black'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-300 shrink-0 shadow-2xs flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white mix-blend-difference" />}
                    </span>
                    <span className="truncate">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Marcas Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-black text-xs uppercase tracking-wider">
                Marcas
              </label>
              {filters.selectedBrands.length > 0 && (
                <span className="text-[11px] text-zinc-500 font-bold">
                  {filters.selectedBrands.length} seleccionadas
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableBrands.map((brand) => {
                const isSelected = filters.selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 border-black text-black'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-black shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-300 shrink-0" />
                    )}
                    <span className="truncate">{brand}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Rango de Precio */}
          <div>
            <label className="block font-bold text-black text-xs uppercase tracking-wider mb-2.5">
              Precio Máximo: {settings.currencySymbol} {filters.maxPrice}
            </label>
            <input
              type="range"
              min="50"
              max="600"
              step="10"
              value={filters.maxPrice}
              onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
              className="w-full accent-black bg-zinc-200 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
              <span>{settings.currencySymbol} 50</span>
              <span>{settings.currencySymbol} 300</span>
              <span>{settings.currencySymbol} 600+</span>
            </div>
          </div>

          {/* 5. Toggles: Stock & Ofertas */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-200">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
              <span className="text-xs font-semibold text-zinc-800">Solo productos en stock</span>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
              <span className="text-xs font-semibold text-zinc-800">Solo productos en liquidación (Ofertas)</span>
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={(e) => onUpdateFilters({ onSaleOnly: e.target.checked })}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-white flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black hover:bg-zinc-800 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Ver {totalFilteredCount} Resultados
          </button>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
