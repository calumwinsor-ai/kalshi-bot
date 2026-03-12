import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExecutiveDashboard();
  }, []);

  const fetchExecutiveDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/analytics/dashboard/executive', { headers: getAuthHeaders() });
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Executive Dashboard...</div>
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

  const { portfolio, recommendations, executed, timeframe } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Executive Dashboard</h1>
        <p className="subtitle">High-level portfolio overview and trading metrics</p>
      </div>

      <div className="dashboard-grid">
        {/* Portfolio Overview */}
        <div className="dashboard-card">
          <div className="card-title">💰 Portfolio Overview</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Total Value:</span>
              <span className="metric-value">${portfolio.totalValue.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Cash Balance:</span>
              <span className="metric-value">${portfolio.cashBalance.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Cash Allocation:</span>
              <span className="metric-value">{portfolio.cashAllocationPercent}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Open Positions:</span>
              <span className="metric-value">{portfolio.openPositions}</span>
            </div>
          </div>
        </div>

        {/* Recommendations Summary */}
        <div className="dashboard-card">
          <div className="card-title">🎯 Recommendations Summary</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Total Recommendations:</span>
              <span className="metric-value">{recommendations.count}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Probability:</span>
              <span className="metric-value">{recommendations.avgProbability}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Expected Value:</span>
              <span className="metric-value">${recommendations.avgExpectedValue}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Score:</span>
              <span className="metric-value">{recommendations.avgScore}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Agent Consensus:</span>
              <span className="metric-value">{recommendations.agentConsensusPercent}%</span>
            </div>
          </div>
        </div>

        {/* Execution Metrics */}
        <div className="dashboard-card">
          <div className="card-title">⚡ Execution Metrics</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Trades Executed:</span>
              <span className="metric-value">{executed.count}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Total Capital Deployed:</span>
              <span className="metric-value">${executed.totalCapital.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Expected Profit:</span>
              <span className="metric-value" style={{ color: executed.expectedProfit >= 0 ? '#10b981' : '#ef4444' }}>
                ${executed.expectedProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Distribution */}
        <div className="dashboard-card">
          <div className="card-title">📅 Timeframe Distribution</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">⚡ Next 24h:</span>
              <span className="metric-value">{timeframe.trades24h} trades</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">📈 1-3 Days:</span>
              <span className="metric-value">{timeframe.trades1to3d} trades</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">📅 1 Week:</span>
              <span className="metric-value">{timeframe.trades7d} trades</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">🗓️ 1 Month:</span>
              <span className="metric-value">{timeframe.tradesMonth} trades</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">📊 1+ Year:</span>
              <span className="metric-value">{timeframe.tradesYear} trades</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchExecutiveDashboard}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
