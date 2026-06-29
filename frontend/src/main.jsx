/**
 * main.jsx — React Application Entry Point
 *
 * Responsibilities:
 *  - Mount React app to #root DOM node
 *  - Import global styles (index.css)
 *  - Wrap App with React.StrictMode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

