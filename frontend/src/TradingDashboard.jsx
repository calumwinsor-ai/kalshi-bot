import React, { useState, useEffect, useCallback } from 'react';
import './TradingDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export function TradingDashboard({ authenticated, portfolio }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [tradeConfirm, setTradeConfirm] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [analysisNeeded, setAnalysisNeeded] = useState(false);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch top 5 recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!authenticated) return;

    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/api/recommendations/top-5`);
      const data = await response.json();

      if (data.success && data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setLastUpdate(new Date());
        setAnalysisNeeded(false);
        setMessage('');
      } else if (data.success && (!data.recommendations || data.recommendations.length === 0)) {
        setRecommendations([]);
        setAnalysisNeeded(true);
        setMessage(data.message || 'Run daily analysis to generate trading recommendations');
        setMessageType('info');
        setLastUpdate(new Date());
      } else {
        setRecommendations([]);
        setMessage(data.error || 'Unable to fetch recommendations');
        setMessageType('error');
      }
    } catch (error) {
      setRecommendations([]);
      setMessage('Connection error: ' + error.message);
      setMessageType('error');
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [authenticated]);

  // Load recommendations on mount and auto-refresh
  useEffect(() => {
    if (authenticated) {
      fetchRecommendations();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchRecommendations, 30000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchRecommendations]);

  const handleExecuteTrade = (recommendation) => {
    setSelectedTrade(recommendation);
    setTradeConfirm({
      market: recommendation.marketTitle,
      action: recommendation.action,
      size: recommendation.positionSize,
      probability: recommendation.probability,
      expectedValue: recommendation.expectedValue,
      risk: recommendation.riskPerTrade
    });
  };

  const confirmTrade = async () => {
    if (!selectedTrade) return;

    setExecutingTrade(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: selectedTrade.marketId,
          side: 'buy',
          quantity: Math.ceil(selectedTrade.positionSize),
          price: 0.5, // Market price (will be adjusted by Kalshi)
          type: 'market'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Trade executed! Order: ${data.orderId}`);
        setMessageType('success');
        setSelectedTrade(null);
        setTradeConfirm(null);
        // Refresh after execution
        setTimeout(fetchRecommendations, 2000);
      } else {
        setMessage(`Trade failed: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Trade error: ${error.message}`);
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
    if (probability >= 80) return '#4CAF50'; // Green
    if (probability >= 70) return '#8BC34A'; // Light green
    if (probability >= 60) return '#FFC107'; // Orange
    return '#F44336'; // Red
  };

  if (!authenticated) {
    return (
      <div className="dashboard-empty">
        <p>Please authenticate to view trading recommendations</p>
      </div>
    );
  }

  return (
    <div className="trading-dashboard">
      <div className="dashboard-header">
        <h2>🎯 Trading Opportunities</h2>
        <div className="header-controls">
          <button
            className="refresh-btn"
            onClick={fetchRecommendations}
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

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Trading Opportunities Available</h3>
            <p>{analysisNeeded ? 'Run the daily analysis to generate trading recommendations' : 'Waiting for market analysis...'}</p>
            {analysisNeeded && (
              <button
                className="action-btn"
                onClick={() => window.location.href = 'http://localhost:5173'}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className="rank-badge">#{rec.rank}</div>

              <div className="market-info">
                <h3 className="market-title">{rec.marketTitle}</h3>
                <p className="market-id">{rec.marketId}</p>
              </div>

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
                  <span className="metric-value">{rec.expectedValuePercent}%</span>
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

              <button
                className="execute-btn"
                onClick={() => handleExecuteTrade(rec)}
                disabled={portfolio?.cash < rec.positionSize}
              >
                {portfolio?.cash < rec.positionSize
                  ? '❌ Insufficient Funds'
                  : '💸 Execute Trade'
                }
              </button>

              {portfolio?.cash < rec.positionSize && (
                <p className="error-text">
                  Need ${rec.positionSize.toFixed(2)}, have ${portfolio?.cash?.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trade Confirmation Modal */}
      {tradeConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Trade Execution</h3>

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
