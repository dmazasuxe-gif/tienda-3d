const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleSaveSettings = \(newSettings: StoreSettings\) => \{\n    setSettings\(newSettings\);\n    syncSaveStoreSettings\(newSettings\);\n  \};/,
  `const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    syncSaveStoreSettings(newSettings);
  };`
);

fs.writeFileSync('src/App.tsx', code);
