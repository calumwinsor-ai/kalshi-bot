// API Helper utilities for authenticated requests

export const API_BASE = 'http://localhost:5001';

// Get authentication headers with session ID from localStorage
export const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const sessionId = localStorage.getItem('sessionId');

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  return headers;
};

// Fetch with authentication headers
export const authenticatedFetch = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  return response;
};

// Fetch and parse JSON with authentication
export const fetchJSON = async (endpoint) => {
  try {
    const response = await authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export default {
  API_BASE,
  getAuthHeaders,
  authenticatedFetch,
  fetchJSON
};
