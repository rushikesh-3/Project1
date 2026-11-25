import React from "react";
import { assets, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext.js";
import toast from "react-hot-toast";

function Hero() {
  const { pickupLocation, setPickupLocation, pickupDate, setPickupDate, returnDate, setReturnDate, searchAvailableCars, navigate } = useAppContext();
  const today = new Date().toISOString().slice(0, 10);

  const onSearch = async (event) => {
    event.preventDefault();
    if (!pickupLocation || !pickupDate || !returnDate || returnDate <= pickupDate) {
      toast.error("Choose a location and valid pickup and return dates");
      return;
    }
    await searchAvailableCars({ location: pickupLocation, pickupDate, returnDate });
    navigate(`/cars?location=${encodeURIComponent(pickupLocation)}&pickup=${pickupDate}&return=${returnDate}`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center gap-12 bg-light text-center px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-semibold">Luxury cars on Rent</h1>
      <form onSubmit={onSearch} className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl md:rounded-full w-full max-w-4xl bg-white shadow-lg">
        <label className="flex flex-col items-start gap-2">Pickup Location
          <select required value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="text-sm text-gray-600 outline-none">
            <option value="">Select a location</option>{cityList.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label className="flex flex-col items-start gap-2">Pickup Date
          <input type="date" min={today} value={pickupDate} onChange={e => { setPickupDate(e.target.value); if (returnDate && e.target.value >= returnDate) setReturnDate(""); }} required className="text-sm text-gray-600" />
        </label>
        <label className="flex flex-col items-start gap-2">Return Date
          <input type="date" min={pickupDate || today} value={returnDate} onChange={e => setReturnDate(e.target.value)} required className="text-sm text-gray-600" />
        </label>
        <button type="submit" className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer">
          <img src={assets.search_icon} alt="" className="brightness-300" />Search
        </button>
      </form>
      <img src={assets.main_car} alt="Rental car" className="max-h-72 object-contain" />
    </div>
  );
}

export default Hero;
