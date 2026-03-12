import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const RiskHeatmapDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/risk/portfolio-heatmap', { headers: getAuthHeaders() });
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

  const getHeatColor = (riskScore) => {
    if (riskScore < 3) return '#10b981';
    if (riskScore < 5) return '#84cc16';
    if (riskScore < 7) return '#f59e0b';
    if (riskScore < 8.5) return '#ef4444';
    return '#8b0000';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'INCREASING':
        return '📈';
      case 'DECREASING':
        return '📉';
      case 'STABLE':
        return '➡️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Risk Heatmap...</div>
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

  const { sectors = [], overallConcentration = {}, topRisks = [] } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🔥 Portfolio Risk Heatmap</h1>
        <p className="subtitle">Sector concentration and risk exposure analysis</p>
      </div>

      <div className="dashboard-grid">
        {/* Overall Concentration */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Portfolio Concentration</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Concentration Score:</span>
              <span className="metric-value" style={{
                color: overallConcentration?.score > 7 ? '#ef4444' : overallConcentration?.score > 5 ? '#f59e0b' : '#10b981'
              }}>
                {overallConcentration?.score || 0}/10
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Assessment:</span>
              <span className="metric-value">{overallConcentration?.assessment || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label\">Recommendation:</span>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0 0 0' }}>
                {overallConcentration?.diversificationTarget}
              </p>
            </div>
          </div>
        </div>

        {/* Sector Heatmap */}
        <div className="dashboard-card full-width">
          <div className="card-title">🌡️ Sector Risk Heatmap</div>
          <div className="heatmap-grid">
            {sectors.map((sector, idx) => (
              <div key={idx} className="heatmap-sector">
                <div className="heatmap-header">
                  <div>
                    <h4>{sector.name}</h4>
                    <p className="sector-meta">{sector.positions} positions</p>
                  </div>
                  <div className="trend-indicator">{getTrendIcon(sector.trendingRisk)}</div>
                </div>
                <div className="heatmap-content" style={{
                  backgroundColor: getHeatColor(sector.riskScore),
                  opacity: 0.1
                }}>
                  <div className="risk-meter">
                    <div className="meter-bar" style={{
                      width: `${(sector.riskScore / 10) * 100}%`,
                      backgroundColor: getHeatColor(sector.riskScore),
                      height: '24px',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Risk Score:</span>
                    <span className="metric-value" style={{ color: getHeatColor(sector.riskScore) }}>
                      {sector.riskScore || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Concentration:</span>
                    <span className="metric-value">{sector.concentration || 0}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Exposure:</span>
                    <span className="metric-value">${sector.exposure?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Trend:</span>
                    <span className="metric-value">{sector.trendingRisk}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>
                    💡 {sector.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risk Positions */}
        {topRisks.length > 0 && (
          <div className="dashboard-card full-width">
            <div className="card-title">⚠️ Top Risk Positions</div>
            <div className="risk-positions-table">
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Concentration</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.map((position, idx) => (
                    <tr key={idx} className="high-risk-row">
                      <td className="position-name">{position.position}</td>
                      <td>
                        <div className="concentration-bar">
                          <div className="bar-fill" style={{
                            width: `${position.concentration}%`,
                            backgroundColor: '#ef4444'
                          }}></div>
                        </div>
                        <span>{position.concentration}%</span>
                      </td>
                      <td style={{ color: position.delta.includes('+') ? '#ef4444' : '#10b981' }}>
                        {position.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchHeatmap}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default RiskHeatmapDashboard;
