const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const newSection = `
      {/* SECTION 11 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 space-y-4 text-xs shadow-xs" id="section-whatsapp-templates">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-sky-800 text-xs flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-sky-600" />
            <span>11. Mensajes Predeterminados de WhatsApp</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Personaliza los mensajes que se envían por WhatsApp. Utiliza variables como <code>{{storeName}}</code>, <code>{{orderNumber}}</code>, <code>{{customerName}}</code>, <code>{{customerPhone}}</code>, <code>{{address}}</code>, <code>{{itemsList}}</code>, <code>{{total}}</code>, <code>{{currencySymbol}}</code>, <code>{{paymentMethod}}</code>, <code>{{status}}</code>, <code>{{driverName}}</code>.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Nuevo Pedido (General)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.orderGeneric || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), orderGeneric: e.target.value}})}
              placeholder="Mensaje para órdenes generales..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Pago Contra Entrega</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.orderContraEntrega || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), orderContraEntrega: e.target.value}})}
              placeholder="Mensaje para órdenes de contra entrega..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Pago por Yape / Plin</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.orderYapePlin || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), orderYapePlin: e.target.value}})}
              placeholder="Mensaje para órdenes pagadas con Yape o Plin..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Pago por Transferencia</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.orderTransferencia || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), orderTransferencia: e.target.value}})}
              placeholder="Mensaje para órdenes pagadas con transferencia..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Rastreo de Pedido (Cliente a Tienda)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.trackingQuery || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), trackingQuery: e.target.value}})}
              placeholder="Mensaje cuando el cliente consulta sobre su pedido..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Mensaje de Contacto a Repartidor / Chofer</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-y min-h-[120px]"
              value={formData.whatsappTemplates?.driverContact || ''}
              onChange={(e) => setFormData({...formData, whatsappTemplates: {...(formData.whatsappTemplates || {}), driverContact: e.target.value}})}
              placeholder="Mensaje cuando el cliente contacta al chofer..."
            />
          </div>
        </div>
      </div>
`;

code = code.replace("    </form>", newSection + "\n    </form>");
fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
