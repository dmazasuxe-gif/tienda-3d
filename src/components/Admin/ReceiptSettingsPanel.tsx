import React, { useRef, useState } from 'react';
import { Printer, Upload, Image as ImageIcon, Eye } from 'lucide-react';
import { StoreSettings } from '../../types';
import { printTicket } from '../../utils/printTicket';
import { INITIAL_PRODUCTS } from '../../data/initialData'; // We'll use a product for the mock order

interface ReceiptSettingsPanelProps {
  settings: StoreSettings;
  onChange: (updatedSettings: Partial<StoreSettings>) => void;
}

export const ReceiptSettingsPanel: React.FC<ReceiptSettingsPanelProps> = ({ settings, onChange }) => {
  const rs = settings.receiptSettings || { 
    ruc: '', 
    legalName: '', 
    address: '', 
    phone: '', 
    logoUrl: '', 
    footerMessage: '',
    paperWidth: '80mm',
    fontSize: 'normal',
    showCustomerInfo: true,
    showOrderNotes: true,
    showQrCode: true
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateField = (field: keyof typeof rs, value: any) => {
    onChange({ receiptSettings: { ...rs, [field]: value } });
  };

  const compressImage = (file: File, maxWidth: number, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Si el archivo es PNG o WEBP (que soportan transparencia), mantener el formato para no perder la transparencia.
          // Si es JPEG, usar JPEG para mayor compresión.
          const outputType = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/png' : 'image/jpeg';
          
          ctx.drawImage(img, 0, 0, width, height);
          
          if (outputType === 'image/jpeg') {
            callback(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            callback(canvas.toDataURL('image/png'));
          }
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Por favor, sube un archivo de imagen válido.");
      return;
    }

    setIsUploading(true);
    // Compress and resize for thermal printers (~380px is optimal)
    compressImage(file, 380, (compressedUrl) => {
      updateField('logoUrl', compressedUrl);
      setIsUploading(false);
    });
  };

  const handlePreview = () => {
    // Generate a mock order to test the receipt
    const mockOrder = {
      id: 'mock-order-123',
      orderNumber: 'AURA-MOCK',
      customerName: 'Cliente de Prueba',
      customerPhone: '987654321',
      customerEmail: 'prueba@aura.com',
      shippingAddress: 'Av. Las Flores 123',
      city: 'Lima',
      district: 'Miraflores',
      reference: 'Frente al parque',
      notes: 'Entregar por la tarde.',
      items: [
        {
          id: 'mock-item-1',
          product: INITIAL_PRODUCTS[0] || { name: 'Zapatilla de Prueba', price: 120 },
          quantity: 1,
          selectedSize: '38',
          selectedColor: { name: 'Negro', value: '#000000' }
        },
        {
          id: 'mock-item-2',
          product: INITIAL_PRODUCTS[1] || { name: 'Bolso Elegante', price: 85 },
          quantity: 2,
          selectedSize: 'Única',
          selectedColor: { name: 'Beige', value: '#F5F5DC' }
        }
      ] as any,
      subtotal: 290,
      shippingCost: 15,
      discount: 0,
      total: 305,
      status: 'pending' as any,
      paymentMethod: 'yape' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Call print function with the mock order and current settings
    printTicket(mockOrder, { ...settings, receiptSettings: rs });
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-6 text-xs shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-wider text-slate-800 text-xs flex items-center gap-1.5">
          <Printer className="w-4 h-4 text-slate-600" />
          <span>12. Configuración de Boleta / Ticket de Impresora</span>
        </h3>
        <button
          type="button"
          onClick={handlePreview}
          className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Vista Previa
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Personaliza los datos y el diseño que aparecerán al imprimir la boleta de venta.
      </p>

      {/* --- DISEÑO DE BOLETA --- */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-2">Diseño y Formato</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Ancho del Papel</label>
            <select
              value={rs.paperWidth || '80mm'}
              onChange={(e) => updateField('paperWidth', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 shadow-2xs"
            >
              <option value="58mm">58mm (Pequeño)</option>
              <option value="80mm">80mm (Estándar)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Tamaño de Fuente</label>
            <select
              value={rs.fontSize || 'normal'}
              onChange={(e) => updateField('fontSize', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 shadow-2xs"
            >
              <option value="small">Pequeña</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-slate-700 font-semibold mb-1">Elementos a mostrar</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rs.showCustomerInfo !== false}
                onChange={(e) => updateField('showCustomerInfo', e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-600">Datos del Cliente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rs.showOrderNotes !== false}
                onChange={(e) => updateField('showOrderNotes', e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-600">Notas del Pedido</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" title="Se agregará un código QR escaneable al final del ticket para ver el recibo digital">
              <input
                type="checkbox"
                checked={rs.showQrCode !== false}
                onChange={(e) => updateField('showQrCode', e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-600 font-semibold text-orange-700">Incluir Código QR (Recibo Digital)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Logo Upload */}
        <div className="sm:col-span-2 p-4 border border-dashed border-orange-300 bg-orange-50/50 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-white border border-orange-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
            {isUploading ? (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-1"></div>
                <span className="text-[10px] text-orange-700 font-semibold">Procesando...</span>
              </div>
            ) : null}
            {rs.logoUrl ? (
              <img src={rs.logoUrl} alt="Logo Boleta" className="max-w-full max-h-full object-contain grayscale" />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-[10px]">Sin Logo</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h4 className="font-bold text-slate-700">Logo del Ticket</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              Para un mejor resultado en impresoras térmicas, el sistema optimizará tu imagen a blanco y negro con el ancho ideal (380px) automáticamente.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-orange-300 text-orange-700 font-bold rounded-xl shadow-xs hover:bg-orange-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {rs.logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
            </button>
            {rs.logoUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => updateField('logoUrl', '')}
                className="mt-2 ml-2 inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quitar
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">RUC de la Empresa</label>
          <input
            type="text"
            value={rs.ruc}
            onChange={(e) => updateField('ruc', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej: 20123456789"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">Razón Social o Nombre Legal</label>
          <input
            type="text"
            value={rs.legalName}
            onChange={(e) => updateField('legalName', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej: AURA MODA & CALZADO S.A.C."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1.5">Dirección de la Tienda (Para el Ticket)</label>
          <input
            type="text"
            value={rs.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej: Av. Principal 123, Ciudad, País"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">Teléfono (Para el Ticket)</label>
          <input
            type="text"
            value={rs.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej: +51 987 654 321"
          />
        </div>
        
        <div className="hidden sm:block"></div>

        <div className="sm:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1.5">Mensaje de Agradecimiento o Eslogan (Pie de página)</label>
          <textarea
            value={rs.footerMessage}
            onChange={(e) => updateField('footerMessage', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-y min-h-[80px]"
            placeholder="Ej: ¡Gracias por tu compra! Vuelve pronto."
          />
        </div>
      </div>
    </div>
  );
};
