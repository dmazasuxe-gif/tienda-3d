const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const replacement = `              placeholder="Mensaje cuando el cliente contacta al chofer..."
            />
          </div>
          <div className="pt-4 mt-2 border-t border-sky-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Plantillas Guardadas</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Plantillas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>`;

code = code.replace(/              placeholder="Mensaje cuando el cliente contacta al chofer..."\n            \/>\n          <\/div>\n        <\/div>\n      <\/div>/, replacement);

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
