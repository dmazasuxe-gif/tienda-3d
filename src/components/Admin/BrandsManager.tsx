import React, { useState } from 'react';
import { StoreSettings, StoreBrand } from '../../types';
import { DEFAULT_STORE_BRANDS } from '../../data/initialData';
import { BRAND_SVGS } from '../../data/brandLogos';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  ExternalLink,
  HelpCircle,
  X,
  AlertCircle
} from 'lucide-react';

interface BrandsManagerProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

// Quick presets of popular sportswear & footwear brand logos for instant 1-click addition
const POPULAR_BRAND_PRESETS: Array<{ name: string; label: string; logoUrl: string }> = [
  {
    name: 'Nike',
    label: 'NIKE',
    logoUrl: BRAND_SVGS.Nike
  },
  {
    name: 'Adidas',
    label: 'ADIDAS',
    logoUrl: BRAND_SVGS.Adidas
  },
  {
    name: 'Jordan',
    label: 'JORDAN',
    logoUrl: BRAND_SVGS.Jordan
  },
  {
    name: 'Puma',
    label: 'PUMA',
    logoUrl: BRAND_SVGS.Puma
  },
  {
    name: 'Reebok',
    label: 'REEBOK',
    logoUrl: BRAND_SVGS.Reebok
  },
  {
    name: 'Lacoste',
    label: 'LACOSTE',
    logoUrl: BRAND_SVGS.Lacoste
  },
  {
    name: 'FILA',
    label: 'FILA',
    logoUrl: BRAND_SVGS.FILA
  },
  {
    name: 'Joma',
    label: 'JOMA',
    logoUrl: BRAND_SVGS.Joma
  },
  {
    name: 'Under Armour',
    label: 'UNDER ARMOUR',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg'
  },
  {
    name: 'Lacoste',
    label: 'LACOSTE',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Lacoste_logo.svg'
  },
  {
    name: 'FILA',
    label: 'FILA',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Fila_logo.svg'
  },
  {
    name: 'Joma',
    label: 'JOMA',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Joma_logo.svg'
  },
  {
    name: 'ASICS',
    label: 'ASICS',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Asics_Logo.svg'
  },
  {
    name: 'Umbro',
    label: 'UMBRO',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Umbro_logo.svg'
  }
];

