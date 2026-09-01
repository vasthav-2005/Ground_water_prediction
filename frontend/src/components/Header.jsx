import React, { useState } from 'react';
import { Droplets, Activity, Cpu, Info } from 'lucide-react';
import AboutModelModal from './AboutModelModal';

const Header = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Droplets size={28} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Groundwater Telemetry Predictor
                <span style={{
                  fontSize: '0.7rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  ML Powered &bull; 96.15% Accuracy
                </span>
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Hydrological telemetry analytics & XGBoost groundwater level forecasting for Meghalaya stations
              </p>
            </div>
          </div>

          {/* System Badges & About Model Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsAboutOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                background: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)'
              }}
              title="View Machine Learning Model Architecture & Accuracy Report"
            >
              <Info size={15} />
              <span>About Model (96.15% Accuracy)</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontWeight: 500
            }}>
              <Activity size={14} />
              <span>API Online</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontWeight: 500
            }}>
              <Cpu size={14} />
              <span>XGBoost Regressor</span>
            </div>
          </div>

        </div>
      </header>

      <AboutModelModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default Header;
