import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import FeatureForm from './components/FeatureForm';
import PredictionResult from './components/PredictionResult';
import ErrorAlert from './components/ErrorAlert';
import { fetchStations, predictGroundwaterLevel } from './services/api';

function App() {
  const [stations, setStations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationList = await fetchStations();
        setStations(stationList);
      } catch (err) {
        console.error('Failed to load stations:', err);
      }
    };
    loadStations();
  }, []);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await predictGroundwaterLevel(formData);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'An error occurred while calculating prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <MetricsOverview />

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid-dashboard">
        <div>
          <FeatureForm
            stations={stations}
            onSubmit={handlePredict}
            isLoading={isLoading}
          />
        </div>

        <div>
          <PredictionResult result={prediction} />
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-dim)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        Groundwater Level Telemetry Prediction System &bull; React + Spring Boot + XGBoost Model &bull; 2026
      </footer>
    </div>
  );
}

export default App;
