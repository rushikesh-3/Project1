import React, { useCallback, useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext.js'
import { getImageUrl } from '../../utils/getImageUrl'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

export default function ManageBookings() {
  const currency = import.meta.env.VITE_CURRENCY
  const { axios } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/booking/admin')
      if (data.success) setBookings(data.bookings)
      else toast.error(data.message)
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
    finally { setLoading(false) }
  }, [axios])
  useEffect(() => { fetchBookings() }, [fetchBookings])
  const changeStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/booking/change-status', { bookingId, status })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message); fetchBookings()
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }
  if (loading) return <Loader />
  return <section className="w-full px-4 py-10 md:px-10"><Title title="Manage Bookings" subTitle="Review requests, renter details, and rental status." />
    {bookings.length === 0 ? <p className="mt-6 text-gray-500">No bookings yet.</p> : <div className="mt-6 w-full max-w-5xl overflow-x-auto rounded-md border border-borderColor"><table className="w-full border-collapse text-left text-sm text-gray-600"><thead><tr>{['Car / renter','Rental dates','License','Total','Payment','Status'].map(x=><th key={x} className="p-3 font-medium">{x}</th>)}</tr></thead><tbody>
      {bookings.map(booking=><tr key={booking._id} className="border-t border-borderColor align-top"><td className="p-3"><div className="flex items-center gap-3"><img src={getImageUrl(booking.car?.image)} alt="" className="h-12 w-12 rounded object-cover"/><div><p className="font-medium">{booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Car removed'}</p><p>{booking.user?.name || 'Renter'}</p><p className="text-xs">{booking.user?.email}</p></div></div></td><td className="whitespace-nowrap p-3">{new Date(booking.pickupDate).toLocaleDateString()} – {new Date(booking.returnDate).toLocaleDateString()}</td><td className="p-3">{booking.licenseNumber || 'Not provided'}</td><td className="whitespace-nowrap p-3">{currency}{booking.price}</td><td className="p-3"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{booking.paymentStatus === 'pay_at_pickup' ? 'Pay at pickup' : booking.paymentStatus}</span></td><td className="p-3">{booking.status === 'pending' ? <select value={booking.status} onChange={e=>changeStatus(booking._id,e.target.value)} className="rounded border px-2 py-1"><option value="pending">Pending</option><option value="confirmed">Confirm</option><option value="cancelled">Cancel</option></select> : booking.status === 'confirmed' ? <select value={booking.status} onChange={e=>changeStatus(booking._id,e.target.value)} className="rounded border px-2 py-1"><option value="confirmed">Confirmed</option><option value="completed">Mark completed</option><option value="cancelled">Cancel</option></select> : <span className={`rounded-full px-2 py-1 text-xs ${booking.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{booking.status}</span>}</td></tr>)}
    </tbody></table></div>}
  </section>
}
