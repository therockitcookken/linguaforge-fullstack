export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://linguaforge-backend.onrender.com';

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
