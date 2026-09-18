import React, { useState, useEffect } from 'react';
import { CartItem, StoreSettings, Order, PaymentMethodType } from '../types';
import { 
  X, 
  CheckCircle2, 
  MessageCircle, 
  MapPin, 
  User, 
  CreditCard, 
  QrCode,
  Building2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getOrderWhatsAppUrl, 
  getContraEntregaWhatsAppUrl, 
  getYapeProofWhatsAppUrl, 
  getBankTransferProofWhatsAppUrl,
  formatPaymentMethod 
} from '../utils/whatsapp';
import { saveLastTrackedCode } from '../utils/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  discount: number;
  promoCode: string;
  settings: StoreSettings;
  onOrderPlaced: (order: Order) => Promise<void>;
  onOpenTracking?: (orderCode: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  discount,
  promoCode,
  settings,
  onOrderPlaced,
  onOpenTracking
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lima');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('yape_plin');
  
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      }).catch(() => {
        fallbackCopy(text, key);
      });
    } else {
      fallbackCopy(text, key);
    }
  };

  const fallbackCopy = (text: string, key: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.error('Could not copy text', e);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Active shipping options from settings
  const activeShippingOptions = (settings.shippingOptions && settings.shippingOptions.length > 0)
    ? settings.shippingOptions.filter((opt) => opt.isActive)
    : [];

  const [selectedShippingId, setSelectedShippingId] = useState<string>(() => {
    const firstActive = (settings.shippingOptions || []).find((opt) => opt.isActive);
    return firstActive ? firstActive.id : 'standard';
  });

  const selectedShippingOption = activeShippingOptions.find((opt) => opt.id === selectedShippingId) 
    || activeShippingOptions[0] 
    || null;

  const isFreeShipping = subtotal >= settings.freeShippingThreshold;
  const shippingCost = selectedShippingOption
    ? (selectedShippingOption.price === 0 || (isFreeShipping && selectedShippingOption.price <= settings.standardShippingCost)
        ? 0 
        : selectedShippingOption.price)
    : (isFreeShipping ? 0 : settings.standardShippingCost);

  const total = Math.max(0, subtotal - discount + shippingCost);

  // Auto redirect for Contra Entrega after confirmation
  useEffect(() => {
    if (placedOrder && placedOrder.paymentMethod === 'contra_entrega') {
      const timer = setTimeout(() => {
        const url = getContraEntregaWhatsAppUrl(settings, placedOrder);
        window.open(url, '_blank');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [placedOrder, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [k: string]: string } = {};

    if (!customerName.trim()) errors.customerName = 'Por favor ingresa tu nombre y apellido';
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 7) {
      errors.customerPhone = 'Por favor ingresa un número de WhatsApp válido';
    }
    if (!shippingAddress.trim()) errors.shippingAddress = 'Por favor ingresa tu dirección de entrega';
    if (!city.trim()) errors.city = 'Por favor especifica tu ciudad o distrito';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AUR-${randomSuffix}`;

    const finalNotes = [
      notes.trim(),
      selectedShippingOption ? `Método de envío: ${selectedShippingOption.name} (${selectedShippingOption.estimatedTime})` : '',
      (promoCode && discount > 0) ? `Cupón Canjeado: ${promoCode} (-${settings.currencySymbol} ${discount.toFixed(2)})` : ''
    ].filter(Boolean).join(' • ');

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      city: city.trim(),
      items: [...cart],
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (customerEmail.trim()) {
      newOrder.customerEmail = customerEmail.trim();
    }
    if (finalNotes) {
      newOrder.notes = finalNotes;
    }

    try {
      await onOrderPlaced(newOrder);
      saveLastTrackedCode(orderNumber);
      setPlacedOrder(newOrder);
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Hubo un error al procesar la orden. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const yapeNumberToDisplay = settings.yapeNumber || settings.whatsappDisplayNumber || '987 654 321';
  const yapeHolderToDisplay = settings.yapeHolderName || settings.whatsappAdvisorName || settings.storeName;
  const yapeQrToDisplay = settings.yapeQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=YAPE-PLIN-${yapeNumberToDisplay.replace(/\D/g, '')}&color=18181b&bgcolor=ffffff`;

  const bankAccountsToDisplay = (settings.bankAccounts && settings.bankAccounts.length > 0) ? settings.bankAccounts : [
    {
      id: 'default-bcp',
      bankName: 'BCP (Banco de Crédito)',
      accountNumber: '193-98765432-0-12',
      cci: '002-193-009876543201-12',
      holderName: settings.storeName,
    },
    {
      id: 'default-bbva',
      bankName: 'BBVA Continental',
      accountNumber: '0011-0123-0200987654',
      cci: '011-123-000200987654-15',
      holderName: settings.storeName,
    },
    {
      id: 'default-interbank',
      bankName: 'Interbank',
      accountNumber: '200-3001234567',
      cci: '003-200-003001234567-28',
      holderName: settings.storeName,
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div className="fixed inset-0" onClick={placedOrder ? onClose : undefined} />

      <div className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[95vh] flex flex-col text-zinc-900">
        
        {/* Minimal Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span>{placedOrder ? '¡Pedido Confirmado!' : 'Finalizar Pedido'}</span>
            </h2>
            <p className="text-xs text-zinc-500">
              {placedOrder ? 'Tu orden ha sido registrada en nuestro sistema' : 'Completa tus datos para coordinar el despacho'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Form or Success Screen with QR/Banks/ContraEntrega */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-5">
          {placedOrder ? (
            <div className="space-y-6 text-center py-2">
              
              {/* Status Header Badge */}
              <div className="w-16 h-16 bg-zinc-100 text-black rounded-full flex items-center justify-center mx-auto border border-zinc-200 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">Orden Registrada Exitosamente</span>
                <h3 className="text-2xl sm:text-3xl font-black text-black mt-1 font-mono">
                  #{placedOrder.orderNumber}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md mx-auto">
                  Gracias <strong>{placedOrder.customerName}</strong>. Total de tu pedido: <strong className="text-black text-base">{settings.currencySymbol} {placedOrder.total.toFixed(2)}</strong>.
                </p>
              </div>

              {/* Live Tracking Highlight Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center border border-zinc-200 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Código de Rastreo Oficial</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-black text-black font-mono bg-white px-2.5 py-0.5 rounded-lg border border-zinc-200">
                        #{placedOrder.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(placedOrder.orderNumber, 'tracking_code')}
                        className="px-2 py-1 bg-white hover:bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded-lg border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedKey === 'tracking_code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                        <span>{copiedKey === 'tracking_code' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {onOpenTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      const code = placedOrder.orderNumber;
                      onClose();
                      onOpenTracking(code);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#F0713D] hover:bg-[#d95d28] text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all uppercase tracking-wider shadow-xs"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Rastrear en Vivo</span>
                  </button>
                )}
              </div>

              {/* ---------------------------------------------------- */}
              {/* CASE 1: YAPE / PLIN (QR + Number + Copy + Holder) */}
              {/* ---------------------------------------------------- */}
              {placedOrder.paymentMethod === 'yape_plin' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F0713D] text-white flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-black uppercase">Pagar con Yape o Plin</h4>
                        <p className="text-[11px] text-zinc-500">Escanea el código QR o transfiere al número</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#F0713D] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                      YAPE / PLIN
                    </span>
                  </div>

                  {/* QR Image Presentation */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200">
                    <div className="relative group shrink-0 text-center">
                      <img
                        src={yapeQrToDisplay}
                        alt="Código QR Yape Plin"
                        className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl object-cover bg-white p-2 border border-zinc-200 shadow-xs mx-auto"
                        referrerPolicy="no-referrer"
                      />
                      <a
                        href={yapeQrToDisplay}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="QR_Yape.png"
                        className="mt-2 text-[11px] text-zinc-600 hover:text-black flex items-center justify-center gap-1 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar / Ver QR</span>
                      </a>
                    </div>

                    <div className="space-y-3 flex-1 text-left w-full">
                      {/* Amount to pay */}
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Monto Exacto a Yapear</span>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-black">{settings.currencySymbol} {placedOrder.total.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(placedOrder.total.toFixed(2), 'yape_amount')}
                            className="px-2 py-1 bg-white hover:bg-zinc-100 text-black text-[10px] font-bold rounded-md border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            {copiedKey === 'yape_amount' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'yape_amount' ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <span className="text-[10px] text-zinc-500 block font-medium">Número Yape / Plin:</span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200 mt-0.5 shadow-2xs">
                          <span className="text-sm font-black text-black font-mono tracking-wider">{yapeNumberToDisplay}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(yapeNumberToDisplay.replace(/\s/g, ''), 'yape_num')}
                            className="px-2.5 py-1 bg-[#F0713D] text-white hover:bg-[#d95d28] text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === 'yape_num' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-zinc-300" />}
                            <span>{copiedKey === 'yape_num' ? '¡Copiado!' : 'Copiar Número'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Holder */}
                      <div>
                        <span className="text-[10px] text-zinc-500 block font-medium">Titular de la Cuenta:</span>
                        <p className="text-xs font-bold text-black">{yapeHolderToDisplay}</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={getYapeProofWhatsAppUrl(settings, placedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer uppercase tracking-wider text-center shadow-xs"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-900 shrink-0" />
                    <span>Enviar Comprobante por WhatsApp</span>
                  </a>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* CASE 2: TRANSFERENCIA BANCARIA (Bank Accounts + Copy) */}
              {/* ---------------------------------------------------- */}
              {placedOrder.paymentMethod === 'transferencia' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F0713D] text-white flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-black uppercase">Cuentas Bancarias</h4>
                        <p className="text-[11px] text-zinc-500">Transfiere desde tu banca móvil favorita</p>
                      </div>
                    </div>
                    <span className="text-black font-black text-sm">
                      {settings.currencySymbol} {placedOrder.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Bank Accounts List */}
                  <div className="space-y-3">
                    {bankAccountsToDisplay.map((bank, index) => (
                      <div key={bank.id || index} className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
                        <span className="font-bold text-xs sm:text-sm text-black flex items-center gap-1.5">
                          🏦 {bank.bankName}
                        </span>

                        {/* Account Number */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] text-zinc-500 block font-medium">N° de Cuenta:</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-black tracking-wide truncate block">
                              {bank.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.accountNumber.replace(/\s/g, ''), `bank_acc_${index}`)}
                            className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                          >
                            {copiedKey === `bank_acc_${index}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === `bank_acc_${index}` ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>

                        {/* CCI if available */}
                        {bank.cci && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] text-zinc-500 block font-medium">CCI (Interbancario):</span>
                              <span className="text-xs sm:text-sm font-mono font-bold text-zinc-800 tracking-wide truncate block">
                                {bank.cci}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(bank.cci!.replace(/\s/g, ''), `bank_cci_${index}`)}
                              className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                            >
                              {copiedKey === `bank_cci_${index}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === `bank_cci_${index}` ? '¡Copiado!' : 'Copiar CCI'}</span>
                            </button>
                          </div>
                        )}

                        {bank.holderName && (
                          <div className="text-[11px] text-zinc-500">
                            <span>Titular: </span>
                            <strong className="text-black">{bank.holderName}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <a
                    href={getBankTransferProofWhatsAppUrl(settings, placedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-[#F0713D] hover:bg-[#d95d28] text-white font-bold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer uppercase tracking-wider text-center shadow-xs"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-black shrink-0" />
                    <span>Enviar Comprobante por WhatsApp</span>
                  </a>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* CASE 3: PAGO CONTRA ENTREGA                          */}
              {/* ---------------------------------------------------- */}
              {placedOrder.paymentMethod === 'contra_entrega' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-4">
                  <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0713D] text-white flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase">Pago Contra Entrega</h4>
                      <p className="text-xs text-zinc-500">Pagas en efectivo o Yape al recibir tu paquete en casa</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2 text-xs text-zinc-700">
                    <p>📍 <strong>Dirección de Entrega:</strong> {placedOrder.shippingAddress}, {placedOrder.city}</p>
                    <p>💰 <strong>Monto a pagar al recibir:</strong> <span className="font-black text-black text-sm">{settings.currencySymbol} {placedOrder.total.toFixed(2)}</span></p>
                    <p>📞 <strong>Teléfono de contacto:</strong> {placedOrder.customerPhone}</p>
                  </div>

                  <a
                    href={getContraEntregaWhatsAppUrl(settings, placedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2.5 transition-all cursor-pointer uppercase tracking-wider text-center shadow-xs"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-800 shrink-0" />
                    <span>Confirmar Entrega en WhatsApp</span>
                  </a>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* CASE 4: COORDINAR POR WHATSAPP (General)             */}
              {/* ---------------------------------------------------- */}
              {placedOrder.paymentMethod === 'whatsapp' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-4">
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2 text-xs text-zinc-700">
                    <p>📍 <strong>Destino:</strong> {placedOrder.shippingAddress}, {placedOrder.city}</p>
                    <p>📱 <strong>Teléfono de contacto:</strong> {placedOrder.customerPhone}</p>
                    <p>💳 <strong>Método:</strong> {formatPaymentMethod(placedOrder.paymentMethod)}</p>
                  </div>

                  <a
                    href={getOrderWhatsAppUrl(settings, placedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer text-center shadow-xs uppercase tracking-wider"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-800 shrink-0" />
                    <span>Enviar Pedido a WhatsApp</span>
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-full transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Volver a la tienda
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Order Summary Strip */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-zinc-500 text-[11px] block font-medium">Total a pagar ({cart.length} productos):</span>
                    <p className="text-base font-black text-black">
                      {settings.currencySymbol} {total.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-emerald-700 font-bold text-[10px] sm:text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    {isFreeShipping ? 'Envío Gratis' : `Envío: ${settings.currencySymbol} ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && promoCode && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                    <span>Cupón Aplicado ({promoCode}):</span>
                    <span className="font-bold">-{settings.currencySymbol} {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Customer Personal Details */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Datos del Cliente</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">Nombre y Apellido *</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formErrors.customerName) setFormErrors({ ...formErrors, customerName: '' });
                      }}
                      className={`w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors ${
                        formErrors.customerName ? 'border-rose-500' : 'border-zinc-200'
                      }`}
                    />
                    {formErrors.customerName && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">WhatsApp / Teléfono *</label>
                    <input
                      type="tel"
                      placeholder="Ej. 987654321"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (formErrors.customerPhone) setFormErrors({ ...formErrors, customerPhone: '' });
                      }}
                      className={`w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors ${
                        formErrors.customerPhone ? 'border-rose-500' : 'border-zinc-200'
                      }`}
                    />
                    {formErrors.customerPhone && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Dirección de Despacho</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">Dirección / Calle / N° / Dpto *</label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Larco 450 Dpto 302"
                      value={shippingAddress}
                      onChange={(e) => {
                        setShippingAddress(e.target.value);
                        if (formErrors.shippingAddress) setFormErrors({ ...formErrors, shippingAddress: '' });
                      }}
                      className={`w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors ${
                        formErrors.shippingAddress ? 'border-rose-500' : 'border-zinc-200'
                      }`}
                    />
                    {formErrors.shippingAddress && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors.shippingAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">Ciudad / Distrito *</label>
                    <input
                      type="text"
                      placeholder="Ej. Miraflores, Lima"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                      }}
                      className={`w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors ${
                        formErrors.city ? 'border-rose-500' : 'border-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-700 mb-1 font-semibold">Notas o Referencias (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Dejar en conserjería"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Shipping Method Options Selector */}
              {activeShippingOptions.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Método de Envío</span>
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeShippingOptions.map((opt) => {
                      const isSelected = selectedShippingId === opt.id || (selectedShippingOption?.id === opt.id);
                      const isFreeForThis = opt.price === 0 || (isFreeShipping && opt.price <= settings.standardShippingCost);
                      
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedShippingId(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-100 border-black text-black font-bold ring-1 ring-black'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5 w-full">
                            <span className="font-bold text-xs leading-tight">{opt.name}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                              isFreeForThis
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-zinc-200 text-zinc-800'
                            }`}>
                              {isFreeForThis ? 'GRATIS' : `${settings.currencySymbol} ${opt.price.toFixed(2)}`}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{opt.estimatedTime}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Método de Pago</span>
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'yape_plin' as const, label: '📱 Yape / Plin', desc: 'QR o número' },
                    { id: 'transferencia' as const, label: '🏦 Transferencia', desc: 'Bancos nacionales' },
                    { id: 'contra_entrega' as const, label: '📦 Contra Entrega', desc: 'Pagas al recibir' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-zinc-100 border-black text-black font-bold ring-1 ring-black'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#F0713D] hover:bg-[#d95d28] text-white font-black rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <span>Procesando pedido...</span>
                  ) : (
                    <>
                      <span>Confirmar Pedido • {settings.currencySymbol} {total.toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Tu pedido será registrado y coordinado directamente con la tienda vía WhatsApp</span>
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
