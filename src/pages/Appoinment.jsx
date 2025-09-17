import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";


export default function Appointment() {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id == docId);
    setDocInfo(docInfo);
  };

  const checkSlotAvailability = async (slotDate, slotTime) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/check-slot-availability",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        return true;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getAvaiableSlots = async () => {
    setDocSlots([]);

    //getting current date
    let today = new Date();
    for (let i = 0; i < 7; i++) {
      // Getting date with index
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Setting end time of the date
      let endTime = new Date(currentDate);
      endTime.setDate(currentDate.getDate());
      endTime.setHours(21, 0, 0, 0);

      // Setting Hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // add slot to array
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }
    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;
      // console.log(slotDate)

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appoinments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetching slot availability whenever docSlots change
  useEffect(() => {
    const fetchAvailability = async () => {
      let availability = {};

      for (let i = 0; i < docSlots.length; i++) {
        const date = docSlots[i][0].datetime;
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        const slotDate = day + "_" + month + "_" + year;

        for (let slot of docSlots[i]) {
          const res = await checkSlotAvailability(slotDate, slot.time);
          availability[slotDate + "_" + slot.time] = res; // true/false
        }
      }

      setAvailableSlots(availability);
    };

    if (docSlots.length > 0) {
      fetchAvailability();
    }
  }, [docSlots]);

  // Fetching doctor info whenever docId or doctors list change

  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);
  // console.log(docInfo);

  // Fetching available slots whenever docInfo changes
  useEffect(() => {
    getAvaiableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/*........... Doctor Details .............*/}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-0 mt-[-80px] sm:mt-0">
            {/* ......... Name, Degree, Experience ........ */}
            <p className="flex text-gray-900 items-center text-xl gap-2">
              {docInfo.name}{" "}
              <img className="w-4" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree}-{docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xg rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* .......... Doctor About .......... */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appoinmnet fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {""}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* ......... Booking Slots ......... */}

        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  }`}
                  key={index}
                  onClick={() => setSlotIndex(index)}
                >
                  {item[0] != null && (
                    <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                  )}
                  {item[0] != null && <p>{item[0].datetime.getDate()}</p>}
                </div>
              ))}
          </div>
          <div className="flex gap-2 item-center overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <>
                  {docSlots.length > 0 &&
                    docSlots[slotIndex].map((item, index) => {
                      const date = docSlots[slotIndex][0].datetime;
                      const slotDate =
                        date.getDate() +
                        "_" +
                        (date.getMonth() + 1) +
                        "_" +
                        date.getFullYear();
                      const isAvailable =
                        availableSlots[slotDate + "_" + item.time];

                      return (
                        !isAvailable?"": (
                          <p
                            key={index}
                            onClick={() => setSlotTime(item.time)}
                            className={`text-sm font-light flex flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                              item.time === slotTime
                                ? "bg-primary text-white"
                                : "text-gray-800 border border-gray-200"
                            }`}
                          >
                            {item.time.toLowerCase()}
                          </p>
                        )
                      );
                    })}
                </>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm mt-4 font-light px-14 py-3 rounded-full"
          >
            Book an Appointment
          </button>
        </div>

        {/* Listing Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
}
