import axios from 'axios';

/**
 * Axios instance pre-configured for the Open Gaia backend.
 * Vite proxies /api/* → http://localhost:8000 in dev.
 */
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120_000, // world generation can take a while
});

export default api;
