const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authFetch = async (url: string, options: RequestInit = {}) => { 
    const token = localStorage.getItem("token");

    const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // Add a base URL if you have one, e.g., http://localhost:5000
  const fullUrl = `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;

  return fetch(fullUrl, {
    ...options,
    headers: headers,
  });
};