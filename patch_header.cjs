const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

code = code.replace(
  /<div className="p-4 sm:p-5 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">/,
  '<div className="sticky top-4 z-40 p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-sky-900/5">'
);

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
