# Express Kurye - Mimari Dokümantasyon

## 📐 Proje Mimarisi

### Genel Bakış

Express Kurye, modern web teknolojileri kullanılarak geliştirilmiş, modüler ve ölçeklenebilir bir kurye çağırma uygulamasıdır.

```
┌─────────────────────────────────────────────────────────┐
│                    Kullanıcı (Browser)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │    Modal     │  │   MapPicker  │  │
│  │     Page     │  │  Component   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (Backend)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │  │
│  │   Database   │  │   (Future)   │  │   (Future)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Katmanlı Mimari

### 1. Presentation Layer (Sunum Katmanı)

**Konum:** `src/app/` ve `src/components/`

**Sorumluluklar:**
- Kullanıcı arayüzü render etme
- Kullanıcı etkileşimlerini yönetme
- State yönetimi
- Form validasyonu

**Bileşenler:**
```
src/app/
├── page.tsx          # Landing page (Hero section)
├── layout.tsx        # Root layout (metadata, fonts)
└── globals.css       # Global styles

src/components/
├── CourierModal.tsx  # Ana form modal'ı
└── MapPicker.tsx     # Harita seçici component
```

### 2. Business Logic Layer (İş Mantığı Katmanı)

**Konum:** Component içi hooks ve functions

**Sorumluluklar:**
- Form validasyonu
- State yönetimi
- Veri dönüşümleri
- Kullanıcı akışı kontrolü

**Örnekler:**
```typescript
// Validasyon mantığı
const canProceedFromPickup = 
  pickupLat !== null && 
  pickupAddress && 
  pickupName && 
  pickupPhone;

// Veri dönüşümü
const formattedCode = String(data.order_code).padStart(6, '0');
```

### 3. Data Access Layer (Veri Erişim Katmanı)

**Konum:** `src/lib/supabase.ts`

**Sorumluluklar:**
- Supabase client yönetimi
- API çağrıları
- Veri tipleri tanımlaması
- Error handling

**Örnek:**
```typescript
const { data, error } = await supabase
  .from('packages')
  .insert([packageData])
  .select('order_code')
  .single();
```

### 4. Database Layer (Veritabanı Katmanı)

**Konum:** Supabase PostgreSQL

**Sorumluluklar:**
- Veri saklama
- İlişkisel veri yönetimi
- İndeksleme
- RLS (Row Level Security)

## 🔄 Veri Akışı

### Sipariş Oluşturma Akışı

```
1. Kullanıcı "Hemen Kurye Çağır" butonuna tıklar
   └─> CourierModal açılır (step: 'pickup')

2. Kullanıcı haritayı kaydırır
   └─> MapEventHandler onMove event'i tetikler
       └─> currentCenter state güncellenir
           └─> Koordinatlar ekranda gösterilir

3. Kullanıcı "Konumumu Onayla" butonuna tıklar
   └─> onConfirm callback çağrılır
       └─> pickupLat ve pickupLng state'e kaydedilir
           └─> Form inputları görünür hale gelir

4. Kullanıcı form bilgilerini doldurur
   └─> Her input onChange event'i ile state günceller
       └─> canProceedFromPickup validasyonu çalışır
           └─> "Devam Et" butonu aktif/pasif olur

5. Kullanıcı "Devam Et" butonuna tıklar
   └─> step state 'delivery' olarak güncellenir
       └─> Aynı süreç varış adresi için tekrarlanır

6. Kullanıcı paket detaylarını seçer
   └─> desi, content, paymentMethod, payer state'leri güncellenir
       └─> canSubmit validasyonu çalışır
           └─> "Gönderi Oluştur" butonu aktif/pasif olur

7. Kullanıcı "Gönderi Oluştur" butonuna tıklar
   └─> handleSubmit fonksiyonu çağrılır
       └─> isSubmitting = true
           └─> Supabase insert işlemi yapılır
               └─> Başarılı: order_code alınır
                   └─> formattedCode oluşturulur
                       └─> step = 'success'
                           └─> Başarı ekranı gösterilir
               └─> Hata: Alert gösterilir
```

## 🧩 Component Hiyerarşisi

```
App (layout.tsx)
└── Home (page.tsx)
    └── CourierModal
        ├── MapPicker (Pickup)
        │   ├── MapContainer
        │   │   ├── TileLayer
        │   │   └── MapEventHandler
        │   ├── Sabit Pin (SVG)
        │   ├── Koordinat Göstergesi
        │   └── Onaylama Butonu
        │
        ├── Form Inputs (Pickup)
        │   ├── Açık Adres Input
        │   ├── İsim Soyisim Input
        │   └── Telefon Input
        │
        ├── MapPicker (Delivery)
        │   └── [Aynı yapı]
        │
        ├── Form Inputs (Delivery)
        │   └── [Aynı yapı]
        │
        ├── Paket Detayları
        │   ├── Desi Select
        │   ├── İçerik Select
        │   ├── Ödeme Yöntemi Butonları
        │   └── Ödemeyi Yapan Butonları
        │
        └── Başarı Ekranı
            ├── Onay İkonu
            ├── Başlık
            ├── Sipariş Kodu
            └── Kapat Butonu
```

## 🔐 Güvenlik Mimarisi

### Frontend Güvenlik

1. **Input Validasyonu**
   - Tüm form alanları zorunlu
   - Koordinat formatı kontrolü
   - Telefon numarası formatı (opsiyonel)

2. **XSS Koruması**
   - React otomatik escape
   - Kullanıcı girdileri sanitize edilir

3. **CSRF Koruması**
   - Next.js built-in koruma
   - Supabase token yönetimi

### Backend Güvenlik

1. **Row Level Security (RLS)**
   ```sql
   -- Herkes insert yapabilir
   CREATE POLICY "Anyone can insert packages" ON packages
     FOR INSERT WITH CHECK (true);
   
   -- Herkes okuyabilir (gelecekte kısıtlanabilir)
   CREATE POLICY "Anyone can read their own package" ON packages
     FOR SELECT USING (true);
   ```

2. **Environment Variables**
   - API anahtarları .env.local'de
   - Git'e commit edilmez
   - Production'da Vercel secrets

3. **Rate Limiting**
   - Supabase built-in rate limiting
   - Gelecekte custom rate limiting eklenebilir

## 📊 State Yönetimi

### Local State (useState)

**Kullanım Alanları:**
- Form inputları
- Modal açık/kapalı durumu
- Adım (step) yönetimi
- Loading durumları

**Avantajları:**
- Basit ve hızlı
- Component-scoped
- Re-render kontrolü kolay

**Dezavantajları:**
- Global state yok
- Prop drilling riski (şu an yok)

### Gelecek İyileştirmeler

**Context API:**
```typescript
// OrderContext.tsx (gelecek)
const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }) {
  const [order, setOrder] = useState<Order | null>(null);
  // ...
}
```

**Zustand veya Redux:**
```typescript
// store.ts (gelecek)
import create from 'zustand';

interface OrderStore {
  order: Order | null;
  setOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
}));
```

## 🚀 Performans Optimizasyonları

### 1. Code Splitting

```typescript
// Dynamic import ile lazy loading
const MapPicker = dynamic(() => import('./MapPicker'), { 
  ssr: false  // Harita SSR'de render edilmez
});
```

### 2. Memoization (Gelecek)

```typescript
// useMemo ile pahalı hesaplamalar
const distance = useMemo(() => {
  return calculateDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
}, [pickupLat, pickupLng, deliveryLat, deliveryLng]);

// useCallback ile fonksiyon referansları
const handleSubmit = useCallback(async () => {
  // ...
}, [/* dependencies */]);
```

### 3. Image Optimization

```typescript
// Next.js Image component (gelecek)
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={100} 
  alt="Express Kurye"
  priority
/>
```

### 4. Bundle Optimization

- Tree shaking (otomatik)
- Minification (production)
- Compression (gzip/brotli)

## 🧪 Test Stratejisi (Gelecek)

### Unit Tests

```typescript
// MapPicker.test.tsx
describe('MapPicker', () => {
  it('should update coordinates on map move', () => {
    // ...
  });
  
  it('should call onConfirm with correct coordinates', () => {
    // ...
  });
});
```

### Integration Tests

```typescript
// CourierModal.test.tsx
describe('CourierModal', () => {
  it('should complete full order flow', async () => {
    // 1. Pickup address
    // 2. Delivery address
    // 3. Package details
    // 4. Submit
    // 5. Success screen
  });
});
```

### E2E Tests

```typescript
// e2e/order.spec.ts (Playwright)
test('user can create an order', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Hemen Kurye Çağır');
  // ...
});
```

## 📈 Ölçeklenebilirlik

### Horizontal Scaling

- Next.js serverless functions
- Vercel edge network
- CDN caching

### Vertical Scaling

- Supabase connection pooling
- Database indexing
- Query optimization

### Caching Strategy

```typescript
// SWR ile data fetching (gelecek)
import useSWR from 'swr';

function OrderStatus({ orderId }) {
  const { data, error } = useSWR(
    `/api/orders/${orderId}`,
    fetcher,
    { ref