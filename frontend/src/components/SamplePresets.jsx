import React from 'react';
import { getSamplePresets } from '../utils/samplePresets';
import { Sparkles, MapPin } from 'lucide-react';

const SamplePresets = ({ onSelectPreset }) => {
  const presets = getSamplePresets();

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '0.6rem'
      }}>
        <Sparkles size={16} color="var(--color-primary)" />
        <span>Quick Load Rolling Sample Scenarios:</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="btn-preset"
            onClick={() => onSelectPreset(preset)}
            title={`Load ${preset.name} sample values`}
          >
            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SamplePresets;
