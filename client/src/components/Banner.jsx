import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

export default function Banner() {
  const navigate = useNavigate()
  return <section className="mx-3 flex max-w-6xl flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] px-8 pt-10 md:mx-auto md:flex-row md:pl-14">
    <div className="text-white"><h2 className="text-3xl font-medium">Your next trip starts here</h2><p className="mt-2">Browse cars managed by our rental team and request a booking online.</p><p className="max-w-xl">Choose your dates, compare available vehicles, and keep track of your request from your account.</p><button onClick={()=>navigate('/cars')} className="mt-4 rounded-lg bg-white px-6 py-2 text-sm text-primary">Browse cars</button></div>
    <img src={assets.banner_car_image} alt="Rental car" className="mt-10 max-h-48"/>
  </section>
}
