const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const remainderRegex = /\s*<button\s*type="submit"\s*className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r[\s\S]*?<\/button>\s*<\/div>/;
code = code.replace(remainderRegex, '');

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
