const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

code = code.replace(
  /export async function syncUpdateOrderStatus/,
  `export async function syncDeleteOrder(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLL, orderId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting order:', err);
  }
}

export async function syncUpdateOrderStatus`
);

fs.writeFileSync('src/services/firestoreSync.ts', code);
