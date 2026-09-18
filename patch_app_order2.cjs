const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleOrderPlaced = async \(newOrder: Order\) => \{[\s\S]*?\/\* 3\. Clear Cart & Mark Coupon as Used in state & cloud \*\//,
  `const handleOrderPlaced = async (newOrder: Order) => {
    // 1. Add order to state & cloud
    setOrders((prev) => [newOrder, ...prev]);
    await syncCreateOrder(newOrder);

    // 2. Reduce products stock in state & cloud
    newOrder.items.forEach(item => {
      const p = products.find(prod => prod.id === item.product.id);
      if (p) {
        const nextStock = Math.max(0, p.stock - item.quantity);
        syncReduceStock(p.id, nextStock);
      }
    });

    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((it) => it.product.id === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );

    /* 3. Clear Cart & Mark Coupon as Used in state & cloud */`
);

fs.writeFileSync('src/App.tsx', code);
