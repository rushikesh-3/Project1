import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import { getImageUrl } from '../utils/getImageUrl'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'

function MyBookings() {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { currency, axios, user, setShowLogin } = useAppContext()

  const fetchMyBooking = async () => {
    try {
      const { data } = await axios.get('/api/booking/user')
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setShowLogin(true)
      setLoading(false)
      return
    }
    fetchMyBooking()
  }, [user])

  if (loading) return <Loader />

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
      
      <Title
        title='My Booking'
        subTitle='View and manage all your car bookings'
        align="left"
      />

      {bookings.length === 0 ? (
        <p className='text-gray-500 mt-8'>You have no bookings yet.</p>
      ) : (
        <div>
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5'
            >
              
              <div className='md:col-span-1'>
                <div className='rounded-md overflow-hidden mb-3'>
                  <img
                    src={getImageUrl(booking.car.image)}
                    alt=""
                    className='w-full h-auto aspect-video object-cover'
                  />
                </div>

                <p className='text-lg font-medium mt-2'>
                  {booking.car.brand} {booking.car.model}
                </p>

                <p className='text-gray-500'>
                  {booking.car.year} • {booking.car.category} • {booking.car.location}
                </p>
              </div>

              <div className='md:col-span-2'>
                <div className='flex items-center gap-2'>
                  <p className='px-3 py-1.5 bg-light rounded'>
                    Booking #{index + 1}
                  </p>

                  <p
                    className={`px-3 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-400/15 text-green-600'
                        : 'bg-yellow-400/15 text-yellow-600'
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>
                <div className='flex item-start gap-3 mt-3'>
                  <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                
                  <div className='text-gray-500'>
                    <p>Rental Period</p>
                    <p>{new Date(booking.pickupDate).toISOString().split('T')[0]} To {new Date(booking.returnDate).toISOString().split('T')[0]}</p>
                  </div>
                </div>

                <div className='flex item-start gap-3 mt-3'>
                  <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                
                  <div className='text-gray-500'>
                    <p>Pickup Location</p>
                    <p>{booking.car.location}</p>
                  </div>
                </div>

              </div>

              <div className='md:col-span-1 flex flex-col justify-between gap-6'>

                <div className='text-sm text-gray-500 text-right'> 
                    <p>Total Price</p>
                    <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                    <p>Booked on {new Date(booking.createdAt).toISOString().split('T')[0]}</p>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
