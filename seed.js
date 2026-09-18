import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    id: "prod_001",
    name: "Maceta Geométrica 3D",
    description: "Hermosa maceta impresa en 3D con diseño geométrico y acabado mate. Ideal para suculentas y plantas pequeñas. Fabricada en PLA biodegradable.",
    price: 15.99,
    stock: 20,
    category: "Hogar",
    images: ["/3d_planter.jpg"],
    sizes: ["S", "M", "L"],
    colors: ["Blanco", "Negro", "Gris"],
    brand: "MQ3D Original",
    isNew: true,
    tags: ["hogar", "maceta", "suculenta", "decoracion"]
  },
  {
    id: "prod_002",
    name: "Dragón de Fantasía (Resina)",
    description: "Figura de dragón altamente detallada impresa en resina gris de alta resolución. Perfecta para coleccionistas, pintores de miniaturas o juegos de rol.",
    price: 45.00,
    stock: 5,
    category: "Figuras",
    images: ["/3d_figure.jpg"],
    sizes: ["Estándar"],
    colors: ["Gris Resina"],
    brand: "MQ3D Miniatures",
    isNew: true,
    tags: ["figura", "dragon", "fantasia", "resina", "rol"]
  },
  {
    id: "prod_003",
    name: "Set de Cucharas Medidoras 3D",
    description: "Juego de cucharas medidoras de colores pasteles impresas en 3D. Diseño elegante y moderno, perfectas para darle vida a tu cocina.",
    price: 12.50,
    stock: 50,
    category: "Cocina",
    images: ["/3d_kitchen.jpg"],
    sizes: ["Única"],
    colors: ["Pastel Mix"],
    brand: "MQ3D Home",
    isNew: true,
    tags: ["cocina", "medidoras", "accesorios", "util"]
  }
];

async function seed() {
  console.log("Insertando productos de prueba...");
  
  // Limpiamos los productos anteriores (opcional, pero útil si se corre varias veces)
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 'dummy');
  if (deleteError) {
     console.error("Error limpiando tabla:", deleteError);
  }

  const { data, error } = await supabase
    .from('products')
    .insert(products);

  if (error) {
    console.error("Error al insertar:", error);
  } else {
    console.log("¡3 Productos insertados exitosamente!");
  }
}

seed();
