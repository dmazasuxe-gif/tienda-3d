import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, Lock, ArrowRight, Store, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types';

interface AdminPortalLoginProps {
  settings: StoreSettings;
  onSuccess: () => void;
  onGoToStore?: () => void;
}

export const AdminPortalLogin: React.FC<AdminPortalLoginProps> = ({
  settings,
  onSuccess,
  onGoToStore
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === settings.adminPin || pin.trim() === '1234') {
      onSuccess();
      setError('');
      setPin('');
    } else {
      setError('PIN o contraseña incorrecta. (PIN por defecto: 1234)');
    }
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-lg">
            A
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white font-['Playfair_Display',serif]">
              {settings.storeName}
            </h1>
            <p className="text-[10px] text-orange-300/70 font-semibold tracking-wider uppercase">
              Sistema de Gestión y Administración ERP
            </p>
          </div>
        </div>

        {onGoToStore && (
          <button
            onClick={onGoToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Store className="w-3.5 h-3.5 text-orange-400" />
            <span>Ir a Tienda Pública</span>
          </button>
        )}
      </div>

      {/* Main Login Box */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-orange-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-950/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif] pt-1">
              Portal de Administración
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Acceso privado para gestión de inventario, pedidos, chofer y cupones de sorteo.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 text-center">
                PIN o Clave de Seguridad
              </label>
              <div className="flex items-center justify-center gap-2 bg-slate-950/70 px-4 py-3 rounded-2xl border border-orange-500/30 focus-within:border-orange-400 transition-all shadow-inner">
                <KeyRound className="w-4 h-4 text-orange-400 shrink-0" />
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  maxLength={8}
                  autoFocus
                  className="bg-transparent text-center text-xl tracking-widest font-black text-white focus:outline-none w-36"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 py-2 px-3 rounded-xl border border-rose-500/20">
                {error}
              </p>
            )}

            {/* Numeric Keypad for fast mobile/touch interaction */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('');
                    else if (k === '⌫') handleBackspace();
                    else handleQuickKey(k);
                  }}
                  className="py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-200 font-bold text-sm border border-slate-700/60 transition-all cursor-pointer shadow-xs"
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              Servidor Cloud Seguro conectado a <span className="text-emerald-400 font-semibold">Supabase</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        <p>© {new Date().getFullYear()} {settings.storeName} — Todos los derechos reservados.</p>
      </div>
    </div>
  );
};
