const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleOrderPlaced = \(newOrder: Order\) => \{/,
  `const handleOrderPlaced = async (newOrder: Order) => {`
);

code = code.replace(
  /syncCreateOrder\(newOrder\);/,
  `await syncCreateOrder(newOrder);`
);

// We also need to await syncReduceStock?
code = code.replace(
  /syncReduceStock\(p\.id, nextStock\);/g,
  `// syncReduceStock(p.id, nextStock); // Removing this synchronous call, we will do it after state update`
);

// Actually, let's just make syncCreateOrder throw, and handleOrderPlaced await it.
fs.writeFileSync('src/App.tsx', code);
