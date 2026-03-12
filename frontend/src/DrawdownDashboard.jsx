import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const DrawdownDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrawdown();
  }, []);

  const fetchDrawdown = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/drawdown-analysis', { headers: getAuthHeaders() });
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

  const getDrawdownColor = (value) => {
    const absValue = Math.abs(value);
    if (absValue < 10) return '#10b981';
    if (absValue < 15) return '#f59e0b';
    if (absValue < 25) return '#ef4444';
    return '#8b0000';
  };

  const getVolatilityColor = (volatility) => {
    switch (volatility) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      case 'Very High':
      case 'Extreme':
        return '#8b0000';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Drawdown Analysis...</div>
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

  const { historical = {}, current = {}, projections = {}, byStrategy = [], recommendations = [] } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📉 Drawdown Analysis</h1>
        <p className="subtitle">Historical, current, and projected drawdown metrics</p>
      </div>

      <div className="dashboard-grid">
        {/* Historical Drawdown */}
        <div className="dashboard-card">
          <div className="card-title">📊 Historical Drawdown</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value" style={{
                color: getDrawdownColor(historical?.maxDrawdown)
              }}>
                {historical?.maxDrawdown || 0}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Occurred:</span>
              <span className="metric-value">{historical?.occurredOn || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Recovery Time:</span>
              <span className="metric-value">{historical?.recoveryTime || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Recovery Date:</span>
              <span className="metric-value">{historical?.recoveryDate || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Frequency:</span>
              <span className="metric-value">{historical?.frequency || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Current Drawdown */}
        <div className="dashboard-card">
          <div className="card-title">⚡ Current Drawdown</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Current DD:</span>
              <span className="metric-value" style={{
                color: getDrawdownColor(current?.currentDrawdown)
              }}>
                {current?.currentDrawdown || 0}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">% of Historical Max:</span>
              <span className="metric-value">{current?.percentageOfMax || 0}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Days in Current DD:</span>
              <span className="metric-value">{current?.daysInCurrentDD || 0} days</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Status:</span>
              <span className="metric-value" style={{
                color: current?.trending === 'RECOVERING' ? '#10b981' : '#ef4444'
              }}>
                {current?.trending === 'RECOVERING' ? '📈' : '📉'} {current?.trending}
              </span>
            </div>
          </div>
        </div>

        {/* Projections */}
        <div className="dashboard-card">
          <div className="card-title">🔮 Projections</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Worst Case:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {projections?.worstCase || 0}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Likely Case:</span>
              <span className="metric-value" style={{ color: '#f59e0b' }}>
                {projections?.likelyCase || 0}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Best Case:</span>
              <span className="metric-value" style={{ color: '#84cc16' }}>
                {projections?.bestCase || 0}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Recovery:</span>
              <span className="metric-value">{projections?.recoveryTimeAverage || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Strategy Comparison */}
        <div className="dashboard-card full-width">
          <div className="card-title">📈 Drawdown by Strategy</div>
          <div className="strategy-grid">
            {byStrategy.map((strategy, idx) => (
              <div key={idx} className="strategy-card">
                <div className="strategy-name">{strategy.strategy}</div>
                <div className="strategy-metrics">
                  <div className="metric">
                    <span className="label">Max Drawdown:</span>
                    <span className="value" style={{ color: getDrawdownColor(strategy.maxDrawdown) }}>
                      {strategy.maxDrawdown}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Frequency:</span>
                    <span className="value">{strategy.frequency}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Volatility:</span>
                    <span className="value" style={{ color: getVolatilityColor(strategy.volatility) }}>
                      {strategy.volatility}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="dashboard-card full-width">
            <div className="card-title">💡 Risk Management Recommendations</div>
            <div className="recommendations-list">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <span className="rec-icon">🎯</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchDrawdown}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default DrawdownDashboard;
