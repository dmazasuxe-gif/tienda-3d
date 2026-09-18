import React, { useState, useEffect } from 'react';
import { 
  Order, 
  OrderStatus, 
  StoreSettings 
} from '../types';
import { 
  Search, 
  X, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Copy, 
  Check, 
  Home, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  formatPaymentMethod, 
  formatStatus 
} from '../utils/whatsapp';
import { saveLastTrackedCode } from '../utils/storage';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderCode?: string;
  settings: StoreSettings;
}

const TRACKING_STEPS = [
  {
    id: 'almacen',
    title: 'En Almacén',
    subtitle: 'Pedido Confirmado',
    desc: 'Orden registrada en el almacén central con reserva de prendas y calzado.',
    statusKey: 'pendiente'
  },
  {
    id: 'preparacion',
    title: 'En Preparación',
    subtitle: 'Empaque & Calidad',
    desc: 'Inspección de tallas, sellado hermético y empaque protector.',
    statusKey: 'en_preparacion'
  },
  {
    id: 'camino',
    title: 'En Camino',
    subtitle: 'Furgón en Ruta',
    desc: 'Paquete en la unidad de transporte express rumbo a tu dirección.',
    statusKey: 'enviado'
  },
  {
    id: 'entregado',
    title: 'Entregado',
    subtitle: 'Recepción Conforme',
    desc: 'Paquete entregado al cliente a total conformidad.',
    statusKey: 'entregado'
  }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderCode,
  settings
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderCode || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialOrderCode) {
      setSearchInput(initialOrderCode);
      const found = orders.find(
        (o) => o.orderNumber.toLowerCase() === initialOrderCode.toLowerCase().trim()
      );
      if (found) {
        setActiveOrder(found);
        setNotFoundError(false);
      } else {
        setActiveOrder(null);
      }
    } else if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setSearchInput(orders[0].orderNumber);
    }
  }, [initialOrderCode, isOpen, orders]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === query ||
        o.orderNumber.toLowerCase().replace('-', '') === query.replace('-', '') ||
        o.customerPhone.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
        o.customerName.toLowerCase().includes(query)
    );

    if (found) {
      setActiveOrder(found);
      setNotFoundError(false);
      saveLastTrackedCode(found.orderNumber);
    } else {
      setActiveOrder(null);
      setNotFoundError(true);
    }
  };

  const handleSelectSuggested = (order: Order) => {
    setActiveOrder(order);
    setSearchInput(order.orderNumber);
    setNotFoundError(false);
    saveLastTrackedCode(order.orderNumber);
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pendiente': return 0;
      case 'en_preparacion': return 1;
      case 'enviado': return 2;
      case 'entregado': return 3;
      case 'cancelado': return -1;
      default: return 0;
    }
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white border border-zinc-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto z-10 text-zinc-900">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                  Rastreo de Pedido
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>En tiempo real</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 truncate">
                Consulta el estado de tu compra desde almacén hasta tu domicilio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer ml-2"
            aria-label="Cerrar rastreador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex-1 space-y-5 bg-white w-full">
          
          {/* Search Bar */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 sm:p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Código de Pedido (ej. AUR-8943) o Teléfono"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (notFoundError) setNotFoundError(false);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs sm:text-sm text-black placeholder-zinc-400 focus:outline-none focus:border-black uppercase font-semibold transition-colors"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Rastrear</span>
              </button>
            </form>

            {/* Quick Suggestions */}
            {orders.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-zinc-200 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-[11px] pb-1">
                <span className="text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3 text-zinc-500" />
                  <span>Recientes:</span>
                </span>
                {orders.slice(0, 4).map((ord) => {
                  const isSelected = activeOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => handleSelectSuggested(ord)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-2xs'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="font-mono">#{ord.orderNumber}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {formatStatus(ord.status)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Not Found Error */}
          {notFoundError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-black">No encontramos ningún pedido con ese código</h3>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto">
                  Verifica que el código coincida con el de tu recibo o busca usando tu número de teléfono registrado.
                </p>
              </div>
            </div>
          )}

          {/* Active Order Details */}
          {activeOrder && (
            <div className="space-y-5">
              
              {/* Top Banner Guide Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-black shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Guía de Despacho:</span>
                      <button
                        onClick={() => copyTrackingCode(activeOrder.orderNumber)}
                        className="inline-flex items-center gap-1 text-xs font-mono font-black text-black bg-white px-2.5 py-0.5 rounded-md border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
                        title="Copiar código de rastreo"
                      >
                        <span>#{activeOrder.orderNumber}</span>
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      </button>
                    </div>
                    
                    <div className="mt-1 flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-700 leading-snug">
                        <strong className="text-black font-bold">{activeOrder.city}</strong> • {activeOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                  activeOrder.status === 'entregado'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-300'
                }`}>
                  {activeOrder.status === 'entregado' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Truck className="w-3.5 h-3.5 text-black" />}
                  <span>{formatStatus(activeOrder.status).toUpperCase()}</span>
                </span>
              </div>

              {/* Progress Track */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-black" />
                    <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider">
                      Ruta del Pedido
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500">
                    Etapa {Math.max(1, currentStep + 1)} de 4
                  </span>
                </div>

                {/* Track Line */}
                <div className="relative px-1 sm:px-4 pt-6 pb-2">
                  <div className="absolute top-[38px] left-[12.5%] right-[12.5%] h-1 bg-zinc-200 rounded-full pointer-events-none" />

                  <div 
                    className="absolute top-[38px] left-[12.5%] h-1 bg-black rounded-full transition-all duration-700 pointer-events-none"
                    style={{
                      width: activeOrder.status === 'cancelado' ? '0%' : `${(Math.max(0, currentStep) / 3) * 75}%`
                    }}
                  />

                  {/* 4 Points Grid */}
                  <div className="relative grid grid-cols-4 gap-1 sm:gap-2 w-full">
                    {TRACKING_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStep || activeOrder.status === 'entregado';
                      const isCurrent = idx === currentStep && activeOrder.status !== 'entregado';

                      return (
                        <div key={step.id} className="flex flex-col items-center text-center relative min-w-0">
                          {/* Point Circle */}
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shrink-0 ${
                            isCompleted
                              ? 'bg-black text-white ring-4 ring-white shadow-xs'
                              : isCurrent
                              ? 'bg-black text-white ring-4 ring-zinc-200 scale-105'
                              : 'bg-white text-zinc-400 border border-zinc-200 ring-4 ring-white'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : isCurrent ? (
                              <Truck className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>

                          <div className="mt-2.5 space-y-0.5 w-full px-0.5">
                            <p className={`text-[10px] sm:text-xs font-bold leading-tight ${
                              isCompleted || isCurrent ? 'text-black font-black' : 'text-zinc-400'
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 hidden sm:block">
                              {step.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Order Items Summary */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                  Detalle del Paquete ({activeOrder.items.length} productos)
                </h4>

                <div className="space-y-2">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-zinc-200">
                      <div className="w-12 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
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
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-black truncate uppercase">{item.product.name}</h5>
                        <p className="text-[11px] text-zinc-500">
                          Talla: {item.selectedSize} • Cantidad: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-black text-black shrink-0">
                        {settings.currencySymbol} {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 text-xs font-black text-black">
                  <span>Total Pagado:</span>
                  <span className="text-sm">{settings.currencySymbol} {activeOrder.total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
