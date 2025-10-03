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
  const [docSlots, setDocSlots] = useState([]); // slots for 7 days
  const [slotIndex, setSlotIndex] = useState(0); // selected day index
  const [slotTime, setSlotTime] = useState(""); // selected time
  const [availableSlots, setAvailableSlots] = useState({}); // availability for selected day only

  // ---------- Fetch doctor info ----------
  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  // ---------- Check slot availability ----------
  const checkSlotAvailability = async (slotDate, slotTime) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/check-slot-availability",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      return data.success; // true/false
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return false;
    }
  };

  // ---------- Generate slots for next 7 days ----------
  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 5 ? currentDate.getHours() + 1 : 5
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(5);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  };

  // ---------- Fetch availability for selected day only ----------
  const fetchAvailabilityForDay = async (dayIndex) => {
    if (!docSlots[dayIndex]) return;

    const date = docSlots[dayIndex][0].datetime;
    const slotDate =
      date.getDate() + "_" + (date.getMonth() + 1) + "_" + date.getFullYear();

    const results = await Promise.all(
      docSlots[dayIndex].map((slot) =>
        checkSlotAvailability(slotDate, slot.time).then((res) => ({
          key: slotDate + "_" + slot.time,
          value: res,
        }))
      )
    );

    let availability = {};
    results.forEach(({ key, value }) => {
      availability[key] = value;
    });
    setAvailableSlots(availability);
  };

  // ---------- Book appointment ----------
  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const slotDate =
        date.getDate() + "_" + (date.getMonth() + 1) + "_" + date.getFullYear();

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

  // ---------- Effects ----------
  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);

  // fetch availability when user changes day
  useEffect(() => {
    fetchAvailabilityForDay(slotIndex);
    setSlotTime(""); // reset when switching day
  }, [slotIndex, docSlots]);

  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-0 mt-[-80px] sm:mt-0">
            <p className="flex text-gray-900 items-center text-xl gap-2">
              {docInfo.name}
              <img className="w-4" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xg rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.map((item, index) => (
              <div
                key={index}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? "bg-primary text-white"
                    : "border border-gray-200"
                }`}
                onClick={() => setSlotIndex(index)}
              >
                <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 item-center overflow-x-scroll mt-4">
            {docSlots[slotIndex] &&
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
                  isAvailable && (
                    <p
                      key={index}
                      onClick={() => setSlotTime(item.time)}
                      className={`text-sm font-light flex flex-shrink-0 px-5 py-2 rounded-full cursor-pointer
                        ${
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
          </div>

          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm mt-4 font-light px-14 py-3 rounded-full"
          >
            Book an Appointment
          </button>
        </div>

        {/* Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
}
