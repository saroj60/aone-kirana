/**
 * Central API Configuration
 * Dynamically resolves to current host so mobile devices and other computers on the same network connect seamlessly.
 */

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When accessed from another device (e.g. mobile phone, tablet, other PC on LAN)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5005/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
};

export const API_BASE_URL = getApiBaseUrl();
