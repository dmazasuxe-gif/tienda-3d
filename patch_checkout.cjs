const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');

code = code.replace(
  /onOrderPlaced: \(order: Order\) => void;/,
  `onOrderPlaced: (order: Order) => Promise<void>;`
);

code = code.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{/,
  `const handleSubmit = async (e: React.FormEvent) => {`
);

code = code.replace(
  /    setTimeout\(\(\) => \{\n      saveLastTrackedCode\(orderNumber\);\n      onOrderPlaced\(newOrder\);\n      setPlacedOrder\(newOrder\);\n      setIsSubmitting\(false\);\n\n      \/\/ Trigger Celebration Confetti\n      try \{\n        confetti\(\{\n          particleCount: 80,\n          spread: 70,\n          origin: \{ y: 0\.6 \}\n        \}\);\n      \} catch \(err\) \{\n        console\.error\(err\);\n      \}\n    \}, 1500\);/,
  `    try {
      await onOrderPlaced(newOrder);
      saveLastTrackedCode(orderNumber);
      setPlacedOrder(newOrder);
      setIsSubmitting(false);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Hubo un error al procesar la orden. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }`
);

fs.writeFileSync('src/components/CheckoutModal.tsx', code);
