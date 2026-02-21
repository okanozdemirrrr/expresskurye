# Express Kurye - Kurulum Rehberi

Bu rehber, Express Kurye uygulamasını sıfırdan kurmak için adım adım talimatlar içerir.

## 1. Ön Gereksinimler

- Node.js 18+ yüklü olmalı
- npm veya yarn paket yöneticisi
- Bir Supabase hesabı (ücretsiz)

## 2. Supabase Kurulumu

### 2.1. Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. Yeni bir proje oluşturun
4. Proje adı: `express-kurye`
5. Database şifresi belirleyin (güvenli bir şifre seçin)
6. Region seçin (en yakın bölge)
7. "Create new project" butonuna tıklayın

### 2.2. Veritabanı Tablosunu Oluşturma

1. Supabase Dashboard'da sol menüden "SQL Editor" seçin
2. "New query" butonuna tıklayın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. "Run" butonuna tıklayın
5. Başarılı mesajını görmelisiniz

### 2.3. API Anahtarlarını Alma

1. Supabase Dashboard'da sol menüden "Settings" > "API" seçin
2. Aşağıdaki bilgileri not edin:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key (uzun bir string)

## 3. Proje Kurulumu

### 3.1. Bağımlılıkları Yükleme

\`\`\`bash
npm install
\`\`\`

### 3.2. Ortam Değişkenlerini Ayarlama

1. `.env.local` dosyasını açın
2. Supabase bilgilerinizi girin:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**ÖNEMLİ:** Gerçek değerlerinizi yukarıdaki örneklerin yerine yazın!

## 4. Uygulamayı Çalıştırma

### 4.1. Geliştirme Sunucusunu Başlatma

\`\`\`bash
npm run dev
\`\`\`

### 4.2. Tarayıcıda Açma

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 5. Test Etme

### 5.1. İlk Siparişi Oluşturma

1. "Hemen Kurye Çağır" butonuna tıklayın
2. Çıkış adresi için:
   - Haritayı kaydırarak bir konum seçin
   - "Konumumu Onayla" butonuna tıklayın
   - Adres, isim ve telefon bilgilerini girin
   - "Devam Et" butonuna tıklayın
3. Varış adresi için aynı adımları tekrarlayın
4. Paket detaylarını seçin:
   - Kargo desisi: 0-2
   - Paket içeriği: Yemek
5. Ödeme bilgilerini seçin:
   - Ödeme yöntemi: Nakit
   - Ödemeyi kim yapacak: Gönderen
6. "Gönderi Oluştur" butonuna tıklayın
7. Sipariş kodunuzu görmelisiniz (örn: 000001)

### 5.2. Veritabanını Kontrol Etme

1. Supabase Dashboard'da "Table Editor" seçin
2. "packages" tablosunu açın
3. Yeni oluşturduğunuz siparişi görmelisiniz

## 6. Production'a Alma

### 6.1. Vercel'e Deploy Etme

1. [vercel.com](https://vercel.com) hesabı oluşturun
2. "New Project" butonuna tıklayın
3. GitHub reponuzu bağlayın
4. Environment Variables ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. "Deploy" butonuna tıklayın

### 6.2. Özel Domain Ekleme (Opsiyonel)

1. Vercel Dashboard'da projenizi açın
2. "Settings" > "Domains" seçin
3. Kendi domain'inizi ekleyin

## 7. Sorun Giderme

### Harita Görünmüyor

- Tarayıcı konsolunu kontrol edin
- Leaflet CSS'inin yüklendiğinden emin olun
- Sayfayı yenileyin

### Supabase Bağlantı Hatası

- `.env.local` dosyasındaki bilgileri kontrol edin
- Supabase projesinin aktif olduğundan emin olun
- API anahtarlarının doğru olduğunu kontrol edin

### Build Hatası

\`\`\`bash
# Cache'i temizleyin
rm -rf .next
npm run build
\`\`\`

### TypeScript Hatası

\`\`\`bash
# node_modules'ü yeniden yükleyin
rm -rf node_modules
npm install
\`\`\`

## 8. Geliştirme İpuçları

### Harita Başlangıç Konumunu Değiştirme

`src/components/MapPicker.tsx` dosyasında:

\`\`\`typescript
const [currentCenter, setCurrentCenter] = useState({ 
  lat: 41.0082,  // İstanbul koordinatları
  lng: 28.9784 
});
\`\`\`

### Renk Temasını Değiştirme

Tüm `bg-blue-950`, `text-blue-950`, `ring-blue-950` sınıflarını değiştirin.

### Desi Seçeneklerini Güncelleme

`src/components/CourierModal.tsx` dosyasında desi seçeneklerini düzenleyin.

## 9. Güvenlik Notları

- `.env.local` dosyasını asla Git'e commit etmeyin
- Production'da RLS (Row Level Security) politikalarını gözden geçirin
- API rate limiting ekleyin
- CORS ayarlarını yapılandırın

## 10. Destek

Sorun yaşarsanız:
- GitHub Issues açın
- README.md dosyasını okuyun
- Supabase dokümantasyonunu kontrol edin

---

**Tebrikler!** Express Kurye uygulamanız hazır. 🎉
