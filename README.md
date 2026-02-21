# Express Kurye - Kurye Çağırma Uygulaması

Ultra-premium, modern ve kullanıcı dostu kurye çağırma uygulaması.

## Özellikler

- 🗺️ İnteraktif harita ile konum seçimi (React Leaflet)
- 📍 Sabit pin ile hassas konum belirleme
- 📱 Responsive ve modern tasarım
- 🎨 Koyu Lacivert (blue-950) kurumsal renk teması
- ✨ Pürüzsüz animasyonlar ve geçişler
- 📦 Detaylı paket bilgileri
- 💳 Esnek ödeme seçenekleri
- 🔢 Otomatik sipariş kodu oluşturma

## Teknolojiler

- Next.js 15
- TypeScript
- Tailwind CSS
- React Leaflet
- Supabase

## Kurulum

1. Bağımlılıkları yükleyin:
\`\`\`bash
npm install
\`\`\`

2. `.env.local` dosyasını düzenleyin ve Supabase bilgilerinizi ekleyin:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
\`\`\`

3. Supabase'de aşağıdaki SQL ile `packages` tablosunu oluşturun:

\`\`\`sql
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code SERIAL UNIQUE NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_name TEXT NOT NULL,
  pickup_phone TEXT NOT NULL,
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_name TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  desi TEXT NOT NULL,
  content TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- order_code için index
CREATE INDEX idx_packages_order_code ON packages(order_code);
\`\`\`

4. Geliştirme sunucusunu başlatın:
\`\`\`bash
npm run dev
\`\`\`

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Kullanım

1. Ana sayfada "Hemen Kurye Çağır" butonuna tıklayın
2. Çıkış adresi için haritayı kaydırarak konumu seçin ve onaylayın
3. Gönderen bilgilerini girin
4. Varış adresi için haritayı kaydırarak konumu seçin ve onaylayın
5. Alıcı bilgilerini girin
6. Paket detaylarını (desi, içerik) seçin
7. Ödeme yöntemini ve ödemeyi kimin yapacağını seçin
8. "Gönderi Oluştur" butonuna tıklayın
9. Sipariş kodunuzu alın!

## Proje Yapısı

\`\`\`
src/
├── app/
│   ├── layout.tsx          # Ana layout
│   ├── page.tsx            # Ana sayfa (Landing)
│   └── globals.css         # Global stiller
├── components/
│   ├── CourierModal.tsx    # Kurye çağırma modal'ı
│   └── MapPicker.tsx       # Harita seçici component
└── lib/
    └── supabase.ts         # Supabase client ve tipler
\`\`\`

## Özellik Detayları

### Harita Sistemi
- Haritanın ortasında sabit duran Koyu Lacivert pin
- Harita kaydırıldıkça anlık koordinat gösterimi
- Konum onaylama butonu
- İstanbul merkez başlangıç konumu

### Form Akışı
- 3 adımlı form: Çıkış → Varış → Detaylar
- Her adımda validasyon
- Geri dönüş imkanı
- Pürüzsüz geçişler

### Ödeme Sistemi
- İki seviyeli seçim: Yöntem → Kim ödeyecek
- Dinamik buton gösterimi
- Görsel geri bildirim

### Başarı Ekranı
- Büyük puntolarla sipariş kodu
- 6 haneli format (000014)
- Yeşil onay ikonu
- Kapatma butonu

## Lisans

MIT
