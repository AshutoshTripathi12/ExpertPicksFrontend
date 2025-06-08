// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css'; // This line imports your global styles, including Tailwind CSS directives
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <title>ExpertPicks</title>
    <App />
  </React.StrictMode>
);