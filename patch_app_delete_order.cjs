const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /syncUpdateOrderStatus,/,
  `syncUpdateOrderStatus,\n  syncDeleteOrder,`
);

code = code.replace(
  /const handleUpdateOrderStatus = \(orderId: string, status: OrderStatus\) => \{/,
  `const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden de forma permanente?')) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      syncDeleteOrder(orderId);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {`
);

code = code.replace(
  /onUpdateOrderStatus=\{handleUpdateOrderStatus\}/,
  `onUpdateOrderStatus={handleUpdateOrderStatus}\n            onDeleteOrder={handleDeleteOrder}`
);

fs.writeFileSync('src/App.tsx', code);
