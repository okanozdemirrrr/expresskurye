-- Mevcut packages tablosuna ilçe kolonları ekle
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Pickup district kolonu ekle
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS pickup_district TEXT;

-- Delivery district kolonu ekle
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS delivery_district TEXT;

-- Mevcut kayıtlar için varsayılan değer (opsiyonel)
UPDATE packages 
SET pickup_district = 'Bilinmiyor' 
WHERE pickup_district IS NULL;

UPDATE packages 
SET delivery_district = 'Bilinmiyor' 
WHERE delivery_district IS NULL;

-- Artık NOT NULL yapabiliriz (opsiyonel - yeni kayıtlar için zorunlu)
-- ALTER TABLE packages 
-- ALTER COLUMN pickup_district SET NOT NULL;

-- ALTER TABLE packages 
-- ALTER COLUMN delivery_district SET NOT NULL;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_packages_pickup_district ON packages(pickup_district);
CREATE INDEX IF NOT EXISTS idx_packages_delivery_district ON packages(delivery_district);