export const BrandsManager: React.FC<BrandsManagerProps> = ({
  settings,
  onSaveSettings
}) => {
  const brands: StoreBrand[] = (settings.brands && settings.brands.length > 0)
    ? settings.brands
    : DEFAULT_STORE_BRANDS;

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('url');
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Trigger Save Helper
  const triggerSave = (updatedBrands: StoreBrand[]) => {
    onSaveSettings({
      ...settings,
      brands: updatedBrands
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleOpenAddModal = () => {
    setEditingBrandId(null);
    setName('');
    setLabel('');
    setLogoUrl('');
    setWebsiteUrl('');
    setIsActive(true);
    setUploadMethod('url');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (brand: StoreBrand) => {
    setEditingBrandId(brand.id);
    setName(brand.name);
    setLabel(brand.label || brand.name.toUpperCase());
    setLogoUrl(brand.logoUrl);
    setWebsiteUrl(brand.websiteUrl || '');
    setIsActive(brand.isActive);
    setUploadMethod(brand.logoUrl.startsWith('data:') ? 'upload' : 'url');
    setFormError('');
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to PNG for transparency or JPEG
            const isPng = file.type === 'image/png' || file.type === 'image/svg+xml';
            const compressed = isPng 
              ? canvas.toDataURL('image/png') 
              : canvas.toDataURL('image/jpeg', 0.85);
            setLogoUrl(compressed);
            setFormError('');
          }
        };
        if (typeof event.target?.result === 'string') {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrandForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('El nombre de la marca es obligatorio.');
      return;
    }
    if (!logoUrl.trim()) {
      setFormError('Debes subir un logo o ingresar la URL de la imagen.');
      return;
    }

    if (editingBrandId) {
      // Update existing brand
      const updated = brands.map((b) => {
        if (b.id === editingBrandId) {
          return {
            ...b,
            name: name.trim(),
            label: label.trim() || name.trim().toUpperCase(),
            logoUrl: logoUrl.trim(),
            websiteUrl: websiteUrl.trim() || undefined,
            isActive
          };
        }
        return b;
      });
      triggerSave(updated);
    } else {
      // Create new brand
      const newBrand: StoreBrand = {
        id: `brand-${Date.now()}`,
        name: name.trim(),
        label: label.trim() || name.trim().toUpperCase(),
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        isActive,
        order: brands.length + 1
      };
      triggerSave([...brands, newBrand]);
    }

    setModalOpen(false);
  };

  const handleDeleteBrand = (id: string, brandName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la marca "${brandName}" de la pasarela?`)) {
      const updated = brands.filter((b) => b.id !== id);
      triggerSave(updated);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = brands.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    triggerSave(updated);
  };

  const handleMoveBrand = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const list = [...brands];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    
    // Re-index order property
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    triggerSave(reordered);
  };

  const handleResetDefaultBrands = () => {
    if (window.confirm('¿Deseas restaurar las 8 marcas icónicas predeterminadas (Nike, Adidas, Jordan, Puma, etc.)?')) {
      triggerSave(DEFAULT_STORE_BRANDS);
    }
  };

  const handleSelectPreset = (preset: { name: string; label: string; logoUrl: string }) => {
    setName(preset.name);
    setLabel(preset.label);
    setLogoUrl(preset.logoUrl);
    setUploadMethod('url');
    setFormError('');
  };

  const activeBrandsCount = brands.filter(b => b.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Section Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-orange-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
                Pasarela de Marcas & Logos
              </h2>
              <p className="text-xs text-slate-500">
                Administra los logos de marcas oficiales que desfilan en la página principal de la tienda
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              ¡Guardado en tiempo real!
            </span>
          )}

          <button
            onClick={handleResetDefaultBrands}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Restaurar marcas originales"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restaurar Predeterminados</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer uppercase tracking-wider"
            id="btn-add-brand-logo"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nueva Marca</span>
          </button>
        </div>
      </div>

      {/* Live Storefront Preview Box */}
      <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Vista Previa en Vivo de la Pasarela ({activeBrandsCount} visibles para clientes)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Así es exactamente como se ve la pasarela en el inicio de la tienda
          </span>
        </div>

        {/* Replica of BrandsStrip */}
        <div className="py-6 px-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-around gap-8 min-w-max">
            {brands.filter(b => b.isActive).map((brand) => {
              const effectiveLogo = (brand.logoUrl && !brand.logoUrl.includes('upload.wikimedia.org'))
                ? brand.logoUrl
                : (BRAND_SVGS[brand.name] || brand.logoUrl);

              return (
              <div 
                key={brand.id} 
                className="flex flex-col items-center justify-center gap-1.5 group cursor-pointer transition-all hover:scale-105"
                title={`Marca: ${brand.name}`}
              >
                <div className="h-10 w-24 sm:w-28 flex items-center justify-center p-1 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                  {effectiveLogo ? (
                    <img
                      src={effectiveLogo}
                      alt={brand.name}
                      className="max-h-8 max-w-full object-contain filter grayscale group-hover:grayscale-0 contrast-125 transition-all duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (BRAND_SVGS[brand.name] && e.currentTarget.src !== BRAND_SVGS[brand.name]) {
                          e.currentTarget.src = BRAND_SVGS[brand.name];
                        } else {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                          }
                        }
                      }}
                    />
                  ) : null}
                  <span className={`${effectiveLogo ? 'hidden' : 'block'} text-xs font-black tracking-tighter text-zinc-900 font-sans uppercase truncate`}>
                    {brand.label || brand.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-black transition-colors">
                  {brand.name}
                </span>
              </div>
            );})}

            {activeBrandsCount === 0 && (
              <div className="text-center py-4 text-xs text-zinc-400 font-medium w-full">
                No hay marcas activas. Activa al menos una marca para que aparezca en la pasarela.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brands Management Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand, index) => {
          return (
            <div
              key={brand.id}
              className={`p-4 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                brand.isActive 
                  ? 'border-orange-100 hover:border-orange-300 shadow-xs hover:shadow-md' 
                  : 'border-zinc-200 opacity-60 bg-zinc-50/50'
              }`}
            >
              <div>
                {/* Logo Preview Frame */}
                {(() => {
                  const effectiveLogo = (brand.logoUrl && !brand.logoUrl.includes('upload.wikimedia.org'))
                    ? brand.logoUrl
                    : (BRAND_SVGS[brand.name] || brand.logoUrl);

                  return (
                    <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 flex items-center justify-center p-3 mb-3 overflow-hidden">
                      {effectiveLogo ? (
                        <img
                          src={effectiveLogo}
                          alt={brand.name}
                          className="max-h-12 max-w-full object-contain filter drop-shadow-xs transition-transform hover:scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (BRAND_SVGS[brand.name] && e.currentTarget.src !== BRAND_SVGS[brand.name]) {
                              e.currentTarget.src = BRAND_SVGS[brand.name];
                            } else {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }
                          }}
                        />
                      ) : null}

                      {/* Fallback box */}
                      <div className={`${effectiveLogo ? 'hidden' : 'flex'} flex-col items-center justify-center text-center p-2`}>
                        <span className="text-sm font-black text-zinc-800 tracking-wider uppercase">
                          {brand.label || brand.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">Sin logo visual</span>
                      </div>

                      {/* Badge position */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-black text-slate-700 border border-zinc-200 shadow-2xs">
                        #{index + 1}
                      </span>

                      {/* Active / Inactive Badge */}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${
                        brand.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                      }`}>
                        {brand.isActive ? 'Activo' : 'Oculto'}
                      </span>
                    </div>
                  );
                })()}

                {/* Brand Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {brand.name}
                    </h4>
                    {brand.websiteUrl && (
                      <a 
                        href={brand.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Ver enlace web o filtro"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Etiqueta: <strong className="text-slate-700">{brand.label || brand.name}</strong>
                  </p>
                </div>
              </div>

              {/* Bottom Actions: Reorder + Edit + Toggle + Delete */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveBrand(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Mover hacia la izquierda/arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveBrand(index, 'down')}
                    disabled={index === brands.length - 1}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Mover hacia la derecha/abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit & Visibility & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(brand.id)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      brand.isActive
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200'
                    }`}
                    title={brand.isActive ? 'Ocultar marca de la pasarela' : 'Mostrar marca en la pasarela'}
                  >
                    {brand.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(brand)}
                    className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl transition-colors cursor-pointer"
                    title="Editar logo y datos"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar marca"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Brand */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-slate-900">
                    {editingBrandId ? 'Editar Marca & Logo' : 'Agregar Nueva Marca a la Pasarela'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Introduce el nombre y el logo oficial de la marca
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveBrandForm} className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Form Error Alert */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Preset Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    ⚡ Autocompletar con Marcas Populares
                  </label>
                  <span className="text-[10px] text-slate-400">Clic para rellenar datos y logo</span>
                </div>
                
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {POPULAR_BRAND_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border border-zinc-200 cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Nombre de la Marca <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Nike, Adidas, New Balance..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!label || label === name.toUpperCase()) {
                      setLabel(e.target.value.toUpperCase());
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-zinc-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                />
              </div>

              {/* Display Label (Fallback text) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Etiqueta en Mayúsculas (Texto de respaldo)
                </label>
                <input
                  type="text"
                  placeholder="Ej: NIKE, ADIDAS, NEW BALANCE..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-zinc-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-mono font-bold"
                />
              </div>

              {/* Logo Source Selector: Upload or URL */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Logo de la Marca <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        uploadMethod === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-zinc-500'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        URL
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('upload')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        uploadMethod === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-zinc-500'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Subir Archivo
                      </span>
                    </button>
                  </div>
                </div>

                {uploadMethod === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://.../logo.svg o .png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-zinc-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-300 hover:border-orange-500 rounded-2xl cursor-pointer bg-zinc-50 hover:bg-orange-50/30 transition-all text-center">
                    <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                    <span className="text-xs font-bold text-zinc-700">Haz clic para seleccionar el archivo del logo</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Soporta PNG transparente, SVG, WebP o JPG (Máx. 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Instant Logo Preview in Modal */}
                {logoUrl && (
                  <div className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-white rounded-xl border border-zinc-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={logoUrl}
                          alt="Previsualización"
                          className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Previsualización del Logo</p>
                        <p className="text-[10px] text-slate-500">Logo cargado correctamente</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Optional Website / Filter URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Enlace Web o Filtro Específico (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: https://... o dejar vacío para filtrar en el catálogo"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-zinc-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center justify-between bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Mostrar en la Tienda</span>
                  <span className="text-[11px] text-slate-500">Si está activo, aparecerá en el carrusel para los clientes</span>
                </div>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-black rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  {editingBrandId ? 'Guardar Cambios' : 'Añadir Marca'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
