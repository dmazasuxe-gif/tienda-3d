import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Product, 
  CartItem, 
  StoreSettings, 
  Order, 
  CategoryType, 
  TechType, 
  FilterState, 
  ProductColor, 
  OrderStatus,
  OrderNotification
} from './types';
import { 
  getStoredProducts, 
  saveStoredProducts,
  getStoredOrders, 
  saveStoredOrders,
  getStoredSettings, 
  saveStoredSettings,
  getStoredCart, 
  saveStoredCart,
  isAdminAuthenticated, 
  setAdminAuthenticated, 
  clearAdminAuthenticated,
  getStoredNotifications,
  saveStoredNotifications,
  getLastTrackedCode
} from './utils/storage';
import { playNotificationChime, sendPushNotification } from './utils/sound';
import { testSupabaseConnection } from './services/supabase';
import { 
  subscribeToProducts, 
  subscribeToOrders, 
  subscribeToStoreSettings,
  syncSaveProduct,
  syncDeleteProduct,
  syncReduceStock,
  syncCreateOrder,
  syncUpdateOrderStatus,
  syncDeleteOrder,
  syncSaveStoreSettings
} from './services/supabaseSync';

// Public Components
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { ProductImagesStrip } from './components/ProductImagesStrip';
import { LiquidationSection } from './components/LiquidationSection';
import { CategoryCardsSection } from './components/CategoryCardsSection';
import { ProductCarouselSection } from './components/ProductCarouselSection';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FilterDrawer } from './components/FilterDrawer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { NotificationToast } from './components/NotificationToast';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderValidationModal } from './components/OrderValidationModal';

// Admin Components
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminPortalLogin } from './components/Admin/AdminPortalLogin';

// Icons
import { 
  Sparkles, 
  ShoppingBag, 
  Filter, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Heart,
  Store as StoreIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'all',
  techType: 'all',
  selectedBrands: [],
  selectedSizes: [],
  selectedColors: [],
  minPrice: 0,
  maxPrice: 800,
  inStockOnly: false,
  onSaleOnly: false,
  sortBy: 'popular'
};

