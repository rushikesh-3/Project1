import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import { getImageUrl } from '../utils/getImageUrl'
import toast from 'react-hot-toast'

function CarDetails() {

  const { id } = useParams()
  const navigate = useNavigate()
  const { cars, fetchCars, axios, user, setShowLogin, currency } = useAppContext()
  const [car, setCar] = useState(null)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a car')
      setShowLogin(true)
      return
    }

    if (returnDate <= pickupDate) {
      toast.error('Return date must be after pickup date')
      return
    }

    try {
      const { data } = await axios.post('/api/booking/create', {
        car: id,
        pickupDate,
        returnDate
      })

      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (cars.length === 0) fetchCars()
  }, [])

  useEffect(() => {
    const foundCar = cars.find(c => c._id === id)
    setCar(foundCar || null)
  }, [id, cars])

  if (!car) return <Loader />

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'
      >
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>

        <div className='lg:col-span-2'>
          <img
            src={getImageUrl(car.image)}
            alt=""
            className='w-full md:max-h-96 object-cover rounded-xl mb-6 shadow-md'
          />

          <div className='space-y-6'>

            <div>
              <h1 className='text-3xl font-bold'>
                {car.brand} {car.model}
              </h1>
              <p className='text-gray-500 text-lg'>
                {car.category} • {car.year}
              </p>
            </div>

            <hr className='my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location }
              ].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-gray-100 p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className='text-xl font-medium mb-3'>Description</h2>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            <div>
              <h2 className='text-xl font-medium mb-3'>Features</h2>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"]
                  .map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

          </div>
        </div>

        <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay} <span className='text-base text-gray-500'>per day</span></p>
          <hr className='border-borderColor my-6'/>

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className='border border-borderColor px-3 py-2 rounded-lg ' required id='pickup-date' min={new Date().toISOString().split('T')[0]}/>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className='border border-borderColor px-3 py-2 rounded-lg ' required id='return-date' min={pickupDate || new Date().toISOString().split('T')[0]}/>
          </div>

          <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>
            Book Now
          </button>
          
          <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>
          
      </div>
    </div>
  );
}

export default CarDetails
