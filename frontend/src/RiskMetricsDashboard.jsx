import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const RiskMetricsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiskMetrics();
  }, []);

  const fetchRiskMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/value-at-risk', { headers: getAuthHeaders() });
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

  const getMetricColor = (value) => {
    if (value > 2) return '#10b981';
    if (value > 1) return '#84cc16';
    if (value > 0) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Risk Metrics...</div>
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

  const { var: varData = {}, cvar: cvarData = {}, riskMetrics = {}, scenarioAnalysis = {}, riskBudget = {} } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Risk Metrics & Value at Risk</h1>
        <p className="subtitle">Advanced risk measurements and scenario analysis</p>
      </div>

      <div className="dashboard-grid">
        {/* VaR 95% */}
        <div className="dashboard-card">
          <div className="card-title">📈 Value at Risk (95%)</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">VaR Amount:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${Math.abs(varData?.confidence95?.value || 0).toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">VaR %:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {varData?.confidence95?.percentage || 0}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
              {varData?.confidence95?.interpretation}
            </p>
          </div>
        </div>

        {/* VaR 99% */}
        <div className="dashboard-card">
          <div className="card-title">📉 Value at Risk (99%)</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">VaR Amount:</span>
              <span className="metric-value" style={{ color: '#8b0000' }}>
                ${Math.abs(varData?.confidence99?.value || 0).toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">VaR %:</span>
              <span className="metric-value" style={{ color: '#8b0000' }}>
                {varData?.confidence99?.percentage || 0}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
              {varData?.confidence99?.interpretation}
            </p>
          </div>
        </div>

        {/* CVaR 95% */}
        <div className="dashboard-card">
          <div className="card-title">🎯 CVaR (95%)</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Expected Shortfall:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${Math.abs(cvarData?.confidence95?.value || 0).toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">% of Portfolio:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {cvarData?.confidence95?.percentage || 0}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
              {cvarData?.confidence95?.interpretation}
            </p>
          </div>
        </div>

        {/* CVaR 99% */}
        <div className="dashboard-card">
          <div className="card-title">🔴 CVaR (99%)</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Expected Shortfall:</span>
              <span className="metric-value" style={{ color: '#8b0000' }}>
                ${Math.abs(cvarData?.confidence99?.value || 0).toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">% of Portfolio:</span>
              <span className="metric-value" style={{ color: '#8b0000' }}>
                {cvarData?.confidence99?.percentage || 0}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
              {cvarData?.confidence99?.interpretation}
            </p>
          </div>
        </div>

        {/* Risk-Adjusted Performance Metrics */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Risk-Adjusted Performance Metrics</div>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Volatility</span>
              <span className="metric-value" style={{ fontSize: '24px' }}>
                {riskMetrics?.volatility || 0}%
              </span>
              <p className="metric-description">Standard deviation of returns</p>
            </div>
            <div className="metric-box">
              <span className="metric-label">Beta</span>
              <span className="metric-value" style={{ fontSize: '24px' }}>
                {riskMetrics?.beta?.toFixed(2) || 0}
              </span>
              <p className="metric-description">Market sensitivity (1 = market)</p>
            </div>
            <div className="metric-box">
              <span className="metric-label">Sharpe Ratio</span>
              <span className="metric-value" style={{
                fontSize: '24px',
                color: getMetricColor(riskMetrics?.sharpeRatio)
              }}>
                {riskMetrics?.sharpeRatio?.toFixed(2) || 0}
              </span>
              <p className="metric-description">Risk-adjusted return quality</p>
            </div>
            <div className="metric-box">
              <span className="metric-label">Sortino Ratio</span>
              <span className="metric-value" style={{
                fontSize: '24px',
                color: getMetricColor(riskMetrics?.sortinoRatio)
              }}>
                {riskMetrics?.sortinoRatio?.toFixed(2) || 0}
              </span>
              <p className="metric-description">Downside risk-adjusted return</p>
            </div>
            <div className="metric-box">
              <span className="metric-label">Information Ratio</span>
              <span className="metric-value" style={{
                fontSize: '24px',
                color: getMetricColor(riskMetrics?.informationRatio)
              }}>
                {riskMetrics?.informationRatio?.toFixed(2) || 0}
              </span>
              <p className="metric-description">Excess return per unit of tracking error</p>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="dashboard-card full-width">
          <div className="card-title">🎬 Scenario Analysis</div>
          <div className="scenario-table">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Portfolio Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scenarioAnalysis || {}).map(([key, value]) => (
                  <tr key={key} className={value < 0 ? 'scenario-loss' : 'scenario-gain'}>
                    <td className="scenario-name">
                      {key === 'bearMarket' && '📉 Bear Market'}
                      {key === 'sidewaysMarket' && '➡️ Sideways Market'}
                      {key === 'bullMarket' && '📈 Bull Market'}
                      {key === 'flashCrash' && '💥 Flash Crash'}
                      {key === 'volatilitySpike' && '🌪️ Volatility Spike'}
                    </td>
                    <td>${Math.abs(value).toLocaleString()}</td>
                    <td style={{ color: value < 0 ? '#ef4444' : '#10b981' }}>
                      {value > 0 ? '+' : ''}{value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Budget */}
        <div className="dashboard-card full-width">
          <div className="card-title">💰 Risk Budget Status</div>
          <div className="risk-budget-container">
            <div className="budget-info">
              <div className="metric-row">
                <span className="metric-label">Risk Budget Used:</span>
                <span className="metric-value" style={{
                  color: riskBudget?.used > 80 ? '#ef4444' : riskBudget?.used > 60 ? '#f59e0b' : '#10b981'
                }}>
                  {riskBudget?.used || 0}%
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Risk Budget Available:</span>
                <span className="metric-value">
                  {riskBudget?.available || 0}%
                </span>
              </div>
            </div>
            <div className="budget-bar">
              <div className="budget-fill" style={{
                width: `${riskBudget?.used || 0}%`,
                backgroundColor: riskBudget?.used > 80 ? '#ef4444' : riskBudget?.used > 60 ? '#f59e0b' : '#10b981'
              }}></div>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>
              {riskBudget?.recommendation}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchRiskMetrics}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default RiskMetricsDashboard;
