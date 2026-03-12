import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const MarketIntelligenceDashboard = () => {
  const [market, setMarket] = useState(null);
  const [news, setNews] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [macro, setMacro] = useState(null);
  const [signals, setSignals] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [m, n, s, ma, si] = await Promise.all([
        fetch('http://localhost:5001/api/intelligence/market-overview').then(r => r.json()),
        fetch('http://localhost:5001/api/intelligence/news-events').then(r => r.json()),
        fetch('http://localhost:5001/api/intelligence/sentiment-analysis').then(r => r.json()),
        fetch('http://localhost:5001/api/intelligence/macro-data').then(r => r.json()),
        fetch('http://localhost:5001/api/intelligence/technical-signals').then(r => r.json())
      ]);
      setMarket(m.data);
      setNews(n.data);
      setSentiment(s.data);
      setMacro(ma.data);
      setSignals(si.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Market Intelligence...</div></div>;
  if (error) return <div className="dashboard-container"><div className="error">❌ Error: {error}</div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🌍 Market Intelligence & Context</h1>
        <p className="subtitle">Real-time market conditions, news, sentiment, and technical analysis</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['overview', 'news', 'sentiment', 'macro', 'signals'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.5rem 1rem',
            background: activeTab === tab ? '#667eea' : '#e5e7eb',
            color: activeTab === tab ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        {activeTab === 'overview' && market && (
          <>
            <div className="dashboard-card full-width">
              <div className="card-title">📊 Market Conditions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Status</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{market.marketConditions?.status}</div>
                </div>
                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Sentiment</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{market.marketConditions?.sentiment}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Volatility</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>{market.marketConditions?.volatility}</div>
                </div>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Day Change</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{market.marketConditions?.dayChange}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card full-width">
              <div className="card-title">📈 Top Movers</div>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <thead style={{ background: '#f3f4f6' }}>
                  <tr><th style={{ padding: '0.75rem', textAlign: 'left' }}>Symbol</th><th>Change</th><th>Volume</th></tr>
                </thead>
                <tbody>
                  {market.topMovers?.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}><strong>{m.symbol}</strong></td>
                      <td style={{ color: m.change.includes('-') ? '#ef4444' : '#10b981', fontWeight: '600' }}>{m.change}</td>
                      <td>{m.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'news' && news && (
          <div className="dashboard-card full-width">
            <div className="card-title">📰 News & Events</div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {news.headlines?.map((h, i) => (
                <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', borderLeft: `4px solid ${h.impact === 'POSITIVE' ? '#10b981' : h.impact === 'MIXED' ? '#f59e0b' : '#ef4444'}` }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{h.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>{h.date} {h.time} • {h.importance}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && sentiment && (
          <div className="dashboard-card full-width">
            <div className="card-title">💭 Sentiment Analysis</div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Overall Sentiment</div>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#10b981' }}>{sentiment.overallSentiment?.score}</div>
              <div style={{ fontSize: '1rem', color: '#059669' }}>{sentiment.overallSentiment?.direction}</div>
            </div>
          </div>
        )}

        {activeTab === 'macro' && macro && (
          <div className="dashboard-card full-width">
            <div className="card-title">📊 Macro Economic Indicators</div>
            <table style={{ width: '100%', marginTop: '1rem' }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr><th style={{ padding: '0.75rem', textAlign: 'left' }}>Indicator</th><th>Value</th><th>Change</th><th>Impact</th></tr>
              </thead>
              <tbody>
                {macro.indicators?.map((ind, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{ind.name}</td>
                    <td>{ind.value}</td>
                    <td style={{ color: ind.status === 'POSITIVE' ? '#10b981' : '#ef4444' }}>{ind.change}</td>
                    <td>{ind.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'signals' && signals && (
          <div className="dashboard-card full-width">
            <div className="card-title">🎯 Technical Signals</div>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {signals.broadMarketSignals?.map((s, i) => (
                <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', borderLeft: `4px solid ${s.value === 'BULLISH' ? '#10b981' : '#ef4444'}` }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{s.signal}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: s.value === 'BULLISH' ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchAllData}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default MarketIntelligenceDashboard;
