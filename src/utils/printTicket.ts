import { Order, StoreSettings } from '../types';

export const printTicket = (order: Order, settings: StoreSettings) => {
  const rs = settings.receiptSettings;
  const isPrintEnabled = rs && (rs.ruc || rs.legalName || rs.address);

  if (!isPrintEnabled) {
    alert("Por favor, configure primero los datos de la boleta/ticket en 'Configuración Tienda & WhatsApp' -> 'Configuración de Boleta / Ticket de Impresora'.");
    return;
  }

  const date = new Date(order.createdAt).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Calculate totals
  const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);
  
  // Design settings
  const widthStr = rs?.paperWidth === '58mm' ? '200px' : '280px';
  
  let baseFontSize = '12px';
  let smallFontSize = '10px';
  let largeFontSize = '16px';
  
  if (rs?.fontSize === 'small') {
    baseFontSize = '10px'; smallFontSize = '9px'; largeFontSize = '14px';
  } else if (rs?.fontSize === 'large') {
    baseFontSize = '14px'; smallFontSize = '12px'; largeFontSize = '18px';
  }

  // Generate QR Code URL to the validation page
  const receiptUrl = `${window.location.origin}/?receipt=${order.orderNumber}`;
  const qrCodeImg = `https://quickchart.io/qr?text=${encodeURIComponent(receiptUrl)}&size=120&margin=1`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${order.orderNumber}</title>
      <style>
        /* CSS reset & base settings optimized for thermal printers */
        @page {
          margin: 0;
          size: auto;
        }
        body {
          margin: 0;
          padding: 8px;
          font-family: 'Courier New', Courier, monospace, sans-serif;
          font-size: ${baseFontSize};
          color: #000;
          background: #fff;
          width: ${widthStr};
          max-width: 100%;
          line-height: 1.2;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .text-sm { font-size: ${smallFontSize}; }
        .text-lg { font-size: ${largeFontSize}; font-weight: bold; }
        
        .header { margin-bottom: 15px; }
        .logo-img { max-width: 120px; max-height: 80px; margin: 0 auto 5px auto; display: block; filter: grayscale(100%); }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .divider-solid { border-top: 1px solid #000; margin: 10px 0; }
        
        .info-block p { margin: 3px 0; }
        
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 4px 2px; vertical-align: top; text-align: left; }
        th { border-bottom: 1px dashed #000; }
        
        .totals-table { margin-left: auto; width: 70%; }
        .totals-table td { padding: 3px 2px; }
        .total-row { font-size: calc(${baseFontSize} + 2px); font-weight: bold; border-top: 1px solid #000; }
        
        .footer { margin-top: 20px; font-size: ${smallFontSize}; }
        .qr-code { margin: 15px auto 5px; display: block; max-width: 120px; }
        
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header text-center">
        ${rs?.logoUrl ? `<img src="${rs.logoUrl}" class="logo-img" alt="Logo" />` : `<div class="text-lg uppercase">${rs?.legalName || settings.storeName}</div>`}
        ${rs?.legalName && rs.logoUrl ? `<div class="bold uppercase">${rs.legalName}</div>` : ''}
        ${rs?.ruc ? `<div>RUC: ${rs.ruc}</div>` : ''}
        ${rs?.address ? `<div class="text-sm">${rs.address}</div>` : ''}
        ${rs?.phone ? `<div class="text-sm">Telf: ${rs.phone}</div>` : ''}
      </div>
      
      <div class="divider"></div>
      
      <div class="info-block">
        <p><span class="bold">TICKET NO:</span> ${order.orderNumber}</p>
        <p><span class="bold">FECHA:</span> ${date}</p>
        ${rs?.showCustomerInfo !== false ? `<p><span class="bold">CLIENTE:</span> ${order.customerName}</p>` : ''}
        <p><span class="bold">MÉTODO:</span> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
      </div>

      <div class="divider"></div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 15%">CANT</th>
            <th style="width: 55%">DESCRIPCIÓN</th>
            <th style="width: 30%" class="text-right">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td class="text-center">${item.quantity}</td>
              <td>
                <div class="bold">${item.product.name}</div>
                <div class="text-sm">Talla: ${item.selectedSize} | Color: ${item.selectedColor.name}</div>
              </td>
              <td class="text-right">${settings.currencySymbol}${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="divider"></div>

      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">${settings.currencySymbol}${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Envío:</td>
          <td class="text-right">${settings.currencySymbol}${order.shippingCost.toFixed(2)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td>Descuento:</td>
          <td class="text-right">-${settings.currencySymbol}${order.discount.toFixed(2)}</td>
        </tr>` : ''}
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="text-right">${settings.currencySymbol}${order.total.toFixed(2)}</td>
        </tr>
      </table>

      ${rs?.showOrderNotes !== false && order.notes ? `
        <div class="divider"></div>
        <div class="info-block text-sm">
          <p><span class="bold">NOTAS:</span> ${order.notes}</p>
        </div>
      ` : ''}

      <div class="divider text-center" style="margin-bottom: 2px;">***</div>
      
      <div class="footer text-center">
        <p>Artículos totales: ${totalItems}</p>
        ${rs?.footerMessage ? `<p>${rs.footerMessage.replace(/\\n/g, '<br>')}</p>` : `<p>¡Gracias por su compra!</p>`}
        
        ${rs?.showQrCode !== false ? `
          <img src="${qrCodeImg}" class="qr-code" alt="QR Recibo Digital" />
          <p style="margin-top: 5px;">Escanea para ver tu boleta digital</p>
        ` : ''}
        
        <p class="text-sm" style="margin-top:15px; color: #555;">Documento sin valor fiscal</p>
      </div>
    </body>
    </html>
  `;

  // Use a hidden iframe to print without opening a new popup tab
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait a brief moment to ensure images load before calling print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Remove iframe after printing to clean up DOM
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  } else {
    document.body.removeChild(iframe);
    alert("No se pudo iniciar la impresión.");
  }
};
