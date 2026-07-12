import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/js/main.js';

// Font Awesome — chargé globalement via npm (plus fiable que CDN avec Vite)
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
