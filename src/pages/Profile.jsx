import Header from "../components/Header";
import Footer from "../components/Footer"
import MyAccount from "../components/MyAccount";
import Support from "../components/Support"
import React, {useState} from 'react';
//import React, {useState, useEffect} from 'react'
import './Profile.css'


export default function Profile() {
    const [selected, setSelected] = useState('account')
    
    return (
        <div className="layout-fixed">
            <Header />
            <div className="Profile">
                <div className="sideBar">
                    <div className="myInfo">
                        내정보
                        <button
                            className={selected==='account' ? 'active' :''}
                            onClick={()=>setSelected('account')}
                            >계정 관리</button>
                    </div>
                    <div className="myRecord">
                        학습
                        <button>백지 학습 기록</button>
                    </div>
                    <div className="CS">
                        고객지원
                        <button
                            className={selected==='support'?'active':''}
                            onClick={()=>setSelected('support')}
                            >고객지원</button>
                    </div>
                </div>

                <div className="profileContent">
                    {selected === 'account' && <MyAccount />}
                    {selected === 'support' && <Support />}
                </div>
            </div>
            <Footer />
        </div>
    )
}