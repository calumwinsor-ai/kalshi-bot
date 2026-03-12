import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const StressTestingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStressTesting();
  }, []);

  const fetchStressTesting = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/stress-testing', { headers: getAuthHeaders() });
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

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW':
        return '#10b981';
      case 'MEDIUM':
        return '#f59e0b';
      case 'HIGH':
        return '#ef4444';
      case 'CRITICAL':
        return '#8b0000';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Stress Testing Dashboard...</div>
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

  const { scenarios = [], summary = {} } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🧪 Stress Testing Dashboard</h1>
        <p className="subtitle">Market scenario analysis and portfolio resilience testing</p>
      </div>

      <div className="dashboard-grid">
        {/* Summary */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Scenario Summary</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Worst Case Scenario:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {summary?.worstCaseScenario}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Best Case Scenario:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                {summary?.bestCaseScenario}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Average Impact:</span>
              <span className="metric-value" style={{ color: '#f59e0b' }}>
                {summary?.averageImpact?.toFixed(2)}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Critical Scenarios:</span>
              <span className="metric-value">{summary?.criticalScenarios || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">High Risk Scenarios:</span>
              <span className="metric-value">{summary?.highRiskScenarios || 0}</span>
            </div>
          </div>
        </div>

        {/* Individual Scenarios */}
        <div className="dashboard-card full-width">
          <div className="card-title">🎯 Stress Test Scenarios</div>
          <div className="stress-scenarios-grid">
            {scenarios.map((scenario, idx) => (
              <div key={idx} className="scenario-card" style={{
                borderLeft: `4px solid ${getRiskColor(scenario.riskLevel)}`
              }}>
                <div className="scenario-header">
                  <h4>{scenario.name}</h4>
                  <span className="risk-badge" style={{
                    backgroundColor: getRiskColor(scenario.riskLevel),
                    color: 'white'
                  }}>
                    {scenario.riskLevel}
                  </span>
                </div>
                <div className="scenario-metrics">
                  <div className="metric">
                    <span className="label">Portfolio Impact:</span>
                    <span className="value" style={{
                      color: scenario.impact < 0 ? '#ef4444' : '#10b981'
                    }}>
                      {scenario.impact > 0 ? '+' : ''}{scenario.impact}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Portfolio Value:</span>
                    <span className="value">${scenario.portfolioValue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Affected Positions:</span>
                    <span className="value">{scenario.affectedPositions || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Projected Loss:</span>
                    <span className="value" style={{ color: '#ef4444' }}>
                      ${Math.abs(scenario.projectedLoss || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        {summary?.recommendations && (
          <div className="dashboard-card full-width">
            <div className="card-title">💡 Recommendations</div>
            <div className="card-content">
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151' }}>
                {summary.recommendations}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchStressTesting}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default StressTestingDashboard;
