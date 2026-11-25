import React, { useState } from 'react'
import { assets, adminMenuLinks } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.js'
import { getImageUrl } from '../../utils/getImageUrl'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { user, axios, fetchUser } = useAppContext()
  const location = useLocation()
  const [image, setImage] = useState(null)
  const updateImage = async () => {
    if (!image) return
    const form = new FormData(); form.append('image', image)
    try {
      const { data } = await axios.post('/api/admin/update-image', form)
      if (!data.success) return toast.error(data.message)
      toast.success(data.message); setImage(null); await fetchUser()
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }
  return <aside className="relative min-h-screen md:flex flex-col items-center pt-8 max-w-16 md:max-w-60 w-full border border-borderColor text-sm">
    <div className="group relative"><label htmlFor="admin-profile-image"><img src={image ? URL.createObjectURL(image) : getImageUrl(user?.image) || assets.user_profile} alt="Profile" className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover"/><input type="file" id="admin-profile-image" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} /><span className="absolute inset-0 hidden group-hover:flex items-center justify-center rounded-full bg-black/10"><img src={assets.edit_icon} alt="Change photo" width={20} /></span></label></div>
    {image && <button onClick={updateImage} className="mt-2 flex items-center gap-1 bg-primary/10 px-2 py-1 text-primary">Save<img src={assets.check_icon} width={13} alt="" /></button>}
    <p className="mt-2 text-base max-md:hidden">{user?.name}</p>
    <nav className="w-full">{adminMenuLinks.map(link => <NavLink key={link.path} to={link.path} end={link.path === '/admin'} className={({ isActive }) => `relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}><img src={location.pathname === link.path ? link.coloredIcon : link.icon} alt="" width={18}/><span className="max-md:hidden">{link.name}</span>{location.pathname === link.path && <span className="bg-primary w-1.5 h-8 rounded-l absolute right-0"/>}</NavLink>)}</nav>
  </aside>
}
