import React, { useState, useContext } from "react";
import { assets } from "../assets/assets_frontend/assets";
import { Input } from "postcss";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

// import { set } from "mongoose";

export default function MyProfile() {
  const { userData, setUserData, backendUrl,token,loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image,setImage]=useState(false)

  const updateUserProfileData=async()=>{
    try {
      const formData=new FormData()
      formData.append('name',userData.name)
      formData.append('phone',userData.phone)
      formData.append('address',JSON.stringify(userData.address))
      formData.append('gender',userData.gender)
      formData.append('dob',userData.dob)

      image && formData.append('image',image)
      const {data}=await axios.post(backendUrl+'/api/user/update-profile',formData,{headers:{token}})
      if(data.success){
        toast.success("Profile updated successfully")
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // This check is crucial. Render a loading message or null until userData is available.
  // if (!userData) {
  //   return <div>Loading profile...</div>;
  // }

  return (
    <div className="max-w-lg flex-col gap-2 text-sm">
      {
        isEdit? <label htmlFor="image">
          <div className="inline-block relative cursor-pointer">
            <img className="max-w-36 rounded opacity-70" src={image?URL.createObjectURL(image):userData.image} alt="" />
            <img className="w-10 absolute bottom-12 right-12" src={image?'':assets.upload_icon} alt="" />
          </div>
          <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" hidden/>
        </label>:<img className="w-36 rounded" src={userData.image} alt="" />
      }
      
      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          value={userData.name}
          type="text"
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {userData.name}
        </p>
      )}

      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 mt-3 underline">CONTACT INFORMATION</p>
      </div>
      <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
        <p className="font-medium">Email id:</p>
        <p className="text-blue-500">{userData.email}</p>
        <p className="font-medium">Phone:</p>
        {isEdit ? (
          <input
            className="bg-gray-100 max-w-52"
            value={userData.phone}
            onChange={(e) => {
              setUserData((prev) => ({ ...prev, phone: e.target.value }));
            }}
          />
        ) : (
          <p className="text-blue-400">{userData.phone}</p>
        )}
        <p className="font-medium">Address</p>
        {isEdit ? (
          <>
            <p>
              <input
                className="bg-gray-50"
                type="text"
                value={userData.address?.line1}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
              <br />
              <input
                className="bg-gray-50"
                type="text"
                value={userData.address?.line2}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            </p>
          </>
        ) : (
          <p className="text-gray-500">
            {userData.address?.line1} <br /> {userData.address?.line2}
          </p>
        )}
      </div>
      <div>
        <p className="text-neutral-500 underline mt-3">Basic Information</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p>Gender</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              value={userData.gender}
              onChange={(e) => {
                setUserData((prev) => ({ ...prev, gender: e.target.value }));
              }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              value={userData.dob}
              type="date"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{userData.dob}</p>
          )}
        </div>

        <div className="mt-10">
          {isEdit ? (
            <button
              className="border bg-white border-blue-500 px-8 py-2 rounded-full  hover:bg-blue-700 hover:text-white transition-all duration-500"
              onClick={updateUserProfileData}
            >
              Save Information
            </button>
          ) : (
            <button className="border bg-white border-blue-500 px-8 py-2 rounded-full hover:bg-blue-700 hover:text-white" onClick={() => setIsEdit(true)}>Edit</button>
          )}
        </div>
      </div>
    </div>
  );
}