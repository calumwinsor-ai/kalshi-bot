import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const PerformanceTrackerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTracker();
  }, []);

  const fetchTracker = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/history/performance-tracker', { headers: getAuthHeaders() });
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

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Performance Tracker...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;
  if (!data) return <div className="dashboard-container"><div className="error">No data available</div></div>;

  const { timeline = [], statistics = {}, monthlyData = [] } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📈 Performance Tracker</h1>
        <p className="subtitle">Historical balance and return tracking</p>
      </div>

      <div className="dashboard-grid">
        {/* Key Statistics */}
        <div className="dashboard-card">
          <div className="card-title">📊 Period Statistics</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Period Return:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                +{statistics?.periodReturn?.toFixed(2)}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Avg Daily Return:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                +{statistics?.avgDailyReturn?.toFixed(2)}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Volatility:</span>
              <span className="metric-value">{statistics?.volatility?.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Best Day:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                +${statistics?.bestDay?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Worst Day:</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${statistics?.worstDay?.toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Profitable Days:</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                {statistics?.profitableDays}/{statistics?.totalDays} ({statistics?.profitableDaysPct?.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Daily Timeline */}
        <div className="dashboard-card full-width">
          <div className="card-title">📅 Daily Timeline</div>
          <div className="timeline-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Balance</th>
                  <th>Change</th>
                  <th>Trades</th>
                  <th>Win Rate</th>
                  <th>Daily P&L</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((day, idx) => {
                  const prevBalance = idx > 0 ? timeline[idx - 1].balance : timeline[idx].balance;
                  const change = day.balance - prevBalance;
                  return (
                    <tr key={idx} className={day.dailyPnl >= 0 ? 'positive-day' : 'negative-day'}>
                      <td><strong>{day.date}</strong></td>
                      <td>${day.balance?.toLocaleString()}</td>
                      <td style={{ color: change >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                        {change > 0 ? '+' : ''}{change.toLocaleString()}
                      </td>
                      <td>{day.trades}</td>
                      <td style={{ color: day.winRate >= 60 ? '#10b981' : '#f59e0b' }}>
                        {day.winRate?.toFixed(1)}%
                      </td>
                      <td style={{ color: day.dailyPnl >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                        {day.dailyPnl > 0 ? '+' : ''}{day.dailyPnl?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="dashboard-card full-width">
          <div className="card-title">📆 Monthly Performance</div>
          <div className="monthly-grid">
            {monthlyData.map((month, idx) => (
              <div key={idx} className="monthly-card">
                <h4>{month.month}</h4>
                <div className="monthly-metrics">
                  <div className="metric">
                    <span className="label">Trades</span>
                    <span className="value">{month.trades}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Win Rate</span>
                    <span className="value" style={{ color: '#10b981' }}>
                      {month.winRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="label">P&L</span>
                    <span className="value" style={{ color: '#10b981', fontWeight: '700' }}>
                      ${month.pnl?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equity Curve */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Equity Curve</div>
          <div className="equity-curve-container">
            <div className="curve-info">
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                Portfolio value trend over the last week
              </p>
            </div>
            <div className="mini-chart">
              {timeline.map((day, idx) => {
                const minBalance = Math.min(...timeline.map(t => t.balance));
                const maxBalance = Math.max(...timeline.map(t => t.balance));
                const range = maxBalance - minBalance;
                const height = range > 0 ? ((day.balance - minBalance) / range) * 100 : 50;
                return (
                  <div key={idx} className="chart-bar-mini" title={`${day.date}: $${day.balance}`}>
                    <div className="bar" style={{
                      height: `${height}%`,
                      backgroundColor: day.dailyPnl >= 0 ? '#10b981' : '#ef4444'
                    }}></div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>{timeline[0]?.date}</span>
              <span>{timeline[timeline.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchTracker}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default PerformanceTrackerDashboard;
