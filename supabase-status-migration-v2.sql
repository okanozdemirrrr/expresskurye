-- ============================================================
-- Express Kurye — Statü Migrasyonu v2
-- Supabase SQL Editor'de çalıştırın
-- ============================================================

-- 1. Mevcut CHECK constraint'i kaldır
ALTER TABLE packages
DROP CONSTRAINT IF EXISTS packages_status_check;

-- 2. Eski statüleri yeni standart değerlere güncelle
--    new_order   → new
UPDATE packages SET status = 'new'        WHERE status = 'new_order';
--    picking_up  → picked-up
UPDATE packages SET status = 'picked-up'  WHERE status = 'picking_up';
--    on_the_way  → in-transit
UPDATE packages SET status = 'in-transit' WHERE status = 'on_the_way';

-- 3. Tanımsız / bilinmeyen statüleri 'new' yap
UPDATE packages
SET status = 'new'
WHERE status NOT IN (
  'new', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'
);

-- 4. Yeni CHECK constraint ekle (cancelled dahil)
ALTER TABLE packages
ADD CONSTRAINT packages_status_check
CHECK (status IN (
  'new',        -- Müşteri siparişi oluşturdu
  'assigned',   -- Admin kuryeye atadı
  'picked-up',  -- Kurye paketi kabul etti
  'in-transit', -- Kurye paketi gönderenden aldı, yolda
  'delivered',  -- Kurye teslimatı tamamladı
  'cancelled'   -- Sipariş iptal edildi
));

-- 5. Kontrol sorgusu — sonuç sadece yeni statüleri göstermeli
SELECT status, COUNT(*) AS adet
FROM packages
GROUP BY status
ORDER BY adet DESC;
