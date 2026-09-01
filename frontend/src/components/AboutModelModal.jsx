import React from 'react';
import { X, Cpu, CheckCircle2, BarChart2, Layers, MapPin, Zap, Info, ShieldCheck } from 'lucide-react';

const AboutModelModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        padding: '2rem',
        position: 'relative',
        color: 'var(--text-main)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="btn-close-modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            padding: '0.6rem',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              About Machine Learning Model & Accuracy Report
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              XGBoost Regressor &bull; 51,985 Telemetry Observations &bull; 18 Meghalaya Stations
            </p>
          </div>
        </div>

        {/* Model Accuracy Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
              Model Accuracy
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
              96.15%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Based on telemetry MAE evaluation
            </div>
          </div>

          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              R² Score
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
              0.9657
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              96.57% Variance Explained
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              Mean Abs Error (MAE)
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              0.42 m
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Average depth deviation
            </div>
          </div>

          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
              Trees Ensemble
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
              300 Trees
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Gradient Boosted Decision Trees
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>

          {/* Section 1: Executive Overview */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} /> Model Executive Overview
            </h3>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              The groundwater prediction system utilizes an <strong>Extreme Gradient Boosting (XGBoost Regressor)</strong> model trained on 51,985 automated 6-hourly telemetry readings from 18 monitoring stations across Meghalaya (2021–2025). It predicts groundwater level depth in meters below ground level with high precision.
            </p>
          </div>

          {/* Section 2: Feature Engineering */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={18} /> 13-Feature Engineering Pipeline
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#38bdf8' }}>Temporal Features (5)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Year, Month, Day, Hour, DayOfYear
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#10b981' }}>Autoregressive Lags (3)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  GWL_lag1 (6h), GWL_lag2 (12h), GWL_lag4 (24h)
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#f59e0b' }}>Rolling Statistics (4)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  GWL_diff_1, GWL_roll_mean_24h, GWL_roll_mean_48h, GWL_roll_std_24h
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#c084fc' }}>Spatial Identifier (1)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Station_Code (Categorical 0-17)
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Dual Engine & Cloud Architecture */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={18} /> Dual-Engine Cloud Architecture
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8' }}>
              To execute seamlessly on Vercel Serverless Functions without native library compilation errors:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <li><strong>Native Engine</strong>: Scikit-Learn / C++ compiled XGBoost model for local high-memory processing.</li>
              <li><strong>Zero-Dependency Cloud Engine</strong>: Pure Python JSON tree evaluator evaluating 300 exported decision trees in &lt;1 ms with 0 MB native library overhead.</li>
            </ul>
          </div>

          {/* Footer note */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span>Groundwater Level Telemetry Predictor &bull; Meghalaya Dataset</span>
            <button
              onClick={onClose}
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close Report
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AboutModelModal;
