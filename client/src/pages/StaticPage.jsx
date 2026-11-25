import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext.js'

function StaticPage({ title, children }) {
  return <main className="max-w-4xl mx-auto px-6 py-16 text-gray-600"><h1 className="text-3xl font-semibold text-gray-900 mb-6">{title}</h1><div className="space-y-4 leading-7">{children}</div></main>
}

export const About = () => <StaticPage title="About CarRental"><p>CarRental helps people in Hyderabad find and request locally managed rental vehicles. The rental business maintains the fleet and handles bookings through its admin dashboard.</p></StaticPage>
export const Help = () => <StaticPage title="Help Center"><p>Choose a location and rental dates to find available cars. Open a car listing, enter your dates and driving-license number, then submit a booking request.</p><p>Bookings begin as pending. The rental team confirms or cancels requests in the website. Renters can cancel from My Bookings. Payment is due at pickup.</p><p><Link className="text-primary" to="/contact">Contact us</Link> if you need help.</p></StaticPage>
export const Terms = () => <StaticPage title="Terms of Service"><p>Customers must provide accurate account and booking information. The rental business maintains vehicle listings and confirms pickup arrangements. Renters are responsible for returning vehicles on the agreed date.</p><p>Reservations in this version are not charged online. Confirm pickup details with the rental team before the rental begins.</p></StaticPage>
export const Privacy = () => <StaticPage title="Privacy Policy"><p>The service stores account details, password hashes, profile images, vehicle listings, bookings, driving license numbers submitted with a booking, contact messages, and newsletter subscriptions to operate the service.</p><p>Passwords are hashed before storage. Contact and booking data is visible to the parties who need it to fulfill a rental.</p></StaticPage>
export const Insurance = () => <StaticPage title="Insurance"><p>Insurance is not purchased or verified through this application. Before pickup, renters should discuss the vehicle's existing coverage and verify applicable documents with the rental team.</p></StaticPage>

export const Contact = () => {
  const { axios } = useAppContext()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const submit = async event => {
    event.preventDefault()
    try {
      const { data } = await axios.post('/api/user/contact', form)
      if (!data.success) return toast.error(data.message)
      toast.success(data.message)
      setForm({ name: '', email: '', message: '' })
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }
  return <StaticPage title="Contact"><p>Send a message to the CarRental team.</p><form onSubmit={submit} className="max-w-xl flex flex-col gap-3"><input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded px-3 py-2"/><input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border rounded px-3 py-2"/><textarea required rows={5} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="border rounded px-3 py-2"/><button className="bg-primary text-white rounded px-4 py-2 w-max">Send message</button></form></StaticPage>
}
export const NotFound = () => <StaticPage title="Page not found"><p>That page does not exist. <Link className="text-primary" to="/">Return home</Link>.</p></StaticPage>
