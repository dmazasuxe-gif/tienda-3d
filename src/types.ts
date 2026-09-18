export type CategoryType = string;
export type TechType = 'fdm' | 'sla' | 'laser_diodo' | 'laser_co2' | 'cnc' | 'otro';

export type ElementType = 'barcode' | 'text' | 'image';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content: string; 
  width?: number; 
  height?: number; 
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  isVariable?: boolean;
  variableField?: 'productName' | 'price' | 'sku' | 'brand';
}

export interface LabelTemplate {
  sizeId: string;
  widthPx: number;
  heightPx: number;
  elements: LabelElement[];
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: CategoryType;
  techType: TechType;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  lowStockThreshold: number;
  tags?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  materials?: string;
  careGuide?: string;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart item id (productId + size + color)
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado';

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "BCP", "BBVA", "Interbank", "Banco de la Nación", "Scotiabank"
  accountNumber: string; // e.g. "193-98765432-0-12"
  cci?: string; // e.g. "002-193-009876543201-12"
  accountHolder: string; // e.g. "AURA MODA & CALZADO S.A.C."
  accountType?: string; // e.g. "Cuenta Corriente Soles" o "Ahorros Soles"
}

export type PaymentMethodType = 'yape_plin' | 'transferencia' | 'contra_entrega' | 'whatsapp' | 'tarjeta';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  categories?: string[];
  logoUrl: string;
  whatsappNumber: string; // e.g. "51987654321" (without + or spaces for api links)
  whatsappDisplayNumber: string; // e.g. "+51 987 654 321"
  whatsappAdvisorName: string;
  currencySymbol: string;
  currencyCode: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  adminPin: string;
  adminEmail: string;
  notificationSound: boolean;
  pushNotifications: boolean;
  bannerNotice: string;
  bannerNoticeActive: boolean;
  storeAddress: string;
  storeInstagram?: string;
  storeFacebook?: string;

  // Métodos de Pago Digitales & Bancarios
  yapeNumber?: string; // e.g. "987 654 321"
  yapeHolder?: string; // e.g. "Aura Moda & Calzado"
  yapeQrUrl?: string; // URL o DataURL del QR de Yape
  plinNumber?: string; // e.g. "987 654 321"
  plinHolder?: string; // e.g. "Aura Moda & Calzado"
  plinQrUrl?: string;
  bankAccounts?: BankAccount[];

  // Pasarela de Imágenes / Runway Slides
  runwaySlides?: RunwaySlide[];

  // Pasarela de Marcas / Logos (Deprecado a favor de productStripImages)
  brands?: StoreBrand[];
  productStripImages?: string[];
  productStripSpeed?: number;

  // Barra Superior Animada
  topBarColor?: string;
  topBarTexts?: string[];

  // Opciones y Métodos de Envío
  shippingOptions?: ShippingOption[];

  // Cupones de Sorteo / Descuento en Dinero (Un solo uso)
  coupons?: Coupon[];

  // Datos del Chofer / Repartidor de Envíos
  driverName?: string;
  driverPhoto?: string;
  driverWhatsapp?: string;
  driverRole?: string;
  driverVehicle?: string;

  // Plantillas de WhatsApp
  whatsappTemplates?: {
    orderGeneric?: string;
    orderContraEntrega?: string;
    orderYapePlin?: string;
    orderTransferencia?: string;
    trackingQuery?: string;
    driverContact?: string;
    generalSupport?: string;
  };
  
  // Configuración de Boleta / Ticket de Venta
  receiptSettings?: {
    ruc: string;
    legalName: string;
    address: string;
    phone: string;
    logoUrl: string;
    footerMessage: string;
    // Configuraciones de Diseño
    paperWidth?: '58mm' | '80mm';
    fontSize?: 'small' | 'normal' | 'large';
    showCustomerInfo?: boolean;
    showOrderNotes?: boolean;
    showQrCode?: boolean;
  };
  
  // Plantilla Global de Etiquetas
  labelTemplate?: LabelTemplate;
}

export interface Coupon {
  id: string;
  code: string; // Código alfanumérico único (ej. AURA-8F3K)
  discountAmount: number; // Monto en dinero a descontar (ej. 10.00 soles)
  description?: string; // Motivo o campaña (ej. "Sorteo Instagram", "Premio Ruleta")
  createdAt: string;
  isUsed: boolean; // Válido solo una sola vez para una sola compra
  usedAt?: string; // Fecha en que se canjeó
  usedInOrderNumber?: string; // Número de pedido donde se usó (ej. AUR-4921)
  isActive: boolean; // Estado activo o inactivo
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
  description?: string;
  isActive: boolean;
}

export interface StoreBrand {
  id: string;
  name: string; // e.g. "Nike", "Adidas", "Jordan"
  logoUrl: string; // URL or Data URL (uploaded base64 image)
  label?: string; // Optional custom display text/label (e.g. "NIKE")
  websiteUrl?: string; // Optional link or filter
  isActive: boolean; // Toggle to show/hide in the storefront
  order?: number; // Ordering index
}

export interface FilterState {
  search: string;
  category: 'all' | CategoryType;
  techType: 'all' | TechType;
  selectedBrands: string[];
  selectedSizes: string[];
  selectedColors: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'discount';
}

export interface OrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  timestamp: string;
  read: boolean;
}

export interface RunwaySlide {
  id: string;
  imageUrl: string;
}
