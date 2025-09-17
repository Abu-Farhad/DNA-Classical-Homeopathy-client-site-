import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import Contact from './pages/Contact'
import MyAppointments from './pages/MyAppointments'
import Appoinment from './pages/Appoinment'
import Navbar from '../src/components/Navbar'
import Footer from './components/Footer'
import {ToastContainer,toast} from 'react-toastify'

export default function App() {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar/>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/doctors' element={<Doctors/>}/>
        <Route path='/doctors/:speciality' element={<Doctors/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/my-profile' element={<MyProfile/>}/>
        <Route path='/my-appoinments' element={<MyAppointments/>}/>
        <Route path='/appoinment/:docId' element={<Appoinment/>}/>
      </Routes>
      <Footer/>
    </div>
  )
}
