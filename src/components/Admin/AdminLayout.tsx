import React, { useState } from 'react';
import { 
  Product, 
  Order, 
  StoreSettings, 
  OrderStatus,
  CategoryType 
} from '../../types';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Store, 
  LogOut, 
  Edit3, 
  Trash2, 
  ShieldCheck,
  CheckCircle2,
  ScanLine,
  Award,
  Barcode,
  Printer,
  Image as ImageIcon,
  Images
} from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { OrderManager } from './OrderManager';
import { ReportsView } from './ReportsView';
import { StockAlertsView } from './StockAlertsView';
import { StoreSettingsView } from './StoreSettingsView';
import { BarcodeScannerView } from './BarcodeScannerView';
import { ProductImagesManager } from './ProductImagesManager';
import { RunwayManager } from './RunwayManager';
import { LabelDesigner } from './LabelDesigner';
import { ProductLabelPrinter } from './ProductLabelPrinter';

interface AdminLayoutProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onExitAdmin: () => void;
  onLogoutAdmin: () => void;
  onPreviewTracking?: (orderCode: string) => void;
  initialTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

type AdminTab = 'scanner' | 'products' | 'orders' | 'reports' | 'stock' | 'runway' | 'brands' | 'labels' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  products,
  orders,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveSettings,
  onExitAdmin,
  onLogoutAdmin,
  onPreviewTracking,
  initialTab,
  onTabChange
}) => {
  const [activeTab, setActiveTabState] = useState<AdminTab>(initialTab || 'products');
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  React.useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [initialBarcode, setInitialBarcode] = useState<string | undefined>();
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | CategoryType>('all');

  // Badge calculations
  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenNewProduct = (barcode?: string) => {
    setProductToEdit(null);
    setInitialBarcode(barcode);
    setProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setProductToEdit(p);
    setProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-slate-50 to-orange-100/30 text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden shrink-0 shadow-xs">
              <img
                src={settings.logoUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"}
                alt={settings.storeName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Playfair_Display',serif] truncate max-w-[160px] sm:max-w-xs">
                  {settings.storeName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-orange-600" />
                  <span>Panel Admin</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Gestión de Catálogo, Envíos y Ventas</p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Exit to Store View Button */}
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-orange-200 shadow-xs cursor-pointer"
              title="Ir a la tienda para clientes"
              id="btn-admin-view-store"
            >
              <Store className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Ver Tienda</span>
              <span className="sm:hidden">Tienda</span>
            </button>

            {/* Logout Admin */}
            <button
              onClick={onLogoutAdmin}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              title="Cerrar sesión de administrador"
              id="btn-admin-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-orange-100/80 pt-1">
          {[
            { id: 'scanner' as const, label: 'Lector de Códigos', icon: ScanLine },
            { id: 'products' as const, label: 'Productos & Catálogo', icon: Package, count: products.length },
            { id: 'orders' as const, label: 'Órdenes de Compra', icon: ShoppingBag, count: pendingOrdersCount, badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200' },
            { id: 'reports' as const, label: 'Reportes Financieros (PDF/Excel)', icon: TrendingUp },
            { id: 'stock' as const, label: 'Alertas de Stock', icon: AlertTriangle, count: lowStockCount, badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200' },
            { id: 'labels' as const, label: 'Diseñador de Etiquetas', icon: Barcode },
            { id: 'runway' as const, label: 'Banners Principales', icon: ImageIcon, count: (settings.runwaySlides && settings.runwaySlides.length > 0) ? settings.runwaySlides.length : 0, badgeColor: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
            { id: 'brands' as const, label: 'Pasarela de Productos', icon: Images, count: (settings.productStripImages?.length || 0), badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
            { id: 'settings' as const, label: 'Configuración Tienda & WhatsApp', icon: SettingsIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-orange-300 text-orange-800 bg-orange-50 border shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${tab.badgeColor || 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        
        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre, SKU o marca..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
                  />
                </div>

                <div className="flex gap-1">
                  {(['all', 'impresoras_3d', 'filamentos', 'impresiones_3d', 'corte_laser', 'grabado_laser'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setProductCategoryFilter(cat as 'all' | CategoryType)}
                      className={`px-3 py-2 rounded-2xl text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                        productCategoryFilter === cat
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Product CTA Button */}
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Producto</span>
              </button>
            </div>

            {/* Products Grid / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-3xl bg-white border border-orange-100 hover:border-orange-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail & Quick Badges */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-orange-50 border border-orange-100 mb-2.5">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border border-orange-200 shadow-xs">
                          {p.sku}
                        </span>

                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                          p.stock === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          Stock: {p.stock}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="uppercase font-bold text-orange-700">{p.brand}</span>
                          <span className="capitalize">{p.category} • {p.techType}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                    </div>

                    {/* Pricing, Sizes & Action Buttons */}
                    <div className="pt-2 border-t border-orange-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-slate-900">
                            {settings.currencySymbol} {p.price.toFixed(2)}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              {settings.currencySymbol} {p.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {p.sizes.length} tallas
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPrintingProduct(p)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
                          title="Imprimir Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="flex-1 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-orange-200 cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas eliminar ${p.name}?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-xs"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Tab 2: Orders Manager */}
        {activeTab === 'orders' && (
          <OrderManager
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onDeleteOrder={onDeleteOrder}
            settings={settings}
            onPreviewTracking={onPreviewTracking}
          />
        )}

        {/* Tab 3: Monthly Reports & Financials */}
        {activeTab === 'reports' && (
          <ReportsView
            orders={orders}
            products={products}
            settings={settings}
          />
        )}

        {/* Tab 4: Stock Alerts */}
        {activeTab === 'stock' && (
          <StockAlertsView
            products={products}
            onUpdateProductStock={onUpdateProductStock}
            settings={settings}
          />
        )}

        {/* Tab: Barcode Scanner */}
        {activeTab === 'scanner' && (
          <BarcodeScannerView
            products={products}
            onOpenProductForm={(barcode) => handleOpenNewProduct(barcode)}
            onEditProduct={(p) => handleEditProduct(p)}
          />
        )}

        {/* Tab: Runway Manager */}
        {activeTab === 'runway' && (
          <RunwayManager
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        )}

        {/* Tab: Product Images Manager */}
        {activeTab === 'brands' && (
          <ProductImagesManager
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        )}

        {/* Tab: Label Designer */}
        {activeTab === 'labels' && (
          <LabelDesigner 
            settings={settings}
            onSaveSettings={onSaveSettings}
            products={products}
          />
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <StoreSettingsView
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        )}

      </main>

      {/* Product Form Modal for adding or editing */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={onSaveProduct}
        productToEdit={productToEdit}
        initialBarcode={initialBarcode}
        settings={settings}
      />

      <ProductLabelPrinter
        product={printingProduct}
        currencySymbol={settings.currencySymbol}
        onPrintComplete={() => setPrintingProduct(null)}
        settings={settings}
      />

    </div>
  );
};
