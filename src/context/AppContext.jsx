import { createContext, useEffect, useState } from "react";
// import Doctors from "../pages/Doctors";
import axios from 'axios'
import {toast} from 'react-toastify'
export const AppContext=createContext()

const AppContextProvider=(props)=>{

    const currencySymbol='$'
    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const [doctors,setDoctors]=useState([])
    const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
    const [userData,setUserData]=useState(false)

    const getDoctorsData=async()=>{
        try {
            
            const {data}=await axios.get(backendUrl+'/api/doctor/list')
            console.log(data)
            if(data.success==true){
                setDoctors(data.doctors)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData=async()=>{
        try {
            const {data}=await axios.get(backendUrl+'/api/user/get-profile',{headers:{token:token}})
            console.log(data)
            if(data.success){
                setUserData(data.userData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getDoctorsData()
        console.log(userData)
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }
        else{
            setUserData(false)
        }
    },[token])


    const value={
        doctors, currencySymbol, token,setToken,backendUrl,setUserData,userData,loadUserProfileData,getDoctorsData
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider