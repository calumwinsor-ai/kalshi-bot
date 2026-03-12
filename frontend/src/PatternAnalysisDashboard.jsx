import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const PatternAnalysisDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/history/pattern-analysis', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const getConfidenceColor = (conf) => {
    switch (conf) {
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

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Pattern Analysis...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;
  if (!data) return <div className="dashboard-container"><div className="error">No data available</div></div>;

  const { winningPatterns = [], losingPatterns = [], recommendations = '' } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🎯 Pattern Recognition & Analysis</h1>
        <p className="subtitle">Winning and losing trade patterns identified from history</p>
      </div>

      <div className="dashboard-grid">
        {/* Recommendations */}
        {recommendations && (
          <div className="dashboard-card full-width">
            <div className="card-title">💡 Key Recommendation</div>
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
              <p style={{ margin: '0', color: '#047857', fontWeight: '500' }}>
                ✅ {recommendations}
              </p>
            </div>
          </div>
        )}

        {/* Winning Patterns */}
        <div className="dashboard-card full-width">
          <div className="card-title">✅ Winning Patterns</div>
          <div className="patterns-grid">
            {winningPatterns.map((pattern, idx) => (
              <div key={idx} className="pattern-card winning">
                <div className="pattern-header">
                  <h4>{pattern.pattern}</h4>
                  <span className="confidence" style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}>
                    {pattern.confidence}
                  </span>
                </div>
                <p className="pattern-desc">{pattern.description}</p>
                <div className="pattern-metrics">
                  <div className="metric">
                    <span className="label">Occurrences</span>
                    <span className="value">{pattern.occurrences}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Win Rate</span>
                    <span className="value" style={{ color: '#10b981', fontWeight: '700' }}>
                      {pattern.winRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Avg Profit</span>
                    <span className="value" style={{ color: '#10b981' }}>
                      ${pattern.avgProfit?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losing Patterns */}
        <div className="dashboard-card full-width">
          <div className="card-title">❌ Losing Patterns (To Avoid)</div>
          <div className="patterns-grid">
            {losingPatterns.map((pattern, idx) => (
              <div key={idx} className="pattern-card losing">
                <div className="pattern-header">
                  <h4>{pattern.pattern}</h4>
                  <span className="confidence" style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}>
                    {pattern.confidence}
                  </span>
                </div>
                <p className="pattern-desc">{pattern.description}</p>
                <div className="pattern-metrics">
                  <div className="metric">
                    <span className="label">Occurrences</span>
                    <span className="value">{pattern.occurrences}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Loss Rate</span>
                    <span className="value" style={{ color: '#ef4444', fontWeight: '700' }}>
                      {pattern.lossRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Avg Loss</span>
                    <span className="value" style={{ color: '#ef4444' }}>
                      ${Math.abs(pattern.avgLoss || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Comparison */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Pattern Summary</div>
          <div className="pattern-summary">
            <div className="summary-section">
              <h4>Best Winning Pattern</h4>
              <p className="summary-stat">
                {winningPatterns[0]?.pattern || 'N/A'} - {winningPatterns[0]?.winRate?.toFixed(1)}% Win Rate
              </p>
            </div>
            <div className="summary-section">
              <h4>Total Winning Patterns</h4>
              <p className="summary-stat">{winningPatterns.length} identified</p>
            </div>
            <div className="summary-section">
              <h4>Total Losing Patterns</h4>
              <p className="summary-stat">{losingPatterns.length} identified</p>
            </div>
            <div className="summary-section">
              <h4>Most Avoided Pattern</h4>
              <p className="summary-stat">
                {losingPatterns[0]?.pattern || 'N/A'} - {losingPatterns[0]?.lossRate?.toFixed(1)}% Loss Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchPatterns}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default PatternAnalysisDashboard;
