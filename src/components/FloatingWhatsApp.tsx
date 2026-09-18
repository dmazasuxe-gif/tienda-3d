import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCheck } from 'lucide-react';
import { StoreSettings } from '../types';
import { getGeneralSupportWhatsAppUrl } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const handleStartChat = (presetText?: string) => {
    const text = presetText || customMsg;
    const url = getGeneralSupportWhatsAppUrl(settings, text);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 sm:p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Chatear con Asesor por WhatsApp"
          id="btn-floating-whatsapp"
        >
          {/* Radar Ping Animation */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 animate-ping" />
          
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-emerald-800 relative z-10" />

          {/* Tooltip on hover */}
          <span className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ¿Dudas sobre tallas o pedidos? Escríbenos
          </span>
        </button>
      )}

      {/* Floating Interactive Chat Card */}
      {isOpen && (
        <div className="w-[320px] sm:w-[350px] bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-in text-zinc-900">
          
          {/* Card Header */}
          <div className="bg-black p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                <img
                  src={settings.logoUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"}
                  alt={settings.storeName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full" />
              </div>

              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">
                  {settings.whatsappAdvisorName || 'Atención al Cliente'}
                </h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea ahora</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-zinc-50 space-y-3">
            <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-800 leading-relaxed shadow-2xs">
              <p>
                👋 ¡Hola! Bienvenido a <strong>{settings.storeName}</strong>.
              </p>
              <p className="mt-1 text-zinc-500">
                ¿En qué podemos ayudarte con tu compra hoy?
              </p>
              <div className="flex justify-end mt-1 text-[10px] text-zinc-400">
                <CheckCheck className="w-3 h-3 text-emerald-600" />
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preguntas Frecuentes:</p>
              <div className="flex flex-col gap-1.5">
                {[
                  '📏 ¿Cómo elijo mi talla correcta?',
                  '🚚 ¿Hacen envíos a mi ciudad?',
                  '💳 ¿Qué métodos de pago aceptan?',
                  '🛍️ Quisiera consultar stock de un modelo'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartChat(prompt)}
                    className="text-left text-xs bg-white hover:bg-zinc-100 text-zinc-800 p-2.5 rounded-xl border border-zinc-200 transition-colors truncate cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full p-1.5 shadow-2xs">
                <input
                  type="text"
                  placeholder="Escribe tu consulta aquí..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartChat();
                  }}
                  className="flex-1 bg-transparent text-xs text-zinc-900 placeholder-zinc-400 px-3 focus:outline-none"
                />
                <button
                  onClick={() => handleStartChat()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-white p-2.5 text-center text-[10px] text-zinc-400 border-t border-zinc-200">
            Respuesta promedio: Menos de 5 minutos
          </div>

        </div>
      )}
    </div>
  );
};
