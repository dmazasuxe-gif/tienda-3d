const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /sendPushNotification\(\s*`🛍️ Nuevo Pedido #\$\{latestNewOrder\.orderNumber\}`,\s*`\$\{latestNewOrder\.customerName\} ha ordenado \$\{notif\.itemCount\} productos por \$\{currentSettings\.currencySymbol\} \$\{latestNewOrder\.total\.toFixed\(2\)\}`\s*\);/,
  `sendPushNotification(
                \`🛍️ NUEVO PEDIDO\`,
                \`\${latestNewOrder.customerName} ha comprado \${latestNewOrder.items.map(item => item.product.name).join(', ')} por \${currentSettings.currencySymbol} \${latestNewOrder.total.toFixed(2)}\`
              );`
);

code = code.replace(
  /sendPushNotification\(\s*`🛍️ Nuevo Pedido #\$\{newOrder\.orderNumber\}`,\s*`\$\{newOrder\.customerName\} ha ordenado \$\{notif\.itemCount\} productos por \$\{settings\.currencySymbol\} \$\{newOrder\.total\.toFixed\(2\)\}`\s*\);/,
  `sendPushNotification(
          \`🛍️ NUEVO PEDIDO\`,
          \`\${newOrder.customerName} ha comprado \${newOrder.items.map(item => item.product.name).join(', ')} por \${settings.currencySymbol} \${newOrder.total.toFixed(2)}\`
        );`
);

fs.writeFileSync('src/App.tsx', code);
