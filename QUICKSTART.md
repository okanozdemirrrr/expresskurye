# 🚀 Express Kurye - Hızlı Başlangıç

5 dakikada çalışır hale getirin!

## 1️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

## 2️⃣ Supabase Kurulumu

### Supabase Projesi Oluşturun
1. [supabase.com](https://supabase.com) → Yeni proje oluşturun
2. SQL Editor'e gidin
3. `supabase-schema.sql` dosyasını çalıştırın

### API Anahtarlarını Alın
Settings → API → Şu bilgileri kopyalayın:
- Project URL
- anon public key

## 3️⃣ Ortam Değişkenlerini Ayarlayın

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=buraya_project_url_yapistirin
NEXT_PUBLIC_SUPABASE_ANON_KEY=buraya_anon_key_yapistirin
```

## 4️⃣ Çalıştırın

```bash
npm run dev
```

## 5️⃣ Test Edin

[http://localhost:3000](http://localhost:3000) → "Hemen Kurye Çağır" → Formu doldurun → Sipariş kodunu alın!

---

## ⚠️ Sorun mu yaşıyorsunuz?

### Harita görünmüyor
- Sayfayı yenileyin (F5)
- Tarayıcı konsolunu kontrol edin

### Supabase hatası
- `.env.local` dosyasındaki bilgileri kontrol edin
- Supabase projesinin aktif olduğundan emin olun

### Build hatası
```bash
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📚 Daha Fazla Bilgi

- Detaylı kurulum: `SETUP_GUIDE.md`
- Özellikler: `FEATURES.md`
- Genel bilgi: `README.md`

---

**Başarılar!** 🎉
