import React, { useState } from 'react';
import { MapPin, Calendar, Zap, RefreshCw } from 'lucide-react';
import SamplePresets from './SamplePresets';
import { MONTHS } from '../utils/samplePresets';
import { validatePredictionForm } from '../utils/validators';

const FeatureForm = ({ stations, selectedStation, onStationChange, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    station: selectedStation || 'Shillong',
    stationCode: 14,
    month: 6
  });

  const [errors, setErrors] = useState({});

  // Sync internal state when external selectedStation changes (e.g. clicked on map)
  React.useEffect(() => {
    if (selectedStation && selectedStation !== formData.station) {
      const matched = stations.find(s => s.name === selectedStation || String(s.code) === String(selectedStation));
      setFormData(prev => ({
        ...prev,
        station: matched ? matched.name : selectedStation,
        stationCode: matched ? matched.code : prev.stationCode
      }));
    }
  }, [selectedStation, stations]);

  const handleStationChange = (e) => {
    const selectedName = e.target.value;
    const matched = stations.find(s => s.name === selectedName);
    const newCode = matched ? matched.code : 0;
    setFormData(prev => ({
      ...prev,
      station: selectedName,
      stationCode: newCode
    }));
    if (onStationChange) onStationChange(selectedName);
    if (errors.station) setErrors(prev => ({ ...prev, station: null }));
  };

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      month: m
    }));
    if (errors.month) setErrors(prev => ({ ...prev, month: null }));
  };

  const handleSelectPreset = (preset) => {
    setFormData({
      station: preset.station,
      stationCode: preset.stationCode,
      month: preset.month
    });
    if (onStationChange) onStationChange(preset.station);
    setErrors({});
  };

  const handleReset = () => {
    const defaultSt = stations[0]?.name || 'Amlarem';
    const defaultCode = stations[0]?.code || 0;
    setFormData({
      station: defaultSt,
      stationCode: defaultCode,
      month: 1
    });
    if (onStationChange) onStationChange(defaultSt);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validatePredictionForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit({
      station: formData.station,
      stationCode: formData.stationCode,
      month: formData.month
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      
      <SamplePresets onSelectPreset={handleSelectPreset} />

      <form onSubmit={handleSubmit}>
        
        <div className="form-section-title">
          <MapPin size={18} />
          <span>Groundwater Telemetry Parameters</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          
          {/* Station Selection Dropdown */}
          <div className="form-group">
            <label className="form-label">
              Telemetry Station Name
              <span className="hint">18 Meghalaya stations</span>
            </label>
            <select
              className={`form-select ${errors.station ? 'error' : ''}`}
              value={formData.station}
              onChange={handleStationChange}
            >
              {stations.map(st => (
                <option key={st.code} value={st.name}>
                  {st.name} (Code: {st.code})
                </option>
              ))}
            </select>
            {errors.station && <span className="error-text">{errors.station}</span>}
          </div>

          {/* Month Selection Dropdown (January - December) */}
          <div className="form-group">
            <label className="form-label">
              Select Month
              <span className="hint">January – December</span>
            </label>
            <select
              className={`form-select ${errors.month ? 'error' : ''}`}
              value={formData.month}
              onChange={handleMonthChange}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} (Month {m.value})
                </option>
              ))}
            </select>
            {errors.month && <span className="error-text">{errors.month}</span>}
          </div>

        </div>

        {/* Buttons: Predict & Reset */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Predict Groundwater Level</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-preset"
            onClick={handleReset}
            disabled={isLoading}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default FeatureForm;
