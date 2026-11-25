import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.js'

export default function NavbarOwner() {
  const { user, logout } = useAppContext()
  return <div className="flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor">
    <Link to="/"><img src={assets.logo} alt="CarRental" className="h-7" /></Link>
    <div className="flex items-center gap-4"><p>Admin: {user?.name || 'Administrator'}</p><button onClick={logout} className="text-primary">Log out</button></div>
  </div>
}
