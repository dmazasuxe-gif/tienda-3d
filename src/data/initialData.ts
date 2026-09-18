import { Product, StoreSettings, Order, ShippingOption, Coupon, StoreBrand, RunwaySlide } from '../types';

export const DEFAULT_STORE_BRANDS: StoreBrand[] = [
  {
    id: "brand-bambulab",
    name: "Bambu Lab",
    label: "BAMBU LAB",
    logoUrl: "https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=800&auto=format&fit=crop&q=80",
    isActive: true,
    order: 1
  },
  {
    id: "brand-elegoo",
    name: "Elegoo",
    label: "ELEGOO",
    logoUrl: "https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80",
    isActive: true,
    order: 2
  },
  {
    id: "brand-creality",
    name: "Creality",
    label: "CREALITY",
    logoUrl: "https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80",
    isActive: true,
    order: 3
  },
  {
    id: "brand-anycubic",
    name: "Anycubic",
    label: "ANYCUBIC",
    logoUrl: "https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80",
    isActive: true,
    order: 4
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "3D-BAM-A1",
    name: "Bambu Lab A1 Mini",
    description: "Impresora 3D ultra rápida con calibración automática completa.",
    category: "impresoras_3d",
    techType: "fdm",
    brand: "Bambu Lab",
    price: 949,
    originalPrice: 1100,
    images: [
      "https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["Standard"],
    colors: [
      { name: "Blanco", hex: "#ffffff" }
    ],
    stock: 10,
    lowStockThreshold: 3,
    tags: ["bambulab", "a1", "mini", "fdm"],
    isFeatured: true,
    isNew: true,
    materials: "FDM, PLA, PETG",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "prod-2",
    sku: "3D-ELE-MARS5",
    name: "Mars 5 Ultra",
    description: "Impresora de resina de alta resolución con pantalla monocromática.",
    category: "impresoras_3d",
    techType: "resina",
    brand: "Elegoo",
    price: 1699,
    images: [
      "https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["Standard"],
    colors: [
      { name: "Negro", hex: "#000000" }
    ],
    stock: 5,
    lowStockThreshold: 2,
    tags: ["elegoo", "mars", "resina"],
    isFeatured: true,
    isNew: true,
    materials: "Resina UV",
    createdAt: "2026-08-02T10:00:00Z"
  },
  {
    id: "prod-3",
    sku: "FIL-CRE-PLA",
    name: "Filamento Hyper PLA 1kg",
    description: "Filamento PLA de alta velocidad para impresoras 3D rápidas.",
    category: "filamentos",
    techType: "fdm",
    brand: "Creality",
    price: 89,
    originalPrice: 110,
    images: [
      "https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["1KG"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Blanco", hex: "#ffffff" }
    ],
    stock: 50,
    lowStockThreshold: 10,
    tags: ["filamento", "pla", "creality"],
    isFeatured: true,
    isNew: false,
    materials: "PLA",
    createdAt: "2026-08-03T10:00:00Z"
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'KREAR 3D',
  slogan: 'LÍDERES EN FABRICACIÓN DIGITAL',
  logoUrl: 'https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=800&auto=format&fit=crop&q=80',
  whatsappNumber: '51982001288',
  whatsappDisplayNumber: '+51 982 001 288',
  whatsappAdvisorName: 'Soporte KREAR 3D',
  currencySymbol: 'S/',
  currencyCode: 'PEN',
  freeShippingThreshold: 500,
  standardShippingCost: 15,
  adminPin: '1234',
  adminEmail: 'admin@krear3d.com',
  notificationSound: true,
  pushNotifications: true,
  bannerNotice: '🔥 PROMOCIÓN CAMPAÑA MAKER: DESCUENTOS HASTA 10/10 🔥',
  bannerNoticeActive: true,
  storeAddress: 'Calle Javier Fernández 262 Miraflores - Lima',
  runwaySlides: [
    { id: 'slide-1', imageUrl: 'https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=1600&auto=format&fit=crop&q=80' },
    { id: 'slide-2', imageUrl: 'https://images.unsplash.com/photo-1615286595561-2401dc228ff0?w=1600&auto=format&fit=crop&q=80' }
  ],
  brands: DEFAULT_STORE_BRANDS,
  shippingOptions: [
    { id: 'ship-1', name: 'Envío Regular', price: 15, estimatedTime: '2 a 3 días hábiles', isActive: true },
    { id: 'ship-2', name: 'Envío Express (Lima)', price: 25, estimatedTime: 'Mismo día o 24 hrs', isActive: true },
    { id: 'ship-3', name: 'Recojo en Tienda', price: 0, estimatedTime: 'A partir del día siguiente', isActive: true }
  ],
  coupons: [],
  receiptSettings: {
    ruc: '20601234567',
    legalName: 'KREAR 3D S.A.C.',
    address: 'Calle Javier Fernández 262 Miraflores - Lima',
    phone: '+51 982 001 288',
    logoUrl: 'https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=200&auto=format&fit=crop&q=80',
    footerMessage: 'Gracias por tu compra. ¡Líderes en Fabricación Digital!',
    paperWidth: '80mm',
    fontSize: 'normal',
    showCustomerInfo: true,
    showOrderNotes: true,
    showQrCode: false
  },
  productStripImages: [
    "/images/maceta_3d.jpg",
    "/images/figura_3d.jpg",
    "/images/objeto_cocina_3d.jpg",
    "https://images.unsplash.com/photo-1629853925585-7098e94a8731?w=800&auto=format&fit=crop&q=80"
  ],
  topBarColor: "#111111",
  topBarTexts: [
    "✨ ENVÍOS GRATIS A TODO EL PERÚ",
    "💎 CALIDAD PREMIUM EN IMPRESIÓN 3D",
    "🚚 ENTREGA SEGURA Y RÁPIDA"
  ]
};
