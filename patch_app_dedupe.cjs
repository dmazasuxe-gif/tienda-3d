const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /setOrders\(\(prev\) => \[newOrder, \.\.\.prev\]\);/,
  `setOrders((prev) => prev.some(o => o.id === newOrder.id) ? prev : [newOrder, ...prev]);`
);

fs.writeFileSync('src/App.tsx', code);
