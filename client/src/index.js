import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Konfiguracja Axios
axios.defaults.baseURL = 'http://localhost:5000';

// Upewnij się, że element jest dostępny przed renderowaniem
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Element z ID "root" nie został znaleziony w dokumencie HTML');
  }
});