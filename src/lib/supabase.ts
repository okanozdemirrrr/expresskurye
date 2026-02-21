import { createClient } from '@supabase/supabase-js';

// Environment variables'dan oku
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kritik kontrol
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ HATA: Supabase yapılandırması eksik!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'TANIMSIZ');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Mevcut' : 'TANIMSIZ');
  throw new Error(
    '⚠️ Supabase URL veya Anon Key eksik!\n\n' +
    'Lütfen .env.local dosyasını kontrol edin:\n' +
    '• NEXT_PUBLIC_SUPABASE_URL tanımlı mı?\n' +
    '• NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı mı?\n\n' +
    'Dev server\'ı yeniden başlatmayı deneyin.'
  );
}

console.log('✅ Supabase Init - URL:', supabaseUrl);
console.log('✅ Supabase Init - Key:', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface PackageData {
  pickup_lat: number;
  pickup_lng: number;
  pickup_district: string;
  pickup_address: string;
  pickup_name: string;
  pickup_phone: string;
  delivery_lat: number;
  delivery_lng: number;
  delivery_district: string;
  delivery_address: string;
  delivery_name: string;
  delivery_phone: string;
  desi: string;
  content: string;
  payment_method: string;
  payer: string;
}
