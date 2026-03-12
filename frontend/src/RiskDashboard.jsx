import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const RiskDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiskDashboard();
  }, []);

  const fetchRiskDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/analytics/dashboard/risk', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'LOW':
        return '#10b981';
      case 'MEDIUM':
        return '#f59e0b';
      case 'HIGH':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Risk Dashboard...</div>
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

  const { portfolio = {}, probability = {}, sectorExposure = {}, maxDrawdown = {}, alerts = [] } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚠️ Risk Dashboard</h1>
        <p className="subtitle">Portfolio risk assessment and exposure analysis</p>
      </div>

      <div className="dashboard-grid">
        {/* Portfolio Risk Status */}
        <div className="dashboard-card">
          <div className="card-title">📈 Portfolio Risk Status</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Total Portfolio Value:</span>
              <span className="metric-value">${(portfolio?.totalValue || 0).toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Available Cash:</span>
              <span className="metric-value">${(portfolio?.cash || 0).toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Capital Allocated:</span>
              <span className="metric-value">${(portfolio?.allocated || 0).toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Risk Level:</span>
              <span
                className="metric-value"
                style={{
                  color: getRiskLevelColor(portfolio?.riskLevel || 'MEDIUM'),
                  fontWeight: 'bold'
                }}
              >
                {portfolio?.riskLevel || 'MEDIUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Probability Analysis */}
        <div className="dashboard-card">
          <div className="card-title">📊 Probability Analysis</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Average Win Probability:</span>
              <span className="metric-value">{probability?.average || 0}%</span>
            </div>
            {probability?.interpretation && (
              <div className="metric-row">
                <span className="metric-label">Interpretation:</span>
                <p className="interpretation-text">{probability.interpretation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sector Exposure */}
        <div className="dashboard-card">
          <div className="card-title">🌍 Sector Exposure</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">🪙 Crypto Exposure:</span>
              <span className="metric-value">{sectorExposure?.crypto || 0} positions</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">📈 Equities Exposure:</span>
              <span className="metric-value">{sectorExposure?.equities || 0} positions</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">🏆 Commodities Exposure:</span>
              <span className="metric-value">{sectorExposure?.commodities || 0} positions</span>
            </div>
            {sectorExposure?.overConcentration && (
              <div className="metric-row">
                <span className="metric-label">Diversification:</span>
                <span className="metric-value">{sectorExposure.overConcentration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Maximum Drawdown */}
        <div className="dashboard-card">
          <div className="card-title">📉 Maximum Drawdown</div>
          <div className="card-content">
            {maxDrawdown?.potential && (
              <div className="metric-row">
                <span className="metric-label">Potential Drawdown:</span>
                <span className="metric-value" style={{ color: '#ef4444' }}>
                  {maxDrawdown.potential}
                </span>
              </div>
            )}
            {maxDrawdown?.interpretation && (
              <div className="metric-row">
                <span className="metric-label">Interpretation:</span>
                <p className="interpretation-text">{maxDrawdown.interpretation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="dashboard-card full-width">
            <div className="card-title">🚨 Active Risk Alerts</div>
            <div className="alerts-container">
              {alerts.map((alert, idx) => (
                <div key={idx} className="alert-item" style={{ borderLeftColor: '#ef4444' }}>
                  <span className="alert-icon">⚠️</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!alerts || alerts.length === 0) && (
          <div className="dashboard-card full-width">
            <div className="card-title">✅ Risk Assessment</div>
            <div className="card-content">
              <p style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>
                All risk metrics are within acceptable parameters. Portfolio is well-diversified.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchRiskDashboard}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default RiskDashboard;
