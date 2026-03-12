import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const CorrelationDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCorrelations();
  }, []);

  const fetchCorrelations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/correlation-analysis', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (correlation, riskLevel) => {
    if (riskLevel === 'BENEFICIAL') return '#10b981';
    if (correlation < 0.3) return '#84cc16';
    if (correlation < 0.6) return '#f59e0b';
    if (correlation < 0.8) return '#ef4444';
    return '#8b0000';
  };

  const getCorrelationIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'BENEFICIAL':
        return '✅';
      case 'LOW':
        return '✅';
      case 'MEDIUM':
        return '⚠️';
      case 'HIGH':
        return '🔴';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Correlation Analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">❌ Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <div className="error">No data available</div>
      </div>
    );
  }

  const { matrix = [], systemicRisk = {}, hedgeEffectiveness = {}, concentration = {} } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🔗 Correlation Analysis</h1>
        <p className="subtitle">Inter-asset correlations and diversification assessment</p>
      </div>

      <div className="dashboard-grid">
        {/* Systemic Risk */}
        <div className="dashboard-card">
          <div className="card-title">⚠️ Systemic Risk</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Risk Score:</span>
              <span className="metric-value" style={{
                color: systemicRisk?.score > 7 ? '#ef4444' : systemicRisk?.score > 5 ? '#f59e0b' : '#10b981'
              }}>
                {systemicRisk?.score || 0}/10
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Risk Level:</span>
              <span className="metric-value">{systemicRisk?.level || 'N/A'}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px', lineHeight: '1.5' }}>
              {systemicRisk?.description}
            </p>
          </div>
        </div>

        {/* Hedge Effectiveness */}
        <div className="dashboard-card">
          <div className="card-title">🛡️ Hedge Effectiveness</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Primary Hedges:</span>
              <span className="metric-value" style={{ fontSize: '14px' }}>
                {hedgeEffectiveness?.primaryHedges || 'None'}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Effectiveness:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                {((hedgeEffectiveness?.effectiveness || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Downside Coverage:</span>
              <span className="metric-value">{hedgeEffectiveness?.coverage || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Internal Correlation */}
        <div className="dashboard-card">
          <div className="card-title">📊 Internal Correlations</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Avg Correlation:</span>
              <span className="metric-value">
                {(concentration?.internalCorrelations || 0).toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Market Shock Risk:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {concentration?.vulnerableToMarketShocks ? '⚠️ YES' : '✅ NO'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>
              {concentration?.recommendation}
            </p>
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="dashboard-card full-width">
          <div className="card-title">🗺️ Correlation Matrix</div>
          <div className="correlation-table">
            <table>
              <thead>
                <tr>
                  <th>Asset Pair</th>
                  <th>Correlation</th>
                  <th>Risk Level</th>
                  <th>Positions</th>
                  <th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((item, idx) => (
                  <tr key={idx} className={`correlation-row ${item.riskLevel.toLowerCase()}`}>
                    <td className="pair-name">
                      {getCorrelationIcon(item.riskLevel)} {item.pair}
                    </td>
                    <td>
                      <div className="correlation-value">
                        <div className="correlation-bar">
                          <div className="bar-fill" style={{
                            width: `${Math.abs(item.correlation) * 100}%`,
                            backgroundColor: getCorrelationColor(item.correlation, item.riskLevel)
                          }}></div>
                        </div>
                        <span>{item.correlation.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getCorrelationColor(item.correlation, item.riskLevel),
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="center-text">{item.positionCount}</td>
                    <td className="assessment-text">{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="dashboard-card full-width">
          <div className="card-title">📚 Correlation Guide</div>
          <div className="correlation-guide">
            <div className="guide-item">
              <span className="guide-label">1.0 to 0.8:</span>
              <p>Very high positive correlation - assets move together (poor diversification)</p>
            </div>
            <div className="guide-item">
              <span className="guide-label">0.8 to 0.5:</span>
              <p>High positive correlation - assets tend to move together</p>
            </div>
            <div className="guide-item">
              <span className="guide-label">0.5 to 0:</span>
              <p>Low positive correlation - some diversification benefit</p>
            </div>
            <div className="guide-item">
              <span className="guide-label">0 to -1.0:</span>
              <p>Negative correlation - assets move opposite (excellent hedge)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchCorrelations}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default CorrelationDashboard;
