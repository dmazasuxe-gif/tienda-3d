import { jsPDF } from 'jspdf';
import { Order, Product, StoreSettings } from '../types';

export const generateMonthlyPdfReport = (
  orders: Order[],
  products: Product[],
  settings: StoreSettings,
  monthYearString: string
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Accent Line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 39, pageWidth, 2, 'F');

  // Store Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(settings.storeName, 14, 16);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`REPORTE EJECUTIVO DE VENTAS E INGRESOS MENSUALES`, 14, 24);
  doc.text(`Período: ${monthYearString} | Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 31);

  // Right-aligned Store Contact Info
  doc.setFontSize(9);
  doc.text(`WhatsApp: ${settings.whatsappDisplayNumber}`, pageWidth - 14, 16, { align: 'right' });
  doc.text(`Moneda: ${settings.currencyCode} (${settings.currencySymbol})`, pageWidth - 14, 23, { align: 'right' });
  doc.text(`Email: ${settings.adminEmail}`, pageWidth - 14, 30, { align: 'right' });

  y = 50;

  // Financial Metrics Cards
  const validOrders = orders.filter(o => o.status !== 'cancelado');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'entregado').length;
  const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const totalItemsSold = validOrders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  // 3 Metric Boxes
  const boxWidth = (pageWidth - 28 - 8) / 3;
  
  // Card 1: Total Ingresos
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, boxWidth, 24, 2, 2, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL INGRESOS', 18, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text(`${settings.currencySymbol} ${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18, y + 17);

  // Card 2: Total Órdenes
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxWidth + 4, y, boxWidth, 24, 2, 2, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TOTAL DE ÓRDENES', 18 + boxWidth + 4, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text(`${totalOrders} pedidos (${completedOrders} entregados)`, 18 + boxWidth + 4, y + 17);

  // Card 3: Ticket Promedio
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxWidth + 4) * 2, y, boxWidth, 24, 2, 2, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TICKET PROMEDIO', 18 + (boxWidth + 4) * 2, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text(`${settings.currencySymbol} ${avgTicket.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18 + (boxWidth + 4) * 2, y + 17);

  y += 32;

  // Section: Historial Detallado de Órdenes
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Historial de Órdenes del Mes', 14, y);
  y += 5;

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEN', 17, y + 5.5);
  doc.text('FECHA', 40, y + 5.5);
  doc.text('CLIENTE', 65, y + 5.5);
  doc.text('CIUDAD', 115, y + 5.5);
  doc.text('ESTADO', 145, y + 5.5);
  doc.text('TOTAL', pageWidth - 18, y + 5.5, { align: 'right' });
  y += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  orders.slice(0, 12).forEach((order, index) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }
    
    doc.setTextColor(15, 23, 42);
    doc.text(`#${order.orderNumber}`, 17, y + 5);
    doc.text(new Date(order.createdAt).toLocaleDateString('es-ES'), 40, y + 5);
    doc.text(order.customerName.substring(0, 26), 65, y + 5);
    doc.text(order.city, 115, y + 5);
    
    // Status text
    doc.text(order.status.toUpperCase(), 145, y + 5);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(`${settings.currencySymbol} ${order.total.toFixed(2)}`, pageWidth - 18, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  y += 8;

  // Section 2: Resumen de Inventario y Stock Crítico
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Resumen de Inventario & Alertas de Stock', 14, y);
  y += 5;

  const lowStockProds = products.filter(p => p.stock <= p.lowStockThreshold);
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total de catálogo: ${products.length} modelos | Unidades en almacén: ${totalStockUnits} uds | Alertas de Stock Bajo: ${lowStockProds.length} productos`, 14, y);
  y += 6;

  // Table for low stock products
  if (lowStockProds.length > 0) {
    doc.setFillColor(239, 68, 68); // Red
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ALERTA: PRODUCTOS CON STOCK CRÍTICO / AGOTÁNDOSE', 17, y + 5);
    y += 7;

    lowStockProds.forEach((prod, i) => {
      doc.setFillColor(i % 2 === 0 ? 254 : 255, i % 2 === 0 ? 242 : 255, i % 2 === 0 ? 242 : 255);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${prod.sku}] ${prod.name}`, 17, y + 4.5);
      doc.text(`Stock actual: ${prod.stock} unidades (Mínimo: ${prod.lowStockThreshold})`, 120, y + 4.5);
      doc.text(`${settings.currencySymbol} ${prod.price.toFixed(2)}`, pageWidth - 18, y + 4.5, { align: 'right' });
      y += 6.5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 287, pageWidth, 10, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${settings.storeName} - Sistema de Administración y Ventas`, 14, 293);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, 293, { align: 'right' });
  }

  // Download PDF
  const filename = `Reporte_Mensual_Ventas_${monthYearString.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
