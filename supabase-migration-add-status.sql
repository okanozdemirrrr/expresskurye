-- Packages tablosuna status kolonu ekle
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Status kolonu ekle (detaylı workflow)
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Status için check constraint (5 aşamalı süreç)
ALTER TABLE packages
DROP CONSTRAINT IF EXISTS packages_status_check;

ALTER TABLE packages
ADD CONSTRAINT packages_status_check 
CHECK (status IN ('new', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'));

-- Status için index
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);

-- Mevcut kayıtları güncelle
UPDATE packages 
SET status = 'new' 
WHERE status IS NULL OR status NOT IN ('new', 'assigned', 'picked-up', 'in-transit', 'delivered');

-- Courier assignment kolonu
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS assigned_courier_id UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_packages_courier ON packages(assigned_courier_id);

-- Status geçiş zamanları için kolonlar
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Status geçiş zamanları için indexler
CREATE INDEX IF NOT EXISTS idx_packages_assigned_at ON packages(assigned_at);
CREATE INDEX IF NOT EXISTS idx_packages_delivered_at ON packages(delivered_at);

-- Yorum: Status Workflow
-- 1. 'new'        -> Müşteri "Gönderi Oluştur" butonuna bastı
-- 2. 'assigned'   -> Admin panelden kuryeye atandı
-- 3. 'picked-up'  -> Kurye paketi kabul etti (alımda)
-- 4. 'in-transit' -> Kurye paketi gönderenden aldı (teslimatta)
-- 5. 'delivered'  -> Kurye paketi alıcıya teslim etti
-- 6. 'cancelled'  -> Sipariş iptal edildi

