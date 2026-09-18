const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');

const regex = /    setTimeout\(\(\) => \{\n\s*saveLastTrackedCode\(orderNumber\);\n\s*onOrderPlaced\(newOrder\);\n\s*setPlacedOrder\(newOrder\);\n\s*setIsSubmitting\(false\);\n\n\s*\/\/ Trigger Celebration Confetti\n\s*try \{\n\s*confetti\(\{\n\s*particleCount: 80,\n\s*spread: 70,\n\s*origin: \{ y: 0\.6 \}\n\s*\}\);\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*\}\n\s*\}, \d+\);/;

code = code.replace(regex, `    try {
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
    }`);

fs.writeFileSync('src/components/CheckoutModal.tsx', code);
