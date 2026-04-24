import axios from 'axios';

// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://subratha-a013.onrender.com';

// Configure default axios settings
axios.defaults.baseURL = API_BASE_URL;

// You can configure other default settings here if needed
// e.g., axios.defaults.withCredentials = true;

export default axios;
