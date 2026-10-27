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
      
      const currentVal = st.currentGwl !== undefined ? st.currentGwl : (st.observedGwl !== undefined ? st.observedGwl : null);
      const isCustomPred = prediction && (prediction.station === st.name || prediction.station_code === st.code);
      const predictedVal = isCustomPred ? prediction.predicted_gwl_meter : (st.predictedGwl !== undefined ? st.predictedGwl : null);
      const classification = isCustomPred ? prediction.classification : (st.classification || 'Optimal / Normal Range');
      
      const diff = (predictedVal !== null && currentVal !== null) ? (predictedVal - currentVal) : null;
      const diffStr = diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} m` : 'N/A';

      // Status indicator color
      let markerColor = '#10b981'; // Green
      if (predictedVal !== null) {
        if (predictedVal < 5.0) markerColor = '#ef4444'; // Red
        else if (predictedVal <= 35.0) markerColor = '#10b981'; // Green
        else if (predictedVal <= 60.0) markerColor = '#f59e0b'; // Amber
        else markerColor = '#ef4444'; // Red
      }

      const circleMarker = L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 9,
        fillColor: isSelected ? '#38bdf8' : markerColor,
        color: isSelected ? '#ffffff' : '#f8fafc',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.85,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 8px 10px; color: #f8fafc; min-width: 210px; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px;">
            <div style="font-weight: 700; font-size: 0.95rem; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
              <span>📍</span> ${st.name}
            </div>
            <span style="font-size: 0.7rem; font-weight: 600; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">
              Code ${st.code}
            </span>
          </div>

          ${st.district ? `<div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 6px;">District: <strong style="color: #cbd5e1;">${st.district}</strong></div>` : ''}

          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px 8px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.75rem; color: #94a3b8;">Current Observed GWL:</span>
              <strong style="color: #38bdf8; font-size: 0.88rem;">${currentVal !== null ? currentVal.toFixed(2) + ' m' : 'N/A'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.75rem; color: #94a3b8;">Predicted GWL (Model):</span>
              <strong style="color: #34d399; font-size: 0.88rem;">${predictedVal !== null ? predictedVal.toFixed(2) + ' m' : 'N/A'}</strong>
            </div>
            ${diff !== null ? `
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 3px; margin-top: 2px;">
                <span style="font-size: 0.7rem; color: #64748b;">Telemetry Variance:</span>
                <span style="font-size: 0.75rem; font-weight: 600; color: ${diff > 0.5 ? '#ef4444' : (diff < -0.5 ? '#10b981' : '#38bdf8')};">${diffStr}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 4px;">
            <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.68rem; font-weight: 600; background: rgba(56, 189, 248, 0.12); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.25);">
              ${classification}
            </span>
          </div>

          <div style="font-size: 0.65rem; color: #64748b; margin-top: 4px; text-align: right;">
            Depth to water table (bgl)
          </div>
        </div>
      `;

      circleMarker.bindPopup(popupHtml);
      circleMarker.bindTooltip(popupHtml, { sticky: true, className: 'custom-tooltip' });

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
