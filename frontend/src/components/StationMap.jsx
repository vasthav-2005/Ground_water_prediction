import React, { useEffect, useRef } from 'react';
import { MapPin, Compass, Eye } from 'lucide-react';
import { DEFAULT_STATIONS } from '../services/api';

const StationMap = ({ stations = [], selectedStation, onSelectStation, prediction }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const stationList = stations && stations.length > 0 ? stations : DEFAULT_STATIONS;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.55, 91.30],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark / modern tile layer using CartoDB Dark Matter or OpenStreetMap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    // Add markers for all stations
    stationList.forEach(st => {
      const lat = st.lat || 25.55;
      const lng = st.lng || 91.30;
      const isSelected = selectedStation && (selectedStation === st.name || selectedStation === String(st.code));

      // Create glowing circle marker
      const circleMarker = L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 8,
        fillColor: isSelected ? '#38bdf8' : '#0284c7',
        color: isSelected ? '#ffffff' : '#38bdf8',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.9 : 0.75,
      }).addTo(map);

      // Popup Content
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

    // Auto-fit bounds if no station is explicitly selected
    if (!selectedStation && stationList.length > 0) {
      const bounds = L.latLngBounds(stationList.map(s => [s.lat || 25.55, s.lng || 91.30]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

  }, [stationList, prediction]);

  // Pan to selected station when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    const map = mapInstanceRef.current;

    const st = stationList.find(s => s.name === selectedStation || String(s.code) === String(selectedStation));
    if (st && st.lat && st.lng) {
      map.flyTo([st.lat, st.lng], 11, { duration: 1.2 });
      const marker = markersRef.current[st.name] || markersRef.current[st.code];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStation, stationList]);

  const handleResetView = () => {
    if (!mapInstanceRef.current || stationList.length === 0) return;
    const L = window.L;
    if (!L) return;
    const bounds = L.latLngBounds(stationList.map(s => [s.lat || 25.55, s.lng || 91.30]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} className="text-primary" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Meghalaya Hydrological Telemetry Map
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            color: 'var(--color-primary)',
            fontWeight: 600
          }}>
            18 Telemetry Stations
          </span>
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
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '340px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          zIndex: 1
        }}
      />

      <div style={{
        marginTop: '0.65rem',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> Click any marker to auto-select station</span>
        <span>Interactive OpenStreetMap</span>
      </div>

    </div>
  );
};

export default StationMap;
