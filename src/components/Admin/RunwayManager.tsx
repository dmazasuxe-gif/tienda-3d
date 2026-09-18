import React, { useState, useRef } from 'react';
import { StoreSettings, RunwaySlide } from '../../types';
import { Upload, Trash2, GripVertical, Plus } from 'lucide-react';

interface RunwayManagerProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const RunwayManager: React.FC<RunwayManagerProps> = ({ settings, onSaveSettings }) => {
  const [slides, setSlides] = useState<RunwaySlide[]>(settings.runwaySlides || []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (updatedSlides: RunwaySlide[]) => {
    setSlides(updatedSlides);
    onSaveSettings({ ...settings, runwaySlides: updatedSlides });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validations
      if (!file.type.startsWith('image/')) {
        setUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('La imagen es demasiado pesada. Máximo 5MB.');
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // For runway banners, higher resolution is needed, e.g. 1920 max
          const maxDim = 1920; 
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
            const compressedBase64 = canvas.toDataURL('image/webp', 0.85); // good balance of quality/size
            
            const newSlide: RunwaySlide = {
              id: `slide-${Date.now()}`,
              imageUrl: compressedBase64
            };
            
            handleSave([...slides, newSlide]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSlide = (id: string) => {
    const updated = slides.filter(s => s.id !== id);
    handleSave(updated);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    
    const newSlides = [...slides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    
    handleSave(newSlides);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h3 className="text-base font-black text-black uppercase tracking-wider mb-2">
          Gestor de Pasarela de Imágenes
        </h3>
        <p className="text-sm text-zinc-500">
          Sube imágenes desde tu PC o celular para mostrarlas en la cabecera principal de la tienda. 
          Se recomiendan imágenes de alta resolución en formato horizontal.
        </p>
      </div>

      {uploadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {uploadError}
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 px-4 border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 hover:bg-zinc-100 hover:border-black transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 text-black" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-black uppercase tracking-wider">Subir Nueva Imagen</p>
            <p className="text-xs text-zinc-500 mt-1">Selecciona una imagen desde tu dispositivo (Max 5MB)</p>
          </div>
        </button>
      </div>

      {/* Slides List */}
      {slides.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Imágenes Actuales ({slides.length})</h4>
          <div className="grid gap-4">
            {slides.map((slide, idx) => (
              <div 
                key={slide.id} 
                className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs group"
              >
                <div className="flex flex-col gap-1 items-center justify-center px-1">
                  <button 
                    onClick={() => moveSlide(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-zinc-300 hover:text-black disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    ▲
                  </button>
                  <GripVertical className="w-4 h-4 text-zinc-300" />
                  <button 
                    onClick={() => moveSlide(idx, 'down')}
                    disabled={idx === slides.length - 1}
                    className="p-1 text-zinc-300 hover:text-black disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    ▼
                  </button>
                </div>

                <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-100 bg-zinc-50">
                  <img 
                    src={slide.imageUrl} 
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-black truncate uppercase">Imagen {idx + 1}</p>
                </div>

                <button
                  onClick={() => removeSlide(slide.id)}
                  className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4 bg-white border border-zinc-200 rounded-2xl">
          <p className="text-sm font-medium text-zinc-500">No hay imágenes en la pasarela actualmente.</p>
        </div>
      )}
    </div>
  );
};
