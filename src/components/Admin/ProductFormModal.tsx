import React, { useState, useEffect } from 'react';
import { Product, CategoryType, TechType, ProductColor, StoreSettings } from '../../types';
import { X, Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import Barcode from 'react-barcode';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  initialBarcode?: string;
  settings: StoreSettings;
}

const COMMON_SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const COMMON_KIDS_SHOE_SIZES = ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'];
const COMMON_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COMMON_KIDS_CLOTHING_SIZES = ['2T', '4T', '4', '6', '8', '10', '12', '14'];

const PRESET_COLORS = [
  { name: 'Negro', hex: '#09090b' },
  { name: 'Blanco', hex: '#f8fafc' },
  { name: 'Azul Marino', hex: '#1e3a8a' },
  { name: 'Rojo Carmesí', hex: '#dc2626' },
  { name: 'Beige / Arena', hex: '#d4b996' },
  { name: 'Verde Esmeralda', hex: '#059669' },
  { name: 'Marrón / Café', hex: '#78350f' },
  { name: 'Gris Grafito', hex: '#475569' },
  { name: 'Oro / Dorado', hex: '#d97706' },
  { name: 'Rosa Pastel', hex: '#f472b6' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  initialBarcode,
  settings
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('calzado');
  const [techType, setTechType] = useState<TechType>('varones');
  const [brand, setBrand] = useState('Nike');
  const [price, setPrice] = useState(199);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(4);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [materials, setMaterials] = useState('');
  const [careGuide, setCareGuide] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [barcodeImage, setBarcodeImage] = useState<{ url: string, file?: File } | null>(null);

  useEffect(() => {
    if (!barcode) {
      setBarcodeImage(null);
      return;
    }
    
    // Esperar a que el SVG del código de barras se renderice en el DOM
    const timer = setTimeout(() => {
      const svg = document.querySelector('#barcode-container svg') as SVGElement;
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width || 300;
          canvas.height = img.height || 150;
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            
            fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                 const file = new File([blob], `barcode-${barcode}.png`, { type: 'image/png' });
                 setBarcodeImage({ url: dataUrl, file });
              })
              .catch(console.error);
          }
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [barcode]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode || '');
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setTechType(productToEdit.techType);
      setBrand(productToEdit.brand);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStock(productToEdit.stock);
      setLowStockThreshold(productToEdit.lowStockThreshold || 4);
      setImages(productToEdit.images || []);
      setSizes(productToEdit.sizes || []);
      setColors(productToEdit.colors || []);
      setMaterials(productToEdit.materials || '');
      setCareGuide(productToEdit.careGuide || '');
      setIsFeatured(Boolean(productToEdit.isFeatured));
      setIsNew(Boolean(productToEdit.isNew));
    } else {
      setName('');
      setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
      setBarcode(initialBarcode || '');
      setDescription('');
      setCategory('calzado');
      setTechType('varones');
      setBrand('Marca');
      setPrice(150);
      setOriginalPrice(undefined);
      setStock(12);
      setLowStockThreshold(4);
      setImages([]);
      setSizes(['39', '40', '41', '42']);
      setColors([
        { name: 'Negro', hex: '#09090b' },
        { name: 'Blanco', hex: '#f8fafc' }
      ]);
      setMaterials('');
      setCareGuide('');
      setIsFeatured(false);
      setIsNew(true);
    }
  }, [productToEdit, initialBarcode]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImages((prev) => [...prev, compressedBase64]);
      } catch (error) {
        console.error("Error comprimiendo imagen:", error);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes((prev) => prev.filter((s) => s !== size));
    } else {
      setSizes((prev) => [...prev, size]);
    }
  };

  const handleAddCustomSize = () => {
    if (customSizeInput.trim() && !sizes.includes(customSizeInput.trim())) {
      setSizes((prev) => [...prev, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  const togglePresetColor = (preset: { name: string; hex: string }) => {
    const exists = colors.some((c) => c.name === preset.name);
    if (exists) {
      setColors((prev) => prev.filter((c) => c.name !== preset.name));
    } else {
      setColors((prev) => [...prev, preset]);
    }
  };

  const handleAddCustomColor = () => {
    if (customColorName.trim()) {
      setColors((prev) => [
        ...prev,
        { name: customColorName.trim(), hex: customColorHex }
      ]);
      setCustomColorName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};

    if (!name.trim()) newErrors.name = 'El nombre del producto es obligatorio';
    if (!sku.trim()) newErrors.sku = 'El código SKU es obligatorio';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (images.length === 0) newErrors.images = 'Debes incluir al menos una imagen';
    if (sizes.length === 0) newErrors.sizes = 'Debes seleccionar al menos una talla';
    if (colors.length === 0) newErrors.colors = 'Debes seleccionar al menos un color';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      name: name.trim(),
      description: description.trim(),
      category,
      techType,
      brand: brand.trim(),
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      images,
      sizes,
      colors,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      materials: materials.trim() || undefined,
      careGuide: careGuide.trim() || undefined,
      isFeatured,
      isNew,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString()
    };

    onSave(newProduct);
    onClose();
  };

  const standardSizes =
    category === 'calzado'
      ? techType === 'ninos'
        ? COMMON_KIDS_SHOE_SIZES
        : COMMON_SHOE_SIZES
      : techType === 'ninos'
      ? COMMON_KIDS_CLOTHING_SIZES
      : COMMON_CLOTHING_SIZES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white border border-orange-100 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[95vh] flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-orange-100 flex items-center justify-between bg-orange-50/50 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Playfair_Display',serif]">
              {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>
            <p className="text-xs text-slate-500">
              {productToEdit ? `Modificando SKU: ${productToEdit.sku}` : 'Ingresa los detalles de calzado o ropa'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
              1. Información Principal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  placeholder="Ej. Sneakers Urban Pro Leather"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-3.5 py-2 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs ${
                    errors.name ? 'border-rose-500' : 'border-orange-200'
                  }`}
                />
                {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Código SKU / Referencia *</label>
                <input
                  type="text"
                  placeholder="CAL-VAR-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 uppercase shadow-2xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Barcode Section */}
            <div className="bg-orange-50 p-4 border border-orange-200 rounded-2xl space-y-3">
              <label className="block text-orange-800 font-bold mb-1 flex items-center gap-2">
                Código de Barras (Opcional)
                <button
                  type="button"
                  onClick={() => setBarcode(Math.floor(1000000000000 + Math.random() * 9000000000000).toString())}
                  className="px-2 py-1 bg-orange-200 hover:bg-orange-300 text-orange-800 rounded text-[10px] transition-colors cursor-pointer"
                >
                  Generar
                </button>
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="text"
                  placeholder="Escanea o escribe el código de barras"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full max-w-xs px-3.5 py-2 bg-white border border-orange-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono shadow-inner"
                />
                
                {barcode && (
                  <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-2 rounded-xl border border-orange-200 shadow-sm w-full sm:w-auto overflow-x-auto">
                    <div id="barcode-container" className="bg-white p-1">
                      <Barcode value={barcode} height={40} width={1.5} fontSize={12} displayValue={true} />
                    </div>
                    <div className="flex flex-row sm:flex-col gap-1 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={!barcodeImage}
                        onClick={async () => {
                          if (!barcodeImage) return;
                          
                          // Web Share API (Ideal para guardar imágenes en iOS / iPhone y Android)
                          if (barcodeImage.file && navigator.share && navigator.canShare && navigator.canShare({ files: [barcodeImage.file] })) {
                            try {
                              await navigator.share({
                                files: [barcodeImage.file],
                                title: `Código de Barras - ${barcode}`,
                              });
                              return;
                            } catch (err) {
                              console.log("Compartir cancelado o fallido", err);
                            }
                          }
                          
                          // Fallback (Descarga normal para PC)
                          const downloadLink = document.createElement("a");
                          downloadLink.download = `barcode-${barcode}.png`;
                          downloadLink.href = barcodeImage.url;
                          downloadLink.click();
                        }}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap text-center transition-colors ${
                          barcodeImage ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {barcodeImage ? 'Descargar' : 'Preparando...'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const svg = document.querySelector('#barcode-container svg') as SVGElement;
                          if (svg) {
                            const printWindow = window.open('', '', 'width=600,height=400');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Imprimir Código de Barras</title>
                                    <style>
                                      @media print {
                                        @page { 
                                          margin: 0; 
                                          size: 58mm 40mm; /* Formato ticketera/etiqueta térmica */
                                        }
                                        html, body {
                                          margin: 0 !important;
                                          padding: 0 !important;
                                          width: 58mm;
                                          height: 40mm;
                                          background: white;
                                          overflow: hidden;
                                        }
                                        body {
                                          display: flex;
                                          justify-content: center;
                                          align-items: center;
                                        }
                                        svg { 
                                          max-width: 100%; 
                                          max-height: 100%; 
                                          page-break-inside: avoid;
                                          page-break-after: avoid;
                                          page-break-before: avoid;
                                          display: block;
                                        }
                                      }
                                      @media screen {
                                        body {
                                          margin: 0;
                                          padding: 10px;
                                          display: flex;
                                          justify-content: center;
                                          align-items: flex-start;
                                          background: #f8fafc;
                                        }
                                        svg { max-width: 100%; height: auto; }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    ${svg.outerHTML}
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                              }, 250);
                            }
                          }
                        }}
                        className="flex-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap text-center transition-colors"
                      >
                        Imprimir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category, Gender, Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer shadow-2xs font-medium"
                >
                  <option value="impresoras_3d">🖨️ Impresoras 3D</option>
                  <option value="filamentos">🧵 Filamentos</option>
                  <option value="impresiones_3d">🪴 Impresiones 3D</option>
                  <option value="corte_laser">✂️ Corte Láser</option>
                  <option value="grabado_laser">🔥 Grabado Láser</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tecnología *</label>
                <select
                  value={techType}
                  onChange={(e) => setTechType(e.target.value as TechType)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer shadow-2xs font-medium"
                >
                  <option value="varones">Hombres / Varones</option>
                  <option value="mujeres">Mujeres / Damas</option>
                  <option value="ninos">Niños / Niñas (Kids)</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Marca *</label>
                <input
                  type="text"
                  placeholder="Nike, Zara, Adidas..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Descripción Detallada *</label>
              <textarea
                rows={3}
                placeholder="Detalla las características, ajuste, ocasiones de uso y detalles especiales..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs ${
                  errors.description ? 'border-rose-500' : 'border-orange-200'
                }`}
              />
              {errors.description && <p className="text-rose-600 text-[10px] mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Pricing & Stock with Alert */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
              2. Precios, Inventario & Alertas de Stock
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Precio de Venta ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Precio Anterior/Tachado
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 250"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Stock Total Disponible *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Alerta Stock Bajo (Uds) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-amber-300 rounded-2xl text-amber-800 font-bold focus:outline-none focus:bg-white focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>

            {stock <= lowStockThreshold && (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  {stock === 0
                    ? '⚠️ Este producto figurará como AGOTADO en la tienda.'
                    : `⚠️ Alerta activa: El stock actual (${stock}) es menor o igual al umbral (${lowStockThreshold}).`}
                </span>
              </div>
            )}
          </div>

          {/* Image Gallery Management */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
                3. Galería de Imágenes ({images.length}) *
              </h3>
            </div>

            {/* Input Options */}
            <div className="flex-1 space-y-2 w-full">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-orange-200 border-dashed rounded-2xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                <Upload className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-800 font-bold">Haz clic para subir fotos desde Celular / PC</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Thumbnail previews */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-orange-200 group shadow-2xs">
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-white text-[9px] font-black text-center py-0.5">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
            {errors.images && <p className="text-rose-600 text-[10px]">{errors.images}</p>}
          </div>

          {/* Sizes Configuration */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
              4. Tallas Disponibles ({sizes.length}) *
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {standardSizes.map((sz) => {
                const isSelected = sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`min-w-9 h-8 px-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 font-black shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Custom size adder */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                placeholder="Otra talla (ej. 38.5)"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-2xl font-bold border border-orange-200 cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
            {errors.sizes && <p className="text-rose-600 text-[10px]">{errors.sizes}</p>}
          </div>

          {/* Colors Configuration */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
              5. Colores Disponibles ({colors.length}) *
            </h3>

            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = colors.some((c) => c.name === preset.name);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePresetColor(preset)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-900 ring-1 ring-orange-500 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom color adder */}
            <div className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Nombre de color (ej. Azul Cobalto)"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-2xl font-bold border border-orange-200 cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
            {errors.colors && <p className="text-rose-600 text-[10px]">{errors.colors}</p>}
          </div>

          {/* Additional details: Materials & Care & Flags */}
          <div className="space-y-3 pt-2 border-t border-orange-100">
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-[11px]">
              6. Materiales & Opciones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Composición / Materiales</label>
                <input
                  type="text"
                  placeholder="Ej. 100% Cuero Vacuno, Forro textil"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Guía de Cuidados</label>
                <input
                  type="text"
                  placeholder="Ej. Limpiar en seco, no usar cloro"
                  value={careGuide}
                  onChange={(e) => setCareGuide(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span className="text-slate-800 font-medium">Destacar en portada</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span className="text-slate-800 font-medium">Etiqueta "Nuevo"</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-4 border-t border-orange-100 bg-white/95 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 text-white font-black rounded-2xl shadow-md shadow-orange-500/20 transition-all hover:scale-101 cursor-pointer uppercase tracking-wider"
            >
              {productToEdit ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
