import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
// Global styles / bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Create root and render App wrapped in AuthProvider
const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element not found. Ensure your index.html has <div id="root"></div>');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
