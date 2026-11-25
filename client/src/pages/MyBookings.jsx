import React, { useCallback, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext.js'
import { getImageUrl } from '../utils/getImageUrl'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { currency, axios, user, authChecked, setShowLogin } = useAppContext()
  const fetchMyBooking = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/booking/user')
      if (data.success) setBookings(data.bookings)
      else toast.error(data.message)
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
    finally { setLoading(false) }
  }, [axios])

  useEffect(() => {
    if (!authChecked) return
    if (!user) { setShowLogin(true); setLoading(false); return }
    setLoading(true); fetchMyBooking()
  }, [authChecked, user, fetchMyBooking, setShowLogin])

  const cancel = async bookingId => {
    if (!window.confirm('Cancel this booking request?')) return
    try {
      const { data } = await axios.post('/api/booking/cancel', { bookingId })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message); fetchMyBooking()
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }
  if (loading) return <Loader />
  return <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
    <Title title='My Bookings' subTitle='View and manage your car bookings' align="left" />
    {bookings.length === 0 ? <p className='text-gray-500 mt-8'>You have no bookings yet.</p> : bookings.map((booking, index) => <article key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5'>
      <div className='md:col-span-1'><div className='rounded-md overflow-hidden mb-3'><img src={getImageUrl(booking.car?.image)} alt="" className='w-full aspect-video object-cover' /></div><p className='text-lg font-medium mt-2'>{booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Car listing removed'}</p><p className='text-gray-500'>{booking.car ? `${booking.car.year} • ${booking.car.category} • ${booking.car.location}` : 'Contact the rental team for details'}</p></div>
      <div className='md:col-span-2'><div className='flex items-center gap-2'><p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p><span className={`px-3 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.status}</span></div><div className='flex gap-3 mt-3'><img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/><div className='text-gray-500'><p>Rental Period</p><p>{new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}</p></div></div><div className='flex gap-3 mt-3'><img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/><div className='text-gray-500'><p>Pickup Location</p><p>{booking.car?.location || 'N/A'}</p></div></div></div>
      <div className='md:col-span-1 flex flex-col justify-between gap-4'><div className='text-sm text-gray-500 md:text-right'><p>Total Price</p><p className='text-2xl font-semibold text-primary'>{currency}{booking.price}</p><p>Pay at pickup</p><p>Booked {new Date(booking.createdAt).toLocaleDateString()}</p></div>{booking.status !== 'cancelled' && <button onClick={() => cancel(booking._id)} className="self-end border border-red-200 text-red-600 px-3 py-1 rounded">Cancel booking</button>}</div>
    </article>)}
  </div>
}
