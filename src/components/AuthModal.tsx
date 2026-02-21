'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Phone, User, Calendar, Lock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateProfileSlug } from '@/lib/slugify';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPhoneConfirm, setShowPhoneConfirm] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  const resetForm = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setPhone('');
    setCountryCode('+90');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhoneError(false);
    setShowPhoneConfirm(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // URL kontrolü
      console.log("🔍 Supabase URL Check:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("🔍 Supabase Key Check:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Mevcut" : "Eksik");

      const isEmail = loginIdentifier.includes('@');
      
      if (isEmail) {
        // E-posta ile giriş
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginIdentifier,
          password: loginPassword,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Giriş başarısız');

        // Profile bilgilerini al
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Slug oluştur ve yönlendir
        const slug = generateProfileSlug(
          profileData.first_name,
          profileData.last_name,
          data.user.id
        );

        onClose();
        resetForm();
        router.push(`/${slug}`);
      } else {
        // Telefon ile giriş - şimdilik desteklenmiyor
        alert('⚠️ Telefon ile giriş şu anda desteklenmiyor. Lütfen e-posta adresinizi kullanın.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Login Error:', error);
      
      // Failed to fetch hatası kontrolü
      if (error.message && error.message.includes('Failed to fetch')) {
        alert(
          '⚠️ Sunucuya ulaşılamıyor!\n\n' +
          'Lütfen kontrol edin:\n' +
          '• İnternet bağlantınız aktif mi?\n' +
          '• Reklam engelleyici (AdBlock) kapalı mı?\n' +
          '• VPN kullanıyorsanız kapatmayı deneyin.'
        );
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        alert('❌ E-posta veya şifre hatalı!');
      } else {
        alert(`❌ Giriş başarısız: ${error.message || 'Bilinmeyen hata'}`);
      }
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    // Telefon numarasının tam 10 rakam olduğunu kontrol et
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length !== 10) {
      alert('Lütfen geçerli bir telefon numarası girin (10 rakam)');
      return;
    }

    if (!firstName || !lastName || !birthDate || !phone || !email || !password) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setShowPhoneConfirm(true);
  };

  const handlePhoneCorrect = () => {
    setShowPhoneConfirm(false);
    setPhoneError(true);
    setTimeout(() => setPhoneError(false), 3000);
  };

  const handlePhoneConfirm = async () => {
    setLoading(true);
    setShowPhoneConfirm(false);

    try {
      console.log("🔍 Kayıt - Supabase URL Check:", process.env.NEXT_PUBLIC_SUPABASE_URL);

      // 1. Kullanıcıyı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      // 2. Profile oluştur
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: getFullPhoneNumber(),
        birth_date: birthDate,
      });

      if (profileError) throw profileError;

      // 3. Otomatik giriş yap
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 4. Slug oluştur ve yönlendir
      const slug = generateProfileSlug(firstName, lastName, authData.user.id);

      onClose();
      resetForm();
      router.push(`/${slug}`);
    } catch (error: any) {
      console.error('❌ Register Error:', error);
      
      // Failed to fetch hatası kontrolü
      if (error.message && error.message.includes('Failed to fetch')) {
        alert(
          '⚠️ Sunucuya ulaşılamıyor!\n\n' +
          'Lütfen kontrol edin:\n' +
          '• İnternet bağlantınız aktif mi?\n' +
          '• Reklam engelleyici (AdBlock) kapalı mı?\n' +
          '• VPN kullanıyorsanız kapatmayı deneyin.'
        );
      } else if (error.message && error.message.includes('already registered')) {
        alert('❌ Bu e-posta adresi zaten kayıtlı!');
      } else {
        alert(`❌ Kayıt başarısız: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const capitalizeInput = (value: string) => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Telefon formatlaması - sadece rakam kabul eder ve otomatik formatlar (5XX XXX XX XX)
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Maksimum 10 rakam
    const limited = numbers.slice(0, 10);
    
    // Format: 5XX XXX XX XX
    if (limited.length === 0) return '';
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (limited.length <= 8) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Tam telefon numarasını birleştir (ülke kodu + numara)
  const getFullPhoneNumber = () => {
    const cleanNumber = phone.replace(/\s/g, '');
    return `${countryCode}${cleanNumber}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-900/20"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-blue-900/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white text-center">
                {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </h2>
            </div>

            {/* Phone Confirmation Popup */}
            <AnimatePresence>
              {showPhoneConfirm && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute top-20 left-4 right-4 bg-blue-900/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-700 z-10"
                >
                  <p className="text-white text-center mb-4">
                    Telefon numaranız <span className="font-bold">{getFullPhoneNumber()}</span> şeklinde girilmiştir, onaylıyor musunuz?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePhoneCorrect}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition-colors"
                    >
                      Düzelt
                    </button>
                    <button
                      onClick={handlePhoneConfirm}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Kaydediliyor...' : 'Onaylıyorum'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="p-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setMode('register');
                    resetForm();
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>

              {/* Forms */}
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.form
                    key="login"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        E-posta veya Telefon
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="ornek@email.com veya +90 555 123 45 67"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegisterClick();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">İsim</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(capitalizeInput(e.target.value))}
                            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Ahmet"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Soyisim</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(capitalizeInput(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Yılmaz"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Doğum Tarihi</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telefon Numarası</label>
                      {phoneError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mb-2 font-semibold"
                        >
                          Lütfen Telefon Numaranızı Düzeltin
                        </motion.p>
                      )}
                      <div className={`flex gap-2 p-3 bg-slate-800/50 border rounded-xl transition-all ${
                        phoneError
                          ? 'border-red-500 ring-2 ring-red-500 animate-pulse'
                          : 'border-blue-900/30 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'
                      }`}>
                        {/* Ülke Kodu Dropdown */}
                        <div className="relative flex items-center">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="appearance-none bg-transparent text-white font-semibold pr-8 focus:outline-none cursor-pointer"
                          >
                            <option value="+90" className="bg-slate-800">🇹🇷 +90</option>
                            <option value="+1" className="bg-slate-800">🇺🇸 +1</option>
                            <option value="+44" className="bg-slate-800">🇬🇧 +44</option>
                            <option value="+49" className="bg-slate-800">🇩🇪 +49</option>
                            <option value="+33" className="bg-slate-800">🇫🇷 +33</option>
                          </select>
                          <svg className="absolute right-0 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {/* Ayırıcı Çizgi */}
                        <div className="w-px bg-blue-900/30"></div>

                        {/* Telefon Numarası Input */}
                        <div className="flex-1 flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-2" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                            placeholder="555 123 45 67"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="ornek@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Şifre Tekrar</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-blue-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
