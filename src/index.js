import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // For Tailwind CSS styles
import App from './App';
// Optional: If you use reportWebVitals
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional:
// reportWebVitals();
