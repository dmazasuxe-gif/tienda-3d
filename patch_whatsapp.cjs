const fs = require('fs');
let code = fs.readFileSync('src/utils/whatsapp.ts', 'utf8');

// Function to generate variables for orders
const applyVars = `
const buildOrderVars = (settings: StoreSettings, order: Order, itemsList: string) => ({
  storeName: settings.storeName,
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail || '',
  address: \`\${order.shippingAddress}, \${order.city}\`,
  notes: order.notes || '',
  itemsList: itemsList,
  subtotal: order.subtotal.toFixed(2),
  shippingCost: order.shippingCost === 0 ? 'GRATIS' : order.shippingCost.toFixed(2),
  discount: order.discount.toFixed(2),
  total: order.total.toFixed(2),
  currencySymbol: settings.currencySymbol,
  paymentMethod: formatPaymentMethod(order.paymentMethod),
  status: formatStatus(order.status),
  driverName: settings.driverName || 'Chofer de Reparto',
});
`;

code = code.replace("const applyTemplate = (template: string, vars: Record<string, string>) => {", applyVars + "\nconst applyTemplate = (template: string, vars: Record<string, string>) => {");

// Now rewrite getContraEntregaWhatsAppUrl
code = code.replace(/export const getContraEntregaWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getContraEntregaWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return \`   \${index + 1}. *\${item.product.name}* (Cant: \${item.quantity})
      ▫️ Talla: \${item.selectedSize} | Color: \${item.selectedColor.name}
      ▫️ Marca: \${item.product.brand} | Precio: \${settings.currencySymbol} \${(item.product.price * item.quantity).toFixed(2)}\`;
  }).join('\\n');

  let message = '';
  if (settings.whatsappTemplates?.orderContraEntrega) {
    message = applyTemplate(settings.whatsappTemplates.orderContraEntrega, buildOrderVars(settings, order, itemsList));
  } else {
    message = \`👋 ¡Hola *\${settings.storeName}*!\\nDeseo comprar este pedido y solicitar *PAGO CONTRA ENTREGA* 📦💵 (Pago en efectivo o Yape al recibir).\\n\\n📋 *DATOS DE LA ORDEN:*\\n▫️ *N° de Pedido:* #\${order.orderNumber}\\n▫️ *Cliente:* \${order.customerName}\\n▫️ *Teléfono/WhatsApp:* \${order.customerPhone}\\n📍 *DIRECCIÓN DE ENTREGA:*\\n▫️ *Ubicación:* \${order.shippingAddress}, \${order.city}\\n🛒 *DETALLES DEL PRODUCTO / PEDIDO:*\\n\${itemsList}\\n\\n💰 *TOTAL A PAGAR AL RECIBIR EL PAQUETE:*\\n▫️ Subtotal: \${settings.currencySymbol} \${order.subtotal.toFixed(2)}\\n▫️ Envío: \${order.shippingCost === 0 ? 'GRATIS 🎉' : \`\${settings.currencySymbol} \${order.shippingCost.toFixed(2)}\`}\\n🏷️ *MONTO TOTAL EXACTO:* *\${settings.currencySymbol} \${order.total.toFixed(2)}*\\n\\n🚚 *SEGUIMIENTO EN VIVO:*\\nPuedo rastrear el avance de mi paquete en su web ingresando mi código: *\${order.orderNumber}*\\nPor favor confirmen la recepción de mi pedido.\`;
  }
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
};

`);

// Rewrite getYapeProofWhatsAppUrl
code = code.replace(/export const getYapeProofWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getYapeProofWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return \`   \${index + 1}. *\${item.product.name}* (\${item.quantity}x) - Talla \${item.selectedSize}\`;
  }).join('\\n');

  let message = '';
  if (settings.whatsappTemplates?.orderYapePlin) {
    message = applyTemplate(settings.whatsappTemplates.orderYapePlin, buildOrderVars(settings, order, itemsList));
  } else {
    message = \`👋 ¡Hola *\${settings.storeName}*!\\nAcabo de realizar el pago mediante *YAPE / PLIN* 📱💸 de mi pedido *#\${order.orderNumber}*.\\n\\n📋 *Código de Rastreo:* \${order.orderNumber}\\n👤 *Cliente:* \${order.customerName}\\n📱 *Teléfono:* \${order.customerPhone}\\n📍 *Destino:* \${order.shippingAddress}, \${order.city}\\n💵 *Monto Pagado:* *\${settings.currencySymbol} \${order.total.toFixed(2)}*\\n🛒 *Productos:*\\n\${itemsList}\\n\\n📸 *Adjunto a este chat la captura de pantalla / comprobante del Yape/Plin.*\\n🚚 *Rastreo:* Consultaré el avance de mi paquete en su web con el código *\${order.orderNumber}*.\\nPor favor confirmar la validación para proceder con el empaque y envío. ¡Gracias!\`;
  }
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
};

`);

