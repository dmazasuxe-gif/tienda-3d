const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');
code = code.replace(
  /export async function syncDeleteOrder\(orderId: string\): Promise<void> \{\n  try \{\n    const docRef = doc\(db, ORDERS_COLL, orderId\);\n    await deleteDoc\(docRef\);\n  \} catch \(err\) \{\n    console\.warn\('\[Firestore\] Error deleting order:', err\);\n  \}\n\}\n\nexport async function syncUpdateOrderStatus/,
  `export async function syncUpdateOrderStatus`
);
fs.writeFileSync('src/services/firestoreSync.ts', code);
