'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  History,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'courier' | 'active' | 'history' | 'reports' | 'account';

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('courier');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: 'courier' as TabType, label: 'Kurye Çağır', icon: Truck, highlight: true },
    { id: 'active' as TabType, label: 'Aktif Gönderilerim', icon: Package },
    { id: 'history' as TabType, label: 'Önceki Gönderilerim', icon: History },
    { id: 'reports' as TabType, label: 'Raporlarım', icon: BarChart3 },
    { id: 'account' as TabType, label: 'Hesabım', icon: User },
  ];

  const handleSignOut = async () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await signOut();
      router.push('/');
    }
  };

  const handleNotificationClick = () => {
    setHasUnread(false);
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/80 backdrop-blur-md border-b border-blue-900/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white hover:text-blue-400 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Express Kurye</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-6">
              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-white font-bold">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  <Bell className="w-6 h-6" />
                  {hasUnread && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"
                    />
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNotifications(false)}
                        className="fixed inset-0 z-40"
                      />
                      
                      {/* Notification Panel */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-md border border-blue-900/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-blue-900/20">
                          <h3 className="text-white font-semibold">Bildirimler</h3>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="w-12 h-12 text-gray-500 mb-3" />
                            <p className="text-gray-400 text-sm">
                              Sisteme hoş geldiniz, şu an yeni bir bildiriminiz yok.
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-blue-900/20 bg-slate-800/30">
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            Kapat
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800/50"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Desktop */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:block w-72 min-h-[calc(100vh-4rem)] bg-slate-900/50 backdrop-blur-sm border-r border-blue-900/20 p-6"
        >
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Kurye çağır sekmesine tıklayınca sadece sekmeyi değiştir, yönlendirme yapma
                  }}
                  className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : item.highlight
                      ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-16 bottom-0 w-72 bg-slate-900 border-r border-blue-900/20 p-6 z-50 overflow-y-auto"
              >
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                          // Kurye çağır sekmesine tıklayınca sadece sekmeyi değiştir, yönlendirme yapma
                        }}
                        className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-left ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : item.highlight
                            ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                            : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'courier' && (
              <motion.div
                key="courier"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20">
                  <div className="text-center">
                    <Truck className="w-20 h-20 mx-auto text-blue-500 mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Kurye Çağır</h2>
                    <p className="text-gray-400 mb-2">
                      Hızlı, Güvenli ve Tasarruflu Paket Gönderimleri için EXPRESS KURYE
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                      (Paket Taşıma Ücretimiz Rastgele Değil ; Mesafe, Trafik, Bölge Durumuna Göre Gelişmiş Algoritmamızla Hesaplanmaktadır)
                    </p>
                    <button
                      onClick={() => {
                        const slug = window.location.pathname.split('/')[1];
                        router.push(`/${slug}/kurye-cagir`);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50"
                    >
                      Kurye Çağır
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Aktif Gönderilerim</h2>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Henüz aktif gönderiniz bulunmuyor</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Önceki Gönderilerim</h2>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 text-center">
                  <History className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Geçmiş gönderiniz bulunmuyor</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Raporlarım</h2>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Henüz rapor bulunmuyor</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Hesabım</h2>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20">
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">İsim Soyisim</label>
                      <p className="text-white text-lg font-semibold">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">E-posta</label>
                      <p className="text-white text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Telefon</label>
                      <p className="text-white text-lg">{profile?.phone}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Doğum Tarihi</label>
                      <p className="text-white text-lg">{profile?.birth_date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-blue-900/20 z-40">
        <div className="flex justify-around items-center h-16">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Kurye çağır sekmesine tıklayınca sadece sekmeyi değiştir, yönlendirme yapma
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
