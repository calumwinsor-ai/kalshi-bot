import React, { useState, useEffect } from 'react';
import './App.css';
import { TradeExecutionDashboard } from './TradeExecutionDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import AnalystDashboard from './AnalystDashboard';
import RiskDashboard from './RiskDashboard';
import PerformanceDashboard from './PerformanceDashboard';
// Phase 2: Risk Management Suite
import StressTestingDashboard from './StressTestingDashboard';
import RiskHeatmapDashboard from './RiskHeatmapDashboard';
import CorrelationDashboard from './CorrelationDashboard';
import DrawdownDashboard from './DrawdownDashboard';
import RiskMetricsDashboard from './RiskMetricsDashboard';
import ScenarioModelingDashboard from './ScenarioModelingDashboard';
// Phase 3: Historical Analysis & Learning
import BacktestingDashboard from './BacktestingDashboard';
import TradeJournalDashboard from './TradeJournalDashboard';
import PerformanceTrackerDashboard from './PerformanceTrackerDashboard';
import PatternAnalysisDashboard from './PatternAnalysisDashboard';
import WinLossDashboard from './WinLossDashboard';
// Phase 4: Market Intelligence
import MarketIntelligenceDashboard from './MarketIntelligenceDashboard';
// Phases 5-10: Advanced Features
import AdvancedFeaturesDashboard from './AdvancedFeaturesDashboard';
// Settings
import { SettingsDashboard } from './SettingsDashboard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

