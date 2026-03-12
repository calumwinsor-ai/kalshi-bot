import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const WinLossDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/history/win-loss-analysis', { headers: getAuthHeaders() });
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

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Win/Loss Analysis...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;
  if (!data) return <div className="dashboard-container"><div className="error">No data available</div></div>;

  const { summary = {}, profitMetrics = {}, tradeMetrics = {}, byTimeOfDay = [], consecutiveWins = 0, maxProfitRun = 0, maxLossRun = 0 } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Win/Loss Analysis</h1>
        <p className="subtitle">Comprehensive trade outcome and performance metrics</p>
      </div>

      <div className="dashboard-grid">
        {/* Summary Stats */}
        <div className="dashboard-card">
          <div className="card-title">🎯 Trade Summary</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Total Trades:</span>
              <span className="metric-value">{summary?.totalTrades || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Winning Trades:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                {summary?.winningTrades || 0}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Losing Trades:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                {summary?.losingTrades || 0}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Win Rate:</span>
              <span className="metric-value" style={{ color: '#10b981', fontWeight: '700' }}>
                {summary?.winRate?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Profit Metrics */}
        <div className="dashboard-card">
          <div className="card-title">💰 Profit Metrics</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Gross Profit:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${profitMetrics?.grossProfit?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Gross Loss:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${profitMetrics?.grossLoss?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Net Profit:</span>
              <span className="metric-value" style={{ color: '#10b981', fontWeight: '700' }}>
                ${profitMetrics?.netProfit?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Profit Factor:</span>
              <span className="metric-value">{profitMetrics?.profitFactor?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trade Size Metrics */}
        <div className="dashboard-card">
          <div className="card-title">📏 Trade Size Analysis</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Avg Win Size:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${tradeMetrics?.avgWinSize?.toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Loss Size:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${Math.abs(tradeMetrics?.avgLossSize || 0).toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Risk/Reward Ratio:</span>
              <span className="metric-value">{tradeMetrics?.riskRewardRatio?.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Median Win:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${tradeMetrics?.medianWin?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Extreme Values */}
        <div className="dashboard-card">
          <div className="card-title">⚡ Extreme Values</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Largest Win:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${tradeMetrics?.largestWin?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Largest Loss:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${tradeMetrics?.largestLoss?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Max Profit Run:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${maxProfitRun?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Max Loss Run:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${maxLossRun?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="dashboard-card">
          <div className="card-title">🔥 Streaks & Runs</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Consecutive Wins:</span>
              <span className="metric-value" style={{ color: '#10b981', fontWeight: '700' }}>
                {consecutiveWins} wins
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem' }}>
              Current winning streak active. Maintain discipline and stick to plan.
            </p>
          </div>
        </div>

        {/* Time of Day Analysis */}
        <div className="dashboard-card full-width">
          <div className="card-title">⏰ Performance by Time of Day</div>
          <div className="timeofday-grid">
            {byTimeOfDay.map((period, idx) => (
              <div key={idx} className="timeofday-card">
                <h4>{period.timeWindow}</h4>
                <div className="timeofday-metrics">
                  <div className="metric">
                    <span className="label">Trades</span>
                    <span className="value">{period.trades}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Win Rate</span>
                    <span className="value" style={{
                      color: period.winRate > 70 ? '#10b981' : period.winRate > 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      {period.winRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Avg Win</span>
                    <span className="value" style={{ color: '#10b981' }}>
                      ${period.avgWin?.toFixed(2)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">Avg Loss</span>
                    <span className="value" style={{ color: '#ef4444' }}>
                      ${period.avgLoss?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win/Loss Distribution */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Win/Loss Distribution</div>
          <div className="distribution-chart">
            <div className="distribution-bar">
              <div className="bar-section winning" style={{
                width: `${(summary?.winningTrades / summary?.totalTrades * 100) || 0}%`
              }}>
                <span className="bar-label">{summary?.winningTrades} Wins ({summary?.winRate?.toFixed(0)}%)</span>
              </div>
              <div className="bar-section losing" style={{
                width: `${(summary?.losingTrades / summary?.totalTrades * 100) || 0}%`
              }}>
                <span className="bar-label">{summary?.losingTrades} Losses ({(100 - summary?.winRate)?.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchAnalysis}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default WinLossDashboard;
