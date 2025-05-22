// import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SlidePage from './pages/SlidePage'
import SignupPage   from './pages/SignupPage';
import LoginPage  from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ChatPage   from './pages/ChatPage'
import Profile from './pages/Profile'
import './App.css'

function App() {

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SlidePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/chatbot" element={<ChatPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
