import React, { useState } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';

const ErrorAlert = ({ message, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!message) return null;

  return (
    <div style={{
      background: 'rgba(244, 63, 94, 0.12)',
      border: '1px solid rgba(244, 63, 94, 0.4)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
      color: '#fda4af',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Prediction Failed</strong>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>{message}</p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#fda4af',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
