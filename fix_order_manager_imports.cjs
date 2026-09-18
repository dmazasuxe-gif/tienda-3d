const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/OrderManager.tsx', 'utf8');
code = code.replace(
  /Calendar,\n  X\n\} from 'lucide-react';/,
  `Calendar,\n  X,\n  Trash2,\n  ScanLine\n} from 'lucide-react';`
);
fs.writeFileSync('src/components/Admin/OrderManager.tsx', code);
