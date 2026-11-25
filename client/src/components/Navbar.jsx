import React, { useState } from "react"
import { assets, menuLinks } from "../assets/assets"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext.js"

export default function Navbar() {
  const { setShowLogin, user, logout, isAdmin } = useAppContext()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const search = event => {
    event.preventDefault()
    const query = event.currentTarget.elements.namedItem('car-search').value.trim()
    navigate(query ? `/cars?q=${encodeURIComponent(query)}` : '/cars')
    setOpen(false)
  }
  return <header className={`relative flex items-center justify-between border-b border-borderColor px-6 py-4 text-gray-600 md:px-16 lg:px-24 xl:px-32 ${location.pathname === '/' ? 'bg-light' : ''}`}>
    <Link to="/" aria-label="DriveDesk home" className="text-xl font-bold tracking-tight text-primary">DriveDesk</Link>
    <nav className={`max-sm:fixed max-sm:right-0 max-sm:top-16 max-sm:z-40 max-sm:h-screen max-sm:w-full max-sm:flex-col max-sm:items-start max-sm:border-t max-sm:border-borderColor max-sm:p-5 ${location.pathname === '/' ? 'max-sm:bg-light' : 'max-sm:bg-white'} flex items-center gap-4 sm:gap-8 ${open ? 'max-sm:flex' : 'max-sm:hidden'}`}>
      {menuLinks.map(link=><Link key={link.path} to={link.path} onClick={()=>setOpen(false)}>{link.name}</Link>)}
      <form onSubmit={search} className="hidden items-center gap-2 rounded-full border border-borderColor px-3 text-sm lg:flex"><input name="car-search" placeholder="Search cars" className="w-36 bg-transparent py-1.5 outline-none"/><button aria-label="Search cars" type="submit"><img src={assets.search_icon} alt=""/></button></form>
      {isAdmin && <Link to="/admin" onClick={()=>setOpen(false)} className="cursor-pointer">Admin dashboard</Link>}
      <button onClick={()=>{ user ? logout() : setShowLogin(true); setOpen(false) }} className="rounded-lg bg-primary px-6 py-2 text-white">{user ? 'Log out' : 'Login'}</button>
    </nav>
    <button className="cursor-pointer sm:hidden" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}><img src={open ? assets.close_icon : assets.menu_icon} alt=""/></button>
  </header>
}
