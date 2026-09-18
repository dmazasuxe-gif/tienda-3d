import React, { useState, useEffect } from 'react';
import { Order, StoreSettings } from '../types';
import { X, CheckCircle2, ShieldCheck, User, Package, Calendar } from 'lucide-react';
import { formatPaymentMethod, formatStatus } from '../utils/whatsapp';

interface OrderValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  receiptOrderCode?: string;
  settings: StoreSettings;
}

export const OrderValidationModal: React.FC<OrderValidationModalProps> = ({
  isOpen,
  onClose,
  orders,
  receiptOrderCode,
  settings
}) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && receiptOrderCode) {
      const order = orders.find(
        (o) => o.orderNumber.toLowerCase() === receiptOrderCode.toLowerCase().trim()
      );
      if (order) {
        setActiveOrder(order);
        setError('');
      } else {
        setActiveOrder(null);
        setError('No se encontró el pedido o el código es incorrecto.');
      }
    }
  }, [isOpen, receiptOrderCode, orders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] z-10 text-zinc-900">
        
        {/* Minimal Header */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base uppercase tracking-wider text-black">
                Validación de Boleta
              </h2>
              <p className="text-xs text-zinc-500">
                {settings.storeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto bg-white flex-1 space-y-4">
          {error ? (
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                <X className="w-6 h-6" />
              </div>
              <p className="text-zinc-800 text-xs font-bold">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-black text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : activeOrder ? (
            <div className="space-y-4">
              
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pedido Verificado
                </div>
                <h3 className="text-2xl font-black text-black font-mono">
                  #{activeOrder.orderNumber}
                </h3>
                <p className="text-zinc-500 text-xs flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeOrder.createdAt).toLocaleString('es-PE', {
                    dateStyle: 'medium', timeStyle: 'short'
                  })}
                </p>
              </div>

              {/* Customer Info */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2 text-xs">
                <h4 className="font-bold text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2">
                  <User className="w-4 h-4 text-zinc-600" />
                  Datos del Cliente
                </h4>
                <div className="space-y-1 text-zinc-700">
                  <p><span className="font-bold text-black">Nombre:</span> {activeOrder.customerName}</p>
                  <p><span className="font-bold text-black">Teléfono:</span> {activeOrder.customerPhone}</p>
                  <p><span className="font-bold text-black">Dirección:</span> {activeOrder.shippingAddress}, {activeOrder.city}</p>
                  <p><span className="font-bold text-black">Método de Pago:</span> {formatPaymentMethod(activeOrder.paymentMethod)}</p>
                  <p><span className="font-bold text-black">Estado:</span> {formatStatus(activeOrder.status)}</p>
                </div>
              </div>

              {/* Products */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2">
                  <Package className="w-4 h-4 text-zinc-600" />
                  Productos Comprados
                </h4>
                
                <div className="space-y-2.5 pt-1">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-2 rounded-xl border border-zinc-200">
                      <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                        <img 
                          src={item.product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = 'true';
                              target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h5 className="font-bold text-black truncate uppercase">
                          {item.product.name}
                        </h5>
                        <p className="text-zinc-500 mt-0.5">
                          Talla: <span className="font-bold text-black">{item.selectedSize}</span> | 
                          Color: <span className="font-bold text-black">{item.selectedColor.name}</span>
                        </p>
                        <p className="font-bold text-black mt-0.5">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-3 border-zinc-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
