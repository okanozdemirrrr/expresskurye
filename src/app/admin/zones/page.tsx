'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/AdminSidebar';

// 20 bölge için parlak renk paleti
const ZONE_COLORS: { [key: number]: string } = {
  1: '#FF0000', 2: '#0000FF', 3: '#FFFF00', 4: '#00FF00', 5: '#FF00FF',
  6: '#00FFFF', 7: '#FF8800', 8: '#8800FF', 9: '#FF0088', 10: '#00FF88',
  11: '#88FF00', 12: '#FF8888', 13: '#8888FF', 14: '#FFFF88', 15: '#88FF88',
  16: '#FF88FF', 17: '#88FFFF', 18: '#FFAA00', 19: '#AA00FF', 20: '#FF00AA',
};

// İstanbul ilçeleri listesi
const ISTANBUL_DISTRICTS = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
  'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
  'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
  'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
  'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
  'Ümraniye', 'Üsküdar', 'Zeytinburnu'
];

export default function AdminZonesPage() {
  const [districtZones, setDistrictZones] = useState<{ [key: string]: number }>({});
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [zoneInput, setZoneInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const { data } = await supabase
        .from('zones')
        .select('*')
        .single();
      if (data?.zones) setDistrictZones(data.zones);
    } catch {
      console.log('Henüz kayıtlı bölge yok');
    }
  };

  const handleDistrictClick = (districtName: string) => {
    setSelectedDistrict(districtName);
    setZoneInput(districtZones[districtName]?.toString() || '');
  };

  const handleZoneAssign = () => {
    const zoneNumber = parseInt(zoneInput);
    if (zoneNumber >= 1 && zoneNumber <= 20 && selectedDistrict) {
      setDistrictZones({ ...districtZones, [selectedDistrict]: zoneNumber });
      setSelectedDistrict(null);
      setZoneInput('');
    } else {
      alert('Lütfen 1-20 arası bir bölge numarası girin!');
    }
  };

  const handleSaveZones = async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase.from('zones').select('id').single();
      if (existing) {
        const { error } = await supabase
          .from('zones')
          .update({ zones: districtZones, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('zones').insert({ zones: districtZones });
        if (error) throw error;
      }
      alert('✅ Bölgeler başarıyla kaydedildi!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`❌ Kaydetme hatası: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Shared sidebar */}
      <AdminSidebar />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto bg-slate-900">
        {/* Top bar */}
        <div className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Bölge Yönetimi</h1>
              <p className="text-[10px] text-gray-400">İlçeleri bölgelere ata</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveZones}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'Bölgeleri Kaydet'}
          </motion.button>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Districts Grid */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">İstanbul İlçeleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ISTANBUL_DISTRICTS.map((district) => {
                const zoneNumber = districtZones[district];
                const bgColor = zoneNumber ? ZONE_COLORS[zoneNumber] : '#334155';
                return (
                  <motion.button
                    key={district}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDistrictClick(district)}
                    className="relative p-4 rounded-xl font-semibold text-white shadow-lg transition-all border-2 border-white/20 hover:border-white/40"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="text-sm">{district}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {zoneNumber ? `Bölge ${zoneNumber}` : 'Atanmadı'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Renk Paleti</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {Object.entries(ZONE_COLORS).map(([zone, color]) => (
                <div key={zone} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg border-2 border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-white text-sm mt-1">Bölge {zone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone assign modal */}
      <AnimatePresence>
        {selectedDistrict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setSelectedDistrict(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Bölge Ata</h3>
                <button onClick={() => setSelectedDistrict(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-400 mb-1">Seçilen İlçe:</p>
                <p className="text-2xl font-bold text-white">{selectedDistrict}</p>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Bu ilçe hangi bölgeye ait? (1-20)</label>
                <input
                  type="number" min="1" max="20"
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleZoneAssign(); }}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-20 arası bir sayı girin"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedDistrict(null)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                  İptal
                </button>
                <button onClick={handleZoneAssign} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
                  Kaydet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
