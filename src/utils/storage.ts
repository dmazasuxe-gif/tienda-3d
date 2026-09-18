import { Product, StoreSettings, Order, OrderNotification, CartItem, Coupon } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS, INITIAL_ORDERS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'aura_products_v2',
  SETTINGS: 'aura_settings_v2',
  ORDERS: 'aura_orders_v2',
  NOTIFICATIONS: 'aura_notifications_v2',
  CART: 'aura_cart_v2',
  FAVORITES: 'aura_favorites_v1',
  ADMIN_AUTH: 'aura_admin_auth_v1',
  LAST_TRACKED_CODE: 'aura_last_tracked_code_v1',
  COUPONS: 'aura_coupons_v1'
};

export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_STORE_SETTINGS));
      return INITIAL_STORE_SETTINGS;
    }
    const parsed = JSON.parse(data);
    return { 
      ...INITIAL_STORE_SETTINGS, 
      ...parsed,
      runwaySlides: (parsed.runwaySlides && Array.isArray(parsed.runwaySlides) && parsed.runwaySlides.length > 0)
        ? parsed.runwaySlides
        : INITIAL_STORE_SETTINGS.runwaySlides,
      brands: (parsed.brands && Array.isArray(parsed.brands) && parsed.brands.length > 0)
        ? parsed.brands
        : INITIAL_STORE_SETTINGS.brands,
      shippingOptions: (parsed.shippingOptions && Array.isArray(parsed.shippingOptions) && parsed.shippingOptions.length > 0)
        ? parsed.shippingOptions
        : INITIAL_STORE_SETTINGS.shippingOptions,
      coupons: (parsed.coupons && Array.isArray(parsed.coupons) && parsed.coupons.length > 0)
        ? parsed.coupons
        : INITIAL_STORE_SETTINGS.coupons,
      categories: (parsed.categories && Array.isArray(parsed.categories) && parsed.categories.length > 0)
        ? parsed.categories
        : INITIAL_STORE_SETTINGS.categories
    };
  } catch {
    return INITIAL_STORE_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
};

export const getStoredNotifications = (): OrderNotification[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      const initialNotifs: OrderNotification[] = [
        {
          id: 'notif-1',
          orderId: 'ord-104',
          orderNumber: 'AUR-8945',
          customerName: 'Fiorella Castro Montes',
          total: 417,
          itemCount: 3,
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
      return initialNotifs;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (notifs: OrderNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

export const getStoredFavorites = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredFavorites = (favs: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
};

export const isAdminAuthenticated = (): boolean => {
  try {
    return (
      sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true' ||
      localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true'
    );
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (auth: boolean): void => {
  try {
    if (auth) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  } catch (e) {
    console.warn('Admin auth storage warning:', e);
  }
  window.dispatchEvent(new Event('aura_auth_updated'));
};

export const clearAdminAuthenticated = (): void => {
  setAdminAuthenticated(false);
};

export const saveLastTrackedCode = (code: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TRACKED_CODE, code);
  } catch (e) {
    console.error('Error saving last tracked code:', e);
  }
};

export const getLastTrackedCode = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_TRACKED_CODE) || '';
  } catch {
    return '';
  }
};

// Cupones de Sorteo / Descuento (Válidos solo una sola vez)
export const getStoredCoupons = (): Coupon[] => {
  try {
    const settings = getStoredSettings();
    if (settings.coupons && Array.isArray(settings.coupons)) {
      return settings.coupons;
    }
    return INITIAL_STORE_SETTINGS.coupons || [];
  } catch {
    return INITIAL_STORE_SETTINGS.coupons || [];
  }
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  try {
    const settings = getStoredSettings();
    const updatedSettings: StoreSettings = {
      ...settings,
      coupons
    };
    saveStoredSettings(updatedSettings);
  } catch (e) {
    console.error('Error saving coupons:', e);
  }
};

export const markCouponAsUsed = (code: string, orderNumber: string): boolean => {
  try {
    const coupons = getStoredCoupons();
    const cleanCode = code.trim().toUpperCase();
    let marked = false;

    const updated = coupons.map((c) => {
      if (c.code.toUpperCase() === cleanCode && !c.isUsed) {
        marked = true;
        return {
          ...c,
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedInOrderNumber: orderNumber
        };
      }
      return c;
    });

    if (marked) {
      saveStoredCoupons(updated);
    }
    return marked;
  } catch (e) {
    console.error('Error marking coupon as used:', e);
    return false;
  }
};

