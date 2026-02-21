import { supabase } from '@/lib/supabase';

// 9x9 VIP Fiyat Matrisi (TL cinsinden)
// Satır: Çıkış Bölgesi, Sütun: Varış Bölgesi
export const ZONE_PRICING_MATRIX: number[][] = [
  // B1    B2    B3    B4    B5    B6    B7    B8    B9(Adalar)
  [500,  600,  700,  800,  900,  1000, 1100, 1200, 0], // Bölge 1 (Adalar dinamik)
  [600,  500,  650,  750,  850,  950,  1050, 1150, 0], // Bölge 2 (Adalar dinamik)
  [700,  650,  500,  700,  800,  900,  1000, 1100, 0], // Bölge 3 (Adalar dinamik)
  [800,  750,  700,  500,  750,  850,  950,  1050, 0], // Bölge 4 (Adalar dinamik)
  [900,  850,  800,  750,  500,  800,  900,  1000, 0], // Bölge 5 (Adalar dinamik)
  [1000, 950,  900,  850,  800,  500,  850,  950,  0], // Bölge 6 (Adalar dinamik)
  [1100, 1050, 1000, 950,  900,  850,  500,  900,  0], // Bölge 7 (Adalar dinamik)
  [1200, 1150, 1100, 1050, 1000, 950,  900,  500,  0], // Bölge 8 (Adalar dinamik)
  [0,    0,    0,    0,    0,    0,    0,    0,    500], // Bölge 9 (Adalar - kendi içi 500, dışarı dinamik)
];

// Adalar'a coğrafi yakınlık grupları (ilçe bazında)
// Grup numarası ne kadar düşükse, Adalar'a o kadar yakın
export const ADALAR_PROXIMITY_GROUPS: { [district: string]: number } = {
  // Grup 1: En Yakın (2500 ₺)
  'Kadıköy': 1,
  'Maltepe': 1,
  'Kartal': 1,
  
  // Grup 2: Çok Yakın (2750 ₺ = 2500 × 1.1)
  'Üsküdar': 2,
  'Pendik': 2,
  'Tuzla': 2,
  
  // Grup 3: Yakın (3000 ₺ = 2500 × 1.2)
  'Ataşehir': 3,
  'Ümraniye': 3,
  'Beykoz': 3,
  
  // Grup 4: Orta (3250 ₺ = 2500 × 1.3)
  'Çekmeköy': 4,
  'Sancaktepe': 4,
  'Sultanbeyli': 4,
  'Şile': 4,
  
  // Grup 5: Uzak (3500 ₺ = 2500 × 1.4)
  'Beşiktaş': 5,
  'Fatih': 5,
  'Bakırköy': 5,
  'Zeytinburnu': 5,
  
  // Grup 6: Çok Uzak (3750 ₺ = 2500 × 1.5)
  'Beyoğlu': 6,
  'Şişli': 6,
  'Kağıthane': 6,
  'Sarıyer': 6,
  
  // Grup 7: Çok Çok Uzak (4000 ₺ = 2500 × 1.6)
  'Eyüpsultan': 7,
  'Bayrampaşa': 7,
  'Güngören': 7,
  'Bahçelievler': 7,
  'Esenler': 7,
  
  // Grup 8: Aşırı Uzak (4250 ₺ = 2500 × 1.7)
  'Gaziosmanpaşa': 8,
  'Sultangazi': 8,
  'Bağcılar': 8,
  'Küçükçekmece': 8,
  'Avcılar': 8,
  
  // Grup 9: En Uzak (4500 ₺ = 2500 × 1.8)
  'Başakşehir': 9,
  'Arnavutköy': 9,
  'Beylikdüzü': 9,
  'Esenyurt': 9,
  'Büyükçekmece': 9,
  'Çatalca': 9,
  'Silivri': 9,
  
  // Adalar kendi içi
  'Adalar': 0,
};

// Trafik yoğunluğu çarpanı
const TRAFFIC_MULTIPLIER = 1.15; // %15 artış

// Adalar baz fiyatı
const ADALAR_BASE_PRICE = 2500;

// Desi çarpanları
export const DESI_MULTIPLIERS: { [key: string]: number } = {
  '0-2': 1.0,
  '2-5': 1.01,
  '5-10': 1.05,
  '10-20': 1.10,
};

