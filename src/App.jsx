// import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SlidePage from './pages/SlidePage'
import SignupPage   from './pages/SignupPage';
import LoginPage  from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ChatPage   from './pages/ChatPage'
import Profile from './pages/Profile'
import './App.css'

import DocumentManagementPage   from './pages/DocumentManagementPage'
import FeedbackPage from './pages/FeedbackPage';
import DocumentViewPage from './pages/DocumentViewPage';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SlidePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/management"   element={<DocumentManagementPage />} />
          {/* /feedback/:docId 로 들어오면 FeedbackPage 렌더링 */}
          <Route path="/feedback/:docId/:historyIndex" element={<FeedbackPage />} />
          <Route path="/document/:docId" element={<DocumentViewPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