// Rewrite getBankTransferProofWhatsAppUrl
code = code.replace(/export const getBankTransferProofWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getBankTransferProofWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  const itemsList = order.items.map((item, index) => {
    return \`   \${index + 1}. *\${item.product.name}* (\${item.quantity}x) - Talla \${item.selectedSize}\`;
  }).join('\\n');

  let message = '';
  if (settings.whatsappTemplates?.orderTransferencia) {
    message = applyTemplate(settings.whatsappTemplates.orderTransferencia, buildOrderVars(settings, order, itemsList));
  } else {
    message = \`👋 ¡Hola *\${settings.storeName}*!\\nAcabo de realizar la *TRANSFERENCIA BANCARIA* 🏦📄 de mi pedido *#\${order.orderNumber}*.\\n\\n📋 *Código de Rastreo:* \${order.orderNumber}\\n👤 *Cliente:* \${order.customerName}\\n📱 *Teléfono:* \${order.customerPhone}\\n📍 *Destino:* \${order.shippingAddress}, \${order.city}\\n💵 *Monto Transferido:* *\${settings.currencySymbol} \${order.total.toFixed(2)}*\\n🛒 *Productos:*\\n\${itemsList}\\n\\n📸 *Adjunto en este mensaje la foto / voucher de la transferencia bancaria.*\\n🚚 *Rastreo:* Consultaré el avance de mi paquete en su web con el código *\${order.orderNumber}*.\\nPor favor confirmar la recepción para iniciar el despacho de mi paquete. ¡Gracias!\`;
  }
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
};

`);

// Rewrite getOrderWhatsAppUrl
code = code.replace(/export const getOrderWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getOrderWhatsAppUrl = (
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
    return \`\${index + 1}. *\${item.product.name}* (\${item.quantity}x)\\n   - Talla: \${item.selectedSize} | Color: \${item.selectedColor.name}\\n   - Precio: \${settings.currencySymbol} \${(item.product.price * item.quantity).toFixed(2)}\`;
  }).join('\\n\\n');

  let message = '';
  if (settings.whatsappTemplates?.orderGeneric) {
    message = applyTemplate(settings.whatsappTemplates.orderGeneric, buildOrderVars(settings, order, itemsList));
  } else {
    message = \`✨ *NUEVO PEDIDO REALIZADO - \${settings.storeName}* ✨\\n\\n📋 *Orden / Código de Rastreo:* #\${order.orderNumber}\\n👤 *Cliente:* \${order.customerName}\\n📱 *Teléfono:* \${order.customerPhone}\\n📍 *Dirección de Entrega:* \${order.shippingAddress}, \${order.city}\\n\${order.notes ? \`📝 *Notas:* \${order.notes}\\n\` : ''}🛒 *DETALLE DE PRODUCTOS:*\\n\${itemsList}\\n\\n💵 *RESUMEN DE PAGO:*\\n- Subtotal: \${settings.currencySymbol} \${order.subtotal.toFixed(2)}\\n- Envío: \${order.shippingCost === 0 ? 'GRATIS 🎉' : \`\${settings.currencySymbol} \${order.shippingCost.toFixed(2)}\`}\\n\${order.discount > 0 ? \`- Descuento: -\${settings.currencySymbol} \${order.discount.toFixed(2)}\\n\` : ''}⭐ *TOTAL A PAGAR:* \${settings.currencySymbol} \${order.total.toFixed(2)}\\n💳 *Método preferido:* \${formatPaymentMethod(order.paymentMethod)}\\n🚚 *Seguimiento:* Rastrearé mi paquete en la web con el código *\${order.orderNumber}*.\\n¡Quedo atento a la confirmación y datos para coordinar el pago y envío!\`;
  }
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
};

`);

// Rewrite getCustomerTrackingWhatsAppUrl
code = code.replace(/export const getCustomerTrackingWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getCustomerTrackingWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const phone = cleanPhoneForUrl(settings.whatsappNumber);
  
  let message = '';
  if (settings.whatsappTemplates?.trackingQuery) {
    message = applyTemplate(settings.whatsappTemplates.trackingQuery, buildOrderVars(settings, order, ''));
  } else {
    message = \`👋 ¡Hola *\${settings.storeName}*!\\nDeseo hacer una consulta sobre el estado de mi envío:\\n🚚 *Código de Rastreo:* #\${order.orderNumber}\\n👤 *Cliente:* \${order.customerName}\\n📍 *Destino:* \${order.shippingAddress}, \${order.city}\\n📦 *Estado actual:* \${formatStatus(order.status)}\\n\\n¿Podrían brindarme información adicional sobre el despacho y hora aproximada de entrega? ¡Muchas gracias!\`;
  }
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
};

`);

// Rewrite getDriverWhatsAppUrl
code = code.replace(/export const getDriverWhatsAppUrl = \([\s\S]*?\n\};\n/, `export const getDriverWhatsAppUrl = (
  settings: StoreSettings,
  order: Order
): string => {
  const driverPhone = settings.driverWhatsapp && settings.driverWhatsapp.trim()
    ? cleanPhoneForUrl(settings.driverWhatsapp)
    : cleanPhoneForUrl(settings.whatsappNumber);
  const driverName = settings.driverName || 'Chofer de Reparto';
  
  let message = '';
  if (settings.whatsappTemplates?.driverContact) {
    message = applyTemplate(settings.whatsappTemplates.driverContact, buildOrderVars(settings, order, ''));
  } else {
    message = \`👋 ¡Hola \${driverName}! Le escribo respecto a la entrega de mi pedido:\\n🚚 *Guía de Entrega:* #\${order.orderNumber}\\n👤 *Cliente:* \${order.customerName}\\n📱 *Teléfono:* \${order.customerPhone}\\n📍 *Dirección de Destino:* \${order.shippingAddress}, \${order.city}\\n\${order.notes ? \`📝 *Referencia:* \${order.notes}\\n\` : ''}📦 *Estado:* \${formatStatus(order.status)}\\n\\n¿A qué hora aproximadamente estará llegando a mi domicilio para recibir el paquete? ¡Muchas gracias!\`;
  }
  return \`https://wa.me/\${driverPhone}?text=\${encodeURIComponent(message)}\`;
};

`);

fs.writeFileSync('src/utils/whatsapp.ts', code);
