import React from 'react';
import { Database, Map, Calendar, Cpu } from 'lucide-react';

const MetricsOverview = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Map size={22} color="#38bdf8" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Coverage Area</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>18 Telemetry Stations</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Database size={22} color="#06b6d4" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Dataset Size</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>51,987 Records</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Calendar size={22} color="#10b981" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Time Horizon</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>2021 – 2025 (6-Hourly)</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.65rem', borderRadius: '10px' }}>
          <Cpu size={22} color="#f59e0b" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Algorithm</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>XGBoost Regressor</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
