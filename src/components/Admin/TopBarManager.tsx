import React, { useState } from 'react';
import { StoreSettings } from '../../types';
import { Type, Save, Plus, Trash2, Palette } from 'lucide-react';

interface TopBarManagerProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const TopBarManager: React.FC<TopBarManagerProps> = ({ settings, onSaveSettings }) => {
  const [topBarColor, setTopBarColor] = useState<string>(settings.topBarColor || '#111111');
  const [texts, setTexts] = useState<string[]>(settings.topBarTexts || []);
  const [newText, setNewText] = useState('');

  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      setTexts([...texts, newText.trim()]);
      setNewText('');
    }
  };

  const removeText = (index: number) => {
    const updated = [...texts];
    updated.splice(index, 1);
    setTexts(updated);
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      topBarColor,
      topBarTexts: texts.length > 0 ? texts : undefined
    });
    alert('✅ Configuraciones del cintillo guardadas correctamente.');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Type className="w-6 h-6 text-orange-600" />
            Cintillo Superior Animado
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configura la franja negra que aparece en la parte superior de la tienda. Puedes cambiar su color y los textos que se deslizan.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Color Picker */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-orange-100 pb-2">
            <Palette className="w-5 h-5 text-orange-600" />
            Color de Fondo
          </h3>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              value={topBarColor} 
              onChange={(e) => setTopBarColor(e.target.value)}
              className="w-16 h-16 rounded-2xl cursor-pointer border-0 shadow-sm"
            />
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-semibold mb-1 block">Código Hexadecimal</label>
              <input 
                type="text" 
                value={topBarColor}
                onChange={(e) => setTopBarColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
              />
            </div>
          </div>

          <div 
            className="w-full h-12 rounded-xl mt-4 flex items-center overflow-hidden relative shadow-inner"
            style={{ backgroundColor: topBarColor }}
          >
            <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-white text-xs font-bold tracking-widest px-4">
              {texts.length > 0 ? texts.join(' • ') : 'TU TEXTO AQUÍ'}
            </div>
          </div>
        </div>

        {/* Texts List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-orange-100 pb-2">
            <Type className="w-5 h-5 text-orange-600" />
            Textos y Emojis Deslizantes
          </h3>
          
          <form onSubmit={handleAddText} className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Ej. ✨ ENVÍOS GRATIS A TODO EL PERÚ"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
            {texts.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8 font-medium">
                No has agregado ningún texto.
              </p>
            ) : (
              texts.map((text, index) => (
                <div key={index} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs group">
                  <span className="font-medium text-sm text-slate-700">{text}</span>
                  <button
                    onClick={() => removeText(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
