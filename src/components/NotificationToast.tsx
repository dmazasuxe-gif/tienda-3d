import React from 'react';
import { OrderNotification, StoreSettings } from '../types';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  notification: OrderNotification | null;
  onClose: () => void;
  onViewOrder?: (orderId: string) => void;
  settings: StoreSettings;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onViewOrder,
  settings
}) => {
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-in font-sans">
      <div className="bg-black border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-white">
        
        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border border-zinc-700 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-amber-400 animate-wiggle" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase text-amber-400">¡Nuevo Pedido!</span>
            <span className="text-[11px] text-zinc-400 font-mono">#{notification.orderNumber}</span>
          </div>
          <p className="text-xs text-zinc-200 font-semibold truncate">
            {notification.customerName}
          </p>
          <p className="text-[11px] text-zinc-400">
            {notification.itemCount} items • <strong className="text-white">{settings.currencySymbol} {notification.total.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onViewOrder && (
            <button
              onClick={() => {
                onViewOrder(notification.orderId);
                onClose();
              }}
              className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-full transition-colors uppercase tracking-wider"
            >
              Ver
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
