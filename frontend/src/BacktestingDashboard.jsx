import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const BacktestingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBacktesting();
  }, []);

  const fetchBacktesting = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/history/backtesting', { headers: getAuthHeaders() });
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

  const getRecommendationColor = (rec) => {
    if (rec.includes('STRONG BUY')) return '#10b981';
    if (rec.includes('BUY') && !rec.includes('STRONG')) return '#84cc16';
    if (rec.includes('HOLD')) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Backtesting...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;
  if (!data) return <div className="dashboard-container"><div className="error">No data available</div></div>;

  const { results = [], bestStrategy = '', combinedPerformance = {} } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🧪 Backtesting Engine</h1>
        <p className="subtitle">Strategy performance analysis (Last 90 Days)</p>
      </div>

      <div className="dashboard-grid">
        {/* Combined Performance */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Combined Strategy Performance</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Total Trades</span>
              <span className="stat-value">{combinedPerformance?.totalTrades || 0}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value" style={{ color: '#10b981' }}>
                {combinedPerformance?.winRate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Net Profit</span>
              <span className="stat-value" style={{ color: '#10b981' }}>
                ${combinedPerformance?.netProfit?.toLocaleString() || 0}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Profit Factor</span>
              <span className="stat-value">{combinedPerformance?.profitFactor?.toFixed(2) || 0}</span>
            </div>
          </div>
        </div>

        {/* Best Strategy */}
        {bestStrategy && (
          <div className="dashboard-card full-width">
            <div className="card-title">🏆 Best Performing Strategy</div>
            <div className="best-strategy">
              <h3>{bestStrategy}</h3>
              <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>See detailed results below</p>
            </div>
          </div>
        )}

        {/* Strategy Results */}
        <div className="dashboard-card full-width">
          <div className="card-title">📈 Detailed Strategy Results</div>
          <div className="strategies-container">
            {results.map((strategy, idx) => (
              <div key={idx} className="strategy-result-card">
                <div className="strategy-header">
                  <h4>{strategy.strategyName}</h4>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: getRecommendationColor(strategy.recommendation),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {strategy.recommendation.split(' ')[0]}
                  </span>
                </div>

                <div className="metrics-2col">
                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Total Trades</span>
                      <span className="value">{strategy.totalTrades}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Win Rate</span>
                      <span className="value" style={{ color: '#10b981' }}>
                        {strategy.winRate?.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Winning Trades</span>
                      <span className="value">{strategy.winningTrades}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Losing Trades</span>
                      <span className="value">{strategy.losingTrades}</span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Gross Profit</span>
                      <span className="value" style={{ color: '#10b981' }}>
                        ${strategy.grossProfit?.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Gross Loss</span>
                      <span className="value" style={{ color: '#ef4444' }}>
                        ${strategy.grossLoss?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Net Profit</span>
                      <span className="value" style={{ color: '#10b981', fontWeight: '700' }}>
                        ${strategy.netProfit?.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Profit Factor</span>
                      <span className="value">{strategy.profitFactor?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Avg Win</span>
                      <span className="value" style={{ color: '#10b981' }}>
                        ${strategy.avgWin?.toFixed(2)}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Avg Loss</span>
                      <span className="value" style={{ color: '#ef4444' }}>
                        ${strategy.avgLoss?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Max Win</span>
                      <span className="value">${strategy.maxWin?.toLocaleString()}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Max Loss</span>
                      <span className="value">${strategy.maxLoss?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="metric-pair">
                    <div className="metric">
                      <span className="label">Sharpe Ratio</span>
                      <span className="value">{strategy.sharpeRatio?.toFixed(2)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Max Drawdown</span>
                      <span className="value" style={{ color: '#ef4444' }}>
                        {strategy.maxDrawdown?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  💡 {strategy.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchBacktesting}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default BacktestingDashboard;
