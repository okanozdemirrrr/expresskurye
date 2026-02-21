'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { supabase, PackageData } from '@/lib/supabase';
import { calculateDeliveryPrice, formatPrice, PriceCalculation } from '@/utils/pricingAlgorithm';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

// İstanbul ilçeleri
const ISTANBUL_DISTRICTS = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
  'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
  'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
  'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
  'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
  'Ümraniye', 'Üsküdar', 'Zeytinburnu'
].sort();

interface CourierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourierModal({ isOpen, onClose }: CourierModalProps) {
  const [step, setStep] = useState<'pickup' | 'delivery' | 'details' | 'success'>('pickup');

  // Pickup data
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupDistrict, setPickupDistrict] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');

  // Delivery data
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
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

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStep('pickup');
      setPickupLat(null);
      setPickupLng(null);
      setPickupDistrict('');
      setPickupAddress('');
      setPickupName('');
      setPickupPhone('');
      setDeliveryLat(null);
      setDeliveryLng(null);
      setDeliveryDistrict('');
      setDeliveryAddress('');
      setDeliveryName('');
      setDeliveryPhone('');
      setDesi('');
      setContent('');
      setPaymentMethod('');
      setPayer('');
      setPriceCalculation(null);
      setOrderCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePickupConfirm = (lat: number, lng: number) => {
    setPickupLat(lat);
    setPickupLng(lng);
  };

  const handleDeliveryConfirm = (lat: number, lng: number) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
  };

  const canProceedFromPickup = pickupDistrict && pickupLat !== null && pickupAddress && pickupName && pickupPhone;
  const canProceedFromDelivery = deliveryDistrict && deliveryLat !== null && deliveryAddress && deliveryName && deliveryPhone;
  const canSubmit = desi && content && paymentMethod && payer;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    // Test: Supabase bağlantısını kontrol et
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 Supabase Key var mı:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const packageData: PackageData = {
      pickup_lat: pickupLat!,
      pickup_lng: pickupLng!,
      pickup_district: pickupDistrict,
      pickup_address: pickupAddress,
      pickup_name: pickupName,
      pickup_phone: pickupPhone,
      delivery_lat: deliveryLat!,
      delivery_lng: deliveryLng!,
      delivery_district: deliveryDistrict,
      delivery_address: deliveryAddress,
      delivery_name: deliveryName,
      delivery_phone: deliveryPhone,
      desi,
      content,
      payment_method: paymentMethod,
      payer,
    };

    console.log('📦 Gönderilecek veri:', packageData);

    try {
      // Session kontrolü
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('👤 Session:', sessionData);
      console.log('❌ Session Error:', sessionError);

      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select('order_code')
        .single();

      console.log('✅ Supabase Response Data:', data);
      console.log('❌ Supabase Response Error:', error);

      if (error) {
        console.error('🔥 TAM HATA:', JSON.stringify(error, null, 2));
        console.error('🔥 Error Message:', error.message);
        console.error('🔥 Error Details:', error.details);
        console.error('🔥 Error Hint:', error.hint);
        console.error('🔥 Error Code:', error.code);
        throw error;
      }

      const formattedCode = String(data.order_code).padStart(6, '0');
      setOrderCode(formattedCode);
      setStep('success');
    } catch (error: any) {
      console.error('💥 CATCH BLOĞU - TAM HATA:', error);
      console.error('💥 Error Type:', typeof error);
      console.error('💥 Error Keys:', Object.keys(error || {}));
      console.error('💥 Error Message:', error?.message);
      console.error('💥 Error Details:', error?.details);
      console.error('💥 Error Stack:', error?.stack);
      alert(`Sipariş oluşturulurken bir hata oluştu: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {step === 'success' ? (
          <div className="p-8 text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-blue-950 mb-4">Siparişiniz Alındı!</h2>
            <p className="text-6xl font-bold text-blue-950 mb-8">{orderCode}</p>
            <p className="text-gray-600 mb-8">Kurye en kısa sürede yola çıkacak</p>
            <button
              onClick={onClose}
              className="bg-blue-950 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors"
            >
              Kapat
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-950">Kurye Çağır</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-between mb-8">
              <div className={`flex-1 text-center ${step === 'pickup' ? 'text-blue-950 font-semibold' : 'text-gray-400'}`}>
                Çıkış
              </div>
              <div className={`flex-1 text-center ${step === 'delivery' ? 'text-blue-950 font-semibold' : 'text-gray-400'}`}>
                Varış
              </div>
              <div className={`flex-1 text-center ${step === 'details' ? 'text-blue-950 font-semibold' : 'text-gray-400'}`}>
                Detaylar
              </div>
            </div>

            {step === 'pickup' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Çıkış İlçesi</label>
                  <select
                    value={pickupDistrict}
                    onChange={(e) => setPickupDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  >
                    <option value="">İlçe Seçiniz</option>
                    {ISTANBUL_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <MapPicker onConfirm={handlePickupConfirm} title="Çıkış Adresi" />

                {pickupLat !== null && (
                  <div className="space-y-4 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Açık Adres"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="İsim Soyisim"
                      value={pickupName}
                      onChange={(e) => setPickupName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon Numarası"
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <button
                      onClick={() => setStep('delivery')}
                      disabled={!canProceedFromPickup}
                      className="w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Devam Et
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'delivery' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Varış İlçesi</label>
                  <select
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  >
                    <option value="">İlçe Seçiniz</option>
                    {ISTANBUL_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <MapPicker onConfirm={handleDeliveryConfirm} title="Varış Adresi" />

                {deliveryLat !== null && (
                  <div className="space-y-4 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Açık Adres"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="İsim Soyisim"
                      value={deliveryName}
                      onChange={(e) => setDeliveryName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon Numarası"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep('pickup')}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Geri
                      </button>
                      <button
                        onClick={() => setStep('details')}
                        disabled={!canProceedFromDelivery}
                        className="flex-1 bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                {/* Fiyat Gösterimi */}
                {priceCalculation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-2xl p-6 text-white ${priceCalculation.isAdalarRoute
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
                      <p className="text-5xl font-bold mb-4">{formatPrice(priceCalculation.finalPrice)}</p>

                      {priceCalculation.isTrafficHour && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
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
                        {priceCalculation.isAdalarRoute && priceCalculation.adalarProximityGroup !== undefined && priceCalculation.adalarProximityGroup > 0 && (
                          <p className="mt-1">Mesafe Grubu: {priceCalculation.adalarProximityGroup} / 9</p>
                        )}
                        {!priceCalculation.isAdalarRoute && (
                          <p className="mt-1">Bölge {priceCalculation.originZone} → Bölge {priceCalculation.destinationZone}</p>
                        )}
                        {(priceCalculation.isTrafficHour || priceCalculation.desiMultiplier > 1) && (
                          <p className="mt-1">Baz Fiyat: {formatPrice(priceCalculation.basePrice)}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kargo Desisi</label>
                  <select
                    value={desi}
                    onChange={(e) => setDesi(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    <option value="0-2">0-2 Desi</option>
                    <option value="2-5">2-5 Desi</option>
                    <option value="5-10">5-10 Desi</option>
                    <option value="10-20">10-20 Desi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paket İçeriği</label>
                  <select
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setPaymentMethod('cash');
                        setPayer('');
                      }}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${paymentMethod === 'cash'
                          ? 'bg-blue-950 text-white'
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
                      className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${paymentMethod === 'card'
                          ? 'bg-blue-950 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Kapıda Kredi Kartı
                    </button>
                  </div>
                </div>

                {paymentMethod && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ödemeyi Kim Yapacak?</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setPayer('sender')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${payer === 'sender'
                            ? 'bg-blue-950 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Gönderen
                      </button>
                      <button
                        onClick={() => setPayer('receiver')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${payer === 'receiver'
                            ? 'bg-blue-950 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Alıcı
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep('delivery')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1 bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönderi Oluştur'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
