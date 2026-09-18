import React, { useState } from 'react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import { 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  XCircle, 
  Eye, 
  Phone, 
  MapPin, 
  User, 
  Calendar,
  X,
  Trash2,
  ScanLine,
  Printer
} from 'lucide-react';
import { getAdminToCustomerWhatsAppUrl, formatPaymentMethod, formatStatus } from '../../utils/whatsapp';
import { printTicket } from '../../utils/printTicket';

interface OrderManagerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  settings: StoreSettings;
  onPreviewTracking?: (orderCode: string) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  settings,
  onPreviewTracking
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pendiente</span>
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <Package className="w-3 h-3 text-orange-600" />
            <span>En Preparación</span>
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Enviado / En camino</span>
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Entregado</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por N° de orden, cliente, teléfono o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all' as const, label: 'Todas' },
            { id: 'pendiente' as const, label: 'Pendientes' },
            { id: 'en_preparacion' as const, label: 'En Preparación' },
            { id: 'enviado' as const, label: 'Enviados' },
            { id: 'entregado' as const, label: 'Entregados' },
            { id: 'cancelado' as const, label: 'Cancelados' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-orange-600 text-white font-extrabold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-orange-100 space-y-2 shadow-sm">
          <Package className="w-8 h-8 text-orange-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No se encontraron órdenes</p>
          <p className="text-xs text-slate-500">Prueba cambiando los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const whatsAppClientUrl = getAdminToCustomerWhatsAppUrl(
              order.customerPhone,
              settings,
              order
            );

            return (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-white border border-orange-100 hover:border-orange-300 transition-all space-y-3 shadow-xs"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(order.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Customer Details & Items preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Client Info */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>{order.customerName}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{order.customerPhone}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{order.shippingAddress}, {order.city}</span>
                    </p>
                  </div>

                  {/* Products summary */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500">Productos ({order.items.reduce((s, i) => s + i.quantity, 0)} uds):</span>
                    <div className="space-y-0.5">
                      {order.items.slice(0, 2).map((it, idx) => (
                        <p key={idx} className="text-slate-700 truncate">
                          • {it.quantity}x {it.product.name} (Talla: {it.selectedSize})
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-slate-400">+{order.items.length - 2} productos más...</p>
                      )}
                    </div>
                  </div>

                  {/* Financial & Status Changer */}
                  <div className="flex flex-col justify-between items-start md:items-end gap-2">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-500 block">Total de la Orden:</span>
                      <span className="text-base font-black text-slate-900">
                        {settings.currencySymbol} {order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Status Changer Select */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-orange-50 text-orange-900 text-xs px-3 py-1.5 rounded-2xl border border-orange-200 font-bold focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_preparacion">En Preparación</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Tracking, Inspector, Delete & WhatsApp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-orange-100">
                  <span className="text-[11px] text-slate-500">
                    Pago: <strong className="text-slate-800">{formatPaymentMethod(order.paymentMethod)}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {onPreviewTracking && (
                      <button
                        onClick={() => onPreviewTracking(order.orderNumber)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Ver simulación del rastreo y carrito en movimiento"
                      >
                        <Truck className="w-3.5 h-3.5 text-orange-600" />
                        <span className="hidden sm:inline">Rastreo</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-1.5 sm:px-3 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Eliminar orden permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>

                    <button
                      onClick={() => printTicket(order, settings)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Imprimir boleta / ticket"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ticket</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>Detalles</span>
                    </button>

                    <a
                      href={whatsAppClientUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-xl bg-white border border-orange-100 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 z-10 my-auto max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Detalle de Orden #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500">
                  Fecha: {new Date(selectedOrder.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="p-3.5 bg-orange-50/50 rounded-2xl space-y-1.5 text-xs text-slate-700 border border-orange-100">
              <p>👤 <strong>Cliente:</strong> {selectedOrder.customerName}</p>
              <p>📱 <strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
              {selectedOrder.customerEmail && <p>📧 <strong>Email:</strong> {selectedOrder.customerEmail}</p>}
              <p>📍 <strong>Dirección:</strong> {selectedOrder.shippingAddress}, {selectedOrder.city}</p>
              {selectedOrder.notes && <p>📝 <strong>Notas:</strong> {selectedOrder.notes}</p>}
              <p>💳 <strong>Método:</strong> {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
              <p>🏷️ <strong>Estado Actual:</strong> {formatStatus(selectedOrder.status)}</p>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Productos Ordenados:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-2xl text-xs border border-orange-100 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <img src={it.product.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-orange-100" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-slate-900">{it.product.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Talla: {it.selectedSize} | Color: {it.selectedColor.name} | Cant: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      {settings.currencySymbol} {(it.product.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-2 border-t border-orange-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{settings.currencySymbol} {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className={`font-semibold ${selectedOrder.shippingCost === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {selectedOrder.shippingCost === 0 ? 'GRATIS' : `${settings.currencySymbol} ${selectedOrder.shippingCost.toFixed(2)}`}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Descuento:</span>
                  <span>-{settings.currencySymbol} {selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-orange-100">
                <span>Total Facturado:</span>
                <span className="text-orange-700 font-black">{settings.currencySymbol} {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={getAdminToCustomerWhatsAppUrl(selectedOrder.customerPhone, settings, selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Contactar por WhatsApp</span>
              </a>
              <button
                onClick={() => printTicket(selectedOrder, settings)}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold border border-indigo-200 cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold border border-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
