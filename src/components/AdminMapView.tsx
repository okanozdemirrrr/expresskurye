'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  delivery: string;
  time: string;
  isNew?: boolean;
}

interface AdminMapViewProps {
  couriers: Courier[];
  orders: Order[];
}

// Custom courier icon
const courierIcon = new L.DivIcon({
  className: 'custom-courier-icon',
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      <div class="relative w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Custom order icon
const orderIcon = new L.DivIcon({
  className: 'custom-order-icon',
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
      <div class="relative w-8 h-8 bg-orange-600 rounded-full border-3 border-white shadow-lg"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function AdminMapView({ couriers, orders }: AdminMapViewProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[41.0082, 28.9784]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Dark Mode Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapInvalidator />

        {/* Courier Markers */}
        {couriers.filter(c => c.status === 'active').map((courier) => (
          <Marker
            key={courier.id}
            position={[courier.currentLocation.lat, courier.currentLocation.lng]}
            icon={courierIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">{courier.name}</p>
                <p className="text-sm text-gray-600">Bugün: {courier.todayDeliveries} teslimat</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Order Markers (new and assigned orders) */}
        {orders.filter(o => o.status === 'new' || o.status === 'assigned').map((order, idx) => (
          <Marker
            key={order.id}
            position={[41.0082 + (idx * 0.01), 28.9784 + (idx * 0.01)]}
            icon={orderIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">#{order.orderCode}</p>
                <p className="text-sm text-gray-600">{order.pickup} → {order.delivery}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Overlay Info */}
      <div className="absolute bottom-8 left-4 z-[1000] space-y-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-bold mb-2">Harita Göstergeleri</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-300">Aktif Kurye</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="text-gray-300">Yeni/Atanmış Sipariş</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
