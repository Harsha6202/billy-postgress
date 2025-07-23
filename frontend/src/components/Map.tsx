import { useState, useEffect } from 'react';
import { Report } from '../types';
import { MAP_CONFIG } from '../config/mapConfig';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This flag will be true when running on the server
const isSSR = typeof window === 'undefined';

// Fix for default marker icons in react-leaflet
if (!isSSR) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

interface MapViewProps {
  reports: Report[];
}

const MapView: React.FC<MapViewProps> = ({ reports = [] }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (isSSR || !isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  const getMarkerColor = (count: number) => {
    if (count >= 10) return '#FF0000';
    if (count >= 7) return '#FF4500';
    if (count >= 3) return '#FFA500';
    return '#2196F3';
  };

  // Group reports by location, with safety checks
  const locationGroups = (Array.isArray(reports) ? reports : []).reduce((acc, report) => {
    if (
      !report.location ||
      typeof report.location.lat !== 'number' ||
      typeof report.location.lng !== 'number'
    ) {
      console.warn('Invalid report location:', report);
      return acc; // skip invalid location
    }

    const key = `${report.location.lat.toFixed(4)},${report.location.lng.toFixed(4)}`;
    if (!acc[key]) {
      acc[key] = {
        reports: [],
        count: 0,
        location: report.location,
      };
    }
    acc[key].reports.push(report);
    acc[key].count++;
    return acc;
  }, {} as Record<string, { reports: Report[]; count: number; location: Report['location'] }>);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        key={String(isMounted)}
        center={[MAP_CONFIG.center[0], MAP_CONFIG.center[1]]}
        zoom={MAP_CONFIG.zoom}
        className="h-full w-full rounded-lg shadow-lg"
        maxBounds={[
          [MAP_CONFIG.bounds.south, MAP_CONFIG.bounds.west],
          [MAP_CONFIG.bounds.north, MAP_CONFIG.bounds.east],
        ]}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        whenCreated={(map: any) => {
          setTimeout(() => {
            map.invalidateSize();
          }, 0);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {Object.values(locationGroups).map(({ reports, count, location }) => (
          <CircleMarker
            key={`${location.lat}-${location.lng}`}
            center={[location.lat, location.lng]}
            radius={Math.min(count * 3, 20)}
            fillColor={getMarkerColor(count)}
            color={getMarkerColor(count)}
            weight={2}
            opacity={0.8}
            fillOpacity={0.4}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-lg mb-2">
                  {location.city || location.district}, {location.state}
                </h3>
                <p className="text-red-600 font-semibold mb-2">
                  {count} {count === 1 ? 'Report' : 'Reports'}
                </p>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Types of Incidents:</p>
                  {Object.entries(
                    reports.reduce((acc, r) => {
                      acc[r.bullyingType] = (acc[r.bullyingType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                {count >= 3 && (
                  <div className="mt-3 text-sm text-red-600">
                    ⚠️ Critical area - Reported to cybercrime authorities
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
