'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bike, Package, MapPin, Settings } from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { id: 'couriers', label: 'Kuryeler', icon: Bike, href: '/admin/couriers' },
    { id: 'orders', label: 'Siparişler', icon: Package, href: '/admin/orders' },
    { id: 'zones', label: 'Bölgeler', icon: MapPin, href: '/admin/zones' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, href: '/admin/settings' },
] as const;

export function AdminSidebar() {
    const [expanded, setExpanded] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: expanded ? 240 : 80 }}
            transition={{ type: 'spring', damping: 20 }}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className="bg-slate-950 border-r border-slate-800 flex flex-col py-6 relative z-50 flex-shrink-0"
        >
            {/* Logo */}
            <div className="px-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl">EK</span>
                    </div>
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <h2 className="text-white font-bold text-lg whitespace-nowrap">Express Kurye</h2>
                                <p className="text-gray-400 text-xs whitespace-nowrap">Operasyon Merkezi</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="h-px bg-slate-800 mx-4 mb-6" />

            {/* Nav items */}
            <div className="flex-1 px-4 space-y-2">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    // Dashboard: exact match; diğerleri: startsWith
                    const isActive =
                        item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);

                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(item.href)}
                            className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Icon className="w-6 h-6 flex-shrink-0" />
                            <AnimatePresence>
                                {expanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-semibold whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isActive && !expanded && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.aside>
    );
}
