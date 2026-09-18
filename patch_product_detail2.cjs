const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailModal.tsx', 'utf8');

const regex = /\{activeTab === 'envios' && \([\s\S]*?<\/div>\s*\)\}/;

const newEnvios = `{activeTab === 'envios' && (
                    <div className="space-y-3">
                      {(settings.shippingOptions && settings.shippingOptions.length > 0) ? (
                        settings.shippingOptions.filter(opt => opt.isActive).map(opt => (
                          <div key={opt.id} className="flex gap-2 text-sm text-slate-700">
                            <span className="shrink-0 text-sky-600">📦</span>
                            <div>
                              <strong>{opt.name}:</strong> <span className="text-slate-600">{opt.description}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600">Por favor, consulta las opciones de envío al realizar tu pedido.</p>
                      )}
                      
                      {settings.freeShippingThreshold > 0 && (
                        <div className="flex gap-2 text-sm text-emerald-700 mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <span className="shrink-0">✨</span>
                          <div>
                            <strong>Envío Gratis:</strong> En compras superiores a {settings.currencySymbol} {settings.freeShippingThreshold}.
                          </div>
                        </div>
                      )}
                    </div>
                  )}`;

code = code.replace(regex, newEnvios);

fs.writeFileSync('src/components/ProductDetailModal.tsx', code);
