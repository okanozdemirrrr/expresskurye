-- Express Kurye - Supabase Database Schema
-- Bu SQL dosyasını Supabase SQL Editor'de çalıştırın

-- profiles tablosunu oluştur (kullanıcı bilgileri)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- profiles için RLS kapalı
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- profiles için index
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- packages tablosunu oluştur
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code SERIAL UNIQUE NOT NULL,
  
  -- Çıkış (Pickup) Bilgileri
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_district TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_name TEXT NOT NULL,
  pickup_phone TEXT NOT NULL,
  
  -- Varış (Delivery) Bilgileri
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  delivery_district TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_name TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  
  -- Paket Detayları
  desi TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Ödeme Bilgileri
  payment_method TEXT NOT NULL,
  payer TEXT NOT NULL,
  
  -- Zaman Damgası
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- order_code için index (hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_packages_order_code ON packages(order_code);

-- created_at için index (tarih bazlı sorgular için)
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);

-- Row Level Security (RLS) kapalı - Herkes her şeyi yapabilir
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;

-- Örnek veri (opsiyonel - test için)
-- INSERT INTO packages (
--   pickup_lat, pickup_lng, pickup_address, pickup_name, pickup_phone,
--   delivery_lat, delivery_lng, delivery_address, delivery_name, delivery_phone,
--   desi, content, payment_method, payer
-- ) VALUES (
--   41.0082, 28.9784, 'Taksim Meydanı, Beyoğlu', 'Ahmet Yılmaz', '05551234567',
--   41.0150, 28.9800, 'Galata Kulesi, Beyoğlu', 'Mehmet Demir', '05559876543',
--   '0-2', 'Yemek', 'cash', 'sender'
-- );

-- zones tablosunu oluştur (bölge yönetimi için)
CREATE TABLE IF NOT EXISTS zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zones JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- zones için RLS kapalı
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
