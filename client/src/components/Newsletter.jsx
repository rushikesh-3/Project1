import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext.js'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const { axios } = useAppContext()
  const [email, setEmail] = useState('')
  const submit = async event => {
    event.preventDefault()
    try {
      const { data } = await axios.post('/api/user/subscribe', { email })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message); setEmail('')
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }
  return <section className="my-16 flex flex-col items-center justify-center space-y-2 px-4 text-center"><h2 className="text-2xl font-semibold md:text-4xl">Never miss a deal</h2><p className="pb-5 text-gray-500">Subscribe for car availability and rental updates.</p><form onSubmit={submit} className="flex h-12 w-full max-w-xl"><input className="h-full w-full rounded-l-md border border-gray-300 px-3 outline-none" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required/><button className="rounded-r-md bg-primary px-8 text-white">Subscribe</button></form></section>
}
