import Header from "../components/Header"
import Footer from "../components/Footer"
import Calender from "../components/Calender"
import Notice from "../components/Noitce"


export default function MainPage({goTo}) {

  return (
    <div className="Main">
      <Header goTo={goTo}/>
      <Notice />
      <div className="cal_todo">
        <Calender />
      </div>
      <Footer />
    </div>
  )
}
