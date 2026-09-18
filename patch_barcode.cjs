const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/BarcodeScannerView.tsx', 'utf8');

// Replace refs
code = code.replace(
  /const isProcessingRef = useRef\(false\);/,
  `const lastScannedCodeRef = useRef<string | null>(null);\n  const lastScannedTimeRef = useRef<number>(0);`
);

// Replace onScan callback
code = code.replace(
  /\(decodedText\) => \{\n\s*\/\/ Si ya estamos procesando[\s\S]*?\}\n\s*\},/g,
  `(decodedText) => {
            const now = Date.now();
            // Debouncer: Evitar lecturas duplicadas del mismo código en un lapso corto (2 segundos)
            if (lastScannedCodeRef.current === decodedText && now - lastScannedTimeRef.current < 2000) {
              return;
            }

            lastScannedCodeRef.current = decodedText;
            lastScannedTimeRef.current = now;

            const existingProduct = productsRef.current.find(
              p => p.sku === decodedText || p.barcode === decodedText
            );
            
            if (existingProduct) {
              setScannedProduct(existingProduct);
              setUnregisteredCode(null);
            } else {
              setScannedProduct(null);
              setUnregisteredCode(decodedText);
            }
          },`
);

// Remove handleScanAnother function
code = code.replace(
  /const handleScanAnother = \(\) => \{[\s\S]*?\};\n\n/g,
  `const handleClear = () => {
    setScannedProduct(null);
    setUnregisteredCode(null);
    lastScannedCodeRef.current = null;
  };\n\n`
);

// Update camera container classes (remove opacity condition)
code = code.replace(
  /className=\{`w-full h-full \\\[&>video\\\]:object-cover \\\[&>video\\\]:w-full \\\[&>video\\\]:h-full transition-opacity duration-300 \$\{isProcessingRef\.current \? 'opacity-20' : 'opacity-100'\}`\}/g,
  `className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"`
);

// Remove overlay message {isProcessingRef.current && ( ... )}
code = code.replace(
  /\{\/\* Mensaje superpuesto de Escaneo Exitoso \*\/\}\s*\{isProcessingRef\.current && \([\s\S]*?\}\)\}\s*<\/div>/g,
  `</div>`
);

// Replace handleScanAnother with handleClear in buttons
code = code.replace(
  /onClick=\{handleScanAnother\}/g,
  `onClick={handleClear}`
);

// Update "Escanear Otro Producto" button to "Limpiar Resultados" or just remove it if we want.
// We can change the text to "Limpiar Resultado"
code = code.replace(
  /<span>Escanear Otro Producto<\/span>/g,
  `<span>Limpiar Resultado</span>`
);

code = code.replace(
  /handleScanAnother\(\);/g,
  `handleClear();`
);

code = code.replace(
  /<span>Volver a Escanear<\/span>/g,
  `<span>Limpiar</span>`
);

fs.writeFileSync('src/components/Admin/BarcodeScannerView.tsx', code);
