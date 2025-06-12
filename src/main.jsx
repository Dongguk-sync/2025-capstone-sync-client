// import lamejs from 'lamejs';
// window.Lame = { Mp3Encoder: lamejs.Mp3Encoder };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import React from 'react';
// import ReactDOM from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
