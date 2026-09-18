import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Barcode from 'react-barcode';
import { toPng } from 'html-to-image';
import { Printer, Download, Plus, Type, Image as ImageIcon, Barcode as BarcodeIcon, Trash2, X, Save, Tag, Hash, DollarSign } from 'lucide-react';
import { PrintLabelPreview } from './PrintLabelPreview';
import { useReactToPrint } from 'react-to-print';
import { StoreSettings, LabelElement, LabelTemplate } from '../../types';

// Common thermal printer sizes
const LABEL_SIZES = [
  { id: '50x25', name: 'Producto Estándar (50x25 mm)', width: 50, height: 25 },
  { id: '50x30', name: 'Producto Mediana (50x30 mm)', width: 50, height: 30 },
  { id: '30x20', name: 'Joyería/Pequeña (30x20 mm)', width: 30, height: 20 },
  { id: '100x150', name: 'Envío (100x150 mm)', width: 100, height: 150 },
];

interface LabelDesignerProps {
  settings?: StoreSettings;
  onSaveSettings?: (settings: StoreSettings) => void;
}

export const LabelDesigner: React.FC<LabelDesignerProps> = ({ settings, onSaveSettings }) => {
  const [elements, setElements] = useState<LabelElement[]>(settings?.labelTemplate?.elements || []);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentSizeId, setCurrentSizeId] = useState<string>(settings?.labelTemplate?.sizeId || '50x25');
  const printRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedSize = LABEL_SIZES.find(s => s.id === currentSizeId) || LABEL_SIZES[0];
  
  // Escala para editar cómodamente en pantalla (203dpi = ~8 pixels por mm)
  const screenScale = 8; 
  const canvasWidthPx = selectedSize.width * screenScale;
  const canvasHeightPx = selectedSize.height * screenScale;
  // Zona silenciosa recomendada para impresoras térmicas (aprox 2mm)
  const quietZonePx = 2 * screenScale;

  const handleAddText = () => {
    setElements([...elements, {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 20,
      y: 20,
      content: 'Texto Libre',
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: 'sans-serif'
    }]);
  };

  const handleAddVariable = (field: 'productName' | 'price' | 'sku' | 'brand', defaultContent: string) => {
    setElements([...elements, {
      id: `var-${Date.now()}`,
      type: 'text',
      x: 20,
      y: 20,
      content: defaultContent,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'sans-serif',
      isVariable: true,
      variableField: field
    }]);
  };

  const handleAddBarcode = () => {
    setElements([...elements, {
      id: `barcode-${Date.now()}`,
      type: 'barcode',
      x: 20,
      y: 20,
      content: '123456789',
      width: 1.5,
      height: 40,
      isVariable: true,
      variableField: 'sku'
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
        size: ${selectedSize.width}mm auto;
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
        filter: grayscale(100%) contrast(150%);
        transform-origin: top left;
        transform: scale(calc(${selectedSize.width * 3.779527} / ${canvasWidthPx})); /* convert mm to px for exact scale */
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

  const handleSaveTemplateGlobal = () => {
    if (!settings || !onSaveSettings) return;

    const template: LabelTemplate = {
      sizeId: currentSizeId,
      widthPx: canvasWidthPx,
      heightPx: canvasHeightPx,
      elements: elements
    };

    onSaveSettings({
      ...settings,
      labelTemplate: template
    });
    alert('Plantilla de etiqueta guardada correctamente para todos los productos.');
  };

  const selectedEl = elements.find(el => el.id === selectedElementId);

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm font-sans">
      
      {/* Sidebar Tools */}
      <div className="w-full xl:w-72 flex flex-col gap-4 shrink-0">
        <div>
          <h2 className="text-base font-black text-black uppercase tracking-wider mb-1">
            Diseñador Pro
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Diseña la plantilla base para tus productos.
          </p>
          
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
            Tamaño del Sticker
          </label>
          <select 
            value={currentSizeId}
            onChange={(e) => {
              setCurrentSizeId(e.target.value);
              // Podríamos resetear elementos, pero mejor los conservamos para que el usuario pueda ajustarlos
            }}
            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
          >
            {LABEL_SIZES.map(size => (
              <option key={size.id} value={size.id}>{size.name}</option>
            ))}
          </select>
        </div>

        <div className="h-px bg-zinc-100 my-1" />

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Datos Dinámicos (Se autocompletan)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleAddVariable('productName', '{NOMBRE_PRODUCTO}')} className="flex flex-col items-center justify-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 transition-colors">
                <Tag className="w-4 h-4" /> Nombre
              </button>
              <button onClick={() => handleAddVariable('price', '{PRECIO}')} className="flex flex-col items-center justify-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 transition-colors">
                <DollarSign className="w-4 h-4" /> Precio
              </button>
              <button onClick={() => handleAddVariable('sku', '{SKU}')} className="flex flex-col items-center justify-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 transition-colors">
                <Hash className="w-4 h-4" /> SKU
              </button>
              <button onClick={handleAddBarcode} className="flex flex-col items-center justify-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 transition-colors">
                <BarcodeIcon className="w-4 h-4" /> Código Barras
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Elementos Estáticos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleAddText} className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-black transition-colors">
                <Type className="w-4 h-4" /> Texto Fijo
              </button>
              <label className="flex flex-col items-center justify-center gap-1 p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-black transition-colors cursor-pointer">
                <ImageIcon className="w-4 h-4" /> Logo Fijo
                <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
              </label>
            </div>
          </div>
        </div>

        {selectedEl && (
          <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                Editar Elemento
                {selectedEl.isVariable && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px]">Dinámico</span>}
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
                  disabled={selectedEl.isVariable}
                  className="w-full p-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black disabled:bg-zinc-100 disabled:text-zinc-500"
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
                  disabled={selectedEl.isVariable}
                  className="w-full p-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-black disabled:bg-zinc-100 disabled:text-zinc-500"
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
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-100 rounded-2xl border border-zinc-300 p-4 sm:p-8 overflow-hidden relative">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-500 border-dashed"></div>
            <span className="text-xs font-medium text-zinc-500">Zona Silenciosa (Evitar colocar código aquí)</span>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button 
              onClick={handleSaveTemplateGlobal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" /> Guardar Plantilla Principal
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-zinc-800 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Probar Impresión
            </button>
            <button 
              onClick={handleSaveImage}
              className="flex items-center justify-center w-10 h-10 bg-white border border-zinc-200 hover:border-black rounded-xl text-black transition-colors cursor-pointer"
              title="Descargar como Imagen"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-zinc-200/50 rounded-xl inset-shadow-sm">
          {/* The Printable Container */}
          <div 
            ref={printRef}
            className="relative bg-white shadow-xl overflow-hidden border border-zinc-300 transition-all"
            style={{ 
              width: canvasWidthPx, 
              height: canvasHeightPx,
              // Grilla para alinear
              backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }}
            onClick={() => setSelectedElementId(null)}
          >
            {/* Margen de seguridad visual (Quiet Zone) */}
            <div 
              className="absolute pointer-events-none border-2 border-red-400 border-dashed opacity-30"
              style={{
                top: quietZonePx,
                left: quietZonePx,
                right: quietZonePx,
                bottom: quietZonePx,
              }}
            />

            {elements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDragEnd={(e, info) => updateElement(el.id, { 
                  // Math.round to snap to nearest pixel roughly, or snap to grid (10px)
                  x: Math.round((el.x + info.offset.x) / 5) * 5, 
                  y: Math.round((el.y + info.offset.y) / 5) * 5 
                })}
                onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                className={`absolute cursor-move ${selectedElementId === el.id ? 'ring-2 ring-blue-500 ring-offset-1 z-10 bg-blue-50/50' : 'hover:ring-1 hover:ring-zinc-300 hover:ring-offset-1 z-0'}`}
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
                  <div className="pointer-events-none bg-white p-1">
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

        <div className="text-center mt-4 text-xs text-zinc-500 font-medium bg-zinc-100 p-2 rounded-lg inline-block self-center">
          Medida real: {selectedSize.width}x{selectedSize.height} mm (Resolución emulada 203dpi)
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
