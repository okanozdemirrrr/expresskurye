'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  Package,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bike,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/AdminSidebar';

const AdminMapView = dynamic(() => import('@/components/AdminMapView'), { ssr: false });


interface Courier {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  todayDeliveries: number;
  currentLocation: { lat: number; lng: number };
  avatar: string;
}

interface Order {
  id: string;
  orderCode: string;
  status: 'new' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  pickup: string;
  pickupAddress: string;
  pickupName: string;
  pickupPhone: string;
  delivery: string;
  deliveryAddress: string;
  deliveryName: string;
  deliveryPhone: string;
  time: string;
  isNew?: boolean;
  assignedCourierId?: string;
  assignedCourierName?: string;
  paymentMethod?: string;
  payer?: string;
  desi?: string;
  // Timestamps
  createdAt?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  inTransitAt?: string;
  deliveredAt?: string;
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const map: Record<Order['status'], { label: string; cls: string; icon: React.ReactNode }> = {
    new: { label: 'Yeni', cls: 'bg-blue-500/20 text-blue-300', icon: <AlertCircle className="w-3 h-3" /> },
    assigned: { label: 'Atandı', cls: 'bg-purple-500/20 text-purple-300', icon: <User className="w-3 h-3" /> },
    'picked-up': { label: 'Paket Alındı', cls: 'bg-orange-500/20 text-orange-300', icon: <Package className="w-3 h-3" /> },
    'in-transit': { label: 'Yolda', cls: 'bg-yellow-500/20 text-yellow-300', icon: <Clock className="w-3 h-3" /> },
    delivered: { label: 'Teslim Edildi', cls: 'bg-green-500/20 text-green-300', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: 'İptal', cls: 'bg-red-500/20 text-red-300', icon: <X className="w-3 h-3" /> },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

// ─── TIMELINE ROW ─────────────────────────────────────────────────────────────
const TimelineRow = ({ label, time, done }: { label: string; time?: string; done: boolean }) => (
  <div className="flex items-start gap-2">
    <div className="flex flex-col items-center mt-0.5">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-blue-400' : 'bg-slate-600'}`} />
      <div className="w-px flex-1 bg-slate-700 mt-1" style={{ minHeight: 14 }} />
    </div>
    <div className="pb-2">
      <p className={`text-[10px] font-medium ${done ? 'text-slate-300' : 'text-slate-600'}`}>{label}</p>
      {time && <p className="text-[10px] text-slate-500 font-mono">{time}</p>}
    </div>
  </div>
);

const formatTS = (ts?: string) => {
  if (!ts) return undefined;
  return new Date(ts).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ─── COMPACT ACTIVE CARD (sağ panel — ince şerit) ────────────────────────────
const CompactActiveCard = ({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) => (
  <motion.div
    layoutId={`active-card-${order.id}`}
    onClick={onClick}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="bg-white/5 border border-slate-700/50 rounded-xl py-2 px-3 cursor-pointer hover:bg-white/10 hover:border-slate-600 transition-colors"
    style={{ borderRadius: 12 }}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xl font-black text-white tracking-tight">#{order.orderCode}</span>
      <StatusBadge status={order.status} />
    </div>
    <div className="flex items-center gap-2 mt-1">
      {order.assignedCourierName && (
        <p className="text-xs text-blue-300 flex items-center gap-1 truncate">
          <Bike className="w-3 h-3 flex-shrink-0" />{order.assignedCourierName}
        </p>
      )}
      <span className="text-[10px] text-slate-500 ml-auto flex-shrink-0">
        {order.pickup} → {order.delivery}
      </span>
    </div>
  </motion.div>
);

// ─── EXPANDED ACTIVE CARD (ekran ortası — devasa hero) ─────────────────────────
const ExpandedActiveCard = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => (
  <>
    {/* Overlay backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
      onClick={onClose}
    />

    {/* Ekranın ortasına konumlandırma wrapper'ı — layoutId'siz */}
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-8 pointer-events-none">
      <motion.div
        layoutId={`active-card-${order.id}`}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ borderRadius: 20 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div>
            <span className="text-4xl font-black text-white tracking-tight block">#{order.orderCode}</span>
            <div className="mt-2"><StatusBadge status={order.status} /></div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Kurye */}
        {order.assignedCourierName && (
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Atanan Kurye</p>
              <p className="text-xl font-bold text-white">{order.assignedCourierName}</p>
            </div>
          </div>
        )}

        {/* Rota */}
        <div className="px-6 py-4 border-b border-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Çıkış</p>
              <p className="text-lg font-bold text-white">{order.pickup}</p>
              <p className="text-xs text-slate-400 mt-0.5">{order.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Varış</p>
              <p className="text-lg font-bold text-white">{order.delivery}</p>
              <p className="text-xs text-slate-400 mt-0.5">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Zaman Çizelgesi</p>
          <div className="space-y-1">
            <TimelineRow label="Sipariş Saati" time={formatTS(order.createdAt)} done={!!order.createdAt} />
            <TimelineRow label="Admin Atama Saati" time={formatTS(order.assignedAt)} done={!!order.assignedAt} />
            <TimelineRow label="Kurye Kabul Saati" time={formatTS(order.pickedUpAt)} done={!!order.pickedUpAt} />
            {order.status === 'in-transit' && (
              <TimelineRow label="Gönderenden Alım Saati" time={formatTS(order.inTransitAt)} done={!!order.inTransitAt} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  </>
);

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
const OrderDetailModal = ({
  order,
  couriers,
  onAssign,
  onClose,
}: {
  order: Order;
  couriers: Courier[];
  onAssign: (orderId: string, courierId: string, courierName: string) => Promise<void>;
  onClose: () => void;
}) => {
  const [showCourierList, setShowCourierList] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const activeCouriers = couriers.filter(c => c.status === 'active');

  const handleAssign = async (courierId: string, courierName: string) => {
    setAssigning(true);
    await onAssign(order.id, courierId, courierName);
    setAssigning(false);
    onClose();
  };

  const fullDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : order.time;

  const payLabel = order.paymentMethod === 'cash' ? 'Nakit' : order.paymentMethod === 'card' ? 'Kapıda Kart' : '—';
  const payerLabel = order.payer === 'sender' ? 'Gönderen Öder' : order.payer === 'receiver' ? 'Alıcı Öder' : '—';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10000]"
        onClick={onClose}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="fixed inset-0 z-[10001] flex items-center justify-center p-6 pointer-events-none"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="pointer-events-auto bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-black text-white tracking-tight">#{order.orderCode}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />{fullDate}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Müşteri */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Müşteri</p>
                <p className="text-base font-bold text-white">{order.pickupName || '—'}</p>
              </div>
            </div>

            {/* Telefonlar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Bike className="w-3 h-3 text-blue-400" />Gönderen Tel</p>
                <a href={`tel:${order.pickupPhone}`} className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors">{order.pickupPhone || '—'}</a>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><User className="w-3 h-3 text-green-400" />Alıcı Tel</p>
                <a href={`tel:${order.deliveryPhone}`} className="text-sm font-semibold text-green-300 hover:text-green-200 transition-colors">{order.deliveryPhone || '—'}</a>
              </div>
            </div>

            {/* Adresler */}
            <div className="space-y-3">
              <div className="p-4 bg-blue-950/40 border border-blue-800/30 rounded-xl">
                <p className="text-xs text-blue-400 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Çıkış</p>
                <p className="text-sm font-bold text-white">{order.pickup}</p>
                <p className="text-xs text-slate-400 mt-0.5">{order.pickupAddress || '—'}</p>
              </div>
              <div className="flex justify-center">
                <div className="text-slate-500 text-xs flex items-center gap-2">
                  <div className="w-8 h-px bg-slate-700" />
                  <ChevronDown className="w-3.5 h-3.5" />
                  <div className="w-8 h-px bg-slate-700" />
                </div>
              </div>
              <div className="p-4 bg-green-950/40 border border-green-800/30 rounded-xl">
                <p className="text-xs text-green-400 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Varış</p>
                <p className="text-sm font-bold text-white">{order.delivery}</p>
                <p className="text-xs text-slate-400 mt-0.5">{order.deliveryAddress || '—'}</p>
              </div>
            </div>

            {/* Ödeme */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-800/50 rounded-xl col-span-1">
                <p className="text-xs text-slate-400 mb-1">Desi</p>
                <p className="text-sm font-bold text-white">{order.desi || '—'}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl col-span-2">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-yellow-400" />Ödeme</p>
                <p className="text-sm font-bold text-white">{payLabel}</p>
                <p className="text-xs text-slate-400">{payerLabel}</p>
              </div>
            </div>
          </div>

          {/* Courier assignment */}
          <div className="p-6 pt-0">
            {!showCourierList ? (
              <button
                onClick={() => setShowCourierList(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                Aktif Kuryelere Ata
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Kurye Seç</p>
                {activeCouriers.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Aktif kurye bulunamadı</p>
                ) : (
                  activeCouriers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleAssign(c.id, c.name)}
                      disabled={assigning}
                      className="w-full flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group"
                    >
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {c.avatar}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{c.name}</p>
                        <p className="text-xs text-slate-400">Bugün {c.todayDeliveries} paket</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))
                )}
                <button onClick={() => setShowCourierList(false)} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─── NEW ORDER MINI CARD (bottom live feed — fixed size, no accordion) ────────
const NewOrderCard = ({
  order,
  couriers,
  onAssign,
  onOpenDetail,
}: {
  order: Order;
  couriers: Courier[];
  onAssign: (orderId: string, courierId: string, courierName: string) => Promise<void>;
  onOpenDetail: (order: Order) => void;
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setShowPopover(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCouriers = couriers.filter(c => c.status === 'active');

  const handleAssign = async (courierId: string, courierName: string) => {
    setAssigning(true);
    setShowPopover(false);
    await onAssign(order.id, courierId, courierName);
    setAssigning(false);
  };

  return (
    <div
      onClick={() => onOpenDetail(order)}
      className="relative flex-shrink-0 w-52 h-full bg-slate-800/80 border border-yellow-500/30 hover:border-yellow-400/60 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-yellow-500/10 group select-none"
    >
      {/* Sipariş kodu */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-black text-white tracking-tight">#{order.orderCode}</span>
        <span className="text-[10px] text-slate-500">{order.time}</span>
      </div>

      {/* Müşteri ismi */}
      <p className="text-sm font-semibold text-slate-200 truncate mb-2.5">{order.pickupName || '—'}</p>

      {/* Nereden → Nereye */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs font-bold text-blue-300 truncate max-w-[5rem]">{order.pickup}</span>
        <span className="text-slate-500 text-[10px] flex-shrink-0">→</span>
        <span className="text-xs font-bold text-green-300 truncate max-w-[5rem]">{order.delivery}</span>
      </div>

      {/* Ödeme bilgisi */}
      <p className="text-xs text-slate-400 mb-3">
        {order.paymentMethod === 'cash' ? '💵 Nakit' : order.paymentMethod === 'card' ? '💳 Kart' : '—'}
        {order.payer ? ` · ${order.payer === 'sender' ? 'Gönderen' : 'Alıcı'}` : ''}
      </p>

      {/* Kurye Ata butonu — tıklama kart evenından izole */}
      <div
        className="absolute bottom-3 right-3"
        ref={popoverRef}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setShowPopover(p => !p)}
          disabled={assigning}
          className="text-[10px] font-bold px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white rounded-lg transition-all shadow-md shadow-blue-500/30"
        >
          {assigning ? '⏳' : '⚡ Kurye Ata'}
        </button>

        <AnimatePresence>
          {showPopover && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <p className="text-[10px] text-slate-400 px-3 pt-2 pb-1 font-semibold uppercase tracking-wide">Aktif Kuryeler</p>
              {activeCouriers.length === 0 ? (
                <p className="text-[10px] text-slate-500 px-3 py-2">Aktif kurye yok</p>
              ) : (
                <ul className="pb-2">
                  {activeCouriers.map(c => (
                    <li key={c.id}>
                      <button
                        onClick={() => handleAssign(c.id, c.name)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-blue-600/30 transition-colors flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">{c.avatar}</span>
                        <span className="truncate">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedActiveOrder, setSelectedActiveOrder] = useState<Order | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();

    const sub = supabase
      .channel('admin-orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, () => fetchOrders())
      .subscribe();

    const interval = setInterval(fetchData, 30000);
    return () => { sub.unsubscribe(); clearInterval(interval); };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchCouriers(), fetchOrders()]);
    setLoading(false);
  };

  const fetchCouriers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setCouriers((data || []).map((p, i) => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      status: (i < 3 ? 'active' : 'inactive') as 'active' | 'inactive',
      todayDeliveries: Math.floor(Math.random() * 20),
      currentLocation: { lat: 41.0082 + Math.random() * 0.05, lng: 28.9784 + Math.random() * 0.05 },
      avatar: `${p.first_name[0]}${p.last_name[0]}`,
    })));
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) { console.error(error); return; }

    const mapped: Order[] = (data || []).map(pkg => {
      const createdAt = new Date(pkg.created_at);
      const now = new Date();
      const diffMin = (now.getTime() - createdAt.getTime()) / 60000;
      return {
        id: pkg.id,
        orderCode: String(pkg.order_code).padStart(6, '0'),
        status: (pkg.status || 'new') as Order['status'],
        pickup: pkg.pickup_district,
        pickupAddress: pkg.pickup_address,
        pickupName: pkg.pickup_name,
        pickupPhone: pkg.pickup_phone,
        delivery: pkg.delivery_district,
        deliveryAddress: pkg.delivery_address,
        deliveryName: pkg.delivery_name,
        deliveryPhone: pkg.delivery_phone,
        desi: pkg.desi,
        paymentMethod: pkg.payment_method,
        payer: pkg.payer,
        time: createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isNew: diffMin < 5,
        assignedCourierId: pkg.assigned_courier_id,
        createdAt: pkg.created_at,
        assignedAt: pkg.assigned_at,
        pickedUpAt: pkg.picked_up_at,
        inTransitAt: pkg.in_transit_at,
        deliveredAt: pkg.delivered_at,
      };
    });
    setOrders(mapped);

    // Enrich assigned courier names
    const courierIds = [...new Set(mapped.filter(o => o.assignedCourierId).map(o => o.assignedCourierId!))];
    if (courierIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id,first_name,last_name').in('id', courierIds);
      if (profiles) {
        const nameMap: Record<string, string> = {};
        profiles.forEach(p => { nameMap[p.id] = `${p.first_name} ${p.last_name}`; });
        setOrders(prev => prev.map(o => o.assignedCourierId ? { ...o, assignedCourierName: nameMap[o.assignedCourierId] } : o));
      }
    }
  };

  // ── Assign courier ──────────────────────────────────────────────────────────
  const handleAssignCourier = async (orderId: string, courierId: string, courierName: string) => {
    const { error } = await supabase.from('packages').update({
      status: 'assigned',
      assigned_courier_id: courierId,
      assigned_at: new Date().toISOString(),
    }).eq('id', orderId);

    if (error) { console.error('Atama hatası:', error); return; }

    // Optimistic update
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status: 'assigned', assignedCourierId: courierId, assignedCourierName: courierName, assignedAt: new Date().toISOString() }
        : o
    ));
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const newOrders = orders.filter(o => o.status === 'new');
  const activeOrders = orders.filter(o => ['assigned', 'picked-up', 'in-transit'].includes(o.status));
  const stats = {
    total: orders.length,
    inTransit: orders.filter(o => o.status === 'in-transit' || o.status === 'picked-up').length,
    pending: orders.filter(o => o.status === 'new' || o.status === 'assigned').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // ── Resize ──────────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => { setIsResizing(true); e.preventDefault(); };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const w = window.innerWidth - e.clientX;
      if (w >= 300 && w <= 600) setRightPanelWidth(w);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); }
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isResizing]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* ──── SIDEBAR ──────────────────────────────────────────────────────── */}
      <AdminSidebar />

      {/* ──── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR */}
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex-shrink-0"
        >
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">Operasyon Merkezi</h1>
                <p className="text-[10px] text-gray-400">Gerçek Zamanlı Dispatch</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { icon: Package, color: 'text-blue-400', label: 'Toplam', val: stats.total },
                { icon: Clock, color: 'text-yellow-400', label: 'Yolda', val: stats.inTransit },
                { icon: AlertCircle, color: 'text-orange-400', label: 'Bekleyen', val: stats.pending },
                { icon: Bike, color: 'text-green-400', label: 'Kuryeler', val: couriers.filter(c => c.status === 'active').length },
              ].map(({ icon: Icon, color, label, val }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <div>
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-white leading-tight">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CENTER: MAP + RIGHT PANEL */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* MAP */}
          <div className="flex-1 relative min-w-0">
            <AdminMapView couriers={couriers} orders={orders} />
          </div>

          {/* RESIZE HANDLE */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-colors relative group ${isResizing ? 'bg-blue-500' : ''}`}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
              <div className="w-1 h-10 bg-slate-600 rounded-full group-hover:bg-blue-400 transition-colors" />
            </div>
          </div>

          {/* RIGHT PANEL — Active/In-transit orders only */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: rightPanelWidth }}
            style={{ width: rightPanelWidth }}
            className="bg-slate-900/40 backdrop-blur-md border-l border-slate-800 overflow-y-auto flex-shrink-0"
          >
            {/* Couriers */}
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Bike className="w-4 h-4 text-blue-500" />Aktif Kuryeler
              </h3>
              <div className="space-y-2">
                {couriers.map(courier => (
                  <div key={courier.id} className="bg-white/5 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {courier.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-white truncate">{courier.name}</p>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${courier.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[10px] text-gray-400">Bugün: <span className="text-blue-400 font-medium">{courier.todayDeliveries}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active orders (assigned / picked-up / in-transit) */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  Aktif Paketler
                  <span className="text-xs font-normal text-slate-400">({activeOrders.length})</span>
                </h3>
              </div>
              <div className="space-y-1.5">
                {activeOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Aktif paket yok</p>
                ) : (
                  activeOrders.map(order => (
                    <CompactActiveCard
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedActiveOrder(order)}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM: CANLI AKIŞ ─────────────────────────────────────────── */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex-shrink-0 flex flex-col"
          style={{ height: '35vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <span className="text-sm font-bold text-white tracking-wider">CANLI AKIŞ</span>
              <span className="text-xs text-slate-400">— Yeni Siparişler</span>
              <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                {newOrders.length} bekliyor
              </span>
            </div>
            <button
              onClick={() => setShowAllOrdersModal(true)}
              className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg font-semibold transition-all"
            >
              Hepsini Gör
            </button>
          </div>

          {/* Cards row — horizontal scroll, fixed height cards */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-3 min-h-0">
            <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
              {newOrders.length === 0 ? (
                <div className="flex items-center gap-3 text-slate-500 text-sm h-full">
                  <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse" />
                  <span>Yeni sipariş bekleniyor...</span>
                </div>
              ) : (
                newOrders.map(order => (
                  <NewOrderCard
                    key={order.id}
                    order={order}
                    couriers={couriers}
                    onAssign={handleAssignCourier}
                    onOpenDetail={setSelectedOrder}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ──── ALL ORDERS MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAllOrdersModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAllOrdersModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-8"
              onClick={() => setShowAllOrdersModal(false)}
            >
              <div onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold text-white">Tüm Siparişler (Teslim edilenler hariç)</h2>
                  </div>
                  <button onClick={() => setShowAllOrdersModal(false)} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                  <div className="grid grid-cols-3 gap-4">
                    {orders.filter(o => o.status !== 'delivered').map(order => (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-slate-800/50 border rounded-xl p-4 ${order.status === 'new' ? 'border-yellow-500/50' : 'border-slate-700'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-white">#{order.orderCode}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          <p><MapPin className="w-3 h-3 inline text-blue-400 mr-1" />{order.pickup}</p>
                          <p><MapPin className="w-3 h-3 inline text-green-400 mr-1" />{order.delivery}</p>
                          <p><Clock className="w-3 h-3 inline mr-1" />{order.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──── ORDER DETAIL MODAL (new orders) ──────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            couriers={couriers}
            onAssign={handleAssignCourier}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>

      {/* ──── HERO EXPANDED ACTIVE CARD (layoutId shared transition) ─────── */}
      <AnimatePresence mode="popLayout">
        {selectedActiveOrder && (
          <ExpandedActiveCard
            order={selectedActiveOrder}
            onClose={() => setSelectedActiveOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
