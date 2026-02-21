# Express Kurye - Özellikler ve Teknik Detaylar

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Ana Renk:** Koyu Lacivert (`bg-blue-950` / `#172554`)
- **Arka Plan:** Açık Gri (`bg-slate-50`)
- **Vurgular:** Yeşil (başarı mesajları), Gri (nötr butonlar)

### Tipografi
- **Başlıklar:** 5xl-6xl (48-60px) - Bold
- **Alt Başlıklar:** 2xl-3xl (24-30px) - Bold
- **Butonlar:** 2xl (24px) - Bold
- **Form Elemanları:** Base (16px) - Regular/Medium

### Animasyonlar
- **Fade In:** 0.3s ease-in-out
- **Hover Scale:** 1.05x transform
- **Shadow Transitions:** xl → 2xl
- **Smooth Scrolling:** Modal içeriği

## 🗺️ Harita Sistemi

### Leaflet Entegrasyonu
- **Kütüphane:** React Leaflet 5.0
- **Tile Provider:** OpenStreetMap
- **Başlangıç Konumu:** İstanbul (41.0082, 28.9784)
- **Zoom Seviyesi:** 13

### Sabit Pin Mekanizması
```css
position: absolute
top: 50%
left: 50%
transform: translate(-50%, -50%)
z-index: 1000
pointer-events: none
```

### Özellikler
- ✅ Harita kaydırıldıkça pin sabit kalır
- ✅ Anlık koordinat gösterimi (6 ondalık basamak)
- ✅ `onMove` event ile sürekli güncelleme
- ✅ `map.getCenter()` ile merkez koordinat
- ✅ Konum onaylama butonu
- ✅ Onaylandıktan sonra yeşil başarı mesajı

## 📋 Form Akışı

### Adım 1: Çıkış Adresi (Pickup)
1. Harita ile konum seçimi
2. Konum onaylama
3. Açık adres girişi
4. İsim soyisim girişi
5. Telefon numarası girişi
6. Validasyon kontrolü
7. Devam Et butonu

### Adım 2: Varış Adresi (Delivery)
1. Harita ile konum seçimi
2. Konum onaylama
3. Açık adres girişi
4. İsim soyisim girişi
5. Telefon numarası girişi
6. Validasyon kontrolü
7. Geri / Devam Et butonları

### Adım 3: Paket Detayları
1. **Kargo Desisi:** Dropdown select
   - 0-2 Desi
   - 2-5 Desi
   - 5-10 Desi
   - 10-20 Desi

2. **Paket İçeriği:** Dropdown select
   - Yemek
   - Hediye
   - Gıda
   - Çiçek
   - Diğer

3. **Ödeme Yöntemi:** Toggle butonlar
   - Nakit
   - Kapıda Kredi Kartı

4. **Ödemeyi Kim Yapacak:** Şartlı render
   - Gönderen
   - Alıcı
   - (Ödeme yöntemi seçildikten sonra görünür)

5. Geri / Gönderi Oluştur butonları

### Adım 4: Başarı Ekranı
- ✅ Yeşil onay ikonu
- ✅ "Siparişiniz Alındı!" başlığı
- ✅ 6 haneli sipariş kodu (000001 formatında)
- ✅ Bilgilendirme mesajı
- ✅ Kapat butonu

## 🔐 Validasyon Kuralları

### Çıkış Adresi
```typescript
canProceedFromPickup = 
  pickupLat !== null && 
  pickupAddress && 
  pickupName && 
  pickupPhone
```

### Varış Adresi
```typescript
canProceedFromDelivery = 
  deliveryLat !== null && 
  deliveryAddress && 
  deliveryName && 
  deliveryPhone
```

### Gönderi Oluşturma
```typescript
canSubmit = 
  desi && 
  content && 
  paymentMethod && 
  payer
```

## 💾 Veritabanı Yapısı

### packages Tablosu

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Primary key (otomatik) |
| order_code | SERIAL | Sipariş kodu (otomatik artan) |
| pickup_lat | DOUBLE PRECISION | Çıkış enlem |
| pickup_lng | DOUBLE PRECISION | Çıkış boylam |
| pickup_address | TEXT | Çıkış açık adres |
| pickup_name | TEXT | Gönderen isim |
| pickup_phone | TEXT | Gönderen telefon |
| delivery_lat | DOUBLE PRECISION | Varış enlem |
| delivery_lng | DOUBLE PRECISION | Varış boylam |
| delivery_address | TEXT | Varış açık adres |
| delivery_name | TEXT | Alıcı isim |
| delivery_phone | TEXT | Alıcı telefon |
| desi | TEXT | Kargo desisi |
| content | TEXT | Paket içeriği |
| payment_method | TEXT | Ödeme yöntemi |
| payer | TEXT | Ödemeyi yapan |
| created_at | TIMESTAMP | Oluşturulma zamanı |

