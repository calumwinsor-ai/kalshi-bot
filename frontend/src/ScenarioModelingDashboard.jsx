import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const ScenarioModelingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/scenario-modeling', { headers: getAuthHeaders() });
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

  const getScenarioColor = (scenario) => {
    if (scenario === 'bullCase') return '#10b981';
    if (scenario === 'baseCase') return '#3b82f6';
    if (scenario === 'bearCase') return '#f59e0b';
    if (scenario === 'stressCase') return '#ef4444';
    return '#6b7280';
  };

  const getScenarioIcon = (scenario) => {
    if (scenario === 'bullCase') return '📈';
    if (scenario === 'baseCase') return '➡️';
    if (scenario === 'bearCase') return '📉';
    if (scenario === 'stressCase') return '💥';
    return '❓';
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH':
        return '#10b981';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Scenario Modeling...</div>
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

  const { baseCase = {}, bullCase = {}, bearCase = {}, stressCase = {}, expectedValue = {} } = data || {};
  const scenarios = [
    { key: 'bullCase', label: 'Bull Case', data: bullCase },
    { key: 'baseCase', label: 'Base Case', data: baseCase },
    { key: 'bearCase', label: 'Bear Case', data: bearCase },
    { key: 'stressCase', label: 'Stress Case', data: stressCase }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🎬 Scenario Modeling</h1>
        <p className="subtitle">Probability-weighted scenario analysis and expected value</p>
      </div>

      <div className="dashboard-grid">
        {/* Expected Value Summary */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Expected Value Analysis</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Expected Portfolio Value:</span>
              <span className="metric-value" style={{ fontSize: '20px', color: '#3b82f6' }}>
                ${expectedValue?.portfolioValue?.toLocaleString() || 0}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Expected Return:</span>
              <span className="metric-value" style={{
                fontSize: '18px',
                color: expectedValue?.return >= 0 ? '#10b981' : '#ef4444'
              }}>
                {expectedValue?.return > 0 ? '+' : ''}{expectedValue?.return?.toFixed(2)}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '15px' }}>
              Weighted average of all scenarios based on probability estimates
            </p>
          </div>
        </div>

        {/* Individual Scenarios */}
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="dashboard-card">
            <div className="card-title">
              {getScenarioIcon(scenario.key)} {scenario.label}
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280' }}>
                ({(scenario.data?.probability * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="card-content">
              <div className="metric-row">
                <span className="metric-label">Portfolio Value:</span>
                <span className="metric-value" style={{
                  color: getScenarioColor(scenario.key),
                  fontSize: '16px'
                }}>
                  ${scenario.data?.portfolioValue?.toLocaleString() || 0}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Expected Return:</span>
                <span className="metric-value" style={{
                  color: scenario.data?.return >= 0 ? '#10b981' : '#ef4444'
                }}>
                  {scenario.data?.return > 0 ? '+' : ''}{scenario.data?.return?.toFixed(1)}%
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Confidence:</span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getConfidenceColor(scenario.data?.confidence),
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {scenario.data?.confidence || 'N/A'}
                </span>
              </div>

              {scenario.data?.triggers && scenario.data.triggers.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Triggers:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {scenario.data.triggers.map((trigger, tidx) => (
                      <span key={tidx} style={{
                        fontSize: '11px',
                        backgroundColor: '#f0f0f0',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        color: '#374151'
                      }}>
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scenario.data?.keyAssumptions && scenario.data.keyAssumptions.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Key Assumptions:
                  </p>
                  <ul style={{ fontSize: '12px', color: '#6b7280', paddingLeft: '18px', margin: '0' }}>
                    {scenario.data.keyAssumptions.map((assumption, aidx) => (
                      <li key={aidx} style={{ marginBottom: '4px' }}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Scenario Probability Summary */}
        <div className="dashboard-card full-width">
          <div className="card-title">📈 Scenario Probability Distribution</div>
          <div className="probability-chart">
            <div className="chart-row">
              <div className="chart-label">Bull Case</div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{
                  width: `${(bullCase?.probability || 0) * 100}%`,
                  backgroundColor: '#10b981'
                }}>
                  <span>{(bullCase?.probability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-label">Base Case</div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{
                  width: `${(baseCase?.probability || 0) * 100}%`,
                  backgroundColor: '#3b82f6'
                }}>
                  <span>{(baseCase?.probability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-label">Bear Case</div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{
                  width: `${(bearCase?.probability || 0) * 100}%`,
                  backgroundColor: '#f59e0b'
                }}>
                  <span>{(bearCase?.probability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-label">Stress Case</div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{
                  width: `${(stressCase?.probability || 0) * 100}%`,
                  backgroundColor: '#ef4444'
                }}>
                  <span>{(stressCase?.probability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="dashboard-card full-width">
          <div className="card-title">🎯 Scenario Comparison Table</div>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Probability</th>
                  <th>Portfolio Value</th>
                  <th>Return</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario, idx) => (
                  <tr key={idx} style={{
                    backgroundColor: getScenarioColor(scenario.key),
                    backgroundOpacity: 0.05
                  }}>
                    <td><strong>{scenario.label}</strong></td>
                    <td>{(scenario.data?.probability * 100).toFixed(0)}%</td>
                    <td>${scenario.data?.portfolioValue?.toLocaleString() || 0}</td>
                    <td style={{
                      color: scenario.data?.return >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {scenario.data?.return > 0 ? '+' : ''}{scenario.data?.return?.toFixed(1)}%
                    </td>
                    <td style={{ color: getConfidenceColor(scenario.data?.confidence) }}>
                      <strong>{scenario.data?.confidence}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchScenarios}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default ScenarioModelingDashboard;