function App() {
  const [sessionToken, setSessionToken] = useState('');
  const [sessionId, setSessionId] = useState(null); // New: session ID from server
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userInfo, setUserInfo] = useState(null); // New: store user info from login

  // Portfolio state
  const [portfolio, setPortfolio] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [orders, setOrders] = useState([]);

  // Bot state
  const [botRunning, setBotRunning] = useState(false);
  const [criteria, setCriteria] = useState([
    {
      name: 'Favorite Below 75¢',
      strategy: 'favorite_bias',
      side: 'buy',
      maxPrice: 0.75
    },
    {
      name: 'Favorite Above 85¢',
      strategy: 'favorite_fade',
      side: 'sell',
      minPrice: 0.85
    }
  ]);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    strategy: 'favorite_bias',
    side: 'buy',
    maxPrice: 0.75,
    minPrice: 0.25
  });

  // ========== HELPER FUNCTIONS ==========

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return headers;
  };

  // Restore session from localStorage on mount
  const restoreSession = () => {
    try {
      const savedSessionId = localStorage.getItem('sessionId');
      const savedUserInfo = localStorage.getItem('userInfo');
      const savedSessionToken = localStorage.getItem('sessionToken');

      if (savedSessionId) {
        setSessionId(savedSessionId);
        setAuthenticated(true);
      }
      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
      if (savedSessionToken) {
        setSessionToken(savedSessionToken);
      }
    } catch (err) {
      console.error('Error restoring session:', err);
    }
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('sessionToken');
    setSessionId(null);
    setSessionToken('');
    setUserInfo(null);
    setAuthenticated(false);
  };

  // ========== EFFECTS ==========

  // Check auth status on mount and restore session from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      // First, restore session from localStorage
      try {
        const savedSessionId = localStorage.getItem('sessionId');
        const savedUserInfo = localStorage.getItem('userInfo');
        const savedSessionToken = localStorage.getItem('sessionToken');

        if (savedSessionId) {
          setSessionId(savedSessionId);
          // Verify session is still valid with backend
          try {
            const response = await fetch(`${API_BASE}/api/auth/status`, {
              headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': savedSessionId  // Use saved sessionId directly
              }
            });
            const data = await response.json();

            if (data.authenticated && data.session) {
              setAuthenticated(true);
              setUserInfo(data.session.user);
            } else {
              // Session invalid, clear it
              clearSession();
            }
            setBotRunning(data.botRunning);
          } catch (err) {
            console.error('Auth status check failed:', err);
          }
        }
        if (savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
        }
        if (savedSessionToken) {
          setSessionToken(savedSessionToken);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh data when authenticated (every 60 seconds for live data)
  useEffect(() => {
    if (authenticated) {
      refreshPortfolio();
      const interval = setInterval(refreshPortfolio, 60000); // Every 60 seconds (1 minute) for live updates (reduced to avoid rate limiting)
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/status`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.authenticated && data.session) {
        setAuthenticated(true);
        setUserInfo(data.session.user);
      } else if (!sessionId) {
        // No active session
        setAuthenticated(false);
      }
      setBotRunning(data.botRunning);
    } catch (err) {
      console.error('Auth status check failed:', err);
    }
  };

  const handleOpenKalshi = () => {
    // Open Kalshi login in a new window
    window.open('https://app.kalshi.com/login', '_blank', 'width=1200,height=800');
    setSuccess('Opening Kalshi login... Log in there, then paste your token below');
    setShowTokenInput(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!sessionToken || sessionToken.trim().length < 10) {
      setError('Please paste your API Key ID');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Authenticating with Kalshi API...');
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionToken.trim() // Changed from apiKeyId
        }),
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.sessionId) {
        // Save session to localStorage
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('sessionToken', sessionToken.trim());
        if (data.user) {
          localStorage.setItem('userInfo', JSON.stringify(data.user));
        }

        // Update state
        setSessionId(data.sessionId);
        setUserInfo(data.user);
        setAuthenticated(true);
        setSuccess(`✅ ${data.message || 'Successfully authenticated with Kalshi!'}`);
        setSessionToken('');
        setShowTokenInput(false);
        setActiveTab('dashboard');
      } else {
        setError(data.error || 'Authentication failed: ' + response.status);
      }
    } catch (err) {
      console.error('Full error:', err);
      setError('Connection error: ' + err.message + '. Make sure backend is running on port 5001');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint with session ID
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      // Clear session from frontend
      clearSession();
      setBotRunning(false);
      setPortfolio(null);
      setMarkets([]);
      setOrders([]);
      setActiveTab('dashboard');
      setSuccess('✅ Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear session locally even if API call fails
      clearSession();
      setError('Logout error: ' + err.message);
    }
  };

  const refreshPortfolio = async () => {
    try {
      console.log('Fetching portfolio from:', `${API_BASE}/api/account/portfolio`);

      const [portRes, marketsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/api/account/portfolio`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/markets?status=open&limit=20`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/orders`, { headers: getAuthHeaders() })
      ]);

      console.log('Portfolio response status:', portRes.status);
      console.log('Markets response status:', marketsRes.status);
      console.log('Orders response status:', ordersRes.status);

      // Portfolio
      if (portRes.ok) {
        const portData = await portRes.json();
        console.log('Portfolio raw response:', portData);

        // Handle different Kalshi API response formats
        let portfolioData = portData;
        if (portData?.portfolio) portfolioData = portData.portfolio;
        if (portData?.data) portfolioData = portData.data;

        console.log('Portfolio processed:', portfolioData);
        setPortfolio(portfolioData || { cash: 0, total_value: 0, open_positions: 0 });
      } else {
        try {
          const errData = await portRes.json();
          console.error('Portfolio fetch failed:', portRes.status, errData);

          // Show diagnostic info if available
          if (errData.diagnostic) {
            setError(
              `⚠️ Portfolio Error: ${errData.details}\n` +
              `Possible causes: ${errData.diagnostic.possibleCauses?.join(', ')}\n` +
              `Tip: ${errData.diagnostic.nextSteps}`
            );
          } else {
            setError('Portfolio fetch error: ' + (errData.error || portRes.status));
          }
        } catch (parseErr) {
          console.error('Portfolio fetch failed:', portRes.status, parseErr.message);
          setError('Portfolio fetch error: ' + portRes.status);
          // Set default portfolio so app doesn't crash
          setPortfolio({ cash: 0, total_value: 0, open_positions: 0 });
        }
      }

      // Markets
      try {
        if (marketsRes.ok) {
          const markData = await marketsRes.json();
          console.log('Markets raw response:', markData);

          // Handle different response formats
          let marketsList = markData;
          if (markData?.markets) marketsList = markData.markets;
          if (markData?.data) marketsList = markData.data;
          if (!Array.isArray(marketsList)) marketsList = [];

          console.log('Markets processed:', marketsList.length, 'markets');
          setMarkets(marketsList);
        } else {
          console.error('Markets fetch failed:', marketsRes.status);
          setMarkets([]);
        }
      } catch (err) {
        console.error('Markets parsing error:', err);
        setMarkets([]);
      }

      // Orders
      try {
        if (ordersRes.ok) {
          const orderData = await ordersRes.json();
          console.log('Orders raw response:', orderData);

          // Handle different response formats
          let ordersList = orderData;
          if (orderData?.orders) ordersList = orderData.orders;
          if (orderData?.data) ordersList = orderData.data;
          if (!Array.isArray(ordersList)) ordersList = [];

          console.log('Orders processed:', ordersList.length, 'orders');
          setOrders(ordersList);
        } else {
          console.error('Orders fetch failed:', ordersRes.status);
          setOrders([]);
        }
      } catch (err) {
        console.error('Orders parsing error:', err);
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to load portfolio data: ' + err.message);
    }
  };

  const startBot = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/bot/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ criteria })
      });

      const data = await response.json();

      if (response.ok) {
        setBotRunning(true);
        setSuccess(`🤖 Bot started with ${criteria.length} criteria`);
      } else {
        setError(data.error || 'Failed to start bot');
      }
    } catch (err) {
      setError('Error starting bot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopBot = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/bot/stop`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setBotRunning(false);
        setSuccess('🛑 Bot stopped');
      } else {
        setError(data.error || 'Failed to stop bot');
      }
    } catch (err) {
      setError('Error stopping bot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCriteria = (e) => {
    e.preventDefault();

    if (!newCriteria.name.trim()) {
      setError('Criteria name is required');
      return;
    }

    setCriteria([...criteria, { ...newCriteria }]);
    setNewCriteria({
      name: '',
      strategy: 'favorite_bias',
      side: 'buy',
      maxPrice: 0.75,
      minPrice: 0.25
    });
    setSuccess('✅ Criteria added');
  };

  const removeCriteria = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🤖 Kalshi Trading Bot</h1>
          {authenticated && (
            <div className="header-right">
              <span className={`status ${botRunning ? 'running' : 'stopped'}`}>
                {botRunning ? '🟢 Trading Active' : '🔴 Stopped'}
              </span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!authenticated && (
        // Login Option (Can login for full features, but Phase 1 dashboards work without it)
        <div className="login-option">
          <div className="login-container">
          <div className="login-box">
            <h2>Sign In with Kalshi</h2>
            <p className="subtitle">OAuth-Secured Trading Bot</p>

            <div className="oauth-section">
              <button
                onClick={handleOpenKalshi}
                disabled={loading}
                className="btn btn-primary"
                style={{ marginBottom: '1rem' }}
              >
                🔓 Open Kalshi Login
              </button>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
                Click above to open Kalshi login in your browser. You'll log in directly with your credentials.
              </p>
            </div>

            {showTokenInput && (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>API Key ID</label>
                  <input
                    type="text"
                    value={sessionToken}
                    onChange={(e) => setSessionToken(e.target.value)}
                    placeholder="e.g., 601cdb20-0450-442c-9be6-81788c448ad0"
                    disabled={loading}
                    style={{ fontFamily: 'monospace', padding: '0.75rem' }}
                    required
                  />
                  <small style={{ color: '#999' }}>
                    From Kalshi: Settings → API Keys → Copy "API key id"
                  </small>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Authenticating...' : '✅ Authenticate'}
                </button>
              </form>
            )}

            <div className="security-note">
              <p>🔒 <strong>Security:</strong> You log in directly at Kalshi.com in your browser.</p>
              <p>We never see your password. Only your API token is used by the bot.</p>
              <p>📱 Your credentials stay safe - authorized directly by you on Kalshi's servers.</p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Dashboard - Always visible in demo mode */}
      <div className="dashboard">
          <nav className="tabs">
            <button
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`tab ${activeTab === 'criteria' ? 'active' : ''}`}
              onClick={() => setActiveTab('criteria')}
            >
              ⚙️ Trading Criteria
            </button>
            <button
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              📈 Activity
            </button>
            <button
              className={`tab ${activeTab === 'trading' ? 'active' : ''}`}
              onClick={() => setActiveTab('trading')}
            >
              🎯 Live Trading
            </button>

            {/* Phase 1 Analytics Dashboards */}
            <div className="tab-divider">PHASE 1 ANALYTICS</div>
            <button
              className={`tab ${activeTab === 'executive' ? 'active' : ''}`}
              onClick={() => setActiveTab('executive')}
            >
              👔 Executive
            </button>
            <button
              className={`tab ${activeTab === 'analyst' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyst')}
            >
              🔬 Analyst
            </button>
            <button
              className={`tab ${activeTab === 'risk' ? 'active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              ⚠️ Risk
            </button>
            <button
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              📊 Performance
            </button>

            {/* Phase 2 Risk Management Dashboards */}
            <div className="tab-divider">PHASE 2 RISK MANAGEMENT</div>
            <button
              className={`tab ${activeTab === 'stress-testing' ? 'active' : ''}`}
              onClick={() => setActiveTab('stress-testing')}
            >
              🧪 Stress Testing
            </button>
            <button
              className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('heatmap')}
            >
              🔥 Heatmap
            </button>
            <button
              className={`tab ${activeTab === 'correlation' ? 'active' : ''}`}
              onClick={() => setActiveTab('correlation')}
            >
              🔗 Correlation
            </button>
            <button
              className={`tab ${activeTab === 'drawdown' ? 'active' : ''}`}
              onClick={() => setActiveTab('drawdown')}
            >
              📉 Drawdown
            </button>
            <button
              className={`tab ${activeTab === 'risk-metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('risk-metrics')}
            >
              📊 Risk Metrics
            </button>
            <button
              className={`tab ${activeTab === 'scenarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('scenarios')}
            >
              🎬 Scenarios
            </button>

            {/* Phase 3 Historical Analysis Dashboards */}
            <div className="tab-divider">PHASE 3 HISTORICAL ANALYSIS</div>
            <button
              className={`tab ${activeTab === 'backtesting' ? 'active' : ''}`}
              onClick={() => setActiveTab('backtesting')}
            >
              🧪 Backtesting
            </button>
            <button
              className={`tab ${activeTab === 'journal' ? 'active' : ''}`}
              onClick={() => setActiveTab('journal')}
            >
              📔 Journal
            </button>
            <button
              className={`tab ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
            >
              📈 Tracker
            </button>
            <button
              className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
              onClick={() => setActiveTab('patterns')}
            >
              🎯 Patterns
            </button>
            <button
              className={`tab ${activeTab === 'winloss' ? 'active' : ''}`}
              onClick={() => setActiveTab('winloss')}
            >
              📊 Win/Loss
            </button>

            {/* Phase 4 Market Intelligence */}
            <div className="tab-divider">PHASE 4 MARKET INTELLIGENCE</div>
            <button
              className={`tab ${activeTab === 'intelligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('intelligence')}
            >
              🌍 Intelligence
            </button>

            {/* Phases 5-10 Advanced */}
            <div className="tab-divider">PHASES 5-10 ADVANCED FEATURES</div>
            <button
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              🚀 Advanced Hub
            </button>

            {/* Settings */}
            <div className="tab-divider">ACCOUNT</div>
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>

          <div className="tab-content">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-tab">
                <div className="control-section">
                  <h2>Bot Control</h2>
                  <div className="bot-controls">
                    {!botRunning ? (
                      <button
                        onClick={startBot}
                        disabled={loading || criteria.length === 0}
                        className="btn btn-success"
                      >
                        {loading ? '⏳ Starting...' : '▶️ Start Trading Bot'}
                      </button>
                    ) : (
                      <button
                        onClick={stopBot}
                        disabled={loading}
                        className="btn btn-danger"
                      >
                        {loading ? '⏳ Stopping...' : '⏹️ Stop Bot'}
                      </button>
                    )}
                  </div>
                  <p className="control-note">
                    {criteria.length === 0
                      ? '⚠️ Add at least one trading criteria to start the bot'
                      : `✅ ${criteria.length} criteria active`}
                  </p>
                </div>

                <div className="portfolio-section">
                  <h2>📊 Portfolio</h2>
                  {portfolio ? (
                    <>
                      <div className="portfolio-grid">
                        <div className="stat-card">
                          <label>Cash Available</label>
                          <div className="stat-value">
                            ${(portfolio.cash || portfolio.available_balance || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat-card">
                          <label>Total Portfolio Value</label>
                          <div className="stat-value">
                            ${(portfolio.total_value || portfolio.net_liquidation_value || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="stat-card">
                          <label>Open Positions</label>
                          <div className="stat-value">{portfolio.open_positions || 0}</div>
                        </div>
                      </div>
                      <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                        Last updated: {new Date().toLocaleTimeString()}
                      </small>
                    </>
                  ) : (
                    <div style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>
                      <p>Loading portfolio data...</p>
                      {error && <p style={{ color: '#d32f2f', marginTop: '0.5rem' }}>⚠️ {error}</p>}
                    </div>
                  )}
                </div>

                {markets.length > 0 && (
                  <div className="portfolio-section" style={{ marginTop: '1rem' }}>
                    <h2>📈 Open Markets ({markets.length})</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {markets.slice(0, 10).map((market, idx) => (
                        <div key={idx} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {market.title || market.name || `Market ${idx + 1}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            Price: {(market.last_price || 0).toFixed(2)} |
                            Volume: {(market.volume_24h || 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={refreshPortfolio}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  🔄 Refresh Data (Auto-updates every 1 min)
                </button>
              </div>
            )}

            {/* Criteria Tab */}
            {activeTab === 'criteria' && (
              <div className="criteria-tab">
                <div className="add-criteria-section">
                  <h2>Add New Criteria</h2>
                  <form onSubmit={addCriteria}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={newCriteria.name}
                          onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                          placeholder="e.g., Favorite Below 75¢"
                        />
                      </div>

                      <div className="form-group">
                        <label>Strategy</label>
                        <select
                          value={newCriteria.strategy}
                          onChange={(e) => setNewCriteria({ ...newCriteria, strategy: e.target.value })}
                        >
                          <option value="favorite_bias">Favorite Bias (Buy)</option>
                          <option value="favorite_fade">Favorite Fade (Sell)</option>
                          <option value="correlation_arbitrage">Correlation Arbitrage</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Side</label>
                        <select
                          value={newCriteria.side}
                          onChange={(e) => setNewCriteria({ ...newCriteria, side: e.target.value })}
                        >
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      {(newCriteria.strategy === 'favorite_bias' || newCriteria.strategy === 'correlation_arbitrage') && (
                        <div className="form-group">
                          <label>Max Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newCriteria.maxPrice}
                            onChange={(e) => setNewCriteria({ ...newCriteria, maxPrice: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}

                      {(newCriteria.strategy === 'favorite_fade' || newCriteria.strategy === 'correlation_arbitrage') && (
                        <div className="form-group">
                          <label>Min Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newCriteria.minPrice}
                            onChange={(e) => setNewCriteria({ ...newCriteria, minPrice: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary">
                      ➕ Add Criteria
                    </button>
                  </form>
                </div>

                <div className="criteria-list-section">
                  <h2>Active Criteria ({criteria.length})</h2>
                  {criteria.length === 0 ? (
                    <p className="empty-state">No criteria added yet</p>
                  ) : (
                    <div className="criteria-list">
                      {criteria.map((c, idx) => (
                        <div key={idx} className="criteria-card">
                          <div className="criteria-info">
                            <h3>{c.name}</h3>
                            <p><strong>Strategy:</strong> {c.strategy.replace('_', ' ')}</p>
                            <p><strong>Side:</strong> {c.side.toUpperCase()}</p>
                            {c.maxPrice && <p><strong>Max Price:</strong> ${c.maxPrice.toFixed(2)}</p>}
                            {c.minPrice && <p><strong>Min Price:</strong> ${c.minPrice.toFixed(2)}</p>}
                          </div>
                          <button
                            onClick={() => removeCriteria(idx)}
                            className="btn-remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="activity-tab">
                <h2>Recent Orders</h2>
                {!orders || orders.length === 0 ? (
                  <p className="empty-state">No orders yet</p>
                ) : (
                  <div className="orders-list">
                    {orders.map((order, idx) => (
                      <div key={idx} className="order-card">
                        <div className="order-header">
                          <span className="order-ticker">{order.ticker}</span>
                          <span className={`order-side ${order.side}`}>{order.side.toUpperCase()}</span>
                        </div>
                        <div className="order-details">
                          <p><strong>Price:</strong> ${order.price?.toFixed(2)}</p>
                          <p><strong>Quantity:</strong> {order.quantity}</p>
                          <p><strong>Status:</strong> {order.status || 'Unknown'}</p>
                          <p><strong>Time:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Live Trading Tab - Manual + Automated */}
            {activeTab === 'trading' && (
              <TradeExecutionDashboard authenticated={authenticated} portfolio={portfolio} />
            )}

            {/* Executive Dashboard Tab */}
            {activeTab === 'executive' && (
              <div className="analytics-tab">
                <ExecutiveDashboard />
              </div>
            )}

            {/* Analyst Dashboard Tab */}
            {activeTab === 'analyst' && (
              <div className="analytics-tab">
                <AnalystDashboard />
              </div>
            )}

            {/* Risk Dashboard Tab */}
            {activeTab === 'risk' && (
              <div className="analytics-tab">
                <RiskDashboard />
              </div>
            )}

            {/* Performance Dashboard Tab */}
            {activeTab === 'performance' && (
              <div className="analytics-tab">
                <PerformanceDashboard />
              </div>
            )}

            {/* Phase 2 Risk Management Dashboards */}
            {activeTab === 'stress-testing' && (
              <div className="analytics-tab">
                <StressTestingDashboard />
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div className="analytics-tab">
                <RiskHeatmapDashboard />
              </div>
            )}

            {activeTab === 'correlation' && (
              <div className="analytics-tab">
                <CorrelationDashboard />
              </div>
            )}

            {activeTab === 'drawdown' && (
              <div className="analytics-tab">
                <DrawdownDashboard />
              </div>
            )}

            {activeTab === 'risk-metrics' && (
              <div className="analytics-tab">
                <RiskMetricsDashboard />
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="analytics-tab">
                <ScenarioModelingDashboard />
              </div>
            )}

            {/* Phase 3 Historical Analysis Dashboards */}
            {activeTab === 'backtesting' && (
              <div className="analytics-tab">
                <BacktestingDashboard />
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="analytics-tab">
                <TradeJournalDashboard />
              </div>
            )}

            {activeTab === 'tracker' && (
              <div className="analytics-tab">
                <PerformanceTrackerDashboard />
              </div>
            )}

            {activeTab === 'patterns' && (
              <div className="analytics-tab">
                <PatternAnalysisDashboard />
              </div>
            )}

            {activeTab === 'winloss' && (
              <div className="analytics-tab">
                <WinLossDashboard />
              </div>
            )}

            {/* Phase 4 Market Intelligence */}
            {activeTab === 'intelligence' && (
              <div className="analytics-tab">
                <MarketIntelligenceDashboard />
              </div>
            )}

            {/* Phases 5-10 Advanced Features */}
            {activeTab === 'advanced' && (
              <div className="analytics-tab">
                <AdvancedFeaturesDashboard />
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="analytics-tab">
                <SettingsDashboard />
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default App;
