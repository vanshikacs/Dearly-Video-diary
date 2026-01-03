import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initDB } from './utils/db';

// Initialize database
initDB().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);