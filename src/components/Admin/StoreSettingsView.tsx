import React, { useState, useEffect } from 'react';
import { StoreSettings, ShippingOption, Coupon } from '../../types';
import { 
  Store, 
  MessageCircle, 
  Upload, 
  DollarSign, 
  Lock, 
  Bell, 
  Save, 
  Check, 
  Volume2,
  Smartphone,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Image as ImageIcon,
  Truck,
  User,
  Clock,
  MapPin,
  RotateCcw,
  Gift,
  Ticket,
  Copy,
  Search,
  Share2,
  Tag,
  Info,
  ExternalLink,
  Printer
} from 'lucide-react';
import { ReceiptSettingsPanel } from './ReceiptSettingsPanel';
import { ProductImagesManager } from './ProductImagesManager';
import { playNotificationChime, requestPushPermission, getPushPermissionStatus, sendPushNotification } from '../../utils/sound';

interface StoreSettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>('');

  // Synchronize formData whenever settings prop changes (e.g. from Cloud sync or parent)
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  // Shipping Options State
  const [newShipName, setNewShipName] = useState('');
  const [newShipPrice, setNewShipPrice] = useState<number>(15);
  const [newShipTime, setNewShipTime] = useState('24 a 48 horas hábiles');
  const [newShipDesc, setNewShipDesc] = useState('');
  const [showAddShipModal, setShowAddShipModal] = useState(false);

  // Coupons Management State
  const [couponAmount, setCouponAmount] = useState<number>(10);
  const [couponCode, setCouponCode] = useState<string>('AURA-7K9P');
  const [couponDesc, setCouponDesc] = useState<string>('Sorteo Clientes');
  const [couponFilter, setCouponFilter] = useState<'all' | 'available' | 'used'>('all');
  const [couponSearch, setCouponSearch] = useState<string>('');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const generateRandomCode = () => {
    const prefixes = ['AURA', 'SORTEO', 'PREMIO', 'GANA', 'REGALO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `${prefix}-${suffix}`;
    setCouponCode(generated);
    return generated;
  };

  const handleCreateCoupon = () => {
    const numAmount = Number(couponAmount);
    if (!numAmount || numAmount <= 0) {
      setCouponFeedback('⚠️ Por favor especifica un monto de descuento en dinero mayor a 0 soles.');
      setTimeout(() => setCouponFeedback(null), 3500);
      return;
    }

    let finalCode = couponCode.trim().toUpperCase();
    if (!finalCode || finalCode === 'AURA-') {
      finalCode = generateRandomCode();
    }

    // Verify duplicate code
    const existing = (formData.coupons || []).some(
      (c) => c.code.toUpperCase() === finalCode
    );
    if (existing) {
      setCouponFeedback(`⚠️ El código ${finalCode} ya existe. Por favor genera o ingresa otro código.`);
      setTimeout(() => setCouponFeedback(null), 3500);
      return;
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: finalCode,
      discountAmount: numAmount,
      description: couponDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
      isUsed: false,
      isActive: true
    };

    const updated = {
      ...formData,
      coupons: [newCoupon, ...(formData.coupons || [])]
    };

    setFormData(updated);
    onSaveSettings(updated);

    setCouponFeedback(`¡Cupón ${finalCode} creado con valor de ${formData.currencySymbol} ${numAmount.toFixed(2)}!`);
    setTimeout(() => setCouponFeedback(null), 3500);

    // Prepare next random code
    const prefixes = ['AURA', 'SORTEO', 'PREMIO', 'GANA', 'REGALO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let nextSuffix = '';
    for (let i = 0; i < 4; i++) {
      nextSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(`${prefix}-${nextSuffix}`);
  };

  const handleDeleteCoupon = (id: string) => {
    const target = (formData.coupons || []).find((c) => c.id === id);
    const updatedCoupons = (formData.coupons || []).filter((c) => c.id !== id);
    const updated = {
      ...formData,
      coupons: updatedCoupons
    };
    setFormData(updated);
    onSaveSettings(updated);
    setCouponFeedback(`🗑️ Cupón ${target ? target.code : ''} eliminado correctamente.`);
    setTimeout(() => setCouponFeedback(null), 3000);
  };

  const handleToggleCouponActive = (id: string) => {
    const updatedCoupons = (formData.coupons || []).map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    const updated = {
      ...formData,
      coupons: updatedCoupons
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const handleResetCouponUsed = (id: string) => {
    const updatedCoupons = (formData.coupons || []).map((c) =>
      c.id === id ? { ...c, isUsed: false, usedAt: undefined, usedInOrderNumber: undefined } : c
    );
    const updated = {
      ...formData,
      coupons: updatedCoupons
    };
    setFormData(updated);
    onSaveSettings(updated);
    setCouponFeedback('✅ Cupón reactivado para una nueva compra.');
    setTimeout(() => setCouponFeedback(null), 3000);
  };

  const handleCopyCouponCode = (code: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedCouponId(id);
        setTimeout(() => setCopiedCouponId(null), 2500);
      });
    }
  };

  const handleShareCouponWhatsApp = (coupon: Coupon) => {
    const text = `🎉 *¡FELICIDADES! Eres ganador(a) de nuestro sorteo en ${formData.storeName || 'AURA MODA & CALZADO'}!*\n\nTe premiamos con un cupón de descuento especial por *${formData.currencySymbol} ${coupon.discountAmount.toFixed(2)}* para tu próxima compra en nuestra tienda online.\n\n🎟️ *Tu código exclusivo de único uso:* *${coupon.code}*\n\n👉 *¿Cómo canjearlo?*\n1. Ingresa a nuestra tienda online.\n2. Añade tus prendas o calzados favoritos al carrito.\n3. En tu carrito ingresa tu código *${coupon.code}* y se te descontará *${formData.currencySymbol} ${coupon.discountAmount.toFixed(2)}* de inmediato antes de pagar.\n\n_Válido solo para una sola compra. ¡Que lo disfrutes!_ ✨`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const compressImage = (file: File, maxWidth: number, callback: (url: string) => void, quality = 0.70) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Optimized webp compression keeps file small while preserving HD sharpness AND transparency
          callback(canvas.toDataURL('image/webp', quality));
        } else if (typeof e.target?.result === 'string') {
          callback(e.target.result);
        }
      };
      img.onerror = () => {
        if (typeof e.target?.result === 'string') {
          callback(e.target.result);
        }
      };
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = () => {
      console.warn('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, (compressedUrl) => {
        const updated = { ...formData, logoUrl: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);
      });
    }
  };

  const handleDriverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, (compressedUrl) => {
        const updated = { ...formData, driverPhoto: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);
      });
    }
  };

  const handleYapeQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 600, (compressedUrl) => {
        const updated = { ...formData, yapeQrUrl: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);
      });
    }
  };

  // Shipping Options Handlers
  const handleAddShippingOption = () => {
    if (!newShipName.trim()) return;
    const newOption: ShippingOption = {
      id: `ship-${Date.now()}`,
      name: newShipName.trim(),
      price: Number(newShipPrice) >= 0 ? Number(newShipPrice) : 0,
      estimatedTime: newShipTime.trim() || '24 a 48 horas hábiles',
      description: newShipDesc.trim() || undefined,
      isActive: true
    };
    const updated = { ...formData, shippingOptions: [...(formData.shippingOptions || []), newOption] };
    setFormData(updated);
    onSaveSettings(updated);
    setNewShipName('');
    setNewShipPrice(15);
    setNewShipTime('24 a 48 horas hábiles');
    setNewShipDesc('');
    setShowAddShipModal(false);
  };

  const handleToggleShippingOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingOptions: (prev.shippingOptions || []).map((opt) =>
        opt.id === id ? { ...opt, isActive: !opt.isActive } : opt
      )
    }));
  };

  const handleDeleteShippingOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingOptions: (prev.shippingOptions || []).filter((opt) => opt.id !== id)
    }));
  };

  const handleUpdateShippingOption = (id: string, partial: Partial<ShippingOption>) => {
    setFormData((prev) => ({
      ...prev,
      shippingOptions: (prev.shippingOptions || []).map((opt) =>
        opt.id === id ? { ...opt, ...partial } : opt
      )
    }));
  };

  const handleResetDefaultShippingOptions = () => {
    const defaults: ShippingOption[] = [
      {
        id: "ship-1",
        name: "Envío Estándar a Domicilio",
        price: 15,
        estimatedTime: "24 a 48 horas hábiles",
        description: "Lima Metropolitana y Callao con reparto a domicilio",
        isActive: true
      },
      {
        id: "ship-2",
        name: "Envío Express Mismo Día",
        price: 25,
        estimatedTime: "Mismo día (pedidos antes de las 2:00 PM)",
        description: "Despacho prioritario en furgón express de reparto",
        isActive: true
      },
      {
        id: "ship-3",
        name: "Envío Nacional a Provincias",
        price: 20,
        estimatedTime: "2 a 4 días hábiles vía Olva Courier / Shalom",
        description: "Cobertura nacional con código de seguimiento oficial",
        isActive: true
      },
      {
        id: "ship-4",
        name: "Recojo en Tienda Central / Almacén",
        price: 0,
        estimatedTime: "Disponible en 2 horas",
        description: "Av. La Moda 1042, Miraflores (Gratis - Sin costo)",
        isActive: true
      }
    ];
    setFormData((prev) => ({
      ...prev,
      shippingOptions: defaults
    }));
  };

  const handleTestSound = () => {
    playNotificationChime();
  };

  const handleTestNotificationAlert = async () => {
    playNotificationChime();
    await sendPushNotification(
      '🛍️ NUEVO PEDIDO DE PRUEBA: #1099',
      '¡Hola! Las notificaciones del sistema están funcionando correctamente en este dispositivo.',
      '/logo.png'
    );
  };

  const handleEnablePush = async () => {
    // Check if inside iframe
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const isStandalone = typeof window !== 'undefined' && ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);

    const result = await requestPushPermission();
    if (result === 'granted') {
      setPushStatus('✅ Permiso de notificaciones push activado exitosamente en este dispositivo.');
      const newSettings = { ...formData, pushNotifications: true };
      setFormData(newSettings);
      onSaveSettings(newSettings);
    } else if (result === 'denied') {
      setPushStatus('denied');
      const newSettings = { ...formData, pushNotifications: false };
      setFormData(newSettings);
      onSaveSettings(newSettings);
    } else if (result === 'iframe_blocked' || isInIframe) {
      setPushStatus('iframe');
    } else if (isIOS && !isStandalone) {
      setPushStatus('ios_install_required');
    } else if (result === 'unsupported') {
      setPushStatus(isIOS ? 'ios_install_required' : 'unsupported');
    } else {
      setPushStatus('dismissed');
    }
  };

  // Sync push status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted' && formData.pushNotifications) {
        setPushStatus('✅ Permiso de notificaciones push está activado.');
      } else if (Notification.permission === 'denied') {
        setPushStatus('denied');
      }
    }
  }, [formData.pushNotifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-slate-800">
      
      {/* Header Bar with Save Button */}
      <div className="sticky top-4 z-40 p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-orange-900/5">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 font-['Playfair_Display',serif] flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-600" />
            <span>Configuración General de la Tienda</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza el nombre, logo, canal de WhatsApp, precios y seguridad de tu tienda
          </p>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer uppercase tracking-wider"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white font-bold" />
              <span>¡Guardado con Éxito!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Nombre & Identidad de la Tienda */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
          <span>1. Nombre e Identidad Visual</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nombre de la Tienda *</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. MQ3D"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Slogan o Frase Distintiva</label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. Estilo y distinción a tus pies"
            />
          </div>
        </div>

        {/* Store Logo Management */}
        <div className="pt-3 border-t border-orange-100">
          <label className="block text-slate-700 font-semibold mb-2">Logo de la Tienda</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Logo Preview */}
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-orange-200 overflow-hidden shrink-0 shadow-xs">
              <img
                src={formData.logoUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"}
                alt="Logo Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Input Options */}
            <div className="flex-1 space-y-2 w-full">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-orange-200 border-dashed rounded-2xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                <Upload className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-slate-600 font-medium">Haz clic aquí para subir imagen de logo desde Celular / PC</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

          </div>
        </div>
      </div>


      {/* 2. Canal de WhatsApp de Ventas y Asesoría */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-emerald-700 text-xs flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" />
          <span>2. Canal Oficial de WhatsApp para Clientes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Número de WhatsApp (con código de país sin + ni espacios) *
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-sm focus:outline-none focus:bg-white focus:border-emerald-500 shadow-2xs"
              placeholder="Ej. 51987654321 (Perú) o 521... (México)"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Enlace generado: <code className="text-emerald-700 font-mono">wa.me/{formData.whatsappNumber.replace(/\D/g, '')}</code>
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Número visible en pantalla (Formato legible)
            </label>
            <input
              type="text"
              value={formData.whatsappDisplayNumber}
              onChange={(e) => setFormData({ ...formData, whatsappDisplayNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. +51 987 654 321"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">
            Nombre del Asesor/a de Ventas (visible en chat emergente)
          </label>
          <input
            type="text"
            value={formData.whatsappAdvisorName}
            onChange={(e) => setFormData({ ...formData, whatsappAdvisorName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej. Valeria - Asesora de Moda Aura"
          />
        </div>
      </div>

      {/* 3. Métodos de Pago: Yape / Plin y Cuentas Bancarias */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-orange-600" />
            <span>3. Configuración de Pagos (Yape, Plin y Transferencias)</span>
          </h3>
        </div>

        {/* Yape / Plin Config */}
        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
          <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
            <span>📱 Datos para Yape / Plin</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Número de Yape / Plin *</label>
              <input
                type="text"
                value={formData.yapeNumber || ''}
                onChange={(e) => setFormData({ ...formData, yapeNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-2xl text-purple-900 font-bold focus:outline-none focus:border-purple-500 shadow-2xs"
                placeholder="Ej. 987 654 321"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Titular de la cuenta Yape / Plin *</label>
              <input
                type="text"
                value={formData.yapeHolderName || ''}
                onChange={(e) => setFormData({ ...formData, yapeHolderName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-purple-500 shadow-2xs"
                placeholder="Ej. Juan Pérez - Moda Aura"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Imagen del QR de Yape (Opcional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {formData.yapeQrUrl && (
                <div className="w-16 h-16 rounded-xl bg-purple-50 border-2 border-purple-200 overflow-hidden shrink-0 shadow-xs">
                  <img
                    src={formData.yapeQrUrl}
                    alt="Yape QR"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 border-dashed rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-colors">
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-slate-600 font-medium">Haz clic aquí para subir imagen del QR desde Celular / PC</span>
                  <input type="file" accept="image/*" onChange={handleYapeQrUpload} className="hidden" />
                </label>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Si no se sube una imagen, el sistema generará automáticamente un QR escaneable con el número de Yape.</p>
          </div>
        </div>

        {/* Bank Accounts Config */}
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-orange-900 flex items-center gap-1.5">
              <span>🏦 Cuentas Bancarias para Transferencias</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                const currentAccounts = formData.bankAccounts || [];
                const newAccount = {
                  id: `bank-${Date.now()}`,
                  bankName: 'BCP',
                  accountNumber: '',
                  cci: '',
                  holderName: formData.storeName
                };
                setFormData({ ...formData, bankAccounts: [...currentAccounts, newAccount] });
              }}
              className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-xl border border-orange-200 transition-all cursor-pointer shadow-2xs"
            >
              + Agregar Cuenta
            </button>
          </div>

          <div className="space-y-3">
            {(formData.bankAccounts || []).map((account, idx) => (
              <div key={account.id || idx} className="p-3 bg-white border border-orange-100 rounded-2xl space-y-2 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Banco / Entidad Financiera</label>
                    <input
                      type="text"
                      value={account.bankName}
                      onChange={(e) => {
                        const updated = [...(formData.bankAccounts || [])];
                        updated[idx] = { ...updated[idx], bankName: e.target.value };
                        setFormData({ ...formData, bankAccounts: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:bg-white focus:border-orange-500"
                      placeholder="Ej. BCP, BBVA, Interbank, Banco de la Nación"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Número de Cuenta</label>
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) => {
                        const updated = [...(formData.bankAccounts || [])];
                        updated[idx] = { ...updated[idx], accountNumber: e.target.value };
                        setFormData({ ...formData, bankAccounts: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-orange-200 rounded-xl text-orange-900 font-mono font-bold text-xs focus:outline-none focus:bg-white focus:border-orange-500"
                      placeholder="Ej. 191-12345678-0-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Código Interbancario (CCI)</label>
                    <input
                      type="text"
                      value={account.cci || ''}
                      onChange={(e) => {
                        const updated = [...(formData.bankAccounts || [])];
                        updated[idx] = { ...updated[idx], cci: e.target.value };
                        setFormData({ ...formData, bankAccounts: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:bg-white focus:border-orange-500"
                      placeholder="Ej. 002-1910012345678012-55"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-slate-600 text-[11px] mb-0.5">Titular de Cuenta</label>
                      <input
                        type="text"
                        value={account.holderName}
                        onChange={(e) => {
                          const updated = [...(formData.bankAccounts || [])];
                          updated[idx] = { ...updated[idx], holderName: e.target.value };
                          setFormData({ ...formData, bankAccounts: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-orange-500"
                        placeholder="Ej. Aura Moda S.A.C."
                      />
                    </div>
                    {(formData.bankAccounts || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.bankAccounts || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, bankAccounts: updated });
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>


      {/* 4. Moneda, Envíos y Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-orange-600" />
          <span>4. Moneda, Tarifas de Envío & Banner</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Símbolo Moneda</label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold text-center focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="S/, $, €"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Código Moneda</label>
            <input
              type="text"
              value={formData.currencyCode}
              onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold text-center focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="PEN, USD, EUR"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Envío Estándar</label>
            <input
              type="number"
              value={formData.standardShippingCost}
              onChange={(e) => setFormData({ ...formData, standardShippingCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold text-center focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Monto Envío Gratis</label>
            <input
              type="number"
              value={formData.freeShippingThreshold}
              onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-emerald-700 font-bold text-center focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-slate-700 font-semibold">Mensaje en Barra Promocional Superior</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-orange-700 font-semibold">
              <input
                type="checkbox"
                checked={formData.bannerNoticeActive}
                onChange={(e) => setFormData({ ...formData, bannerNoticeActive: e.target.checked })}
                className="w-3.5 h-3.5 accent-orange-600 rounded cursor-pointer"
              />
              <span>Mostrar en Tienda</span>
            </label>
          </div>
          <input
            type="text"
            value={formData.bannerNotice}
            onChange={(e) => setFormData({ ...formData, bannerNotice: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            placeholder="Ej. ✨ ENVÍO GRATIS en compras mayores a S/ 199 | 20% OFF en Filamentos"
          />
        </div>
      </div>

      {/* 4.5 Barra Superior Animada (Top Bar) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>Barra Superior Animada (Top Bar)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Config */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Color de Fondo de la Barra</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.topBarColor || '#111111'}
                onChange={(e) => setFormData({ ...formData, topBarColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={formData.topBarColor || '#111111'}
                onChange={(e) => setFormData({ ...formData, topBarColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-orange-500"
                placeholder="#111111"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              El color por defecto es Negro (#111111).
            </p>
          </div>

          {/* Texts Config */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">Textos Deslizables (Marquee)</label>
              <button
                type="button"
                onClick={() => {
                  const current = formData.topBarTexts || [];
                  setFormData({ ...formData, topBarTexts: [...current, 'Nuevo texto'] });
                }}
                className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold hover:bg-orange-200"
              >
                + Agregar Texto
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {(formData.topBarTexts || ['Envío Gratis', 'Impresoras 3D']).map((text, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      const updated = [...(formData.topBarTexts || [])];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, topBarTexts: updated });
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                    placeholder="Añade texto o emoji"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.topBarTexts || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, topBarTexts: updated });
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.topBarTexts || formData.topBarTexts.length === 0) && (
                <p className="text-xs text-slate-400 italic">No hay textos configurados. No se mostrará animación.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Opciones y Métodos de Envío (Gestor de Tarifas & Despacho) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs" id="section-shipping-options">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-orange-100">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>5. Opciones de Envío y Despacho ({formData.shippingOptions?.length || 0})</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Configura las opciones de envío que tus clientes podrán elegir en la tienda. Puedes activar, editar tarifas, agregar nuevos o eliminarlos.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleResetDefaultShippingOptions}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer border border-slate-200"
              title="Restablecer opciones predeterminadas recomendadas"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Preestablecidos</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddShipModal(!showAddShipModal)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddShipModal ? 'Cerrar Formulario' : 'Agregar Opción'}</span>
            </button>
          </div>
        </div>

        {/* Quick Add Shipping Option Form */}
        {showAddShipModal && (
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 space-y-3 shadow-inner">
            <h4 className="font-bold text-orange-900 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Nueva Opción de Envío</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre de la opción *</label>
                <input
                  type="text"
                  placeholder="Ej. Envío Motorizado Urgente (3 Horas)"
                  value={newShipName}
                  onChange={(e) => setNewShipName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Costo ({formData.currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0 para Gratis"
                  value={newShipPrice}
                  onChange={(e) => setNewShipPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tiempo de entrega estimado *</label>
                <input
                  type="text"
                  placeholder="Ej. 24 a 48 horas / Mismo día"
                  value={newShipTime}
                  onChange={(e) => setNewShipTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cobertura o Detalle (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Cobertura Lima moderna y Callao"
                  value={newShipDesc}
                  onChange={(e) => setNewShipDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddShipModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddShippingOption}
                disabled={!newShipName.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
              >
                Guardar Opción de Envío
              </button>
            </div>
          </div>
        )}

        {/* List of Configured Shipping Options */}
        <div className="space-y-2.5">
          {(!formData.shippingOptions || formData.shippingOptions.length === 0) ? (
            <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">No hay opciones de envío configuradas.</p>
              <button
                type="button"
                onClick={handleResetDefaultShippingOptions}
                className="mt-2 text-orange-600 hover:underline font-bold text-xs"
              >
                Cargar las 4 opciones preestablecidas recomendadas
              </button>
            </div>
          ) : (
            formData.shippingOptions.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  opt.isActive
                    ? 'bg-white border-orange-200 shadow-2xs hover:border-orange-300'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* Left: Info and Status */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={opt.isActive}
                        onChange={() => handleToggleShippingOption(opt.id)}
                        className="w-4 h-4 accent-orange-600 rounded cursor-pointer mt-0.5"
                        title={opt.isActive ? 'Opción activa (clic para pausar)' : 'Opción pausada (clic para activar)'}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {opt.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          opt.price === 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {opt.price === 0 ? 'GRATIS' : `${formData.currencySymbol} ${opt.price.toFixed(2)}`}
                        </span>
                        {!opt.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Pausado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{opt.estimatedTime}</span>
                        </span>
                        {opt.description && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{opt.description}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Price Edit and Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-500">{formData.currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={opt.price}
                        onChange={(e) => handleUpdateShippingOption(opt.id, { price: Number(e.target.value) >= 0 ? Number(e.target.value) : 0 })}
                        className="w-14 text-center font-bold text-slate-900 text-xs bg-transparent focus:outline-none"
                        title="Modificar tarifa rápida"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteShippingOption(opt.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar esta opción de envío"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Generador y Gestor de Cupones de Sorteo (Descuento en Dinero - Un Solo Uso) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-purple-200/80 space-y-4 text-xs shadow-xs" id="section-coupons">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-purple-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold uppercase tracking-wider text-purple-900 text-xs flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-purple-600" />
                <span>6. Generador de Cupones de Sorteo (Descuento en Dinero)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                {(formData.coupons || []).length} Cupones
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Crea cupones con descuento en soles para premiar a tus clientes en sorteos. Cada cupón es <strong>válido una sola vez</strong>: el sistema reconoce cuando se ingresa en una compra, descuenta automáticamente el valor en dinero y lo marca como canjeado.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold">
              🟢 {(formData.coupons || []).filter((c) => !c.isUsed).length} Disponibles
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold">
              🔒 {(formData.coupons || []).filter((c) => c.isUsed).length} Canjeados
            </span>
          </div>
        </div>

        {/* Formulario Generador de Cupón */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-orange-50/50 border border-purple-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-purple-600" />
              <span>Generar Nuevo Cupón de Sorteo</span>
            </h4>
            <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/60 px-2 py-0.5 rounded-md">
              Descuento directo en soles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Monto en dinero */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Valor del Cupón en Dinero ({formData.currencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-purple-700">
                  {formData.currencySymbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={couponAmount}
                  onChange={(e) => setCouponAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 font-black text-sm focus:outline-none focus:border-purple-600 shadow-2xs"
                  placeholder="10"
                />
              </div>

              {/* Botones rápidos de monto */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[5, 10, 15, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCouponAmount(amt)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      couponAmount === amt
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {formData.currencySymbol} {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Código del cupón (generador aleatorio) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">Código del Cupón *</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                  title="Generar otro código aleatorio"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Código Aleatorio</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 font-mono font-black text-xs uppercase tracking-wider focus:outline-none focus:border-purple-600 shadow-2xs"
                  placeholder="Ej. AURA-7K9P"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-2.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-300 shrink-0"
                  title="Generar código aleatorio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Código único para que el cliente lo ingrese en su compra.
              </p>
            </div>

            {/* 3. Motivo o Campaña */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Motivo / Sorteo (Opcional)
              </label>
              <input
                type="text"
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 shadow-2xs"
                placeholder="Ej. Ganador Sorteo Instagram, Ruleta"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Etiqueta interna para identificar el sorteo o cliente ganador.
              </p>
            </div>

          </div>

          {/* Botón de Creación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-purple-100">
            <div className="text-[11px] text-purple-900 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Se creará: Código <strong className="font-mono">{couponCode || 'ALEATORIO'}</strong> con descuento de <strong>{formData.currencySymbol} {couponAmount.toFixed(2)}</strong> (Válido para 1 sola compra).
              </span>
            </div>

            <button
              type="button"
              onClick={handleCreateCoupon}
              className="w-full sm:w-auto px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-101 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generar Cupón ({formData.currencySymbol} {couponAmount})</span>
            </button>
          </div>

          {couponFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{couponFeedback}</span>
            </div>
          )}
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCouponFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                couponFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({(formData.coupons || []).length})
            </button>
            <button
              type="button"
              onClick={() => setCouponFilter('available')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                couponFilter === 'available'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 Disponibles ({(formData.coupons || []).filter((c) => !c.isUsed).length})
            </button>
            <button
              type="button"
              onClick={() => setCouponFilter('used')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                couponFilter === 'used'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔒 Canjeados ({(formData.coupons || []).filter((c) => c.isUsed).length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código o sorteo..."
              value={couponSearch}
              onChange={(e) => setCouponSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Lista de Cupones Generados */}
        <div className="space-y-2 pt-1">
          {(() => {
            const all = formData.coupons || [];
            const list = all.filter((c) => {
              if (couponFilter === 'available' && c.isUsed) return false;
              if (couponFilter === 'used' && !c.isUsed) return false;
              if (couponSearch.trim()) {
                const q = couponSearch.toLowerCase().trim();
                const matchCode = c.code.toLowerCase().includes(q);
                const matchDesc = (c.description || '').toLowerCase().includes(q);
                const matchOrder = (c.usedInOrderNumber || '').toLowerCase().includes(q);
                if (!matchCode && !matchDesc && !matchOrder) return false;
              }
              return true;
            });

            if (list.length === 0) {
              return (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="font-semibold text-xs text-slate-600">No hay cupones que coincidan con el filtro</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Utiliza el generador de arriba para crear un nuevo cupón con descuento en dinero.
                  </p>
                </div>
              );
            }

            return list.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                  coupon.isUsed
                    ? 'bg-slate-50 border-slate-200 opacity-90'
                    : coupon.isActive
                    ? 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-xs'
                    : 'bg-amber-50/40 border-amber-200 opacity-75'
                }`}
              >
                {/* Info Izquierda */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    coupon.isUsed
                      ? 'bg-slate-200 text-slate-600 border-slate-300'
                      : 'bg-purple-100 text-purple-700 border-purple-200 shadow-2xs'
                  }`}>
                    <Ticket className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {coupon.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        -{formData.currencySymbol} {coupon.discountAmount.toFixed(2)} DESCUENTO
                      </span>
                      {coupon.isUsed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <span>🔒 Canjeado (1 sola compra)</span>
                        </span>
                      ) : coupon.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🟢 Disponible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏸️ Pausado
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      {coupon.description && (
                        <span className="text-purple-800 font-semibold">
                          🏷️ {coupon.description}
                        </span>
                      )}
                      <span>• Creado: {new Date(coupon.createdAt).toLocaleDateString('es-PE')}</span>
                      {coupon.isUsed && coupon.usedInOrderNumber && (
                        <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Canjeado en pedido #{coupon.usedInOrderNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones Derecha */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
                  
                  {/* Copiar Código */}
                  <button
                    type="button"
                    onClick={() => handleCopyCouponCode(coupon.code, coupon.id)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Copiar código para enviar al cliente ganador"
                  >
                    {copiedCouponId === coupon.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>

                  {/* Compartir por WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleShareCouponWhatsApp(coupon)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Enviar felicitación y código al cliente por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Reactivar si ya fue usado */}
                  {coupon.isUsed && (
                    <button
                      type="button"
                      onClick={() => handleResetCouponUsed(coupon.id)}
                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-bold cursor-pointer"
                      title="Volver a habilitar este cupón para otro uso"
                    >
                      Restablecer Uso
                    </button>
                  )}

                  {/* Toggle Activo */}
                  <button
                    type="button"
                    onClick={() => handleToggleCouponActive(coupon.id)}
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border cursor-pointer ${
                      coupon.isActive
                        ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                    title={coupon.isActive ? 'Pausar cupón' : 'Reanudar cupón'}
                  >
                    {coupon.isActive ? 'Pausar' : 'Activar'}
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCoupon(coupon.id);
                    }}
                    className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200 shadow-2xs active:scale-95 flex items-center justify-center shrink-0"
                    title="Eliminar este cupón permanentemente"
                    aria-label="Eliminar cupón"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ));
          })()}
        </div>
      </div>

      {/* 7. Chofer y Repartidor Oficial de Envíos (Rastreo en Vivo) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-emerald-800 text-xs flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>7. Chofer y Repartidor de Envíos (Rastreo en Vivo)</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Conexión WhatsApp
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Estos datos se mostrarán a tus clientes en el panel de seguimiento de pedidos en vivo. El botón <strong>"Contactar Chofer"</strong> abrirá una conversación directa de WhatsApp con el número configurado aquí.
        </p>

        {/* Driver Main Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Nombre Completo del Chofer / Repartidor *
            </label>
            <input
              type="text"
              value={formData.driverName || ''}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. Carlos Méndez R."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Número de WhatsApp del Chofer (con código de país) *
            </label>
            <input
              type="text"
              value={formData.driverWhatsapp || ''}
              onChange={(e) => setFormData({ ...formData, driverWhatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-sm focus:outline-none focus:bg-white focus:border-emerald-500 shadow-2xs"
              placeholder="Ej. 51987654321"
            />
            {formData.driverWhatsapp && (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Enlace directo: <code className="text-emerald-700 font-mono">wa.me/{formData.driverWhatsapp.replace(/\D/g, '')}</code></span>
                <a
                  href={`https://wa.me/${formData.driverWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline font-bold"
                >
                  Probar enlace ↗
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Driver Photo Upload / URL */}
        <div className="pt-3 border-t border-orange-100">
          <label className="block text-slate-700 font-semibold mb-2">Foto del Chofer / Repartidor</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Driver Photo Preview */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-50 border-2 border-orange-200 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
              {formData.driverPhoto ? (
                <img
                  src={formData.driverPhoto}
                  alt="Chofer Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-orange-400 font-bold text-lg">
                  {formData.driverName ? formData.driverName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : <User className="w-8 h-8 text-slate-400" />}
                </div>
              )}
            </div>

            {/* Input Options */}
            <div className="flex-1 space-y-2 w-full">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-orange-200 border-dashed rounded-2xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                <Upload className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-slate-600 font-medium">Haz clic aquí para seleccionar la fotografía del chofer desde tu equipo</span>
                <input type="file" accept="image/*" onChange={handleDriverPhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Additional Driver Credentials: Role and Vehicle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-orange-100">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Distintivo o Rango del Chofer (visible en tarjeta)
            </label>
            <input
              type="text"
              value={formData.driverRole || ''}
              onChange={(e) => setFormData({ ...formData, driverRole: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. Repartidor Elite Autorizado"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Vehículo o Tipo de Unidad
            </label>
            <input
              type="text"
              value={formData.driverVehicle || ''}
              onChange={(e) => setFormData({ ...formData, driverVehicle: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="Ej. Furgón Express de Reparto"
            />

          </div>
        </div>
      </div>


      {/* 8. Notificaciones en Tiempo Real y Push */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-orange-800 text-xs flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-orange-600" />
          <span>8. Notificaciones en Tiempo Real y Push en Celular</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-orange-100">
            <div>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-orange-600" />
                <span>Sonido de Notificación al recibir Nuevos Pedidos</span>
              </p>
              <p className="text-[11px] text-slate-500">Emite un tono acústico inmediato cada vez que un cliente confirma una orden</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestNotificationAlert}
                className="px-3 py-1 bg-white hover:bg-orange-50 text-orange-800 text-[11px] font-bold rounded-xl border border-orange-300 cursor-pointer shadow-2xs"
                title="Prueba sonido, vibración y push en este dispositivo"
              >
                Probar Alerta (Sonido + Push)
              </button>
              <input
                type="checkbox"
                checked={formData.notificationSound}
                onChange={(e) => setFormData({ ...formData, notificationSound: e.target.checked })}
                className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-orange-100">
            <div>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>Notificaciones Push en Navegador / Celular</span>
              </p>
              <p className="text-[11px] text-slate-500">Recibe alertas en la barra de estado de tu dispositivo móvil</p>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
            >
              Solicitar Permiso Push
            </button>
          </div>

          {pushStatus && (
            <div className="text-xs rounded-2xl p-3.5 border transition-all">
              {pushStatus === 'denied' && (
                <div className="space-y-2 text-rose-900 bg-rose-50/90 border border-rose-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <Info className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>El navegador tiene bloqueadas las notificaciones para este sitio</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Para permitirlas en Chrome o Edge:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-rose-700 space-y-1 font-medium pl-1">
                    <li>Haz clic en el ícono de <strong>Ajustes del sitio / Candado 🔒</strong> que está a la izquierda de la barra de direcciones (URL).</li>
                    <li>En el apartado <strong>Notificaciones</strong>, cambia de &quot;Bloquear&quot; a <strong>&quot;Permitir&quot;</strong>.</li>
                    <li>Recarga la página y vuelve a pulsar el botón <em>Solicitar Permiso Push</em>.</li>
                  </ol>
                </div>
              )}

              {pushStatus === 'iframe' && (
                <div className="space-y-2 text-amber-900 bg-amber-50/90 border border-amber-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Estás en la vista previa embebida (iFrame de AI Studio)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Por seguridad, los navegadores (Chrome, Safari, Edge) <strong>no permiten solicitar permisos de notificaciones push dentro de un iframe</strong>.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    👉 <strong>Para activarlas:</strong> Abre tu tienda directamente en tu dominio de Vercel en una pestaña independiente:
                  </p>
                  <a
                    href="https://val-tienda.vercel.app/?mode=admin"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                  >
                    <span>Abrir en val-tienda.vercel.app</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {pushStatus === 'ios_install_required' && (
                <div className="space-y-3 text-orange-950 bg-orange-50 border border-orange-200 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 font-extrabold text-orange-900 text-xs">
                    <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Configuración de Notificaciones Push en iPhone / iOS</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Por restricciones del sistema operativo de Apple (iOS), <strong>las notificaciones Push de páginas web en iPhone solo funcionan cuando la web se agrega a la Pantalla de Inicio</strong>.
                  </p>
                  
                  <div className="bg-white p-3 rounded-xl border border-orange-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-800">👉 Pasos para activarlas en tu iPhone en 1 minuto:</p>
                    <ol className="list-decimal list-inside text-[11px] text-slate-700 space-y-1.5 pl-1">
                      <li>
                        Abre <strong>Safari</strong> en tu iPhone y entra a <strong className="text-orange-700">https://val-tienda.vercel.app/?mode=admin</strong>
                      </li>
                      <li>
                        Toca el botón <strong>Compartir</strong> (el ícono de un cuadrado con flecha hacia arriba ⎋ o 📤 en la barra inferior de Safari).
                      </li>
                      <li>
                        Baja un poco y presiona <strong>&quot;Agregar a inicio&quot;</strong> (o <em>&quot;Añadir a pantalla de inicio&quot;</em> ➕).
                      </li>
                      <li>
                        Presiona <strong>&quot;Agregar&quot;</strong> arriba a la derecha. Se creará el ícono de tu tienda en tu pantalla como una App.
                      </li>
                      <li>
                        Abre esa nueva aplicación desde tu pantalla de inicio, ve a <strong>Configuración ➔ Solicitar Permiso Push</strong> y presiona <strong>&quot;Permitir&quot;</strong> cuando iOS te lo pregunte.
                      </li>
                    </ol>
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    Nota: Requiere iOS 16.4 o superior. En Android o PC con Google Chrome se activan directamente sin este paso.
                  </p>
                </div>
              )}

              {pushStatus === 'unsupported' && (
                <p className="text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  ⚠️ Este navegador o dispositivo no soporta la API estándar de notificaciones Push. Te recomendamos usar Google Chrome en Android o PC.
                </p>
              )}

              {pushStatus === 'dismissed' && (
                <p className="text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  ⚠️ La solicitud fue cancelada o cerrada sin aceptar. Vuelve a pulsar el botón para autorizarla.
                </p>
              )}

              {pushStatus.startsWith('✅') && (
                <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                  {pushStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 9. Seguridad & PIN de Acceso */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 space-y-4 text-xs shadow-xs">
        <h3 className="font-bold uppercase tracking-wider text-rose-700 text-xs flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-rose-600" />
          <span>9. Seguridad del Panel Administrador</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              PIN de Acceso Administrador (4 a 8 dígitos) *
            </label>
            <input
              type="password"
              maxLength={8}
              value={formData.adminPin}
              onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 font-black tracking-widest text-sm focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Este PIN protege tu panel para que ningún cliente ni persona no autorizada pueda ingresar.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Correo Electrónico del Administrador
            </label>
            <input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-orange-200 rounded-2xl text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 shadow-2xs"
              placeholder="admin@mitienda.com"
            />

          </div>
        </div>
      </div>


      <ReceiptSettingsPanel 
        settings={formData} 
        onChange={(updated) => {
          const newData = { ...formData, ...updated };
          setFormData(newData);
          onSaveSettings(newData);
        }} 
      />
    </form>
  );
};