/**
 * Desi değerine göre çarpan döndürür
 */
function getDesiMultiplier(desi: string): number {
  return DESI_MULTIPLIERS[desi] || 1.0;
}

// Bölge-İlçe mapping cache
let districtZoneCache: { [key: string]: number } | null = null;

/**
 * Supabase'den bölge verilerini yükler ve cache'e alır
 */
export async function loadDistrictZones(): Promise<{ [key: string]: number }> {
  if (districtZoneCache) {
    return districtZoneCache;
  }

  try {
    const { data, error } = await supabase
      .from('zones')
      .select('zones')
      .single();

    if (error) throw error;

    if (data && data.zones) {
      districtZoneCache = data.zones;
      console.log('✅ Bölge verileri yüklendi:', districtZoneCache);
      return data.zones;
    }

    console.warn('⚠️ Bölge verisi bulunamadı, varsayılan değerler kullanılıyor');
    return {};
  } catch (error) {
    console.error('❌ Bölge verisi yükleme hatası:', error);
    return {};
  }
}

/**
 * İlçenin bölge numarasını döndürür
 */
export function getDistrictZone(districtName: string, zones: { [key: string]: number }): number | null {
  const zone = zones[districtName];
  if (!zone) {
    console.warn(`⚠️ ${districtName} için bölge bulunamadı`);
    return null;
  }
  return zone;
}

/**
 * Şu anki saatin trafik yoğunluğu saatlerinde olup olmadığını kontrol eder
 * Sabah: 07:30 - 09:30
 * Akşam: 17:00 - 19:30
 */
export function isTrafficHour(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Sabah trafiği: 07:30 - 09:30 (450 - 570 dakika)
  const morningStart = 7 * 60 + 30; // 450
  const morningEnd = 9 * 60 + 30;   // 570

  // Akşam trafiği: 17:00 - 19:30 (1020 - 1170 dakika)
  const eveningStart = 17 * 60;     // 1020
  const eveningEnd = 19 * 60 + 30;  // 1170

  const isTraffic = (totalMinutes >= morningStart && totalMinutes <= morningEnd) ||
                    (totalMinutes >= eveningStart && totalMinutes <= eveningEnd);

  if (isTraffic) {
    console.log(`🚦 Trafik saati tespit edildi: ${hours}:${minutes.toString().padStart(2, '0')}`);
  }

  return isTraffic;
}

/**
 * Adalar'a olan mesafeye göre fiyat hesaplar
 */
function calculateAdalarPrice(districtName: string): number {
  const proximityGroup = ADALAR_PROXIMITY_GROUPS[districtName];
  
  if (proximityGroup === undefined) {
    console.warn(`⚠️ ${districtName} için Adalar yakınlık grubu bulunamadı, varsayılan grup 9 kullanılıyor`);
    return Math.round(ADALAR_BASE_PRICE * (1 + 0.1 * 9)); // En uzak grup
  }
  
  if (proximityGroup === 0) {
    // Adalar kendi içi
    return 500;
  }
  
  // Grup 1: 2500 × 1.0 = 2500
  // Grup 2: 2500 × 1.1 = 2750
  // Grup 3: 2500 × 1.2 = 3000
  // ...
  // Grup 9: 2500 × 1.8 = 4500
  const multiplier = 1 + (0.1 * (proximityGroup - 1));
  return Math.round(ADALAR_BASE_PRICE * multiplier);
}

/**
 * Teslimat fiyatını hesaplar
 */
export interface PriceCalculation {
  basePrice: number;
  trafficMultiplier: number;
  desiMultiplier: number;
  finalPrice: number;
  isTrafficHour: boolean;
  originZone: number;
  destinationZone: number;
  originDistrict: string;
  destinationDistrict: string;
  isAdalarRoute?: boolean;
  adalarProximityGroup?: number;
  desi?: string;
}

