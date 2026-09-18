import { Product, ProductColor, CartItem, StoreSettings, Order } from '../types';

export const cleanPhoneForUrl = (phone: string): string => {
  // Remove spaces, dashes, parentheses and +
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Creates WhatsApp URL for consulting about a specific product with selected variants
 */
export const getProductWhatsAppUrl = (
  settings: StoreSettings,
  product: Product,
  selectedSize?: string,
  selectedColor?: ProductColor
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const colorText = selectedColor && selectedColor.name !== 'Único' ? `\n🎨 *Color:* ${selectedColor.name}` : '';
  const priceText = `${settings.currencySymbol} ${product.price.toFixed(2)}`;

  const message = `👋 ¡Hola ${settings.whatsappAdvisorName || 'Asesor'}! 

Me interesa consultar disponibilidad y detalles de este producto de *${settings.storeName}*:

🛍️ *Producto:* ${product.name}
🏷️ *Código/SKU:* ${product.sku}
💰 *Precio:* ${priceText}
🏢 *Marca:* ${product.brand}
📂 *Categoría:* ${product.category.toUpperCase()} (${product.techType.toUpperCase()})${colorText}

❓ *Consulta:* Quisiera saber tiempos de entrega y si tienen stock disponible para coordinar mi compra. ¡Muchas gracias!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * General store support chat URL
 */
export const getGeneralSupportWhatsAppUrl = (settings: StoreSettings, customGreeting?: string): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const message = customGreeting || `👋 ¡Hola ${settings.whatsappAdvisorName || 'Asesor'}! Estoy visitando la tienda virtual de *${settings.storeName}* y quisiera hacer una consulta sobre los productos y envíos.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const getContraEntregaWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return `   ${index + 1}. *${item.product.name}* (Cant: ${item.quantity})
      ▫️ Color: ${item.selectedColor.name}
      ▫️ Marca: ${item.product.brand} | Precio: ${settings.currencySymbol} ${(item.product.price * item.quantity).toFixed(2)}`;
  }).join('\n');

  const message = `👋 ¡Hola *${settings.storeName}*!
Deseo comprar este pedido y solicitar *PAGO CONTRA ENTREGA* 📦💵 (Pago en efectivo o Yape al recibir).

📋 *DATOS DE LA ORDEN:*
▫️ *N° de Pedido:* #${order.orderNumber}
▫️ *Cliente:* ${order.customerName}
▫️ *Teléfono/WhatsApp:* ${order.customerPhone}
📍 *DIRECCIÓN DE ENTREGA:*
▫️ *Ubicación:* ${order.shippingAddress}, ${order.city} (Moyobamba)
🛒 *DETALLES DEL PRODUCTO / PEDIDO:*
${itemsList}

💰 *TOTAL A PAGAR AL RECIBIR EL PAQUETE:*
▫️ Subtotal: ${settings.currencySymbol} ${order.subtotal.toFixed(2)}
▫️ Envío: ${order.shippingCost === 0 ? 'GRATIS 🎉' : `${settings.currencySymbol} ${order.shippingCost.toFixed(2)}`}
🏷️ *MONTO TOTAL EXACTO:* *${settings.currencySymbol} ${order.total.toFixed(2)}*

Por favor, me confirman el envío de mi pedido. ¡Gracias!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const getYapeProofWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return `   ${index + 1}. *${item.product.name}* (${item.quantity}x)`;
  }).join('\n');

  const message = `👋 ¡Hola *${settings.storeName}*!
Acabo de realizar el pago mediante *YAPE / PLIN* 📱💸 de mi pedido *#${order.orderNumber}*.

📋 *Código de Rastreo:* ${order.orderNumber}
👤 *Cliente:* ${order.customerName}
📱 *Teléfono:* ${order.customerPhone}
📍 *Destino:* ${order.shippingAddress}, ${order.city} (Moyobamba)
💵 *Monto Pagado:* *${settings.currencySymbol} ${order.total.toFixed(2)}*
🛒 *Productos:*
${itemsList}

📸 *Adjunto a este chat la captura de pantalla / comprobante del Yape/Plin.*
Por favor, me confirman el envío de mi pedido. ¡Gracias!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const getBankTransferProofWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return `   ${index + 1}. *${item.product.name}* (${item.quantity}x)`;
  }).join('\n');

  const message = `👋 ¡Hola *${settings.storeName}*!
Acabo de realizar la *TRANSFERENCIA BANCARIA* 🏦📄 de mi pedido *#${order.orderNumber}*.

📋 *Código de Rastreo:* ${order.orderNumber}
👤 *Cliente:* ${order.customerName}
📱 *Teléfono:* ${order.customerPhone}
📍 *Destino:* ${order.shippingAddress}, ${order.city} (Moyobamba)
💵 *Monto Transferido:* *${settings.currencySymbol} ${order.total.toFixed(2)}*
🛒 *Productos:*
${itemsList}

📸 *Adjunto en este mensaje la foto / voucher de la transferencia bancaria.*
Por favor, me confirman el envío de mi pedido. ¡Gracias!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * Order checkout submission via WhatsApp
 */
export const getOrderWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  if (order.paymentMethod === 'contra_entrega') {
    return getContraEntregaWhatsAppUrl(settings, order);
  }
  if (order.paymentMethod === 'yape_plin') {
    return getYapeProofWhatsAppUrl(settings, order);
  }
  if (order.paymentMethod === 'transferencia') {
    return getBankTransferProofWhatsAppUrl(settings, order);
  }
  
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return `${index + 1}. *${item.product.name}* (${item.quantity}x)\n   - Color: ${item.selectedColor.name}\n   - Precio: ${settings.currencySymbol} ${(item.product.price * item.quantity).toFixed(2)}`;
  }).join('\n\n');

  const message = `✨ *NUEVO PEDIDO REALIZADO - ${settings.storeName}* ✨

