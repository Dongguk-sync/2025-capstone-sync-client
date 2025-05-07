import Header from "./components/Header"
import Footer from "./components/Footer"
import Calender from "./components/Calender"
import Notice from "./components/Noitce"
import TodayTodo from "./components/TodayTodo"

import './App.css'

function App() {

  return (
    <div className="App">
      <Header />
      <Notice />
      <div className="cal_todo">
        <Calender />
        <TodayTodo />
      </div>
      <Footer />
    </div>
  )
}

export default App
