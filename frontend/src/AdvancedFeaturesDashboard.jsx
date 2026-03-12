import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const AdvancedFeaturesDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('execution');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const endpoints = [
        '/api/execution/order-management',
        '/api/execution/position-management',
        '/api/reporting/performance-report',
        '/api/strategies/portfolio',
        '/api/customization/dashboard-widgets',
        '/api/collaboration/team-activity',
        '/api/advanced/ai-insights',
        '/api/advanced/automation-rules'
      ];

      const results = {};
      for (const ep of endpoints) {
        try {
          const res = await fetch(`http://localhost:5001${ep}`);
          const d = await res.json();
          results[ep.split('/').pop()] = d.data;
        } catch (e) {
          results[ep.split('/').pop()] = {};
        }
      }
      setData(results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container"><div className="loading">⏳ Loading Advanced Features...</div></div>;

  const tabs = [
    { id: 'execution', label: '⚡ Execution (Phase 5)', color: '#667eea' },
    { id: 'reporting', label: '📊 Reporting (Phase 6)', color: '#3b82f6' },
    { id: 'strategies', label: '🎯 Strategies (Phase 7)', color: '#10b981' },
    { id: 'customization', label: '⚙️ Customization (Phase 8)', color: '#f59e0b' },
    { id: 'collaboration', label: '👥 Collaboration (Phase 9)', color: '#8b5cf6' },
    { id: 'ai', label: '🤖 AI & Advanced (Phase 10)', color: '#ec4899' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'execution':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.75rem 0' }}>Order Management</h4>
              <div>Active Orders: {data['order-management']?.activeOrders || 0}</div>
              <div>Avg Execution: {data['order-management']?.averageExecutionTime || 'N/A'}</div>
            </div>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.75rem 0' }}>Position Management</h4>
              <div>Open Positions: {data['position-management']?.openPositions || 0}</div>
              <div>Capital Deployed: ${data['position-management']?.totalCapitalDeployed?.toLocaleString() || 0}</div>
            </div>
          </div>
        );
      case 'reporting':
        return (
          <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '8px' }}>
            <h4>Performance Reporting</h4>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div><div style={{ fontSize: '0.9rem', color: '#6b7280' }}>MTD Return</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{data['performance-report']?.mtdReturn}</div></div>
              <div><div style={{ fontSize: '0.9rem', color: '#6b7280' }}>YTD Return</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{data['performance-report']?.ytdReturn}</div></div>
              <div><div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Return</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{data['performance-report']?.totalReturn}</div></div>
            </div>
          </div>
        );
      case 'strategies':
        return (
          <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
            <h4>Strategy Portfolio</h4>
            <div style={{ marginTop: '1rem' }}>
              <p>Active Strategies: {data.portfolio?.activeStrategies}</p>
              <p>Backtest Score: {data.portfolio?.backtestScore}/10</p>
            </div>
          </div>
        );
      case 'customization':
        return (
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
            <h4>Dashboard Customization</h4>
            <div style={{ marginTop: '1rem' }}>
              <p>Available Widgets: {data['dashboard-widgets']?.availableWidgets}</p>
              <p>Active Widgets: {data['dashboard-widgets']?.activeWidgets}</p>
              <p>Saved Layouts: {data['dashboard-widgets']?.customLayoutsSaved}</p>
            </div>
          </div>
        );
      case 'collaboration':
        return (
          <div style={{ padding: '1rem', background: '#f5e6ff', borderRadius: '8px' }}>
            <h4>Team Collaboration</h4>
            <div style={{ marginTop: '1rem' }}>
              <p>Team Members: {data['team-activity']?.teamMembers}</p>
              <p>Active Now: {data['team-activity']?.activeNow}</p>
              <p>Shared Portfolios: {data['team-activity']?.sharedPortfolios}</p>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px' }}>
            <h4>AI & Automation</h4>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>ML Models Active</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data['ai-insights']?.mlModelsActive}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Prediction Accuracy</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data['ai-insights']?.predictionAccuracy}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active Rules</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data['automation-rules']?.activeRules}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Success Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data['automation-rules']?.successRate}</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🚀 Phases 5-10: Advanced Features Hub</h1>
        <p className="subtitle">Execution, Reporting, Strategies, Customization, Collaboration & AI</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '0.5rem 1rem',
            background: activeTab === tab.id ? tab.color : '#e5e7eb',
            color: activeTab === tab.id ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card full-width">
          {renderContent()}
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchAllData}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDashboard;
