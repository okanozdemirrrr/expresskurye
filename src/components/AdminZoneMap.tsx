'use client';

import { useEffect, useRef } from 'react';

interface AdminZoneMapProps {
  geoData: any;
  districtZones: { [key: string]: number };
  onDistrictClick: (districtName: string) => void;
  zoneColors: { [key: number]: string };
}

export default function AdminZoneMap({
  geoData,
  districtZones,
  onDistrictClick,
  zoneColors,
}: AdminZoneMapProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !geoData) return;

    // Leaflet'i dinamik olarak import et
    import('leaflet').then((L) => {
      // Harita zaten varsa temizle
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Yeni harita oluştur
      const map = L.map(mapRef.current).setView([41.0082, 28.9784], 10);
      mapInstanceRef.current = map;

      // Dark tile layer ekle
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // GeoJSON layer ekle
      L.geoJSON(geoData, {
        style: (feature: any) => {
          const districtName = feature?.properties?.name;
          const zoneNumber = districtZones[districtName];
          
          if (zoneNumber) {
            return {
              fillColor: zoneColors[zoneNumber],
              fillOpacity: 0.6,
              color: '#ffffff',
              weight: 2,
            };
          }
          
          return {
            fillColor: '#334155',
            fillOpacity: 0.4,
            color: '#64748b',
            weight: 1,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const districtName = feature.properties.name;
          const zoneNumber = districtZones[districtName];
          
          // Tooltip
          const tooltipContent = zoneNumber
            ? `${districtName} - Bölge ${zoneNumber}`
            : `${districtName} - Atanmadı`;
          
          layer.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'center',
          });

          // Click event
          layer.on('click', () => {
            onDistrictClick(districtName);
          });

          // Hover effects
          layer.on('mouseover', function (this: any) {
            this.setStyle({
              weight: 3,
              fillOpacity: 0.8,
            });
          });

          layer.on('mouseout', function (this: any) {
            const zoneNum = districtZones[districtName];
            this.setStyle({
              fillColor: zoneNum ? zoneColors[zoneNum] : '#334155',
              fillOpacity: zoneNum ? 0.6 : 0.4,
              color: zoneNum ? '#ffffff' : '#64748b',
              weight: zoneNum ? 2 : 1,
            });
          });
        },
      }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoData, districtZones, onDistrictClick, zoneColors]);

  return <div ref={mapRef} style={{ height: '70vh', width: '100%' }} />;
}

