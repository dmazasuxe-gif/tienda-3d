const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const saveButtonStr = `
          <div className="pt-6 mt-4 border-t border-sky-100 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer">
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
`;

// Insert before the end of section 1
code = code.replace(
  /placeholder="Ej. Av. La Moda 1042, Miraflores, Lima"\n            \/>\n          <\/div>\n        <\/div>\n      <\/div>/,
  `placeholder="Ej. Av. La Moda 1042, Miraflores, Lima"
            />
          </div>
        </div>${saveButtonStr}      </div>`
);

// Insert before end of section 3 (Payments)
code = code.replace(
  /placeholder="Ej. Cta. Corriente Soles"\n                  \/>\n                <\/div>\n              <\/div>\n            <\/div>\n          \)\)\}\n        <\/div>\n      <\/div>/,
  `placeholder="Ej. Cta. Corriente Soles"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>${saveButtonStr}      </div>`
);

// Insert before end of section 9 (Security)
code = code.replace(
  /placeholder="PIN de acceso"\n            \/>\n          <\/div>\n        <\/div>\n      <\/div>/,
  `placeholder="PIN de acceso"
            />
          </div>
        </div>${saveButtonStr}      </div>`
);


fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