### İndeksler
- `idx_packages_order_code` - order_code üzerinde
- `idx_packages_created_at` - created_at üzerinde (DESC)

### RLS Politikaları
- ✅ Herkes insert yapabilir
- ✅ Herkes kendi siparişini okuyabilir

## 🔄 State Yönetimi

### Modal State
```typescript
const [step, setStep] = useState<'pickup' | 'delivery' | 'details' | 'success'>('pickup');
```

### Pickup State
```typescript
const [pickupLat, setPickupLat] = useState<number | null>(null);
const [pickupLng, setPickupLng] = useState<number | null>(null);
const [pickupAddress, setPickupAddress] = useState('');
const [pickupName, setPickupName] = useState('');
const [pickupPhone, setPickupPhone] = useState('');
```

### Delivery State
```typescript
const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
const [deliveryAddress, setDeliveryAddress] = useState('');
const [deliveryName, setDeliveryName] = useState('');
const [deliveryPhone, setDeliveryPhone] = useState('');
```

### Package Details State
```typescript
const [desi, setDesi] = useState('');
const [content, setContent] = useState('');
const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | ''>('');
const [payer, setPayer] = useState<'sender' | 'receiver' | ''>('');
```

### UI State
```typescript
const [orderCode, setOrderCode] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

## 🎯 Kullanıcı Deneyimi (UX)

### Görsel Geri Bildirim
- ✅ Disabled butonlar gri renkte
- ✅ Aktif butonlar koyu lacivert
- ✅ Hover efektleri (scale, shadow)
- ✅ Focus ring (blue-950)
- ✅ Loading state (Gönderiliyor...)
- ✅ Başarı mesajları (yeşil)

### Erişilebilirlik
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA)

### Responsive Tasarım
- ✅ Mobile-first yaklaşım
- ✅ Breakpoints: sm, md, lg, xl
- ✅ Flexible grid system
- ✅ Touch-friendly butonlar (min 44px)

## 🚀 Performans

### Optimizasyonlar
- ✅ Dynamic import (MapPicker)
- ✅ SSR disabled for maps
- ✅ Lazy loading
- ✅ Minimal re-renders
- ✅ Memoization (where needed)

### Bundle Size
- Next.js: ~85KB (gzipped)
- React: ~40KB (gzipped)
- Leaflet: ~40KB (gzipped)
- Supabase: ~25KB (gzipped)
- **Total:** ~190KB (gzipped)

## 🔧 Geliştirme Araçları

### TypeScript
- ✅ Strict mode enabled
- ✅ No 'any' types
- ✅ Interface definitions
- ✅ Type safety

### ESLint
- ✅ Next.js config
- ✅ React hooks rules
- ✅ TypeScript rules

### Tailwind CSS
- ✅ JIT mode
- ✅ Custom animations
- ✅ Utility-first
- ✅ Responsive utilities

## 📱 Tarayıcı Desteği

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🔮 Gelecek Özellikler (Roadmap)

### Faz 1 (Tamamlandı)
- ✅ Temel kurye çağırma
- ✅ Harita entegrasyonu
- ✅ Supabase entegrasyonu
- ✅ Sipariş kodu sistemi

### Faz 2 (Planlanan)
- ⏳ Sipariş takip sistemi
- ⏳ Kurye paneli
- ⏳ Admin paneli
- ⏳ Gerçek zamanlı konum takibi

### Faz 3 (Gelecek)
- ⏳ Ödeme entegrasyonu
- ⏳ SMS bildirimleri
- ⏳ Push notifications
- ⏳ Fiyat hesaplama

### Faz 4 (İleri Seviye)
- ⏳ Çoklu dil desteği
- ⏳ Dark mode
- ⏳ PWA desteği
- ⏳ Offline mode

## 📊 Metrikler

### Lighthouse Scores (Hedef)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Core Web Vitals (Hedef)
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

**Not:** Bu dokümantasyon, Express Kurye v1.0 için hazırlanmıştır.
