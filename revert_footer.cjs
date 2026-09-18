const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

// 1. Remove the sticky footer
const footerRegex = /\s*\{\/\* Sticky Footer Bar for General Save \*\/\}[\s\S]*?<\/div>\n/;
code = code.replace(footerRegex, '\n');

// 2. Remove the "Guardar Plantillas" button
const templateButtonRegex = /\s*<div className="pt-6 mt-4 border-t border-sky-100 flex justify-end">[\s\S]*?<\/button>\s*<\/div>/;
code = code.replace(templateButtonRegex, '');

// 3. Remove the descriptive text
const descTextRegex = /\s*<p className="text-\[11px\] text-slate-500">\s*Personaliza los mensajes que se envían por WhatsApp[\s\S]*?<\/p>/;
code = code.replace(descTextRegex, '');

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
