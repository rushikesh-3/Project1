import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="mt-24 px-6 text-sm text-gray-600 md:px-16 lg:px-24 xl:px-32"><div className="flex flex-wrap justify-between gap-10 border-b border-borderColor pb-8">
    <div><Link to="/" aria-label="DriveDesk home" className="text-xl font-bold tracking-tight text-primary">DriveDesk</Link><p className="mt-3 max-w-80">Explore the rental fleet, request a car online, and manage your bookings in one place.</p><div className="mt-5 flex gap-3"><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><img src={assets.facebook_logo} className="h-5 w-5" alt=""/></a><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><img src={assets.instagram_logo} className="h-5 w-5" alt=""/></a><a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><img src={assets.twitter_logo} className="h-5 w-5" alt=""/></a><Link to="/contact" aria-label="Email"><img src={assets.gmail_logo} className="h-5 w-5" alt=""/></Link></div></div>
    <div><h2 className="font-medium uppercase text-gray-800">Explore</h2><ul className="mt-3 space-y-2"><li><Link to="/">Home</Link></li><li><Link to="/cars">Browse cars</Link></li><li><Link to="/my-bookings">My bookings</Link></li><li><Link to="/about">About</Link></li><li><Link to="/contact">Contact</Link></li></ul></div>
    <div><h2 className="font-medium uppercase text-gray-800">Information</h2><ul className="mt-3 space-y-2"><li><Link to="/help">Help center</Link></li><li><Link to="/terms">Terms of service</Link></li><li><Link to="/privacy">Privacy policy</Link></li><li><Link to="/insurance">Insurance</Link></li></ul></div>
    <div><h2 className="font-medium uppercase text-gray-800">Contact</h2><ul className="mt-3 space-y-2"><li>Hyderabad, Telangana</li><li><Link to="/contact">Send us a message</Link></li></ul></div>
  </div><div className="flex justify-center py-5">© {new Date().getFullYear()} DriveDesk. All rights reserved.</div></footer>
}
