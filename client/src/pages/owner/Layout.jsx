import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { useAppContext } from '../../context/AppContext.js'
import Loader from '../../components/Loader'

export default function Layout() {
  const { user, isAdmin, authChecked, setShowLogin } = useAppContext()
  const navigate = useNavigate()
  useEffect(() => {
    if (!authChecked) return
    if (!user) { setShowLogin(true); navigate('/'); return }
    if (!isAdmin) navigate('/')
  }, [authChecked, user, isAdmin, navigate, setShowLogin])
  if (!authChecked || !user || !isAdmin) return <Loader />
  return <div className="flex flex-col"><NavbarOwner /><div className="flex"><Sidebar /><Outlet /></div></div>
}