📋 *Orden / Código de Rastreo:* #${order.orderNumber}
👤 *Cliente:* ${order.customerName}
📱 *Teléfono:* ${order.customerPhone}
📍 *Dirección de Entrega:* ${order.shippingAddress}, ${order.city} (Moyobamba)
${order.notes ? `📝 *Notas:* ${order.notes}\n` : ''}🛒 *DETALLE DE PRODUCTOS:*
${itemsList}

💵 *RESUMEN DE PAGO:*
- Subtotal: ${settings.currencySymbol} ${order.subtotal.toFixed(2)}
- Envío: ${order.shippingCost === 0 ? 'GRATIS 🎉' : `${settings.currencySymbol} ${order.shippingCost.toFixed(2)}`}
${order.discount > 0 ? `- Descuento: -${settings.currencySymbol} ${order.discount.toFixed(2)}\n` : ''}⭐ *TOTAL A PAGAR:* ${settings.currencySymbol} ${order.total.toFixed(2)}
💳 *Método preferido:* ${formatPaymentMethod(order.paymentMethod)}
Por favor, me confirman el envío de mi pedido. ¡Gracias!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * WhatsApp query about tracking an order from customer to store
 */
export const getCustomerTrackingWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  
  const message = `👋 ¡Hola *${settings.storeName}*!
Deseo hacer una consulta sobre el estado de mi envío:
🚚 *Código de Rastreo:* #${order.orderNumber}
👤 *Cliente:* ${order.customerName}
📍 *Destino:* ${order.shippingAddress}, ${order.city}
📦 *Estado actual:* ${formatStatus(order.status)}

¿Podrían brindarme información adicional sobre el despacho y hora aproximada de entrega? ¡Muchas gracias!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * WhatsApp chat directly with assigned delivery driver / courier
 */
export const getDriverWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const driverPhone = settings.driverWhatsapp && settings.driverWhatsapp.trim()
    ? cleanPhoneForUrl(settings.driverWhatsapp)
    : cleanPhoneForUrl(settings.whatsappNumber);
  const driverName = settings.driverName || 'Chofer de Reparto';
  
  const message = `👋 ¡Hola ${driverName}! Le escribo respecto a la entrega de mi pedido:
🚚 *Guía de Entrega:* #${order.orderNumber}
👤 *Cliente:* ${order.customerName}
📱 *Teléfono:* ${order.customerPhone}
📍 *Dirección de Destino:* ${order.shippingAddress}, ${order.city}
${order.notes ? `📝 *Referencia:* ${order.notes}\n` : ''}📦 *Estado:* ${formatStatus(order.status)}

¿A qué hora aproximadamente estará llegando a mi domicilio para recibir el paquete? ¡Muchas gracias!`;
  return `https://wa.me/${driverPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Admin sending WhatsApp message to customer regarding their order
 */
export const getAdminToCustomerWhatsAppUrl = (
  customerPhone: string,
  settings: StoreSettings,
  order: Order,
  customMsg?: string
): string => {
  const phone = cleanPhoneForUrl(customerPhone);
  const defaultMsg = `Hola ${order.customerName}, le saludamos de *${settings.storeName}* respecto a su orden *#${order.orderNumber}*. 
Estado actual: *${formatStatus(order.status).toUpperCase()}*. 
Total: *${settings.currencySymbol} ${order.total.toFixed(2)}*. 
¿En qué podemos asistirle hoy?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(customMsg || defaultMsg)}`;
};

export const formatPaymentMethod = (method: Order['paymentMethod']): string => {
  switch (method) {
    case 'whatsapp': return 'Coordinar por WhatsApp';
    case 'yape_plin': return 'Yape / Plin';
    case 'transferencia': return 'Transferencia Bancaria';
    case 'contra_entrega': return 'Pago Contra Entrega';
    case 'tarjeta': return 'Tarjeta Débito / Crédito';
    default: return 'WhatsApp';
  }
};

export const formatStatus = (status: Order['status']): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente de confirmación';
    case 'en_preparacion': return 'En preparación / empaque';
    case 'enviado': return 'En camino / Enviado';
    case 'entregado': return 'Entregado con éxito';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};
