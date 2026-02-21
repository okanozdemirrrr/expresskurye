'use client';

import { useState, useEffect } from 'react';

interface MapPickerProps {
  onConfirm: (lat: number, lng: number) => void;
  title: string;
}

export default function MapPicker({ onConfirm, title }: MapPickerProps) {
  const [currentCenter, setCurrentCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ 
    currentCenter: { lat: number; lng: number };
    setCurrentCenter: (center: { lat: number; lng: number }) => void;
  }> | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Dinamik olarak harita componentini yükle
    import('./MapPickerClient').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm(currentCenter.lat, currentCenter.lng);
  };

  if (!isMounted || !MapComponent) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-950">{title}</h3>
        <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-950">{title}</h3>
      
      {!isConfirmed ? (
        <div className="relative">
          <MapComponent 
            currentCenter={currentCenter}
            setCurrentCenter={setCurrentCenter}
          />

          {/* Sabit Pin - Ekranın Ortasında */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none"
          >
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              <path 
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                fill="#1e40af"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Koordinat Göstergesi */}
          <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-mono z-[1000]">
            <div>Lat: {currentCenter.lat.toFixed(6)}</div>
            <div>Lng: {currentCenter.lng.toFixed(6)}</div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-4 w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-lg"
          >
            Konumumu Onayla
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">✓ Konum onaylandı</p>
          <p className="text-sm text-green-600 mt-1">
            {currentCenter.lat.toFixed(6)}, {currentCenter.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
