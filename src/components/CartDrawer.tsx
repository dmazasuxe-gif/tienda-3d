import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, StoreSettings } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCheckout?: (discount: number, promoCode: string) => void;
  onCheckout?: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  onCheckout,
  settings
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number; description?: string } | null>(null);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Ingresa un código');
      return;
    }
    
    if (settings.coupons) {
      const coupon = settings.coupons.find(c => c.code.toUpperCase() === promoCode.toUpperCase().trim() && c.isActive);
      if (coupon) {
        setAppliedPromo({
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          description: coupon.description
        });
        setPromoError('');
        setPromoCode('');
        return;
      }
    }
    setPromoError('Cupón inválido o expirado');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  
  // Calculate if qualifies for free shipping
  const freeShippingThreshold = settings.shippingOptions?.find(s => s.price === 0)?.minOrderAmount || 0;
  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const standardShippingCost = settings.shippingOptions?.find(s => s.price > 0)?.price || 15;
  const shippingCost = isFreeShipping ? 0 : standardShippingCost;

  const total = Math.max(0, subtotal - discountAmount) + shippingCost;
  const progressPercent = freeShippingThreshold > 0 ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100)) : 0;

  const handleProceedCheckout = () => {
    if (onOpenCheckout) {
      onOpenCheckout(discountAmount, appliedPromo?.code || '');
    } else if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white border-l border-zinc-200 h-full flex flex-col shadow-2xl z-10 text-zinc-900"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-black" />
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                  Carrito de Compras
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {freeShippingThreshold > 0 && (
              <div className="bg-zinc-50 border-b border-zinc-200 p-4 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    {isFreeShipping ? '¡Envío Gratis Alcanzado!' : `Faltan ${settings.currencySymbol} ${(freeShippingThreshold - subtotal).toFixed(2)} para envío gratis`}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F0713D] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <ShoppingBag className="w-16 h-16 text-zinc-300" />
                  <div>
                    <p className="text-lg font-bold text-zinc-900 uppercase">Tu carrito está vacío</p>
                    <p className="text-sm text-zinc-500 mt-1">¡Explora nuestra colección y añade productos!</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-zinc-200 bg-white shadow-2xs group relative">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate uppercase tracking-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-black p-1 -mr-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-900 font-semibold border border-zinc-200">
                          Talla: {item.selectedSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="truncate max-w-[80px]">{item.selectedColor.name}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm font-black text-black">
                          {settings.currencySymbol} {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white text-zinc-700 hover:bg-zinc-100 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                            disabled={item.quantity >= item.product.stock}
                            className="w-6 h-6 rounded bg-white text-zinc-700 hover:bg-zinc-100 flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer transition-colors shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white space-y-3.5 shrink-0">
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="CUPÓN DE DESCUENTO"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black uppercase placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-[#F0713D] hover:bg-[#d95d28] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      Aplicar
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-800 flex items-center justify-between gap-2 font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Cupón <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-300 font-bold text-black">{appliedPromo.code}</strong> (-{settings.currencySymbol} {appliedPromo.discountAmount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-zinc-500 hover:text-black text-[10px] font-bold underline cursor-pointer shrink-0"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{promoError}</p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-zinc-900">{settings.currencySymbol} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span className={`font-semibold ${isFreeShipping ? 'text-emerald-700 font-bold' : 'text-zinc-900'}`}>
                      {isFreeShipping ? 'GRATIS' : `${settings.currencySymbol} ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Descuento cupón:</span>
                      <span>-{settings.currencySymbol} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-black pt-2 border-t border-zinc-200">
                    <span>Total Estimado:</span>
                    <span>{settings.currencySymbol} {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleProceedCheckout}
                    className="w-full py-3.5 px-4 bg-[#F0713D] hover:bg-[#d95d28] text-white font-black rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    <span>Continuar Compra</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClearCart}
                    className="w-full text-center text-[11px] text-zinc-400 hover:text-black py-1 transition-colors cursor-pointer font-medium"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
