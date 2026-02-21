'use client';

import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerClientProps {
  currentCenter: { lat: number; lng: number };
  setCurrentCenter: (center: { lat: number; lng: number }) => void;
}

function MapEventHandler({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    move: () => {
      const center = map.getCenter();
      onMove(center.lat, center.lng);
    },
  });

  // Harita yüklendiğinde boyutunu düzelt
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function MapPickerClient({ currentCenter, setCurrentCenter }: MapPickerClientProps) {
  return (
    <MapContainer
      center={[currentCenter.lat, currentCenter.lng]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventHandler onMove={(lat, lng) => setCurrentCenter({ lat, lng })} />
    </MapContainer>
  );
}
