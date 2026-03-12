import React, { useState, useEffect, useCallback } from 'react';
import './TradingDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export function AutomatedTradingDashboard({ authenticated, portfolio }) {
  const [executedTrades, setExecutedTrades] = useState([]);
  const [todaysSummary, setTodaysSummary] = useState({
    executedCount: 0,
    totalCapital: 0,
    expectedProfit: 0,
    failedCount: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch today's executed trades
  const fetchExecutedTrades = useCallback(async () => {
    if (!authenticated) return;

    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/api/execution/today`);
      const data = await response.json();

      if (data.success) {
        // Extract trades from today's executions
        const allTrades = [];
        if (data.todaysTrades && data.todaysTrades.length > 0) {
          data.todaysTrades.forEach(execution => {
            if (execution.executedTrades && execution.executedTrades.length > 0) {
              allTrades.push(...execution.executedTrades);
            }
          });
        }

        setExecutedTrades(allTrades);
        setTodaysSummary(data.summary || {
          executedCount: 0,
          totalCapital: 0,
          expectedProfit: 0,
          failedCount: 0
        });
        setLastUpdate(new Date());
        setMessage('');
      } else {
        setExecutedTrades([]);
        setTodaysSummary({
          executedCount: 0,
          totalCapital: 0,
          expectedProfit: 0,
          failedCount: 0
        });
        setMessage('No trades executed yet. Daily automation runs at 10:00 AM.');
        setMessageType('info');
      }
    } catch (error) {
      setExecutedTrades([]);
      setMessage('Failed to fetch executed trades: ' + error.message);
      setMessageType('error');
    } finally {
      setRefreshing(false);
    }
  }, [authenticated]);

  // Load on mount and auto-refresh
  useEffect(() => {
    if (authenticated) {
      fetchExecutedTrades();
      const interval = setInterval(fetchExecutedTrades, 30000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchExecutedTrades]);

  const getMetricColor = (probability) => {
    if (probability >= 80) return '#4CAF50';
    if (probability >= 70) return '#8BC34A';
    if (probability >= 60) return '#FFC107';
    return '#F44336';
  };

  if (!authenticated) {
    return (
      <div className="dashboard-empty">
        <p>Please authenticate to view automated trading results</p>
      </div>
    );
  }

  return (
    <div className="trading-dashboard">
      <div className="dashboard-header">
        <h2>🤖 Automated Trading</h2>
        <div className="header-controls">
          <button
            className="refresh-btn"
            onClick={fetchExecutedTrades}
            disabled={refreshing}
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
          {lastUpdate && (
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="label">💰 Cash Balance</span>
          <span className="value">${portfolio?.cash?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-item">
          <span className="label">📊 Portfolio Value</span>
          <span className="value">${portfolio?.total_value?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-item">
          <span className="label">📈 Open Positions</span>
          <span className="value">{portfolio?.open_positions || 0}</span>
        </div>
      </div>

      <div className="automation-info">
        <div className="info-card">
          <h3>⏰ Daily Automation Schedule</h3>
          <p className="schedule">Runs automatically at <strong>10:00 AM</strong> every day</p>
          <p className="description">
            The bot analyzes all available markets using the Trading Decision Engine,
            identifies the top 5 opportunities, and automatically executes trades.
          </p>
        </div>
      </div>

      <div className="execution-summary">
        <h3>📊 Today's Execution Summary</h3>
        <div className="summary-metrics">
          <div className="metric-box success">
            <div className="metric-number">✅ {todaysSummary.executedCount}</div>
            <div className="metric-label">Trades Executed</div>
          </div>
          <div className="metric-box">
            <div className="metric-number">💵 ${todaysSummary.totalCapital.toFixed(2)}</div>
            <div className="metric-label">Capital Deployed</div>
          </div>
          <div className="metric-box profit">
            <div className="metric-number">📈 ${todaysSummary.expectedProfit.toFixed(2)}</div>
            <div className="metric-label">Expected Daily Profit</div>
          </div>
          {todaysSummary.failedCount > 0 && (
            <div className="metric-box error">
              <div className="metric-number">❌ {todaysSummary.failedCount}</div>
              <div className="metric-label">Failed Executions</div>
            </div>
          )}
        </div>
      </div>

      {executedTrades.length === 0 ? (
        <div className="no-recommendations">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Trades Executed Yet Today</h3>
            <p>Wait for the next 10:00 AM automation run to see executed trades</p>
            <p className="hint">Trades executed today will appear here</p>
          </div>
        </div>
      ) : (
        <div className="execution-cards">
          <h3>✅ Today's Executed Trades</h3>
          <div className="recommendations-grid">
            {executedTrades.map((trade, index) => (
              <div key={index} className="executed-trade-card">
                <div className="rank-badge">#{trade.rank}</div>

                <div className="market-info">
                  <h3 className="market-title">{trade.marketTitle}</h3>
                  <p className="market-id">{trade.marketId}</p>
                </div>

                <div className="trade-status">
                  <span className="status-badge success">✅ EXECUTED</span>
                  <span className="order-id">Order: {trade.orderId}</span>
                </div>

                <div className="metrics-container">
                  <div className="metric">
                    <span className="metric-label">Probability</span>
                    <div className="probability-bar">
                      <div
                        className="probability-fill"
                        style={{
                          width: `${trade.probability}%`,
                          backgroundColor: getMetricColor(trade.probability)
                        }}
                      />
                    </div>
                    <span className="metric-value" style={{ color: getMetricColor(trade.probability) }}>
                      {trade.probability}%
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Expected Value</span>
                    <span className="metric-value">{trade.expectedValue.toFixed(2)}%</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Position Size</span>
                    <span className="metric-value">${trade.positionSize.toFixed(2)}</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Expected Profit</span>
                    <span className="metric-value profit">${trade.expectedProfit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="execution-details">
                  <p><strong>Action:</strong> {trade.action}</p>
                  <p><strong>Executed:</strong> {new Date(trade.executedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
