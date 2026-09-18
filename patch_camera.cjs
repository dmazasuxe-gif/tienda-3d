const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/BarcodeScannerView.tsx', 'utf8');

const regexContainer = /\{\/\* Ocultamos el reader visualmente si ya hay un producto procesado, pero la cámara sigue prendida de fondo \*\/\}\s*<div \s*id="reader" \s*className=\{`w-full h-full \\\[&>video\\\]:object-cover \\\[&>video\\\]:w-full \\\[&>video\\\]:h-full transition-opacity duration-300 \$\{isProcessingRef\.current \? 'opacity-20' : 'opacity-100'\}`\}\s*><\/div>\s*\{\/\* Mensaje superpuesto de Escaneo Exitoso \*\/\}\s*\{isProcessingRef\.current && \([\s\S]*?\}\)\}/;

const newContainer = `<div 
              id="reader" 
              className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
            ></div>`;

code = code.replace(regexContainer, newContainer);

fs.writeFileSync('src/components/Admin/BarcodeScannerView.tsx', code);
