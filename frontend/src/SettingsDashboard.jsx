import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export function SettingsDashboard() {
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState(null);

  // Get session ID from localStorage
  const getSessionId = () => localStorage.getItem('sessionId');

  // Check current status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings/status`, {
        headers: {
          'X-Session-Id': getSessionId()
        }
      });
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!privateKey.trim()) {
      setError('Please paste your private key');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/settings/private-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId()
        },
        body: JSON.stringify({ privateKey: privateKey.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setPrivateKey('');
        setTimeout(() => checkStatus(), 1000);
      } else {
        setError(data.error || 'Failed to save private key');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>⚙️ Settings</h2>

      {/* Status Section */}
      {status && (
        <div
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            borderRadius: '8px',
            backgroundColor: status.hasValidPrivateKey ? '#d4edda' : '#fff3cd',
            border: `2px solid ${status.hasValidPrivateKey ? '#28a745' : '#ffc107'}`,
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>
            {status.hasValidPrivateKey ? '🟢' : '🟡'} {status.message}
          </h3>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
            {status.hasValidPrivateKey
              ? 'All trades will be executed on your REAL Kalshi account'
              : 'Trades are currently in DEMO mode. Add your private key to enable live trading.'}
          </p>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24'
          }}
        >
          ❌ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724'
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Private Key Form */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}
      >
        <h3>🔐 Add Your Kalshi Private Key</h3>

        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          To execute <strong>REAL trades</strong>, paste your Kalshi API Private Key below:
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            <strong>How to get your private key:</strong>
          </p>
          <ol style={{ marginLeft: '1.5rem', color: '#666' }}>
            <li>Go to <a href="https://kalshi.com/settings/api-keys" target="_blank" rel="noopener noreferrer">Kalshi.com → Settings → API Keys</a></li>
            <li>Copy your <strong>Private Key</strong> (the multi-line text starting with -----BEGIN RSA PRIVATE KEY-----)</li>
            <li>Paste it in the box below</li>
            <li>Click "Save & Enable Live Trading"</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Paste your complete private key here (including -----BEGIN and -----END lines)"
            style={{
              width: '100%',
              height: '200px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem',
              resize: 'vertical'
            }}
            disabled={loading}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading || !privateKey.trim()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                opacity: loading || !privateKey.trim() ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Saving...' : '✅ Save & Enable Live Trading'}
            </button>

            <button
              type="button"
              onClick={() => setPrivateKey('')}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Security Note */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px'
        }}
      >
        <p style={{ margin: '0', color: '#004085' }}>
          <strong>🔒 Security Note:</strong> Your private key is stored in the bot's memory and never leaves your computer.
          It's used only to sign API requests to Kalshi. Restart the app to clear it.
        </p>
      </div>
    </div>
  );
}
