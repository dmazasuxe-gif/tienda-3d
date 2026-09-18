const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/AdminLayout.tsx', 'utf8');

code = code.replace(
  /onUpdateOrderStatus: \(orderId: string, status: OrderStatus\) => void;/,
  `onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;`
);

code = code.replace(
  /onUpdateOrderStatus,\n  onSaveSettings,/,
  `onUpdateOrderStatus,\n  onDeleteOrder,\n  onSaveSettings,`
);

code = code.replace(
  /onUpdateOrderStatus=\{onUpdateOrderStatus\}\n            settings=\{settings\}/,
  `onUpdateOrderStatus={onUpdateOrderStatus}\n            onDeleteOrder={onDeleteOrder}\n            settings={settings}`
);

fs.writeFileSync('src/components/Admin/AdminLayout.tsx', code);
