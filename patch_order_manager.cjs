const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/OrderManager.tsx', 'utf8');

code = code.replace(
  /onUpdateOrderStatus: \(orderId: string, newStatus: OrderStatus\) => void;/,
  `onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;`
);

code = code.replace(
  /onUpdateOrderStatus,\n  settings,/,
  `onUpdateOrderStatus,\n  onDeleteOrder,\n  settings,`
);

// We need to fix the whatsapp button wrapper.
// Also add the delete button somewhere. Maybe next to "Ver Detalles" in the bottom actions?
// Let's find the bottom actions block.

const bottomActionsRegex = /\{\/\* Bottom Actions: Contact Customer via WhatsApp \+ Inspector \*\/\}\s*<div className="flex items-center justify-between gap-2 pt-2 border-t border-sky-100">\s*<span className="text-\[11px\] text-slate-500">\s*Pago: <strong className="text-slate-800">\{formatPaymentMethod\(order\.paymentMethod\)\}<\/strong>\s*<\/span>\s*<div className="flex items-center gap-2">([\s\S]*?)<\/div>\s*<\/div>/;

// I'm going to rewrite that block for better responsiveness and adding the trash button.
const newBottomActions = `{/* Bottom Actions: Tracking, Inspector, Delete & WhatsApp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-sky-100">
                  <span className="text-[11px] text-slate-500">
                    Pago: <strong className="text-slate-800">{formatPaymentMethod(order.paymentMethod)}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {onPreviewTracking && (
                      <button
                        onClick={() => onPreviewTracking(order.orderNumber)}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Ver simulación del rastreo y carrito en movimiento"
                      >
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
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
                </div>`;

code = code.replace(bottomActionsRegex, newBottomActions);

fs.writeFileSync('src/components/Admin/OrderManager.tsx', code);
