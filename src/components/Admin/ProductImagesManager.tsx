import React, { useState, useRef } from 'react';
import { StoreSettings } from '../../types';
import { Image as ImageIcon, Upload, Trash2, Save, GripVertical } from 'lucide-react';

interface ProductImagesManagerProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const ProductImagesManager: React.FC<ProductImagesManagerProps> = ({ settings, onSaveSettings }) => {
  const [images, setImages] = useState<string[]>(settings.productStripImages || []);
  const [speed, setSpeed] = useState<number>(settings.productStripSpeed || 30);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages([...images, base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const item = newImages.splice(draggedIndex, 1)[0];
    newImages.splice(dropIndex, 0, item);
    
    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      productStripImages: images,
      productStripSpeed: speed
    });
    alert('Imágenes guardadas correctamente.');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 space-y-4 text-xs shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-wider text-slate-800 text-xs flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-600" />
          <span>Pasarela de Imágenes de Productos ({images.length})</span>
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>
      
      <p className="text-slate-500 text-xs">
        Sube imágenes de productos para mostrarlas en la pasarela animada de la tienda.
        Puedes arrastrarlas para cambiar su orden.
      </p>

      {/* Speed Control */}
      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <label className="text-slate-700 font-semibold whitespace-nowrap">Velocidad de Pasarela:</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-700 outline-none focus:border-slate-500 w-full sm:w-auto cursor-pointer"
        >
          <option value={60}>Muy Lento</option>
          <option value={45}>Lento</option>
          <option value={30}>Normal</option>
          <option value={15}>Rápido</option>
          <option value={10}>Muy Rápido</option>
        </select>
      </div>

      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-slate-400 mb-2" />
        <span className="font-semibold text-slate-600">Haz clic aquí para subir una imagen</span>
        <span className="text-slate-400 mt-1">Recomendado: Imágenes PNG con fondo transparente</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </div>

      {/* Grid of Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {images.map((imgUrl, index) => (
            <div 
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group bg-white border rounded-xl overflow-hidden aspect-square flex items-center justify-center ${
                draggedIndex === index ? 'opacity-50 border-slate-400 border-dashed' : 'border-slate-200'
              }`}
            >
              <div className="absolute top-2 left-2 p-1 bg-white/80 backdrop-blur rounded cursor-grab active:cursor-grabbing shadow-sm z-10 text-slate-400 hover:text-slate-600">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <img 
                src={imgUrl} 
                alt={`Product ${index}`} 
                className="w-full h-full object-cover" 
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
