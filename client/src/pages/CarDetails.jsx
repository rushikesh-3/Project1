import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext.js'
import { getImageUrl } from '../utils/getImageUrl'
import toast from 'react-hot-toast'

function CarDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { axios, user, setShowLogin, currency, pickupDate: sharedPickup, returnDate: sharedReturn } = useAppContext()
  const [car, setCar] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [pickupDate, setPickupDate] = useState(sharedPickup || '')
  const [returnDate, setReturnDate] = useState(sharedReturn || '')
  const [licenseNumber, setLicenseNumber] = useState('')

  useEffect(() => {
    let active = true
    axios.get(`/api/user/cars/${id}`).then(({ data }) => {
      if (!active) return
      if (data.success) setCar(data.car)
      else setNotFound(true)
    }).catch(() => { if (active) setNotFound(true) })
    return () => { active = false }
  }, [id, axios])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) { setShowLogin(true); return }
    if (returnDate <= pickupDate) { toast.error('Return date must be after pickup date'); return }
    try {
      const { data } = await axios.post('/api/booking/create', { car: id, pickupDate, returnDate, licenseNumber })
      if (data.success) { toast.success(data.message); navigate('/my-bookings') }
      else toast.error(data.message)
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }

  if (notFound) return <div className="px-6 py-20 text-center"><p>Car not found.</p><button onClick={() => navigate('/cars')} className="text-primary mt-4">Browse cars</button></div>
  if (!car) return <Loader />
  const features = car.features?.length ? car.features : ['Air Conditioning', 'Bluetooth', 'GPS']

  return <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
    <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'><img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />Back to cars</button>
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
      <div className='lg:col-span-2'>
        <img src={getImageUrl(car.image)} alt={`${car.brand} ${car.model}`} className='w-full md:max-h-96 object-cover rounded-xl mb-6 shadow-md' />
        <div className='space-y-6'>
          <div><h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1><p className='text-gray-500 text-lg'>{car.category} • {car.year}</p></div>
          <hr />
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>{[
            { icon: assets.users_icon, text: `${car.seating_capacity} Seats` }, { icon: assets.fuel_icon, text: car.fuel_type }, { icon: assets.car_icon, text: car.transmission }, { icon: assets.location_icon, text: car.location }
          ].map(({ icon, text }) => <div key={text} className='flex flex-col items-center bg-gray-100 p-4 rounded-lg'><img src={icon} alt="" className='h-5 mb-2' /><span>{text}</span></div>)}</div>
          <div><h2 className='text-xl font-medium mb-3'>Description</h2><p className='text-gray-500'>{car.description}</p></div>
          <div><h2 className='text-xl font-medium mb-3'>Features</h2><ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>{features.map(item => <li key={item} className='flex items-center text-gray-500'><img src={assets.check_icon} className='h-4 mr-2' alt="" />{item}</li>)}</ul></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-5 text-gray-500'>
        <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-500'>per day</span></p><hr />
        <label className='flex flex-col gap-2' htmlFor="pickup-date">Pickup Date<input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} required id="pickup-date" className='border border-borderColor px-3 py-2 rounded-lg' /></label>
        <label className='flex flex-col gap-2' htmlFor="return-date">Return Date<input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} min={pickupDate || new Date().toISOString().slice(0, 10)} required id="return-date" className='border border-borderColor px-3 py-2 rounded-lg' /></label>
        <label className='flex flex-col gap-2' htmlFor="license">Driving license number<input id="license" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} minLength={4} required className='border border-borderColor px-3 py-2 rounded-lg' /></label>
        {pickupDate && returnDate > pickupDate && <p className="text-gray-800">Estimated total: {currency}{car.pricePerDay * Math.max(1, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / 86400000))}</p>}
        <button className='w-full bg-primary hover:bg-primary-dull py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>
        <p className='text-center text-sm'>Payment is due at pickup.</p>
      </form>
    </div>
  </div>
}

export default CarDetails
