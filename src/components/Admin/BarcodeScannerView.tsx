import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../../types';
import { Package, ScanLine, AlertCircle, Plus, RefreshCw, Tag, DollarSign, Palette, Ruler, Info, Box } from 'lucide-react';

interface BarcodeScannerViewProps {
  products: Product[];
  onOpenProductForm: (barcode?: string) => void;
  onEditProduct: (product: Product) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({
  products,
  onOpenProductForm,
  onEditProduct
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [unregisteredCode, setUnregisteredCode] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const productsRef = useRef(products);

  // Mantener la referencia de productos actualizada para no reiniciar la cámara
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    let isMounted = true;
    scannerRef.current = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          { 
            fps: 15, // Mayor velocidad de frames para captar mejor
            qrbox: { width: 300, height: 150 }, // Rectángulo ancho ideal para códigos de barra
            aspectRatio: 1.0,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.QR_CODE
            ]
          },
          (decodedText) => {
            const now = Date.now();
            // Debouncer: Evitar lecturas duplicadas del mismo código en un lapso corto (2 segundos)
            if (lastScannedCodeRef.current === decodedText && now - lastScannedTimeRef.current < 2000) {
              return;
            }

            lastScannedCodeRef.current = decodedText;
            lastScannedTimeRef.current = now;

            const existingProduct = productsRef.current.find(
              p => p.sku === decodedText || p.barcode === decodedText
            );
            
            if (existingProduct) {
              setScannedProduct(existingProduct);
              setUnregisteredCode(null);
            } else {
              setScannedProduct(null);
              setUnregisteredCode(decodedText);
            }
          },
          (errorMessage) => {
            // Ignorar errores de "no se encuentra código", ocurren cada frame que no hay nada enfocado
          }
        );
      } catch (err: any) {
        if (isMounted) {
          console.error("Error al iniciar escáner:", err);
          setError("No se pudo acceder a la cámara. Por favor, asegúrate de haber dado los permisos en tu navegador (celular) o revisa tu conexión.");
        }
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, []); // Dependencias vacías para montar la cámara solo una vez

  const handleClear = () => {
    setScannedProduct(null);
    setUnregisteredCode(null);
    lastScannedCodeRef.current = null;
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-3xl border border-orange-100 shadow-xs max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-orange-900 flex items-center justify-center gap-2">
          <ScanLine className="w-5 h-5 text-orange-600" />
          <span>Lector Automático de Códigos</span>
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          La cámara trasera está activa. Enfoca un código de barras. Una vez detectado, verás la información aquí mismo y podrás seguir escaneando.
        </p>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex flex-col items-center gap-2 text-sm text-center">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cámara Container */}
          <div className="rounded-2xl overflow-hidden border-2 border-orange-100 shadow-inner bg-black relative w-full max-w-md mx-auto aspect-square sm:aspect-video flex items-center justify-center">
            <div id="reader" className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
          </div>


          {/* Información del Producto Registrado */}
          {scannedProduct && (
            <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{scannedProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {scannedProduct.brand}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {scannedProduct.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-600">S/ {scannedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Código / SKU</p>
                  <p className="text-sm font-mono font-medium text-slate-700">{scannedProduct.sku}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Actual</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Box className="w-4 h-4 text-orange-500" />
                    {scannedProduct.stock} unidades
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-orange-200/60 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Palette className="w-3 h-3" /> Colores
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scannedProduct.colors.map(c => (
                      <span key={c.name} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: c.hex }}></span>
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Ruler className="w-3 h-3" /> Tallas
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scannedProduct.sizes.map(s => (
                      <span key={s} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Info className="w-3 h-3" /> Descripción
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">{scannedProduct.description}</p>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Limpiar Resultado</span>
              </button>
            </div>
          )}

          {/* Información de Código No Registrado */}
          {unregisteredCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-2">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Código Nuevo</h3>
                <p className="text-sm text-amber-700 mt-1">Este código de barras no pertenece a ningún producto registrado en la tienda.</p>
                <p className="text-xl font-mono font-bold text-amber-600 mt-2 bg-white px-3 py-1 inline-block rounded-lg border border-amber-200">{unregisteredCode}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    handleClear();
                    onOpenProductForm(unregisteredCode);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Producto</span>
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
