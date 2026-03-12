import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const TradeJournalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/history/trade-journal', { headers: getAuthHeaders() });
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

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Trade Journal...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;
  if (!data) return <div className="dashboard-container"><div className="error">No data available</div></div>;

  const { recentTrades = [], summary = {} } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📔 Trade Journal</h1>
        <p className="subtitle">Detailed trade history and analysis</p>
      </div>

      <div className="dashboard-grid">
        {/* Summary Stats */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Today's Summary</div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Trades</span>
              <span className="summary-value">{summary?.totalTradedToday || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Win Rate</span>
              <span className="summary-value" style={{ color: '#10b981' }}>
                {summary?.todayWinRate?.toFixed(1)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Net P&L</span>
              <span className="summary-value" style={{
                color: (summary?.todayNetPnl || 0) >= 0 ? '#10b981' : '#ef4444'
              }}>
                ${summary?.todayNetPnl?.toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Current Streak</span>
              <span className="summary-value">{summary?.recentStreak}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Best Trade</span>
              <span className="summary-value" style={{ color: '#10b981' }}>
                ${summary?.bestTrade?.toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Worst Trade</span>
              <span className="summary-value" style={{ color: '#ef4444' }}>
                ${summary?.worstTrade?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Trades Table */}
        <div className="dashboard-card full-width">
          <div className="card-title">📋 Recent Trades</div>
          <div className="trades-journal-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Market</th>
                  <th>Side</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Size</th>
                  <th>P&L</th>
                  <th>Result</th>
                  <th>Strategy</th>
                  <th>Time Held</th>
                  <th>Consensus</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, idx) => (
                  <tr key={idx} className={trade.result === 'WIN' ? 'trade-win' : 'trade-loss'}>
                    <td className="date">{trade.date}</td>
                    <td className="market"><strong>{trade.market}</strong></td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        backgroundColor: trade.side === 'BUY' ? '#dbeafe' : '#fee2e2',
                        color: trade.side === 'BUY' ? '#075985' : '#7f1d1d',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {trade.side}
                      </span>
                    </td>
                    <td>${trade.price?.toFixed(2)}</td>
                    <td>${trade.exitPrice?.toFixed(2)}</td>
                    <td>{trade.size}</td>
                    <td style={{ color: trade.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                      ${trade.pnl?.toFixed(2)}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        backgroundColor: trade.result === 'WIN' ? '#dcfce7' : '#fee2e2',
                        color: trade.result === 'WIN' ? '#166534' : '#991b1b',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {trade.result === 'WIN' ? '✅ Win' : '❌ Loss'}
                      </span>
                    </td>
                    <td className="strategy">{trade.strategyUsed}</td>
                    <td className="time">{trade.timeHeld}</td>
                    <td className="consensus">{trade.agentConsensus}%</td>
                    <td className="notes">{trade.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchJournal}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default TradeJournalDashboard;
