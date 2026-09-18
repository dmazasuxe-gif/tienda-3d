import React, { useState } from 'react';
import { Order, Product, StoreSettings } from '../../types';
import { 
  FileText, 
  FileSpreadsheet, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Sparkles,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import { generateMonthlyPdfReport } from '../../utils/exportPdf';
import { exportMonthlySalesToExcel } from '../../utils/exportExcel';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  products,
  settings
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Septiembre 2026');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Financial calculations
  const validOrders = orders.filter((o) => o.status !== 'cancelado');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'entregado').length;
  const totalUnitsSold = validOrders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Category revenue split
  let calzadoRevenue = 0;
  let ropaRevenue = 0;

  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      const itemTotal = item.product.price * item.quantity;
      if (item.product.category === 'calzado') {
        calzadoRevenue += itemTotal;
      } else {
        ropaRevenue += itemTotal;
      }
    });
  });

  const totalCatSum = calzadoRevenue + ropaRevenue || 1;
  const calzadoPercent = Math.round((calzadoRevenue / totalCatSum) * 100);
  const ropaPercent = Math.round((ropaRevenue / totalCatSum) * 100);

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      generateMonthlyPdfReport(orders, products, settings, selectedMonth);
      setIsExportingPdf(false);
    }, 300);
  };

  const handleDownloadExcel = () => {
    setIsExportingExcel(true);
    setTimeout(() => {
      exportMonthlySalesToExcel(orders, products, settings, selectedMonth);
      setIsExportingExcel(false);
    }, 300);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner & Export Actions */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-orange-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-base sm:text-xl font-bold text-slate-900 font-['Playfair_Display',serif]">
              Reportes Mensuales de Ingresos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Descarga los balances de ventas, órdenes y métricas financieras en formatos oficiales
          </p>
        </div>

        {/* Month Selector & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="Septiembre 2026">Septiembre 2026 (Mes Actual)</option>
            <option value="Agosto 2026">Agosto 2026</option>
            <option value="Julio 2026">Julio 2026</option>
          </select>

          {/* Export to PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Descargar Reporte en PDF"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>{isExportingPdf ? 'Generando...' : 'Exportar PDF'}</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleDownloadExcel}
            disabled={isExportingExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Descargar Reporte en Excel XLSX"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isExportingExcel ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Ingresos */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ingresos Brutos</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-slate-900">
              {settings.currencySymbol} {totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-700 flex items-center gap-0.5 mt-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              <span>{validOrders.length} transacciones activas</span>
            </span>
          </div>
        </div>

        {/* Órdenes Totales */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pedidos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-slate-900">
              {totalOrdersCount}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {completedOrders} entregados con éxito
            </span>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-slate-900">
              {settings.currencySymbol} {avgTicket.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Por cada orden registrada
            </span>
          </div>
        </div>

        {/* Unidades Vendidas */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Unidades Vendidas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-slate-900">
              {totalUnitsSold} uds
            </p>
            <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
              Calzado y moda despachada
            </span>
          </div>
        </div>

      </div>

      {/* Category Sales Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Distribution Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-600" />
            <span>Distribución de Ventas por Categoría</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">👟 Calzado ({calzadoPercent}%)</span>
                <span className="text-orange-700 font-extrabold">{settings.currencySymbol} {calzadoRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-orange-100">
                <div className="h-full bg-gradient-to-r from-orange-500 to-blue-600 rounded-full" style={{ width: `${calzadoPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">👔 Ropa & Moda ({ropaPercent}%)</span>
                <span className="text-purple-700 font-extrabold">{settings.currencySymbol} {ropaRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-orange-100">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" style={{ width: `${ropaPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            📊 El calzado representa la principal fuente de ingresos con alta rotación en tallas 40-42 y calzado de temporada.
          </div>
        </div>

        {/* Top Selling Products Preview */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-100 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Productos Más Solicitados en el Mes</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {products.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 border border-orange-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover border border-orange-100 bg-white" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.brand} • {p.category}</p>
                  </div>
                </div>

                <span className="font-black text-slate-900">
                  {settings.currencySymbol} {p.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
