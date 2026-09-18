import React, { useState } from 'react';
import { Product, ProductColor, StoreSettings } from '../types';
import { 
  X, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CreditCard,
  Truck
} from 'lucide-react';
import { getProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onAddToCart: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  recommendedProducts?: Product[];
  onOpenProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen = true,
  onClose,
  settings,
  onAddToCart,
  recommendedProducts = [],
  onOpenProduct
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product?.colors?.[0] || { name: 'Estándar', hex: '#000000' });
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Accordion open/close states matching Yolu Screenshot 8
  const [openAccordion, setOpenAccordion] = useState<string | null>('envios');

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || { name: 'Estándar', hex: '#000000' });
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product || isOpen === false) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  const whatsAppProductUrl = getProductWhatsAppUrl(
    settings,
    product,
    selectedSize,
    selectedColor
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // Filter recommendations (different from current product)
  const related = recommendedProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.techType === product.techType))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in select-none">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[96vh] text-zinc-900 border border-zinc-200">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-8">
          
          {/* Main 2-Column Product Layout matching Screenshots 7 & 8 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10">
            
            {/* Left Column (5 cols): Thumbnail list + Main Image Viewport */}
            <div className="md:col-span-6 flex gap-3 sm:gap-4">
              
              {/* Vertical Thumbnails List (left of main image, exactly as Yolu) */}
              {product.images.length > 1 && (
                <div className="flex flex-col gap-2 shrink-0">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#f4f4f5] border transition-all cursor-pointer p-1 ${
                        selectedImageIndex === idx
                          ? 'border-black ring-1 ring-black'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Container */}
              <div className="relative flex-1 aspect-square rounded-2xl bg-[#f4f4f5] flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
                    }
                  }}
                />

                {/* Arrow Controls */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black shadow-xs flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black shadow-xs flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* Right Column (6-7 cols): Product Information & Buying Actions */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              
              <div className="space-y-4">
                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight font-sans">
                  {product.name}
                </h1>

                {/* Price Display matching Yolu */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-black font-sans">
                    {settings.currencySymbol} {product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base text-zinc-400 line-through">
                      {settings.currencySymbol} {product.originalPrice!.toFixed(2)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      PRECIO FINAL
                    </span>
                  )}
                </div>

                {/* Size Selector matching Yolu screenshot 7 */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-black">
                      TALLAS EUR
                    </span>
                    {selectedSize && (
                      <button
                        onClick={() => setSelectedSize('')}
                        className="text-zinc-400 hover:text-black text-xs font-semibold cursor-pointer underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Size buttons grid */}
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-11 h-10 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-black text-white border-black font-black'
                              : 'bg-white text-zinc-800 border-zinc-200 hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold uppercase tracking-wider text-black">
                        COLOR: <span className="font-semibold text-zinc-600">{selectedColor.name}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((clr, i) => {
                        const isSelected = selectedColor.name === clr.name;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedColor(clr)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-black'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-zinc-300 shrink-0"
                              style={{ backgroundColor: clr.hex }}
                            />
                            <span>{clr.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="pt-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
                    CANTIDAD
                  </label>
                  <div className="inline-flex items-center border border-zinc-300 rounded-lg p-1 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded hover:bg-zinc-100 text-black font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded hover:bg-zinc-100 text-black font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Primary CTA Button matching Yolu */}
                <div className="pt-3 space-y-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
                      isOutOfStock
                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        : addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black hover:bg-zinc-800 text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                    }`}
                    id="btn-modal-add-to-cart"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>¡AÑADIDO AL CARRITO!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>{isOutOfStock ? 'PRODUCTO AGOTADO' : 'AÑADIR AL CARRITO'}</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Support Direct Button */}
                  <a
                    href={whatsAppProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:border-black text-zinc-800 hover:text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    id="btn-modal-whatsapp-advisor"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Consultar disponibilidad por WhatsApp</span>
                  </a>
                </div>

                {/* Product Meta Details */}
                <div className="pt-4 border-t border-zinc-200 space-y-1.5 text-xs text-zinc-600">
                  <p className="leading-relaxed">{product.description}</p>
                  <p className="pt-1">
                    <strong className="text-black">Color que se muestra:</strong> {selectedColor.name}
                  </p>
                  <p>
                    <strong className="text-black">Estilo:</strong> {product.sku}
                  </p>
                  <p>
                    <strong className="text-black">Marca:</strong> {product.brand}
                  </p>
                </div>

                {/* Collapsible Accordions matching Yolu Screenshot 8 */}
                <div className="pt-2 border-t border-zinc-200 divide-y divide-zinc-200 text-xs">
                  
                  {/* Métodos de Pago */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('pago')}
                      className="w-full py-3.5 flex items-center justify-between font-extrabold uppercase tracking-wider text-black hover:text-zinc-600 text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-zinc-700" />
                        <span>MÉTODOS DE PAGO</span>
                      </span>
                      {openAccordion === 'pago' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openAccordion === 'pago' && (
                      <div className="pb-3 text-zinc-600 space-y-1 leading-relaxed">
                        <p>Aceptamos pagos a través de <strong>Yape</strong>, <strong>Plin</strong>, transferencia bancaria directa (BCP, Interbank, BBVA) y pago con tarjetas de débito/crédito.</p>
                      </div>
                    )}
                  </div>

                  {/* Opciones de Envío */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('envios')}
                      className="w-full py-3.5 flex items-center justify-between font-extrabold uppercase tracking-wider text-black hover:text-zinc-600 text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-zinc-700" />
                        <span>OPCIONES DE ENVÍO</span>
                      </span>
                      {openAccordion === 'envios' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openAccordion === 'envios' && (
                      <div className="pb-3 text-zinc-600 space-y-1.5 leading-relaxed">
                        <p>• <strong>Lima Metropolitana:</strong> Entrega estándar en 24 a 48 horas hábiles.</p>
                        <p>• <strong>Provincias a nivel nacional:</strong> Despachos vía Olva Courier / Shalom con guía oficial de rastreo en 2 a 4 días.</p>
                        {settings.freeShippingThreshold > 0 && (
                          <p className="text-emerald-700 font-bold">
                            • ¡Envío gratis a todo el Perú en compras mayores a {settings.currencySymbol} {settings.freeShippingThreshold}!
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Autenticidad Garantizada */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('autenticidad')}
                      className="w-full py-3.5 flex items-center justify-between font-extrabold uppercase tracking-wider text-black hover:text-zinc-600 text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-zinc-700" />
                        <span>AUTENTICIDAD GARANTIZADA</span>
                      </span>
                      {openAccordion === 'autenticidad' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openAccordion === 'autenticidad' && (
                      <div className="pb-3 text-zinc-600 space-y-1 leading-relaxed">
                        <p>Garantizamos que todos nuestros productos son 100% legítimos y de procedencia verificada. Calidad original certificada.</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* "TAMBIÉN PODRÍA GUSTARTE" Section matching Yolu Screenshot 9 */}
          {related.length > 0 && (
            <div className="pt-8 border-t border-zinc-200">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black mb-4">
                TAMBIÉN PODRÍA GUSTARTE
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {related.map((relProduct) => (
                  <div
                    key={relProduct.id}
                    onClick={() => onOpenProduct && onOpenProduct(relProduct)}
                    className="flex flex-col group cursor-pointer text-center"
                  >
                    <div className="aspect-square w-full bg-[#f4f4f5] group-hover:bg-[#ededf0] rounded-xl p-3 flex items-center justify-center transition-all">
                      <img
                        src={relProduct.images[0]}
                        alt={relProduct.name}
                        className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="pt-2 text-center space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-900 group-hover:text-black line-clamp-1">
                        {relProduct.name}
                      </p>
                      <p className="text-xs font-extrabold text-black">
                        {settings.currencySymbol} {relProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges Strip at Bottom */}
          <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-zinc-600">
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 text-black shrink-0" />
              <span>Paga con Yape, Plin y Tarjetas</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black shrink-0" />
              <span>Compra 100% segura y garantizada</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-black shrink-0" />
              <span>Envíos a todo el Perú</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
