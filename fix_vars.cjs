const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const oldText = '          Personaliza los mensajes que se envían por WhatsApp. Utiliza variables como <code>{{storeName}}</code>, <code>{{orderNumber}}</code>, <code>{{customerName}}</code>, <code>{{customerPhone}}</code>, <code>{{address}}</code>, <code>{{itemsList}}</code>, <code>{{total}}</code>, <code>{{currencySymbol}}</code>, <code>{{paymentMethod}}</code>, <code>{{status}}</code>, <code>{{driverName}}</code>.';
const newText = '          Personaliza los mensajes que se envían por WhatsApp. Utiliza variables como <code>{"{{storeName}}"}</code>, <code>{"{{orderNumber}}"}</code>, <code>{"{{customerName}}"}</code>, <code>{"{{customerPhone}}"}</code>, <code>{"{{address}}"}</code>, <code>{"{{itemsList}}"}</code>, <code>{"{{total}}"}</code>, <code>{"{{currencySymbol}}"}</code>, <code>{"{{paymentMethod}}"}</code>, <code>{"{{status}}"}</code>, <code>{"{{driverName}}"}</code>.';

code = code.replace(oldText, newText);
fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
