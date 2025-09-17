import React from "react";
import { assets } from "../assets/assets_frontend/assets";

export default function Footer() {
  return (
    <div className="md:mx-10 ">
      {/* Left Section */}
      <div className=" sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm">
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur
            aperiam est, neque unde iste beatae itaque libero dignissimos
            aliquam, praesentium illum asperiores dolor?
          </p>
        </div>

        {/* Center Section */}
        <div className="">
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* Right Section */}
        <div>
          <div>
            <p className="text-xl font-medium mb-5">Get IN Touch</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>987968</li>
              <li>email@gmail.com</li>
            </ul>
          </div>
        </div>
        
      </div>
      <div className="text-center">Copyright 2024@Prescripto - All Right Reserved</div>
    </div>
  );
}
