import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Eye, Layers } from 'lucide-react';
import { DEFAULT_STATIONS } from '../services/api';

const StationMap = ({ stations = [], selectedStation, onSelectStation, prediction }) => {
  const [mapMode, setMapMode] = useState('folium'); // 'folium' | 'leaflet'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const stationList = stations && stations.length > 0 ? stations : DEFAULT_STATIONS;

  useEffect(() => {
    if (mapMode !== 'leaflet') return;
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;

    // Initialize Leaflet map if not created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.55, 91.30],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    // Add markers
    stationList.forEach(st => {
      const lat = st.lat || 25.55;
      const lng = st.lng || 91.30;
      const isSelected = selectedStation && (selectedStation === st.name || selectedStation === String(st.code));

      const circleMarker = L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 8,
        fillColor: isSelected ? '#38bdf8' : '#0284c7',
        color: isSelected ? '#ffffff' : '#38bdf8',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.9 : 0.75,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 2px; color: #0f172a; min-width: 160px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: #0284c7; margin-bottom: 4px;">
            📍 ${st.name}
          </div>
          <div style="font-size: 0.78rem; color: #475569; margin-bottom: 2px;">
            Station Code: <strong>${st.code}</strong>
          </div>
          <div style="font-size: 0.75rem; color: #64748b;">
            Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°
          </div>
          ${prediction && (prediction.station === st.name || prediction.station_code === st.code) ? `
            <div style="margin-top: 6px; padding: 4px 6px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 0.75rem; color: #166534; font-weight: 600;">
              GWL: ${prediction.predicted_gwl_meter?.toFixed(2)} m (${prediction.classification})
            </div>
          ` : ''}
        </div>
      `;

      circleMarker.bindPopup(popupHtml);

      circleMarker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(st);
        }
      });

      markersRef.current[st.name] = circleMarker;
      markersRef.current[st.code] = circleMarker;
    });

  }, [mapMode, stationList, prediction]);

  // Pan to selected station in leaflet mode
  useEffect(() => {
    if (mapMode !== 'leaflet' || !mapInstanceRef.current || !selectedStation) return;
    const map = mapInstanceRef.current;

    const st = stationList.find(s => s.name === selectedStation || String(s.code) === String(selectedStation));
    if (st && st.lat && st.lng) {
      map.flyTo([st.lat, st.lng], 11, { duration: 1.2 });
      const marker = markersRef.current[st.name] || markersRef.current[st.code];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStation, stationList, mapMode]);

  const handleResetView = () => {
    if (mapMode === 'leaflet' && mapInstanceRef.current && stationList.length > 0) {
      const L = window.L;
      if (!L) return;
      const bounds = L.latLngBounds(stationList.map(s => [s.lat || 25.55, s.lng || 91.30]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} className="text-primary" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Interactive Meghalaya Telemetry Map
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Mode Switcher Buttons */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setMapMode('folium')}
              style={{
                background: mapMode === 'folium' ? 'var(--color-primary)' : 'transparent',
                color: mapMode === 'folium' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Layers size={12} /> Folium Map
            </button>

            <button
              type="button"
              onClick={() => setMapMode('leaflet')}
              style={{
                background: mapMode === 'leaflet' ? 'var(--color-primary)' : 'transparent',
                color: mapMode === 'leaflet' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Compass size={12} /> Station Explorer
            </button>
          </div>

          {mapMode === 'leaflet' && (
            <button
              onClick={handleResetView}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reset Map View"
            >
              <Compass size={12} /> Reset View
            </button>
          )}
        </div>
      </div>

      {/* Map View Area */}
      {mapMode === 'folium' ? (
        <div style={{
          width: '100%',
          height: '420px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: '#0f172a'
        }}>
          <iframe
            src="/water_wells_map.html"
            title="Interactive Meghalaya Folium Water Wells Map"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '420px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            zIndex: 1
          }}
        />
      )}

      <div style={{
        marginTop: '0.65rem',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> Interactive Folium district map generated from hydrological telemetry data</span>
        <span>Vercel Compatible</span>
      </div>

    </div>
  );
};

export default StationMap;
