import React, { useState } from 'react';
import { Product, StoreSettings } from '../../types';
import { AlertTriangle, CheckCircle2, XCircle, Search, PackageCheck } from 'lucide-react';

interface StockAlertsViewProps {
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  settings: StoreSettings;
}

export const StockAlertsView: React.FC<StockAlertsViewProps> = ({
  products,
  onUpdateProductStock,
  settings
}) => {
  const [search, setSearch] = useState('');

  const criticalProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const healthyCount = products.filter((p) => p.stock > p.lowStockThreshold).length;

  const filteredProducts = (criticalProducts.length > 0 ? criticalProducts : products).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-200 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{outOfStockCount}</p>
            <p className="text-xs text-rose-700 font-bold">Agotados (0 stock)</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-200 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{lowStockCount}</p>
            <p className="text-xs text-amber-700 font-bold">En Alerta de Stock Bajo</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{healthyCount}</p>
            <p className="text-xs text-emerald-700 font-bold">Stock Saludable / Normal</p>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-orange-100 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm text-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-orange-600" />
              <span>Control y Reabastecimiento de Inventario</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ajusta el inventario en tiempo real con 1 clic para que los clientes vean disponibilidad inmediata
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="space-y-2.5">
          {filteredProducts.map((p) => {
            const isOut = p.stock === 0;
            const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

            return (
              <div
                key={p.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-orange-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-12 h-14 rounded-xl object-cover shrink-0 border border-orange-100 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wider">{p.sku}</span>
                      <span className="text-xs text-slate-500">• {p.brand}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Tallas: {p.sizes.join(', ')} | Precio: {settings.currencySymbol} {p.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-orange-100 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {p.stock} uds
                      </span>
                      {isOut ? (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                          AGOTADO
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          STOCK BAJO
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          OK
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Mínimo: {p.lowStockThreshold} uds</span>
                  </div>

                  {/* Quick Add Stock Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateProductStock(p.id, p.stock + 1)}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-orange-200 cursor-pointer shadow-2xs"
                      title="Sumar 1 unidad"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onUpdateProductStock(p.id, p.stock + 5)}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-orange-200 cursor-pointer shadow-2xs"
                      title="Sumar 5 unidades"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => onUpdateProductStock(p.id, p.stock + 10)}
                      className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      title="Sumar 10 unidades"
                    >
                      +10
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
