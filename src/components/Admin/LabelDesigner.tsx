import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Barcode from 'react-barcode';
import { toPng } from 'html-to-image';
import { Printer, Download, Plus, Type, Image as ImageIcon, Barcode as BarcodeIcon, Trash2, X } from 'lucide-react';
import { PrintLabelPreview } from './PrintLabelPreview';
import { useReactToPrint } from 'react-to-print';

// Common thermal printer sizes
const LABEL_SIZES = [
  { id: '50x25', name: 'Producto Estándar (50x25 mm)', width: 50, height: 25 },
  { id: '50x30', name: 'Producto Mediana (50x30 mm)', width: 50, height: 30 },
  { id: '30x20', name: 'Joyería/Pequeña (30x20 mm)', width: 30, height: 20 },
  { id: '100x150', name: 'Envío (100x150 mm)', width: 100, height: 150 },
];

export type ElementType = 'barcode' | 'text' | 'image';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content: string; 
  width?: number; 
  height?: number; 
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

export const LabelDesigner: React.FC = () => {
  const [elements, setElements] = useState<LabelElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentSizeId, setCurrentSizeId] = useState<string>('50x25');
  const printRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedSize = LABEL_SIZES.find(s => s.id === currentSizeId) || LABEL_SIZES[0];
  
  // A scale factor to make it editable comfortably on screen
  // e.g., 50mm * 8 = 400px
  const screenScale = 8; 
  const canvasWidthPx = selectedSize.width * screenScale;
  const canvasHeightPx = selectedSize.height * screenScale;

  const handleAddText = () => {
    setElements([...elements, {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 20,
      y: 20,
      content: 'Texto Nuevo',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Arial'
    }]);
  };

  const handleAddBarcode = () => {
    setElements([...elements, {
      id: `barcode-${Date.now()}`,
      type: 'barcode',
      x: 20,
      y: 20,
      content: '123456789012',
      width: 1.5,
      height: 40
    }]);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setElements([...elements, {
          id: `img-${Date.now()}`,
          type: 'image',
          x: 20,
          y: 20,
          content: event.target?.result as string,
          width: 50,
          height: 50
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #000000;
        font-family: sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-label-container {
        /* Contraste estricto */
        filter: grayscale(100%) contrast(150%);
        transform-origin: top left;
        transform: scale(calc(302 / ${canvasWidthPx}));
        width: ${canvasWidthPx}px !important;
        height: ${canvasHeightPx}px !important;
      }
    `,
  });

  const handleSaveImage = async () => {
    if (!printRef.current) return;
    
    const previousSelected = selectedElementId;
    setSelectedElementId(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const imgData = await toPng(printRef.current, { pixelRatio: 4, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `etiqueta-${currentSizeId}-${Date.now()}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
    } finally {
      setSelectedElementId(previousSelected);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElementId);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm animate-fade-in font-sans">
      
      {/* Sidebar Tools */}
      <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
        <div>
          <h2 className="text-base font-black text-black uppercase tracking-wider mb-1">
            Diseñador de Etiquetas
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Diseña stickers para impresoras térmicas (Ej: Zebra, Xprinter).
          </p>
          
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
            Tamaño del Sticker
          </label>
          <select 
            value={currentSizeId}
            onChange={(e) => setCurrentSizeId(e.target.value)}
            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
          >
            {LABEL_SIZES.map(size => (
              <option key={size.id} value={size.id}>{size.name}</option>
            ))}
          </select>
        </div>

        <div className="h-px bg-zinc-100 my-2" />

        <div className="space-y-2">
          <button 
            onClick={handleAddBarcode}
            className="w-full flex items-center gap-2 p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-black transition-colors cursor-pointer"
          >
            <BarcodeIcon className="w-4 h-4" /> Agregar Código
          </button>
          
          <button 
            onClick={handleAddText}
            className="w-full flex items-center gap-2 p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-black transition-colors cursor-pointer"
          >
            <Type className="w-4 h-4" /> Agregar Texto
          </button>
          
          <label className="w-full flex items-center gap-2 p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-black transition-colors cursor-pointer">
            <ImageIcon className="w-4 h-4" /> Subir Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
          </label>
        </div>

        {selectedEl && (
          <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Editar Elemento
              </h3>
              <button onClick={() => setSelectedElementId(null)} className="text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEl.type === 'text' && (
              <>
                <input 
                  type="text" 
                  value={selectedEl.content} 
                  onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                  className="w-full p-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Tamaño</label>
                    <input 
                      type="number" 
                      value={selectedEl.fontSize} 
                      onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                      className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Grosor</label>
                    <select 
                      value={selectedEl.fontWeight} 
                      onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                      className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {selectedEl.type === 'barcode' && (
              <>
                <input 
                  type="text" 
                  value={selectedEl.content} 
                  onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                  className="w-full p-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Ancho</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={selectedEl.width} 
                      onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                      className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Alto</label>
                    <input 
                      type="number" 
                      value={selectedEl.height} 
                      onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })}
                      className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedEl.type === 'image' && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Ancho (px)</label>
                  <input 
                    type="number" 
                    value={selectedEl.width} 
                    onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                    className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Alto (px)</label>
                  <input 
                    type="number" 
                    value={selectedEl.height} 
                    onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })}
                    className="w-full p-1 text-sm border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={() => deleteElement(selectedEl.id)}
              className="w-full flex items-center justify-center gap-2 p-2 mt-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Objeto
            </button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 rounded-2xl border border-zinc-200 p-4 sm:p-8 overflow-hidden relative">
        <div className="flex justify-end gap-3 mb-6">
          <button 
            onClick={handleSaveImage}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:border-black rounded-xl text-sm font-bold text-black transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Guardar (PNG)
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-auto p-4">
          {/* The Printable Container */}
          <div 
            ref={printRef}
            className="relative bg-white shadow-lg overflow-hidden border border-zinc-200"
            style={{ 
              width: canvasWidthPx, 
              height: canvasHeightPx,
              // Background pattern just to show it's a canvas, hidden on print via html2canvas if we set background to white, but we can leave it plain white
            }}
            onClick={() => setSelectedElementId(null)}
          >
            {elements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDragEnd={(e, info) => updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y })}
                onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                className={`absolute cursor-move ${selectedElementId === el.id ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-zinc-300 hover:ring-offset-1'}`}
                style={{ x: el.x, y: el.y }}
              >
                {el.type === 'text' && (
                  <div 
                    style={{ 
                      fontSize: el.fontSize, 
                      fontWeight: el.fontWeight, 
                      fontFamily: el.fontFamily,
                      color: '#000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'barcode' && (
                  <div className="pointer-events-none">
                    {/* pointer-events-none is to prevent internal SVG elements from hijacking the drag */}
                    <Barcode 
                      value={el.content} 
                      width={el.width || 1.5} 
                      height={el.height || 40} 
                      displayValue={true}
                      margin={0}
                      fontSize={12}
                    />
                  </div>
                )}
                {el.type === 'image' && (
                  <img 
                    src={el.content} 
                    alt="Logo" 
                    style={{ width: el.width, height: el.height, objectFit: 'contain' }} 
                    draggable={false}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-zinc-400 font-medium">
          Dimensiones de trabajo: {canvasWidthPx}x{canvasHeightPx} px (Escala: {screenScale}x)
        </div>
        
        {/* Contenedor oculto para la inyección HTML de impresión */}
        <div 
          className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none overflow-hidden" 
          aria-hidden="true" 
        >
          <div ref={previewRef}>
            <PrintLabelPreview 
              elements={elements} 
              widthPx={canvasWidthPx} 
              heightPx={canvasHeightPx} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
