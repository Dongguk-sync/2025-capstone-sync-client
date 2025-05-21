import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SlidePage from './pages/SlidePage'
import SignupPage   from './pages/SignupPage';
import LoginPage  from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ChatBot from './pages/ChatBot';
import Profile from './pages/Profile'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SlidePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
