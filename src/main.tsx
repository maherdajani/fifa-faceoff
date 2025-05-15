import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { syncOfflineActions } from './utils/offlineStorage'

// Register service worker and handle offline sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/serviceWorker.js', { scope: '/' })
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for offline actions when coming online
        window.addEventListener('online', () => {
          syncOfflineActions();
        });
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
