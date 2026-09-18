import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Truck,
  MessageCircle,
  MapPin,
  Bot
} from 'lucide-react';
import { StoreSettings, CategoryType, TechType } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenAdminAuth?: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  onOpenAdmin?: () => void;
  onSelectCategoryFilter?: (category: 'all' | CategoryType, techType: 'all' | TechType) => void;
  onOpenTracking?: () => void;
  cartBounceTrigger?: number;
  showAdminButton?: boolean;
  currentCategory?: string;
  currentTechType?: string;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenAdminAuth,
  isAdmin = false,
  onOpenAdminPanel,
  onOpenAdmin,
  onSelectCategoryFilter,
  onOpenTracking,
  cartBounceTrigger = 0,
  showAdminButton = false,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Top bar links
  const topLinks = ['Industria', 'Dental', 'Cursos', 'STL', 'Soporte', 'Distribuidores'];

  const handleAdminClick = () => {
    if (isAdmin) {
      if (onOpenAdminPanel) onOpenAdminPanel();
      else if (onOpenAdmin) onOpenAdmin();
    } else {
      if (onOpenAdminAuth) onOpenAdminAuth();
      else if (onOpenAdmin) onOpenAdmin();
    }
  };

  const handleCategoryClick = (cat: 'all' | CategoryType) => {
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(cat, 'all');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans border-b border-zinc-200">
      {/* Top Bar (Luxury Black) */}
      <div className="bg-[#111111] text-white text-xs py-2 px-4 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          {topLinks.map((link) => (
            <a key={link} href="#" className="hover:text-white/80 transition-colors font-medium">
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6 font-medium">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>904 494 989 - 934 760 404 - 982 001 288</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{settings.storeAddress}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-zinc-800"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div 
          className="flex-shrink-0 cursor-pointer flex items-center" 
          onClick={() => handleCategoryClick('all')}
        >
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.storeName} 
              className="h-10 object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-2xl font-serif text-[#111111] tracking-[0.2em]">{settings.storeName}</span>
          )}
        </div>

        {/* Categories Button (Desktop) */}
        <button 
          className="hidden md:flex items-center gap-2 bg-[#111111] hover:bg-[#333333] text-white px-6 py-2 rounded-sm font-medium text-sm transition-colors tracking-wide"
          onClick={() => setMobileMenuOpen(true)}
        >
          Categorías
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="¿Buscas una impresora 3D para...?"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-sm py-2.5 pl-6 pr-12 text-sm focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-shadow placeholder:text-zinc-400"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="hidden lg:flex items-center gap-2 border border-zinc-200 text-zinc-600 hover:text-[#111111] hover:border-[#111111] px-5 py-2 rounded-sm font-medium text-sm transition-colors">
            <Bot className="w-4 h-4" />
            Asistente IA
          </button>
          
          <button 
            onClick={onOpenTracking}
            className="hidden md:flex items-center gap-2 border border-zinc-200 text-zinc-600 hover:text-[#111111] hover:border-[#111111] px-5 py-2 rounded-sm font-medium text-sm transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Rastrear Pedidos
          </button>
          
          {showAdminButton && (
            <button 
              onClick={handleAdminClick}
              className="hidden sm:flex items-center gap-2 text-zinc-500 hover:text-[#111111] font-medium text-sm transition-colors"
            >
              <User className="w-4 h-4" />
              {isAdmin ? 'Panel' : 'Acceder'}
            </button>
          )}

          <button 
            className="md:hidden p-2 text-zinc-800"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="w-6 h-6" />
          </button>

          <button 
            className="flex items-center gap-2 bg-white border border-zinc-200 hover:border-[#111111] text-zinc-800 px-5 py-2 rounded-sm font-medium transition-colors relative"
            onClick={onOpenCart}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-sm py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#111111]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          </div>
        </div>
      )}

      {/* Mobile Categories Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <span className="font-bold text-lg text-black">Menú</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Categorías</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleCategoryClick('impresoras_3d')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Impresoras 3D</button>
                  <button onClick={() => handleCategoryClick('filamentos')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Filamentos</button>
                  <button onClick={() => handleCategoryClick('resinas')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Resinas</button>
                  <button onClick={() => handleCategoryClick('upgrades')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Upgrades</button>
                  <button onClick={() => handleCategoryClick('repuestos')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Repuestos</button>
                  <button onClick={() => handleCategoryClick('cortadoras_laser')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Cortadoras Láser</button>
                  <button onClick={() => handleCategoryClick('routers_cnc')} className="text-left px-4 py-3 rounded-xl hover:bg-zinc-50 font-semibold text-zinc-700">Routers CNC</button>
                </div>
              </div>
              
              <div className="px-4 border-t border-zinc-100 pt-6">
                <button onClick={handleAdminClick} className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-3 rounded-sm font-medium tracking-wide">
                  <User className="w-5 h-5" />
                  {isAdmin ? 'Panel de Administración' : 'Acceso Administrador'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
