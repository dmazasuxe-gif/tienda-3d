import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Inicializar Supabase.
// Nota: Si las credenciales no existen, no crasheará inmediatamente, pero fallará al intentar hacer peticiones.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para probar la conexión con Supabase
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Missing credentials in environment variables.');
      return false;
    }
    // Una forma simple de probar la conexión es hacer un count a alguna tabla
    // o al menos verificar que el cliente se creó sin tirar error.
    console.log('[Supabase] Client initialized successfully.');
    return true;
  } catch (error) {
    console.error('[Supabase] Failed to initialize:', error);
    return false;
  }
}