export default function App() {
  // Core Store Data
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings);
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);

  // Automatic domain/subdomain separation between Customer Store and Admin ERP System
  const isDedicatedAdminSubdomainOrRoute = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    const isSubdomain = host.startsWith('admin.') || host.startsWith('sistema.') || host.startsWith('erp.');
    const isPath = pathname.startsWith('/admin') || pathname.startsWith('/sistema');
    const isParam = searchParams.get('mode') === 'admin' || searchParams.get('app') === 'admin' || searchParams.get('subdomain') === 'admin';

    return isSubdomain || isPath || isParam;
  }, []);

  // App Mode & Navigation
  const [viewMode, setViewMode] = useState<'store' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'store';
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    if (
      host.startsWith('admin.') || 
      host.startsWith('sistema.') || 
      host.startsWith('erp.') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/sistema') ||
      searchParams.get('mode') === 'admin' ||
      searchParams.get('app') === 'admin' ||
      searchParams.get('subdomain') === 'admin'
    ) {
      return 'admin';
    }
    return 'store';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(isAdminAuthenticated);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryType>('all');
  const [selectedTechType, setSelectedTechType] = useState<'all' | TechType>('all');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Modals & Drawers
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [receiptOrderCode, setReceiptOrderCode] = useState('');
  const [trackedOrderCode, setTrackedOrderCode] = useState<string>(() => getLastTrackedCode());
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeToast, setActiveToast] = useState<OrderNotification | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'scanner' | 'products' | 'orders' | 'reports' | 'stock' | 'brands' | 'settings'>('products');

  // Cart Promo Code & Discount
  const [cartDiscount, setCartDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [cartBounceTrigger, setCartBounceTrigger] = useState(0);

  // Product Pagination State (10 productos por página)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Keep live refs to viewMode, isAdminLoggedIn and settings for use in real-time callbacks
  const viewModeRef = useRef(viewMode);
  const isAdminLoggedInRef = useRef(isAdminLoggedIn);
  const settingsRef = useRef(settings);
  useEffect(() => {
    viewModeRef.current = viewMode;
    isAdminLoggedInRef.current = isAdminLoggedIn;
    settingsRef.current = settings;
  }, [viewMode, isAdminLoggedIn, settings]);

  // Track previous orders to detect newly arrived orders from customers in real time
  const isInitialOrdersLoad = useRef(true);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Real-time Cloud Synchronization via Supabase
  useEffect(() => {
    testSupabaseConnection();

    // 1. Live Sync Products from Cloud
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      setProducts(cloudProducts);
      saveStoredProducts(cloudProducts);
    }, getStoredProducts());

    // 2. Live Sync Orders from Cloud
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      // Check for incoming new orders to notify admin
      if (isInitialOrdersLoad.current) {
        isInitialOrdersLoad.current = false;
        knownOrderIdsRef.current = new Set(cloudOrders.map(o => o.id));
      } else {
        const newOrders = cloudOrders.filter(o => !knownOrderIdsRef.current.has(o.id));
        if (newOrders.length > 0) {
          // Update known IDs
          newOrders.forEach(o => knownOrderIdsRef.current.add(o.id));

          // STRICT SEPARATION:
          // ONLY trigger toast / sound / vibration / push if this browser instance is currently in ADMIN MODE ('admin') AND the administrator is authenticated!
          // NEVER notify in the store or to public customers!
          const isCurrentlyInAdminMode = viewModeRef.current === 'admin' && isAdminLoggedInRef.current;
          if (isCurrentlyInAdminMode) {
            const latestNewOrder = newOrders[0];
            const currentSettings = settingsRef.current;
            const notif: OrderNotification = {
              id: `notif-${Date.now()}-${latestNewOrder.id}`,
              orderId: latestNewOrder.id,
              orderNumber: latestNewOrder.orderNumber,
              customerName: latestNewOrder.customerName,
              total: latestNewOrder.total,
              itemCount: latestNewOrder.items.reduce((s, i) => s + i.quantity, 0),
              timestamp: new Date().toISOString(),
              read: false
            };

            setActiveToast(notif);

            if (currentSettings.notificationSound !== false) {
              playNotificationChime();
            }
            if (currentSettings.pushNotifications !== false) {
              sendPushNotification(
                `🛍️ NUEVO PEDIDO: #${latestNewOrder.orderNumber}`,
                `${latestNewOrder.customerName} realizó una compra por ${currentSettings.currencySymbol} ${latestNewOrder.total.toFixed(2)}`
              );
            }
          }
        }
      }

      setOrders(cloudOrders);
      saveStoredOrders(cloudOrders);
    }, getStoredOrders());

    // 3. Live Sync Settings & Coupons from Cloud
    const unsubSettings = subscribeToStoreSettings((cloudSettings) => {
      setSettings(cloudSettings);
      saveStoredSettings(cloudSettings);
    }, getStoredSettings());

    // 4. Check for URL parameters (like ?track=ORDER-CODE or ?receipt=ORDER-CODE from QR scans)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const trackCode = searchParams.get('track');
      const receiptCode = searchParams.get('receipt');
      
      if (trackCode) {
        setTrackedOrderCode(trackCode);
        setTrackingModalOpen(true);
        // Clean URL to avoid reopening on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (receiptCode) {
        setReceiptOrderCode(receiptCode);
        setValidationModalOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
    };
  }, []);

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTechType, filters]);

  // Synchronize state with storage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Compute unique filter options from current inventory
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const allSizes = products.flatMap((p) => p.sizes);
    return Array.from(new Set(allSizes)).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, ProductColor>();
    products.forEach((p) => {
      p.colors.forEach((c) => {
        if (!colorMap.has(c.name)) {
          colorMap.set(c.name, c);
        }
      });
    });
    return Array.from(colorMap.values());
  }, [products]);

  // Filtered & Sorted Products computation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesSku) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // 3. Tech Filter
      if (selectedTechType !== 'all') {
        if (product.techType !== selectedTechType && product.techType !== 'otro') {
          return false;
        }
      }

      // 4. Sizes Filter
      if (filters.selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some((sz) => filters.selectedSizes.includes(sz));
        if (!hasMatchingSize) return false;
      }

      // 5. Colors Filter
      if (filters.selectedColors.length > 0) {
        const hasMatchingColor = product.colors.some((col) => filters.selectedColors.includes(col.name));
        if (!hasMatchingColor) return false;
      }

      // 6. Brands Filter
      if (filters.selectedBrands.length > 0) {
        if (!filters.selectedBrands.includes(product.brand)) return false;
      }

      // 7. Price Range Filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // 8. On Sale Only
      if (filters.onSaleOnly && (!product.originalPrice || product.originalPrice <= product.price)) {
        return false;
      }

      // 9. In Stock Only
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'discount':
          const discountA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discountB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discountB - discountA;
        case 'popular':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [products, searchQuery, selectedCategory, selectedTechType, filters]);

  // Pagination Calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (productsSectionRef.current) {
        productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: ProductColor, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor.name === color.name
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity: Math.min(product.stock, quantity)
        };
        return [...prevCart, newItem];
      }
    });

    // Trigger tactile bouncing animation on header cart icon
    setCartBounceTrigger((prev) => prev + 1);

    // Open drawer smoothly so customer can witness the tactile bounce
    setTimeout(() => {
      setCartDrawerOpen(true);
    }, 600);
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: Math.min(item.product.stock, nextQty) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setAppliedPromo('');
  };

  // Checkout and Order Placement
  const handleOrderPlaced = async (newOrder: Order) => {
    // 1. Add order to state & cloud
    setOrders((prev) => prev.some(o => o.id === newOrder.id) ? prev : [newOrder, ...prev]);
    await syncCreateOrder(newOrder);

    // 2. Reduce products stock in state & cloud
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((it) => it.product.id === p.id);
        if (orderedItem) {
          const nextStock = Math.max(0, p.stock - orderedItem.quantity);
          // syncReduceStock(p.id, nextStock); // Removing this synchronous call, we will do it after state update
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    // 3. Clear Cart & Mark Coupon as Used in state & cloud
    if (appliedPromo) {
      const cleanPromo = appliedPromo.trim().toUpperCase();
      setSettings((prev) => {
        const updatedCoupons = (prev.coupons || []).map((cp) => {
          if (cp.code.toUpperCase() === cleanPromo) {
            return {
              ...cp,
              isUsed: true,
              usedAt: new Date().toISOString(),
              usedInOrderNumber: newOrder.orderNumber
            };
          }
          return cp;
        });
        const updatedSettings = { ...prev, coupons: updatedCoupons };
        saveStoredSettings(updatedSettings);
        syncSaveStoreSettings(updatedSettings);
        return updatedSettings;
      });
    }

    setCart([]);
    setCartDiscount(0);
    setAppliedPromo('');

    // 4. Save Notification in stored history for the administrative records
    const notif: OrderNotification = {
      id: `notif-${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      total: newOrder.total,
      itemCount: newOrder.items.reduce((s, i) => s + i.quantity, 0),
      timestamp: new Date().toISOString(),
      read: false
    };

    saveStoredNotifications([notif, ...getStoredNotifications()]);
    // NOTE: We do NOT trigger any toast, sound chime or push notification here in the checkout window.
    // That guarantees the customer storefront remains quiet and uninterrupted.
    // The alert is received live via Firestore by any admin device (phone or PC).
  };

  const handleOpenTracking = (code?: string) => {
    if (code) {
      setTrackedOrderCode(code);
    } else {
      const stored = getLastTrackedCode();
      if (stored) {
        setTrackedOrderCode(stored);
      } else if (orders.length > 0) {
        setTrackedOrderCode(orders[0].orderNumber);
      }
    }
    setTrackingModalOpen(true);
  };

  // Admin Management Handlers
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const updated = exists 
        ? prev.map((p) => (p.id === product.id ? product : p))
        : [product, ...prev];
      saveStoredProducts(updated);
      return updated;
    });
    syncSaveProduct(product);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveStoredProducts(updated);
      return updated;
    });
    syncDeleteProduct(productId);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p));
      saveStoredProducts(updated);
      return updated;
    });
    syncReduceStock(productId, newStock);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden de forma permanente?')) {
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== orderId);
        saveStoredOrders(updated);
        return updated;
      });
      syncDeleteOrder(orderId);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      saveStoredOrders(updated);
      return updated;
    });
    syncUpdateOrderStatus(orderId, status);
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    syncSaveStoreSettings(newSettings);
  };

  const handleLoginAdminSuccess = () => {
    setAdminAuthenticated(true);
    setIsAdminLoggedIn(true);
    setAdminLoginModalOpen(false);
    setViewMode('admin');
  };

  const handleLogoutAdmin = () => {
    clearAdminAuthenticated();
    setIsAdminLoggedIn(false);
    setViewMode('store');
  };

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    (settings.categories || []).forEach(cat => {
      const catProducts = products.filter(p => p.category === cat);
      if (catProducts.length > 0) {
        grouped[cat] = catProducts;
      }
    });
    // Add any products that belong to categories not in settings
    products.forEach(p => {
      if (!grouped[p.category] && (settings.categories || []).indexOf(p.category) === -1) {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p);
      }
    });
    return grouped;
  }, [products, settings.categories]);

  const isHomeView = 
    selectedCategory === 'all' && 
    selectedTechType === 'all' && 
    !searchQuery && 
    !filters.onSaleOnly && 
    filters.selectedSizes.length === 0 && 
    filters.selectedColors.length === 0 && 
    filters.selectedBrands.length === 0;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-zinc-900 flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* If in Dedicated Admin / ERP Subdomain Mode */}
      {viewMode === 'admin' ? (
        isAdminLoggedIn ? (
          <AdminLayout
            products={products}
            orders={orders}
            settings={settings}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSaveSettings={handleSaveSettings}
            onExitAdmin={() => setViewMode('store')}
            onLogoutAdmin={handleLogoutAdmin}
            onPreviewTracking={(code) => handleOpenTracking(code)}
            initialTab={adminActiveTab}
            onTabChange={setAdminActiveTab}
          />
        ) : (
          <AdminPortalLogin
            settings={settings}
            onSuccess={handleLoginAdminSuccess}
            onGoToStore={() => setViewMode('store')}
          />
        )
      ) : (
        /* Public Storefront View (100% Client-Facing, No Admin Buttons) */
        <>
          {/* Header */}
          <Header
            settings={settings}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCart={() => setCartDrawerOpen(true)}
            isAdmin={isAdminLoggedIn}
            showAdminButton={false}
            currentCategory={selectedCategory}
            currentTechType={selectedTechType}
            onOpenAdminAuth={() => setAdminLoginModalOpen(true)}
            onOpenAdminPanel={() => setViewMode('admin')}
            onOpenAdmin={() => {
              if (isAdminLoggedIn) {
                setViewMode('admin');
              } else {
                setAdminLoginModalOpen(true);
              }
            }}
            onSelectCategoryFilter={(cat, gen) => {
              setSelectedCategory(cat);
              setSelectedTechType(gen);
              if (cat === 'all' && gen === 'all') {
                setFilters(INITIAL_FILTERS);
                setSearchQuery('');
              }
              setCurrentPage(1);
            }}
            onSelectSpecialFilter={(type) => {
              if (type === 'nuevo') {
                setSelectedCategory('all');
                setSelectedTechType('all');
                setFilters((prev) => ({ ...prev, onSaleOnly: false }));
                setCurrentPage(1);
              } else if (type === 'sale') {
                setFilters((prev) => ({ ...prev, onSaleOnly: true }));
                setCurrentPage(1);
              }
            }}
            onOpenTracking={() => handleOpenTracking()}
            cartBounceTrigger={cartBounceTrigger}
          />

          <Banner settings={settings} />

          {/* Bloques de Categorías (Visibles en Vista General / Home) */}
          {isHomeView && (
            <CategoryCardsSection
              products={products}
              settings={settings}
              onSelectCategory={(cat, tech) => {
                setSelectedCategory(cat);
                setSelectedTechType(tech);
                setCurrentPage(1);
              }}
            />
          )}

          {/* Main Catalog Grid */}
          <main ref={productsSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            
            {/* Dynamic Category & Gender Filter Bar matching Yolu Screenshots 5 & 6 */}
            <CategoryFilterBar
              currentCategory={selectedCategory}
              selectedCategory={selectedCategory}
              currentTechType={selectedTechType}
              selectedTechType={selectedTechType}
              onSelect={(cat, gen) => {
                setSelectedCategory(cat);
                setSelectedTechType(gen);
                setCurrentPage(1);
              }}
              onSelectCategory={(c) => {
                setSelectedCategory(c);
                setCurrentPage(1);
              }}
              onSelectGender={(g) => {
                setSelectedTechType(g);
                setCurrentPage(1);
              }}
              onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
              onOpenFilters={() => setFilterDrawerOpen(true)}
              activeFilterCount={
                filters.selectedSizes.length +
                filters.selectedColors.length +
                filters.selectedBrands.length +
                (filters.onSaleOnly ? 1 : 0) +
                (filters.inStockOnly ? 1 : 0)
              }
              activeFiltersCount={
                filters.selectedSizes.length +
                filters.selectedColors.length +
                filters.selectedBrands.length +
                (filters.onSaleOnly ? 1 : 0) +
                (filters.inStockOnly ? 1 : 0)
              }
              totalProductsCount={filteredProducts.length}
              sortBy={filters.sortBy}
              onSortChange={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort }))}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(sz) => {
                setItemsPerPage(sz);
                setCurrentPage(1);
              }}
              startIndex={startIndex}
              endIndex={endIndex}
            />

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-zinc-200 shadow-xs p-8 space-y-4 max-w-md mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-black uppercase">No encontramos productos coincidentes</h3>
                <p className="text-xs text-zinc-500">
                  Intenta cambiar las categorías, filtros o términos de búsqueda seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTechType('all');
                    setSearchQuery('');
                    setFilters(INITIAL_FILTERS);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Ver Catálogo Completo
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedProducts.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      settings={settings}
                      onOpenDetails={(p) => setSelectedProduct(p || product)}
                      onOpenDetail={(p) => setSelectedProduct(p || product)}
                      onQuickAddToCart={(p) => {
                        const target = p || product;
                        handleAddToCart(target, target.sizes[0], target.colors[0], 1);
                      }}
                      onAddToCart={(size, color) => handleAddToCart(product, size, color, 1)}
                    />
                  ))}
                </div>

                {/* Product Pagination Bar matching Screenshot 6 */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left: Summary */}
                    <div className="text-xs text-zinc-500 text-center sm:text-left font-normal">
                      Mostrando {startIndex + 1}–{endIndex} de {totalProducts} productos
                    </div>

                    {/* Center: Sleek Numeric Page Buttons */}
                    <div className="flex items-center gap-2 justify-center">
                      {/* Previous Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage <= 1}
                        className="w-8 h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const isActive = pageNum === safeCurrentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isActive
                                ? 'bg-black text-white shadow-xs font-black'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage >= totalPages}
                        className="w-8 h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Right: Items per page */}
                    <div className="text-xs text-zinc-400">
                      Página {safeCurrentPage} de {totalPages}
                    </div>

                  </div>
                )}
              </>
            )}

          </main>
          {/* Official Brands Gliding Runway - Positioned after the entire product catalog, before footer */}
          <ProductImagesStrip
            settings={settings}
          />

          {/* Minimalist Store Footer matching Yolu */}
          <footer className="bg-white border-t border-zinc-200 text-zinc-600 text-xs mt-12 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Brand Logo & Slogan */}
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.storeName}
                      className="h-8 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl font-black tracking-tight text-black uppercase font-sans">
                      {settings.storeName || 'MQ3D'}
                    </span>
                  )}
                  <span className="hidden sm:inline text-zinc-300">|</span>
                  <p className="text-xs text-zinc-500 font-medium">
                    {settings.slogan || 'Líderes en Fabricación Digital'}
                  </p>
                </div>

                {/* Quick Utility Links */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-700">
                  <button
                    onClick={() => handleOpenTracking()}
                    className="hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                    id="btn-footer-tracking"
                  >
                    <Truck className="w-4 h-4 text-zinc-500" />
                    <span>Rastrear mi Pedido</span>
                  </button>
                  
                  <span className="text-zinc-300">•</span>

                  <a
                    href={`https://wa.me/${(settings.whatsappNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${settings.storeName}! Quisiera consultar sobre sus productos.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer text-emerald-700"
                    id="link-footer-whatsapp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp: {settings.whatsappDisplayNumber || settings.whatsappNumber}</span>
                  </a>

                  <span className="text-zinc-300">•</span>

                  <button
                    onClick={() => setViewMode('admin')}
                    className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
                    title="Acceso al Subdominio / Sistema ERP de Administración"
                    id="btn-footer-admin-portal"
                  >
                    Acceso ERP
                  </button>
                </div>

              </div>

              {/* Copyright & Disclaimer */}
              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 text-center sm:text-left">
                <p>© {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados. Expertos en tecnología 3D y láser.</p>
                <p>Envíos a todo el Perú • Asesoría Especializada • Soporte Técnico</p>
              </div>
            </div>
          </footer>

          {/* Floating WhatsApp Widget */}
          <FloatingWhatsApp settings={settings} />

          {/* Product Detail Modal */}
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            settings={settings}
            recommendedProducts={products}
            onOpenProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(product, size, color, quantity) => {
              handleAddToCart(product, size, color, quantity);
              setSelectedProduct(null);
            }}
          />

          {/* Advanced Filter Drawer */}
          <FilterDrawer
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            filters={filters}
            onUpdateFilters={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
            onResetFilters={() => setFilters(INITIAL_FILTERS)}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            availableColors={availableColors}
            settings={settings}
            totalFilteredCount={filteredProducts.length}
          />

          {/* Shopping Cart Drawer */}
          <CartDrawer
            isOpen={cartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenCheckout={(disc, promo) => {
              setCartDiscount(disc);
              setAppliedPromo(promo);
              setCartDrawerOpen(false);
              setCheckoutModalOpen(true);
            }}
            onCheckout={() => {
              setCartDrawerOpen(false);
              setCheckoutModalOpen(true);
            }}
            settings={settings}
          />

          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={checkoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            cart={cart}
            discount={cartDiscount}
            promoCode={appliedPromo}
            settings={settings}
            onOrderPlaced={handleOrderPlaced}
            onOpenTracking={(code) => handleOpenTracking(code)}
          />

          {/* Admin Login Modal */}
          <AdminLoginModal
            isOpen={adminLoginModalOpen}
            onClose={() => setAdminLoginModalOpen(false)}
            onSuccess={handleLoginAdminSuccess}
            settings={settings}
          />
        </>
      )}

      {/* Real-time Order Notification Toast: Exclusively visible to the administrator when inside the admin panel */}
      {viewMode === 'admin' && isAdminLoggedIn && (
        <NotificationToast
          notification={activeToast}
          onClose={() => setActiveToast(null)}
          settings={settings}
          onViewOrder={() => {
            setViewMode('admin');
            setAdminActiveTab('orders');
          }}
        />
      )}

      {/* Order Tracking Live Modal (Accessible globally in store & admin) */}
      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        orders={orders}
        initialOrderCode={trackedOrderCode}
        settings={settings}
      />

      {/* Order Validation Modal (from Receipt QR) */}
      <OrderValidationModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        orders={orders}
        receiptOrderCode={receiptOrderCode}
        settings={settings}
      />

    </div>
  );
}
