import * as XLSX from 'xlsx';
import { Order, Product, StoreSettings } from '../types';
import { formatPaymentMethod, formatStatus } from './whatsapp';

export const exportMonthlySalesToExcel = (
  orders: Order[],
  products: Product[],
  settings: StoreSettings,
  monthYearString: string
): void => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: ÓRDENES Y VENTAS
  const ordersData = orders.map((order) => ({
    'N° Orden': `#${order.orderNumber}`,
    'Fecha y Hora': new Date(order.createdAt).toLocaleString('es-ES'),
    'Cliente': order.customerName,
    'Teléfono': order.customerPhone,
    'Email': order.customerEmail || 'N/A',
    'Dirección': order.shippingAddress,
    'Ciudad': order.city,
    'Cantidad Productos': order.items.reduce((s, i) => s + i.quantity, 0),
    'Subtotal': order.subtotal,
    'Costo Envío': order.shippingCost,
    'Descuento': order.discount,
    'Total': order.total,
    'Moneda': settings.currencyCode,
    'Método Pago': formatPaymentMethod(order.paymentMethod),
    'Estado': formatStatus(order.status),
    'Notas Cliente': order.notes || ''
  }));
  const wsOrders = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Ventas_Mensuales');

  // 2. Sheet: PRODUCTOS & INVENTARIO
  const productsData = products.map((prod) => ({
    'SKU': prod.sku,
    'Nombre': prod.name,
    'Categoría': prod.category.toUpperCase(),
    'Género': prod.techType.toUpperCase(),
    'Marca': prod.brand,
    'Precio Regular': prod.price,
    'Precio Original': prod.originalPrice || prod.price,
    'Stock Actual': prod.stock,
    'Alerta Stock Mínimo': prod.lowStockThreshold,
    'Estado Stock': prod.stock === 0 ? 'AGOTADO' : prod.stock <= prod.lowStockThreshold ? 'STOCK BAJO' : 'OK',
    'Tallas': prod.sizes.join(', '),
    'Colores': prod.colors.map(c => c.name).join(', '),
    'Fecha Creación': new Date(prod.createdAt).toLocaleDateString('es-ES')
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Inventario_Productos');

  // 3. Sheet: RESUMEN FINANCIERO
  const validOrders = orders.filter(o => o.status !== 'cancelado');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalItemsSold = validOrders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  const summaryData = [
    { 'Métrica': 'Período del Reporte', 'Valor': monthYearString },
    { 'Métrica': 'Tienda', 'Valor': settings.storeName },
    { 'Métrica': 'Moneda', 'Valor': `${settings.currencyCode} (${settings.currencySymbol})` },
    { 'Métrica': 'Total de Ingresos Brutos', 'Valor': totalRevenue },
    { 'Métrica': 'Total de Pedidos Registrados', 'Valor': orders.length },
    { 'Métrica': 'Pedidos Entregados/Efectivos', 'Valor': orders.filter(o => o.status === 'entregado').length },
    { 'Métrica': 'Unidades de Productos Vendidas', 'Valor': totalItemsSold },
    { 'Métrica': 'Ticket Promedio de Venta', 'Valor': avgTicket },
    { 'Métrica': 'Total Catálogo Activo', 'Valor': products.length },
    { 'Métrica': 'Productos en Alerta Stock Bajo', 'Valor': products.filter(p => p.stock <= p.lowStockThreshold).length }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen_Financiero');

  // Save Excel file
  const filename = `Reporte_Ventas_${settings.storeName.replace(/\s+/g, '_')}_${monthYearString.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};
