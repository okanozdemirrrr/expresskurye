'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Brain,
  Headphones,
  Shield,
  MapPin,
  BarChart3,
  Truck,
  Clock,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { generateProfileSlug } from '@/lib/slugify';

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user && profile) {
      // Kullanıcı giriş yapmışsa, profile sayfasına yönlendir
      const slug = generateProfileSlug(
        profile.first_name,
        profile.last_name,
        user.id
      );
      router.push(`/${slug}`);
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: 'Akıllı Fiyatlandırma',
      description:
        'Bölge durumu, trafik yoğunluğu, mesafe ve birçok değişkeni anlık analiz eden özel algoritmamız sayesinde sürprizlere yer yok! Rastgele değil, milimetrik hesaplanmış net fiyatlar.',
    },
    {
      icon: Headphones,
      title: '7/24 Kesintisiz Operasyon',
      description:
        'Gece ya da gündüz fark etmez. 7/24 Canlı Destek ekibimizle her an yanınızdayız.',
    },
    {
      icon: Shield,
      title: '%100 Sipariş Güvenliği',
      description:
        'Gönderileriniz bizim namusumuzdur. Uçtan uca şifrelenmiş sistemimizle %100 güvenli teslimat garantisi.',
    },
    {
      icon: MapPin,
      title: 'Canlı Harita Takibi',
      description:
        'Kargonuz nerede diye düşünmeyin! Müşteri panelinden siparişinizi harita üzerinden saniye saniye, canlı olarak takip edin.',
    },
    {
      icon: BarChart3,
      title: 'Gelişmiş Finans & Muhasebe',
      description:
        'İşletmenizi büyütürken hesaplarla boğuşmayın. Borç grafikleri, otomatik muhasebe entegrasyonu ve detaylı raporlamalarla tüm kontrol sizde.',
    },
  ];

  const stats = [
    { value: 10000, label: 'Başarılı Teslimat', suffix: '+' },
    { value: 30, label: 'Ortalama Teslimat Süresi', suffix: ' Dk' },
    { value: 100, label: 'Müşteri Memnuniyeti', suffix: '%' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[url('/login-bg.png')] bg-cover bg-center bg-no-repeat">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Animated Background Effects */}
        <div className="absolute inset-0 z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-900/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-800/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Teslimatın Geleceğine
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Hoş Geldiniz
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Yapay zeka destekli algoritmamız ile en hızlı, en güvenli ve en ekonomik teslimat deneyimi
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  Hemen Kurye Çağır
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500/30 text-white rounded-xl font-semibold text-lg hover:bg-slate-800/70 hover:border-blue-500/50 transition-all"
              >
                İşletme Hesabı Aç
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-blue-500/50 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-blue-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Neden Express Kurye?
            </h2>
            <p className="text-xl text-gray-400">
              Teknoloji ve deneyimin mükemmel birleşimi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-blue-900/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Express Kurye</h3>
              <p className="text-gray-400 mb-4">
                Yapay zeka destekli lojistik çözümleriyle teslimatın geleceğini bugünden yaşayın.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hızlı Erişim</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Hizmetlerimiz
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Fiyatlandırma
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    İletişim
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>info@expresskurye.com</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+90 555 123 45 67</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-900/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Express Kurye. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Gizlilik Politikası
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Kullanım Koşulları
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                KVKK
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-slate-800/50 backdrop-blur-sm border border-blue-900/20 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-gray-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

function StatCard({ stat, index }: { stat: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = stat.value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-5xl md:text-6xl font-bold text-white mb-2">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-xl text-gray-400">{stat.label}</div>
    </motion.div>
  );
}
