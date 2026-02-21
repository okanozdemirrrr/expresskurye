'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { supabase, PackageData } from '@/lib/supabase';
import { calculateDeliveryPrice, formatPrice, PriceCalculation } from '@/utils/pricingAlgorithm';
import { MapPin, Package as PackageIcon, CreditCard, User, Phone, FileText } from 'lucide-react';

const MapPickerClient = dynamic(() => import('./MapPickerClient'), { ssr: false });

const ISTANBUL_DISTRICTS = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
  'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
  'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
  'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
  'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
  'Ümraniye', 'Üsküdar', 'Zeytinburnu'
].sort();

interface KuryeCagirContentProps {
  profileSlug: string;
}

export default function KuryeCagirContent({ profileSlug }: KuryeCagirContentProps) {
  const router = useRouter();
  const [step, setStep] = useState<'pickup' | 'delivery' | 'details' | 'success'>('pickup');
  
  // Pickup data
  const [pickupLat, setPickupLat] = useState<number>(41.0082);
  const [pickupLng, setPickupLng] = useState<number>(28.9784);
  const [pickupDistrict, setPickupDistrict] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');

  // Delivery data
  const [deliveryLat, setDeliveryLat] = useState<number>(41.0082);
  const [deliveryLng, setDeliveryLng] = useState<number>(28.9784);
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  // Package details
  const [desi, setDesi] = useState('');
  const [content, setContent] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | ''>('');
  const [payer, setPayer] = useState<'sender' | 'receiver' | ''>('');

  // Pricing
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Success
  const [orderCode, setOrderCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Konum kaydetme
  const [pickupLocationSaved, setPickupLocationSaved] = useState(false);
  const [deliveryLocationSaved, setDeliveryLocationSaved] = useState(false);

  // Map center
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });

  // Fiyat hesaplama
  useEffect(() => {
    if (pickupDistrict && deliveryDistrict) {
      setIsCalculatingPrice(true);
      calculateDeliveryPrice(pickupDistrict, deliveryDistrict, desi || undefined)
        .then((result) => {
          setPriceCalculation(result);
          setIsCalculatingPrice(false);
        })
        .catch((error) => {
          console.error('Fiyat hesaplama hatası:', error);
          setIsCalculatingPrice(false);
        });
    } else {
      setPriceCalculation(null);
    }
  }, [pickupDistrict, deliveryDistrict, desi]);

  const canProceedFromPickup = pickupDistrict && pickupAddress && pickupName && pickupPhone;
  const canProceedFromDelivery = deliveryDistrict && deliveryAddress && deliveryName && deliveryPhone;
  const canSubmit = desi && content && paymentMethod && payer;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    const packageData: PackageData = {
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      pickup_district: pickupDistrict,
      pickup_address: pickupAddress,
      pickup_name: pickupName,
      pickup_phone: pickupPhone,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      delivery_district: deliveryDistrict,
      delivery_address: deliveryAddress,
      delivery_name: deliveryName,
      delivery_phone: deliveryPhone,
      desi,
      content,
      payment_method: paymentMethod,
      payer,
    };

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select('order_code')
        .single();

      if (error) throw error;

      const formattedCode = String(data.order_code).padStart(6, '0');
      setOrderCode(formattedCode);
      setStep('success');
    } catch (error: any) {
      console.error('Sipariş oluşturma hatası:', error);
      alert(`Sipariş oluşturulurken bir hata oluştu: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <svg className="w-32 h-32 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-4xl font-bold text-blue-950 mb-4">Siparişiniz Alındı!</h2>
          <p className="text-7xl font-bold text-blue-950 mb-8">{orderCode}</p>
          <p className="text-gray-600 mb-8 text-lg">Kurye en kısa sürede yola çıkacak</p>
          <button
            onClick={() => router.push(`/${profileSlug}`)}
            className="bg-blue-950 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-900 transition-colors text-lg w-full"
          >
            Dashboard'a Dön
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sol Taraf - Harita (Tam Ekran) */}
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full">
          <MapPickerClient 
            currentCenter={mapCenter}
            setCurrentCenter={setMapCenter}
          />
        </div>
        
        {/* Sabit Pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none">
          <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
              fill="#1e40af"
              stroke="#ffffff"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Koordinat Göstergesi - Sağ Üst */}
        <div className="absolute top-4 right-[420px] bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg z-[1000]">
          <div className="font-bold text-blue-950 mb-2 text-base">
            {step === 'pickup' ? '📍 Çıkış Konumu' : step === 'delivery' ? '🎯 Varış Konumu' : '📌 Konum'}
          </div>
          <div className="text-gray-700 font-mono text-sm">Lat: {mapCenter.lat.toFixed(6)}</div>
          <div className="text-gray-700 font-mono text-sm">Lng: {mapCenter.lng.toFixed(6)}</div>
        </div>

        {/* Konumu Kaydet Butonu - %150 Büyük */}
        {(step === 'pickup' || step === 'delivery') && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (step === 'pickup') {
                setPickupLat(mapCenter.lat);
                setPickupLng(mapCenter.lng);
                setPickupLocationSaved(true);
                setTimeout(() => setPickupLocationSaved(false), 3000);
              } else if (step === 'delivery') {
                setDeliveryLat(mapCenter.lat);
                setDeliveryLng(mapCenter.lng);
                setDeliveryLocationSaved(true);
                setTimeout(() => setDeliveryLocationSaved(false), 3000);
              }
            }}
            className="absolute bottom-24 right-[420px] bg-blue-950 hover:bg-blue-900 text-white px-9 py-5 rounded-2xl font-bold shadow-2xl z-[1000] transition-all flex items-center gap-3 text-lg"
          >
            <MapPin className="w-8 h-8" />
            Konumu Kaydet
          </motion.button>
        )}

        {/* Step Indicator */}
        <div className="absolute bottom-4 left-4 right-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-[1000]">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step === 'pickup' ? 'text-blue-950 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'pickup' ? 'bg-blue-950 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="hidden sm:inline">Çıkış</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className={`flex items-center gap-2 ${step === 'delivery' ? 'text-blue-950 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'delivery' ? 'bg-blue-950 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="hidden sm:inline">Varış</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-blue-950 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-blue-950 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="hidden sm:inline">Detaylar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Form Paneli (Floating) */}
      <div className="absolute top-0 right-0 w-[400px] h-full bg-white shadow-2xl z-[1001] overflow-y-auto">
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'pickup' && (
              <motion.div
                key="pickup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-950 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">Çıkış Noktası</h2>
                    <p className="text-gray-600">Paketin alınacağı konum</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İlçe</label>
                  <select
                    value={pickupDistrict}
                    onChange={(e) => setPickupDistrict(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  >
                    <option value="">İlçe Seçiniz</option>
                    {ISTANBUL_DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Açık Adres</label>
                  <textarea
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    rows={3}
                    placeholder="Mahalle, sokak, bina no, daire no..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İsim Soyisim</label>
                  <input
                    type="text"
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                    placeholder="Gönderen kişi"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />
                </div>

                {/* Konum Kaydedildi Bilgilendirmesi */}
                <AnimatePresence>
                  {pickupLocationSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start gap-3"
                    >
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-semibold text-sm">Çıkış Konumu Seçildi!</p>
                        <p className="text-green-700 text-xs mt-1">
                          Konum başarıyla belirlendi. Sipariş oluşturulduğunda kuryeye iletilecektir.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => {
                    if (!pickupLocationSaved) {
                      alert('Lütfen önce haritadan konumu kaydedin!');
                      return;
                    }
                    setStep('delivery');
                  }}
                  disabled={!canProceedFromPickup || !pickupLocationSaved}
                  className="w-full bg-blue-950 text-white py-4 rounded-xl font-semibold hover:bg-blue-900 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-lg shadow-lg"
                >
                  Devam Et →
                </button>
              </motion.div>
            )}

            {step === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">Varış Noktası</h2>
                    <p className="text-gray-600">Paketin teslim edileceği konum</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İlçe</label>
                  <select
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  >
                    <option value="">İlçe Seçiniz</option>
                    {ISTANBUL_DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Açık Adres</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    placeholder="Mahalle, sokak, bina no, daire no..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İsim Soyisim</label>
                  <input
                    type="text"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    placeholder="Alıcı kişi"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />
                </div>

                {/* Konum Kaydedildi Bilgilendirmesi */}
                <AnimatePresence>
                  {deliveryLocationSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start gap-3"
                    >
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-semibold text-sm">Varış Konumu Seçildi!</p>
                        <p className="text-green-700 text-xs mt-1">
                          Konum başarıyla belirlendi. Sipariş oluşturulduğunda kuryeye iletilecektir.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('pickup')}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all text-lg"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={() => {
                      if (!deliveryLocationSaved) {
                        alert('Lütfen önce haritadan konumu kaydedin!');
                        return;
                      }
                      setStep('details');
                    }}
                    disabled={!canProceedFromDelivery || !deliveryLocationSaved}
                    className="flex-1 bg-blue-950 text-white py-4 rounded-xl font-semibold hover:bg-blue-900 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-lg shadow-lg"
                  >
                    Devam Et →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <PackageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">Paket Detayları</h2>
                    <p className="text-gray-600">Son bilgiler ve fiyat</p>
                  </div>
                </div>

                {/* Fiyat Gösterimi */}
                {priceCalculation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-2xl p-6 text-white ${
                      priceCalculation.isAdalarRoute
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : 'bg-gradient-to-r from-blue-950 to-blue-800'
                    }`}
                  >
                    <div className="text-center">
                      {priceCalculation.isAdalarRoute && (
                        <div className="mb-3 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                          <span>🏝️</span>
                          <span>Adalar Özel Rota</span>
                        </div>
                      )}
                      <p className="text-sm opacity-80 mb-2">Teslimat Ücreti</p>
                      <p className="text-6xl font-bold mb-4">{formatPrice(priceCalculation.finalPrice)}</p>
                      
                      {priceCalculation.isTrafficHour && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 mb-4"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Trafik Saati - %15 Ek Ücret
                        </motion.div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-70">
                        <p>{priceCalculation.originDistrict} → {priceCalculation.destinationDistrict}</p>
                        {priceCalculation.desi && (
                          <p className="mt-1">Desi: {priceCalculation.desi} (×{priceCalculation.desiMultiplier})</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {isCalculatingPrice && (
                  <div className="bg-gray-100 rounded-2xl p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Fiyat hesaplanıyor...</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kargo Desisi</label>
                  <select
                    value={desi}
                    onChange={(e) => setDesi(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="0-2">0-2 Desi</option>
                    <option value="2-5">2-5 Desi</option>
                    <option value="5-10">5-10 Desi</option>
                    <option value="10-20">10-20 Desi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paket İçeriği</label>
                  <select
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Yemek">Yemek</option>
                    <option value="Hediye">Hediye</option>
                    <option value="Gıda">Gıda</option>
                    <option value="Çiçek">Çiçek</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPaymentMethod('cash');
                        setPayer('');
                      }}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-blue-950 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Nakit
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('card');
                        setPayer('');
                      }}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-blue-950 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Kredi Kartı
                    </button>
                  </div>
                </div>

                {paymentMethod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ödemeyi Kim Yapacak?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPayer('sender')}
                        className={`py-3 rounded-xl font-semibold transition-all ${
                          payer === 'sender'
                            ? 'bg-blue-950 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Gönderen
                      </button>
                      <button
                        onClick={() => setPayer('receiver')}
                        className={`py-3 rounded-xl font-semibold transition-all ${
                          payer === 'receiver'
                            ? 'bg-blue-950 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Alıcı
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep('delivery')}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all text-lg"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-lg shadow-lg"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : '✓ Gönderi Oluştur'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
