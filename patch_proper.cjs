const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

const targetSection = `              placeholder="Mensaje cuando el cliente contacta al chofer..."
            />
          </div>
        </div>
      </div>`;

const newSection = `              placeholder="Mensaje cuando el cliente contacta al chofer..."
            />
          </div>
          <div className="pt-4 border-t border-sky-100 flex justify-end">
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
                  <span>Guardar Plantillas de WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>`;

code = code.replace(targetSection, newSection);

// Also add a sticky footer button for all changes
const footerHtml = `
      {/* Sticky Footer Bar for General Save */}
      <div className="sticky bottom-4 z-40 p-4 sm:p-5 mt-8 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="text-white">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar Todos los Cambios</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Asegúrate de guardar si has modificado cualquier sección del administrador.
          </p>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer uppercase tracking-wider"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5 text-white font-bold" />
              <span>¡Todo Guardado con Éxito!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar Cambios del Administrador</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
`;

code = code.replace(/    <\/form>\n  \);\n};\n?$/, footerHtml);

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
