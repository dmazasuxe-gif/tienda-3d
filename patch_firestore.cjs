const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

code = code.replace(
  /export async function syncCreateOrder\(order: Order\): Promise<void> \{\n  try \{\n    const docRef = doc\(db, ORDERS_COLL, order\.id\);\n    await setDoc\(docRef, order\);\n  \} catch \(err\) \{\n    console\.warn\('\[Firestore\] Error saving order:', err\);\n  \}\n\}/,
  `export async function syncCreateOrder(order: Order): Promise<void> {
  const docRef = doc(db, ORDERS_COLL, order.id);
  await setDoc(docRef, order);
}`
);

fs.writeFileSync('src/services/firestoreSync.ts', code);