export async function calculateDeliveryPrice(
  originDistrict: string,
  destinationDistrict: string,
  desi?: string
): Promise<PriceCalculation | null> {
  try {
    // 1. Bölge verilerini yükle
    const zones = await loadDistrictZones();

    // 2. İlçelerin bölge numaralarını bul
    const originZone = getDistrictZone(originDistrict, zones);
    const destinationZone = getDistrictZone(destinationDistrict, zones);

    if (originZone === null || destinationZone === null) {
      console.error('❌ Bölge numaraları bulunamadı');
      return null;
    }

    // 3. Bölge numaralarını array index'e çevir (1-9 -> 0-8)
    const originIndex = originZone - 1;
    const destinationIndex = destinationZone - 1;

    // 4. Matris sınırlarını kontrol et
    if (originIndex < 0 || originIndex >= 9 || destinationIndex < 0 || destinationIndex >= 9) {
      console.error('❌ Geçersiz bölge numarası:', { originZone, destinationZone });
      return null;
    }

    let basePrice = 0;
    let isAdalarRoute = false;
    let adalarProximityGroup: number | undefined;

    // 5. Adalar rotası kontrolü
    if (originDistrict === 'Adalar' && destinationDistrict !== 'Adalar') {
      // Adalar'dan başka yere
      isAdalarRoute = true;
      basePrice = calculateAdalarPrice(destinationDistrict);
      adalarProximityGroup = ADALAR_PROXIMITY_GROUPS[destinationDistrict];
      console.log(`🏝️ Adalar → ${destinationDistrict}: Grup ${adalarProximityGroup}, Fiyat: ${basePrice} ₺`);
    } else if (destinationDistrict === 'Adalar' && originDistrict !== 'Adalar') {
      // Başka yerden Adalar'a
      isAdalarRoute = true;
      basePrice = calculateAdalarPrice(originDistrict);
      adalarProximityGroup = ADALAR_PROXIMITY_GROUPS[originDistrict];
      console.log(`🏝️ ${originDistrict} → Adalar: Grup ${adalarProximityGroup}, Fiyat: ${basePrice} ₺`);
    } else if (originDistrict === 'Adalar' && destinationDistrict === 'Adalar') {
      // Adalar kendi içi
      isAdalarRoute = true;
      basePrice = 500;
      adalarProximityGroup = 0;
      console.log('🏝️ Adalar → Adalar: Kendi içi, Fiyat: 500 ₺');
    } else {
      // Normal rota (Adalar dahil değil)
      basePrice = ZONE_PRICING_MATRIX[originIndex][destinationIndex];
    }

    // 6. Desi çarpanını hesapla
    const desiMultiplier = desi ? getDesiMultiplier(desi) : 1.0;
    
    // 7. Desi ile çarpılmış fiyat
    const priceWithDesi = Math.round(basePrice * desiMultiplier);

    // 8. Trafik durumunu kontrol et
    const trafficHour = isTrafficHour();
    const trafficMultiplier = trafficHour ? TRAFFIC_MULTIPLIER : 1.0;
    
    // 9. Trafik ek ücretini hesapla (sadece baz fiyata uygulanır, desi artışına değil)
    const trafficExtraCharge = trafficHour ? Math.round(basePrice * (TRAFFIC_MULTIPLIER - 1)) : 0;

    // 10. Final fiyat = (Baz × Desi) + Trafik Ek Ücreti
    const finalPrice = priceWithDesi + trafficExtraCharge;

    console.log('💰 Fiyat Hesaplandı:', {
      originDistrict,
      destinationDistrict,
      originZone,
      destinationZone,
      isAdalarRoute,
      adalarProximityGroup,
      basePrice,
      desi,
      desiMultiplier,
      priceWithDesi,
      trafficHour,
      trafficExtraCharge,
      finalPrice,
    });

    return {
      basePrice,
      trafficMultiplier,
      desiMultiplier,
      finalPrice,
      isTrafficHour: trafficHour,
      originZone,
      destinationZone,
      originDistrict,
      destinationDistrict,
      isAdalarRoute,
      adalarProximityGroup,
      desi,
    };
  } catch (error) {
    console.error('❌ Fiyat hesaplama hatası:', error);
    return null;
  }
}

/**
 * Fiyatı formatlar (1500 -> "1.500 ₺")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Cache'i temizler (admin bölge güncellemesi sonrası kullanılır)
 */
export function clearDistrictZoneCache(): void {
  districtZoneCache = null;
  console.log('🔄 Bölge cache temizlendi');
}
