import React, {useState, useEffect} from 'react';
import MainPage from "./pages/MainPage"
import StartPage from './pages/StartPage';
import ChatBot from './pages/ChatBot';
import './App.css'
import { useDebugValue } from 'react';

function App() {

  const [page, setPage] = useState('start');

  useEffect(()=>{
    if(page === 'start'){
      const timer = setTimeout(()=>setPage('home'), 3000);
      return ()=> clearTimeout(timer);
    }  
  }, [page]);

  const goTo = (newPage) => {
    setPage(newPage);
  }

  const renderPage =()=>{
    switch (page) {
      case 'start':
        return <StartPage />;
      case 'chatbot':
        return <ChatBot goTo={goTo}/>;
      case 'main':
      default:
        return <MainPage goTo={goTo}/>;
    }
  }

  return (
      <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
