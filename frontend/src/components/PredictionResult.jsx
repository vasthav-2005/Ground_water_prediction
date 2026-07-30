import React from 'react';
import { Droplet, AlertCircle, CheckCircle, ShieldAlert, Calendar, MapPin } from 'lucide-react';
import { MONTHS } from '../utils/samplePresets';

const PredictionResult = ({ result }) => {
  if (!result) {
    return (
      <div className="glass-panel" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '380px'
      }}>
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          padding: '1.5rem',
          borderRadius: '50%',
          marginBottom: '1rem',
          border: '1px dashed rgba(56, 189, 248, 0.3)'
        }}>
          <Droplet size={48} color="#38bdf8" />
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Ready for Prediction
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '360px', marginTop: '0.5rem' }}>
          Select a <strong>Station</strong> and <strong>Month</strong> from the form, then click <strong>Predict Groundwater Level</strong>.
        </p>
      </div>
    );
  }

  const { predicted_gwl_meter, classification, station, station_code, inputs_evaluated } = result;

  const getStatusStyle = (classificationText) => {
    if (classificationText?.toLowerCase().includes('optimal')) {
      return { class: 'optimal', icon: <CheckCircle size={16} />, color: '#10b981' };
    } else if (classificationText?.toLowerCase().includes('shallow')) {
      return { class: 'deep', icon: <ShieldAlert size={16} />, color: '#f43f5e' };
    } else if (classificationText?.toLowerCase().includes('moderate')) {
      return { class: 'moderate', icon: <AlertCircle size={16} />, color: '#f59e0b' };
    } else {
      return { class: 'deep', icon: <ShieldAlert size={16} />, color: '#f43f5e' };
    }
  };

  const statusInfo = getStatusStyle(classification);
  const monthObj = MONTHS.find(m => m.value === inputs_evaluated?.Month);
  const monthLabel = monthObj ? monthObj.label : `Month ${inputs_evaluated?.Month}`;

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      
      {/* Header */}
      <div className="result-header">
        <div style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-primary)',
          fontWeight: 700
        }}>
          Inference Result • Station {station}
        </div>

        <div className="result-value-badge">
          <div className="result-number">
            {predicted_gwl_meter !== undefined ? predicted_gwl_meter.toFixed(2) : 'N/A'}
          </div>
          <div className="result-unit">meters (predicted depth to water table)</div>
        </div>

        <div className={`status-pill ${statusInfo.class}`}>
          {statusInfo.icon}
          <span>{classification}</span>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.5rem' }}>
        
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Prediction Summary
        </h4>

        <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="metric-box">
            <div className="metric-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <MapPin size={12} /> Station
            </div>
            <div className="metric-val" style={{ color: '#38bdf8', fontSize: '1rem' }}>
              {station}
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Calendar size={12} /> Selected Month
            </div>
            <div className="metric-val" style={{ color: '#10b981', fontSize: '1rem' }}>
              {monthLabel}
            </div>
          </div>
        </div>

        {/* Inputs Summary Box */}
        {inputs_evaluated && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              padding: '0.85rem 1rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Station Code:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{inputs_evaluated.Station_Code}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Month:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{monthLabel} (Code {inputs_evaluated.Month})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Engine:</span>
                  <strong style={{ color: 'var(--color-primary)' }}>XGBoost Regressor</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default PredictionResult;
