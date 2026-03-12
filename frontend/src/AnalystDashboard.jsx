import React, { useState, useEffect } from 'react';
import { fetchJSON, getAuthHeaders } from './apiHelper';

const AnalystDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalystDashboard();
  }, []);

  const fetchAnalystDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/analytics/dashboard/analyst', { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading Analyst Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">❌ Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <div className="error">No data available</div>
      </div>
    );
  }

  const { agentAnalysis = {}, tradeDependencies = {}, recommendations = [] } = data || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🔬 Analyst Dashboard</h1>
        <p className="subtitle">Agent reasoning, consensus, and trade dependencies</p>
      </div>

      <div className="dashboard-grid">
        {/* Agent Consensus Overview */}
        <div className="dashboard-card full-width">
          <div className="card-title">🤖 Agent Consensus Analysis</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Average Consensus Strength:</span>
              <span className="metric-value">{agentAnalysis?.avgConsensusStrength || 0}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Trades with Full Agreement:</span>
              <span className="metric-value">{agentAnalysis?.fullAgreementTrades || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Trades with Partial Agreement:</span>
              <span className="metric-value">{agentAnalysis?.partialAgreementTrades || 0}</span>
            </div>
          </div>
        </div>

        {/* Agent Consensus Details */}
        <div className="dashboard-card full-width">
          <div className="card-title">📊 Recommendation Consensus</div>
          <div className="consensus-table">
            {agentAnalysis?.consensus && agentAnalysis.consensus.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Market</th>
                    <th>Trade Analyzer</th>
                    <th>Strategy Optimizer</th>
                    <th>Decision Engine</th>
                    <th>Agreement</th>
                  </tr>
                </thead>
                <tbody>
                  {agentAnalysis.consensus.map((item, idx) => (
                    <tr key={idx} className={item.hasFullAnalysis ? 'full-agreement' : 'partial-agreement'}>
                      <td>{item.rank}</td>
                      <td>{item.market}</td>
                      <td>{item.tradeAnalyzerConsent ? '✅' : '❌'}</td>
                      <td>{item.strategyOptimizerConsent ? '✅' : '❌'}</td>
                      <td>{item.decisionEngineConsent ? '✅' : '❌'}</td>
                      <td>
                        <span className={item.hasFullAnalysis ? 'agreement-strong' : 'agreement-weak'}>
                          {item.agreementStrength}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No recommendations available</p>
            )}
          </div>
        </div>

        {/* Trade Dependencies */}
        <div className="dashboard-card full-width">
          <div className="card-title">⚠️ Trade Dependencies & Correlations</div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label">Correlation Warnings:</span>
              <span className="metric-value">{tradeDependencies?.count || 0}</span>
            </div>
            {tradeDependencies?.recommendation && (
              <p className="recommendation-text">
                <strong>Recommendation:</strong> {tradeDependencies.recommendation}
              </p>
            )}
            {tradeDependencies?.warnings && tradeDependencies.warnings.length > 0 && (
              <div className="warnings-list">
                <h4>Warnings:</h4>
                {tradeDependencies.warnings.map((warning, idx) => (
                  <div key={idx} className="warning-item">
                    <span className="warning-icon">⚠️</span>
                    <div>
                      <p><strong>{warning.trade1} ↔️ {warning.trade2}</strong></p>
                      <p>Correlation: {(warning.correlation * 100).toFixed(0)}%</p>
                      <p>Risk Level: {warning.risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations with Scores */}
        <div className="dashboard-card full-width">
          <div className="card-title">🎯 Recommendations Summary</div>
          {recommendations && recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-rank">#{rec.rank}</span>
                    <h4>{rec.title}</h4>
                  </div>
                  <div className="rec-metrics">
                    <div className="metric">
                      <span className="label">Probability:</span>
                      <span className="value">{rec.probability}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Score:</span>
                      <span className="value">{rec.score}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Timeframe:</span>
                      <span className="value">{rec.timeframe}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Agent Consensus:</span>
                      <span className="value">{rec.agentConsensus}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recommendations available</p>
          )}
        </div>
      </div>

      <div className="dashboard-footer">
        <small>Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</small>
        <button className="refresh-btn" onClick={fetchAnalystDashboard}>🔄 Refresh</button>
      </div>
    </div>
  );
};

export default AnalystDashboard;
