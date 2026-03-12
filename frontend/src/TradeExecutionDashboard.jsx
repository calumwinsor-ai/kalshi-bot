import React, { useState, useEffect, useCallback } from 'react';
import './TradingDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export function TradeExecutionDashboard({ authenticated, portfolio }) {
  const [recommendations, setRecommendations] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [tradeConfirm, setTradeConfirm] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [automationTime, setAutomationTime] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState({});
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  // Handle custom position size change
  const handlePositionSizeChange = useCallback((marketId, amount) => {
    setSelectedPositions(prev => ({
      ...prev,
      [marketId]: amount
    }));
  }, []);

  // Filter recommendations by timeframe
  const getFilteredRecommendations = useCallback(() => {
    if (timeframeFilter === 'all') return recommendations;
    return recommendations.filter(rec => rec.timeframe === timeframeFilter);
  }, [recommendations, timeframeFilter]);

  // Get color for time indicator
  const getTimeframeColor = (timeframe) => {
    const colors = {
      '24h': '#10B981',
      '1-3d': '#F59E0B',
      '7d': '#F59E0B',
      'month': '#EF4444',
      'year': '#6B7280'
    };
    return colors[timeframe] || '#6B7280';
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Calculate next 10 AM
  useEffect(() => {
    const calculateNextRun = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(10, 0, 0, 0);

      if (now.getHours() >= 10) {
        next.setDate(next.getDate() + 1);
      }

      setAutomationTime(next);
    };

    calculateNextRun();
    const interval = setInterval(calculateNextRun, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setRefreshing(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const headers = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
      }

      const response = await fetch(`${API_BASE}/api/recommendations/top-5`, { headers });
      const data = await response.json();

      if (data.success && data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setLastUpdate(new Date());
        setMessage('');
      } else {
        setRecommendations([]);
        setMessage('Run daily analysis to generate trading recommendations');
        setMessageType('info');
      }
    } catch (error) {
      setRecommendations([]);
      setMessage('Failed to fetch recommendations: ' + error.message);
      setMessageType('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch executed trades
  const fetchExecutedTrades = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const headers = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
      }

      const response = await fetch(`${API_BASE}/api/execution/today`, { headers });
      const data = await response.json();

      if (data.success && data.todaysTrades) {
        const allTrades = [];
        data.todaysTrades.forEach(execution => {
          if (execution.executedTrades) {
            allTrades.push(...execution.executedTrades);
          }
        });
        setExecutedTrades(allTrades);
      } else {
        setExecutedTrades([]);
      }
    } catch (error) {
      console.error('Failed to fetch executed trades:', error);
    }
  }, []);

  // Load on mount and auto-refresh
  useEffect(() => {
    fetchRecommendations();
    fetchExecutedTrades();

    const interval = setInterval(() => {
      fetchRecommendations();
      fetchExecutedTrades();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRecommendations, fetchExecutedTrades]);

  // Handle manual trade execution
  const handleExecuteTrade = (recommendation) => {
    const customSize = selectedPositions[recommendation.marketId] || recommendation.positionSize;
    setSelectedTrade(recommendation);
    setTradeConfirm({
      market: recommendation.marketTitle,
      action: recommendation.action || 'BUY',
      size: customSize,
      probability: recommendation.probability,
      expectedValue: recommendation.expectedValue,
      risk: recommendation.riskPerTrade
    });
  };

  // Confirm and execute trade
  const confirmTrade = async () => {
    if (!selectedTrade || !tradeConfirm) return;

    setExecutingTrade(true);
    setMessage('⏳ Executing trade...');
    setMessageType('info');

    try {
      // Get session ID from localStorage for authentication
      const sessionId = localStorage.getItem('sessionId');
      console.log('🔐 Session ID:', sessionId ? sessionId.substring(0, 20) + '...' : 'NONE');

      const headers = {
        'Content-Type': 'application/json'
      };
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
      }

      const requestBody = {
        ticker: selectedTrade.marketId,
        side: 'buy',
        quantity: Math.ceil(tradeConfirm.size),
        price: 0.5,
        type: 'market'
      };

      console.log('📤 Sending trade request:', requestBody);
      console.log('📍 API Base:', API_BASE);
      console.log('📋 Headers:', { 'Content-Type': 'application/json', 'X-Session-Id': sessionId ? '***' : 'NONE' });

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📬 Response status:', response.status);
      console.log('📬 Response headers:', response.headers);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok && (data.success || data.orderId)) {
        const orderId = data.orderId || data.id || 'UNKNOWN';
        console.log('✅ Trade success, Order ID:', orderId);

        // Update trade confirm to show success message
        setTradeConfirm(prev => ({
          ...prev,
          executionStatus: 'success',
          orderId: orderId
        }));

        setMessage(`✅ Trade executed successfully! Order: ${orderId}`);
        setMessageType('success');

        // Close modal after 2 seconds
        setTimeout(() => {
          setSelectedTrade(null);
          setTradeConfirm(null);
          // Refresh both recommendations and executed trades
          fetchRecommendations();
          fetchExecutedTrades();
        }, 2000);
      } else {
        const errorMsg = data.error || data.message || 'Unknown error';
        console.error('❌ Trade execution failed:', errorMsg);

        // Update trade confirm to show error message
        setTradeConfirm(prev => ({
          ...prev,
          executionStatus: 'error',
          errorMessage: errorMsg
        }));

        setMessage(`❌ Trade failed: ${errorMsg}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('❌ Trade error:', error);
      setMessage(`❌ Trade error: ${error.message}`);
      setMessageType('error');
    } finally {
      setExecutingTrade(false);
    }
  };

  const cancelTrade = () => {
    setSelectedTrade(null);
    setTradeConfirm(null);
  };

  const getMetricColor = (probability) => {
    if (probability >= 80) return '#4CAF50';
    if (probability >= 70) return '#8BC34A';
    if (probability >= 60) return '#FFC107';
    return '#F44336';
  };

  const nextRunTime = automationTime ? automationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';
  const nextRunDate = automationTime ? automationTime.toLocaleDateString() : 'Today';

  return (
    <div className="trading-dashboard">
      <div className="dashboard-header">
        <h2>🎯 Live Trading</h2>
        <div className="header-controls">
          <button
            className="refresh-btn"
            onClick={() => {
              fetchRecommendations();
              fetchExecutedTrades();
            }}
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

      {/* Automation Info */}
      <div className="automation-info">
        <div className="info-card">
          <h3>⏰ Daily Automation</h3>
          <p className="schedule">Next automatic execution: <strong>{nextRunTime}</strong> ({nextRunDate})</p>
          <p className="description">
            Top 5 recommendations will execute automatically at 10:00 AM daily.
            You can also manually execute any recommendation anytime below.
          </p>
        </div>
      </div>

      {/* Active Recommendations for Manual Trading */}
      <div className="active-section">
        <h3>📊 Active Recommendations (Click to Trade Manually)</h3>

        {/* Timeframe Filter Buttons */}
        <div className="timeframe-filters">
          <button
            className={`filter-btn ${timeframeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('all')}
          >
            📊 All ({recommendations.length})
          </button>
          <button
            className={`filter-btn ${timeframeFilter === '24h' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('24h')}
          >
            ⚡ Next 24h
          </button>
          <button
            className={`filter-btn ${timeframeFilter === '1-3d' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('1-3d')}
          >
            📈 1-3 Days
          </button>
          <button
            className={`filter-btn ${timeframeFilter === '7d' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('7d')}
          >
            📅 1 Week
          </button>
          <button
            className={`filter-btn ${timeframeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('month')}
          >
            🗓️ 1 Month
          </button>
          <button
            className={`filter-btn ${timeframeFilter === 'year' ? 'active' : ''}`}
            onClick={() => setTimeframeFilter('year')}
          >
            📊 1+ Year
          </button>
        </div>

        {recommendations.length === 0 ? (
          <div className="no-recommendations">
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Recommendations Available</h3>
              <p>Run daily analysis to generate trading recommendations</p>
            </div>
          </div>
        ) : (
          <div className="recommendations-grid">
            {getFilteredRecommendations().map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="rank-badge">#{rec.rank}</div>

                <div className="market-info">
                  <div className="market-header">
                    <h3 className="market-title">{rec.marketTitle}</h3>
                    {rec.daysToResolution && (
                      <div
                        className="time-indicator"
                        style={{ backgroundColor: getTimeframeColor(rec.timeframe) }}
                      >
                        {rec.daysToResolution === 1
                          ? '⏱️ Today'
                          : rec.daysToResolution <= 7
                          ? `⏱️ ${rec.daysToResolution}d`
                          : rec.daysToResolution <= 30
                          ? `⏱️ ${Math.ceil(rec.daysToResolution / 7)}w`
                          : `⏱️ ${Math.ceil(rec.daysToResolution / 30)}mo`}
                      </div>
                    )}
                  </div>
                  <p className="market-id">{rec.marketId}</p>
                </div>

                {/* Why This Trade? */}
                <div className="trade-rationale">
                  <p className="rationale-title"><strong>Why This Trade?</strong></p>
                  <ul className="rationale-list">
                    <li>📈 Probability: {rec.probability}% chance to win</li>
                    <li>💰 Expected edge: +{rec.expectedValue.toFixed(2)}% profit potential</li>
                    <li>⭐ Market quality: {rec.score}/100 opportunity score</li>
                    <li>💧 Liquidity: ${(rec.liquidity / 1000).toFixed(0)}K trading volume</li>
                  </ul>
                </div>

                {/* Agent Analysis Summary */}
                {rec.agentAnalysis && (
                  <div className="agent-analysis">
                    <p className="analysis-title"><strong>📊 Agent Analysis Summary</strong></p>
                    <div className="agent-insights">
                      <div className="agent-item">
                        <span className="agent-name">🤖 Trade Analyzer:</span>
                        <p className="agent-text">{rec.agentAnalysis.tradeAnalyzer}</p>
                      </div>
                      <div className="agent-item">
                        <span className="agent-name">📈 Strategy Optimizer:</span>
                        <p className="agent-text">{rec.agentAnalysis.strategyOptimizer}</p>
                      </div>
                      <div className="agent-item">
                        <span className="agent-name">⚡ Trading Decision Engine:</span>
                        <p className="agent-text">{rec.agentAnalysis.decisionEngine}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="metrics-container">
                  <div className="metric">
                    <span className="metric-label">Probability</span>
                    <div className="probability-bar">
                      <div
                        className="probability-fill"
                        style={{
                          width: `${rec.probability}%`,
                          backgroundColor: getMetricColor(rec.probability)
                        }}
                      />
                    </div>
                    <span className="metric-value" style={{ color: getMetricColor(rec.probability) }}>
                      {rec.probability}%
                    </span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Expected Value</span>
                    <span className="metric-value">{rec.expectedValue.toFixed(2)}%</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Position Size</span>
                    <span className="metric-value">${rec.positionSize.toFixed(2)}</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Risk/Reward</span>
                    <span className="metric-value">{rec.rewardRatio.toFixed(2)}:1</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Market Score</span>
                    <span className="metric-value">{rec.score}/100</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Liquidity</span>
                    <span className="metric-value">${(rec.liquidity / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                {/* Custom Position Size Input */}
                <div className="position-size-selector">
                  <label>Position Size (USD):</label>
                  <div className="input-group">
                    <input
                      type="number"
                      min="1"
                      max={portfolio?.cash || 100}
                      step="0.5"
                      value={selectedPositions[rec.marketId] || rec.positionSize}
                      onChange={(e) => handlePositionSizeChange(rec.marketId, parseFloat(e.target.value))}
                      className="position-input"
                      placeholder={rec.positionSize.toFixed(2)}
                    />
                    <span className="input-label">$ USD</span>
                  </div>
                  <p className="available-cash">Available: ${portfolio?.cash?.toFixed(2) || '0.00'}</p>
                </div>

                <button
                  className="execute-btn"
                  onClick={() => handleExecuteTrade(rec)}
                  disabled={!selectedPositions[rec.marketId] || selectedPositions[rec.marketId] <= 0 || portfolio?.cash < selectedPositions[rec.marketId]}
                >
                  {!selectedPositions[rec.marketId] || selectedPositions[rec.marketId] <= 0
                    ? '⚠️ Enter Amount'
                    : portfolio?.cash < selectedPositions[rec.marketId]
                    ? '❌ Insufficient Funds'
                    : '💸 Execute Trade Now'
                  }
                </button>

                {selectedPositions[rec.marketId] > 0 && portfolio?.cash < selectedPositions[rec.marketId] && (
                  <p className="error-text">
                    Need ${selectedPositions[rec.marketId].toFixed(2)}, have ${portfolio?.cash?.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executed Trades History */}
      {executedTrades.length > 0 && (
        <div className="executed-section">
          <h3>✅ Today's Executed Trades</h3>
          <div className="execution-summary">
            <div className="summary-metrics">
              <div className="metric-box success">
                <div className="metric-number">{executedTrades.length}</div>
                <div className="metric-label">Trades Executed</div>
              </div>
              <div className="metric-box">
                <div className="metric-number">
                  ${executedTrades.reduce((sum, t) => sum + t.positionSize, 0).toFixed(2)}
                </div>
                <div className="metric-label">Capital Deployed</div>
              </div>
              <div className="metric-box profit">
                <div className="metric-number">
                  ${executedTrades.reduce((sum, t) => sum + (t.expectedProfit || 0), 0).toFixed(2)}
                </div>
                <div className="metric-label">Expected Profit</div>
              </div>
            </div>
          </div>

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
                    <span className="metric-value" style={{ color: getMetricColor(trade.probability) }}>
                      {trade.probability}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Position Size</span>
                    <span className="metric-value">${trade.positionSize.toFixed(2)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Expected Value</span>
                    <span className="metric-value">{trade.expectedValue.toFixed(2)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Expected Profit</span>
                    <span className="metric-value profit">${(trade.expectedProfit || 0).toFixed(2)}</span>
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

      {/* Trade Confirmation Modal */}
      {tradeConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {tradeConfirm.executionStatus === 'success' && '✅ Trade Executed Successfully!'}
              {tradeConfirm.executionStatus === 'error' && '❌ Trade Execution Failed'}
              {!tradeConfirm.executionStatus && 'Confirm Trade Execution'}
            </h3>

            {tradeConfirm.executionStatus === 'success' && (
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                color: '#155724',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '15px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                Order executed! Order ID: {tradeConfirm.orderId}
              </div>
            )}

            {tradeConfirm.executionStatus === 'error' && (
              <div style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                color: '#721c24',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '15px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                Error: {tradeConfirm.errorMessage}
              </div>
            )}

            <div className="confirmation-details">
              <div className="detail-row">
                <span className="detail-label">Market:</span>
                <span className="detail-value">{tradeConfirm.market}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Action:</span>
                <span className="detail-value">{tradeConfirm.action}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Position Size:</span>
                <span className="detail-value">${tradeConfirm.size.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Probability:</span>
                <span className="detail-value">{tradeConfirm.probability}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Expected Value:</span>
                <span className="detail-value">{tradeConfirm.expectedValue.toFixed(2)}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Max Risk:</span>
                <span className="detail-value">{tradeConfirm.risk}%</span>
              </div>
              <div className="detail-row" style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <span className="detail-label">Cash Remaining:</span>
                <span className="detail-value" style={{ color: '#4CAF50' }}>
                  ${(portfolio?.cash - tradeConfirm.size).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              {tradeConfirm.executionStatus ? (
                <button
                  className="confirm-btn"
                  onClick={cancelTrade}
                  style={{ width: '100%' }}
                >
                  {tradeConfirm.executionStatus === 'success' ? '✅ Close' : '🔄 Try Again'}
                </button>
              ) : (
                <>
                  <button
                    className="confirm-btn"
                    onClick={confirmTrade}
                    disabled={executingTrade}
                  >
                    {executingTrade ? '⟳ Executing...' : '✅ Confirm & Execute'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={cancelTrade}
                    disabled={executingTrade}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
