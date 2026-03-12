import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const PerformanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceDashboard();
  }, []);

  const fetchPerformanceDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/analytics/dashboard/performance', { headers: getAuthHeaders() });
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
        <div className="loading">⏳ Loading Performance Dashboard...</div>
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

  const { metrics, agentAccuracy, performanceByTimeframe, recentTrades, trend } = data;

  const getTrendColor = (trendValue) => {
    switch (trendValue) {
      case 'IMPROVING':
        return '#10b981';
      case 'STABLE':
        return '#3b82f6';
      case 'DECLINING':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📈 Performance Dashboard</h1>
        <p className="subtitle">Historical performance metrics and win rate analysis</p>
      </div>

      <div className="dashboard-grid">
        {/* Key Performance Metrics */}
        <div className="dashboard-card">
          <div className="card-title">🎯 Key Performance Metrics</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Win Rate:</span>
              <span className="metric-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                {metrics.winRate}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Average Win:</span>
              <span className="metric-value">${metrics.avgWin.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Average Loss:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                -${metrics.avgLoss.toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Profit Factor:</span>
              <span className="metric-value">{metrics.profitFactor.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Risk-Adjusted Returns */}
        <div className="dashboard-card">
          <div className="card-title">📊 Risk-Adjusted Returns</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Sharpe Ratio:</span>
              <span className="metric-value">{metrics.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Sortino Ratio:</span>
              <span className="metric-value">{metrics.sortinoRatio || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                -{metrics.maxDrawdown.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Agent Accuracy */}
        <div className="dashboard-card">
          <div className="card-title">🤖 Agent Accuracy</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Trade Analyzer:</span>
              <span className="metric-value">{agentAccuracy.tradeAnalyzer}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Strategy Optimizer:</span>
              <span className="metric-value">{agentAccuracy.strategyOptimizer}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Decision Engine:</span>
              <span className="metric-value" style={{ color: '#667eea', fontWeight: 'bold' }}>
                {agentAccuracy.decisionEngine}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="dashboard-card">
          <div className="card-title">📈 Performance Trend</div>
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', margin: '15px 0' }}>
              {trend === 'IMPROVING' && '📈'}
              {trend === 'STABLE' && '➡️'}
              {trend === 'DECLINING' && '📉'}
            </div>
            <div className="metric-row">
              <span className="metric-label">Current Trend:</span>
              <span
                className="metric-value"
                style={{
                  color: getTrendColor(trend),
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                {trend}
              </span>
            </div>
          </div>
        </div>

        {/* Performance by Timeframe */}
        <div className="dashboard-card full-width">
          <div className="card-title">⏱️ Performance by Timeframe</div>
          <div className="timeframe-grid">
            {Object.entries(performanceByTimeframe).map(([timeframe, performance]) => (
              <div key={timeframe} className="timeframe-item">
                <span className="timeframe-label">{timeframe}</span>
                <span className="timeframe-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {performance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="dashboard-card full-width">
          <div className="card-title">📜 Recent Trades</div>
          <div className="trades-table">
            {recentTrades && recentTrades.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Result</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade, idx) => (
                    <tr key={idx} className={trade.result === 'win' ? 'trade-win' : 'trade-loss'}>
                      <td>{new Date(trade.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`trade-badge ${trade.result}`}>
                          {trade.result === 'win' ? '✅ Win' : '❌ Loss'}
                        </span>
                      </td>
                      <td
                        style={{
                          color: trade.pnl >= 0 ? '#10b981' : '#ef4444',
                          fontWeight: 'bold'
                        }}
                      >
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No recent trades</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchPerformanceDashboard}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
