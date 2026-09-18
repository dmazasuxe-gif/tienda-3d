import { supabase } from './supabase';
import { Product, Order, StoreSettings } from '../types';

// Tablas en Supabase
const PRODUCTS_TABLE = 'products';
const ORDERS_TABLE = 'orders';
const SETTINGS_TABLE = 'store_settings';

/**
 * Suscripción en tiempo real a Productos
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  initialFallback: Product[]
): () => void {
  const fetchProducts = async () => {
    const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*');
    if (error) {
      console.warn('[Supabase] Products fetch error, using local data:', error);
      onUpdate(initialFallback);
      return;
    }
    onUpdate(data as Product[]);
  };

  fetchProducts();

  const channel = supabase
    .channel('public:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: PRODUCTS_TABLE }, () => {
      fetchProducts();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Suscripción en tiempo real a Órdenes
 */
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  initialFallback: Order[]
): () => void {
  const fetchOrders = async () => {
    const { data, error } = await supabase.from(ORDERS_TABLE).select('*').order('createdAt', { ascending: false });
    if (error) {
      console.warn('[Supabase] Orders fetch error, using local data:', error);
      onUpdate(initialFallback);
      return;
    }
    onUpdate(data as Order[]);
  };

  fetchOrders();

  const channel = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: ORDERS_TABLE }, () => {
      fetchOrders();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Suscripción en tiempo real a Ajustes de la Tienda
 */
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  initialFallback: StoreSettings
): () => void {
  const fetchSettings = async () => {
    const { data, error } = await supabase.from(SETTINGS_TABLE).select('*').eq('id', 'general').single();
    if (error) {
      if (error.code === 'PGRST116') {
        // No existe, crear inicial
        try {
          await supabase.from(SETTINGS_TABLE).insert({ id: 'general', ...initialFallback });
          onUpdate(initialFallback);
        } catch (err) {
          console.warn('[Supabase] Error creating initial settings:', err);
          onUpdate(initialFallback);
        }
      } else {
        console.warn('[Supabase] Settings fetch error, using local data:', error);
        onUpdate(initialFallback);
      }
      return;
    }
    
    // Unir configuraciones
    const mergedSettings: StoreSettings = {
      ...initialFallback,
      ...data,
      runwaySlides: (data.runwaySlides && Array.isArray(data.runwaySlides) && data.runwaySlides.length > 0)
        ? data.runwaySlides
        : (initialFallback.runwaySlides || []),
      brands: (data.brands && Array.isArray(data.brands) && data.brands.length > 0)
        ? data.brands
        : (initialFallback.brands || []),
      shippingOptions: (data.shippingOptions && Array.isArray(data.shippingOptions) && data.shippingOptions.length > 0)
        ? data.shippingOptions
        : (initialFallback.shippingOptions || []),
      coupons: (data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0)
        ? data.coupons
        : (initialFallback.coupons || []),
    };
    onUpdate(mergedSettings);
  };

  fetchSettings();

  const channel = supabase
    .channel('public:store_settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: SETTINGS_TABLE }, () => {
      fetchSettings();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Operaciones CRUD de Productos
 */
export async function syncSaveProduct(product: Product): Promise<void> {
  try {
    const { error } = await supabase.from(PRODUCTS_TABLE).upsert(product);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] Error saving product:', err);
  }
}

export async function syncDeleteProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', productId);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] Error deleting product:', err);
  }
}

export async function syncReduceStock(productId: string, quantityToDeduct: number): Promise<void> {
  try {
    const { data: product, error: fetchError } = await supabase.from(PRODUCTS_TABLE).select('stock').eq('id', productId).single();
    if (fetchError) throw fetchError;
    
    const newStock = Math.max(0, product.stock - quantityToDeduct);
    const { error: updateError } = await supabase.from(PRODUCTS_TABLE).update({ stock: newStock }).eq('id', productId);
    if (updateError) throw updateError;
  } catch (err) {
    console.warn('[Supabase] Error updating stock:', err);
  }
}

/**
 * Operaciones CRUD de Órdenes
 */
export async function syncCreateOrder(order: Order): Promise<void> {
  try {
    const { error } = await supabase.from(ORDERS_TABLE).insert(order);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] Error creating order:', err);
  }
}

export async function syncUpdateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const { error } = await supabase.from(ORDERS_TABLE).update({ 
      status,
      updatedAt: new Date().toISOString()
    }).eq('id', orderId);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] Error updating order status:', err);
  }
}

export async function syncDeleteOrder(orderId: string): Promise<void> {
  try {
    const { error } = await supabase.from(ORDERS_TABLE).delete().eq('id', orderId);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] Error deleting order:', err);
  }
}

/**
 * Operaciones CRUD de Ajustes
 */
export function cleanFirestoreData<T>(obj: T): T {
  // Para Supabase no es tan estricto como Firestore respecto a undefined (generalmente lo ignora o lo vuelve null)
  // Dejamos la función para no romper compatibilidad con llamadas existentes.
  return JSON.parse(JSON.stringify(obj));
}

export async function syncSaveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const cleaned = cleanFirestoreData(settings);
    const { error } = await supabase.from(SETTINGS_TABLE).upsert({ id: 'general', ...cleaned });
    if (error) throw error;
    console.log('[Supabase] Store settings successfully synced to cloud.');
  } catch (err) {
    console.warn('[Supabase] Error saving store settings:', err);
  }
}
