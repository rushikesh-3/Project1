import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext.js'
import { assets, cityList, carFeatures } from '../../assets/assets'
import Title from '../../components/owner/Title'
import Loader from '../../components/Loader'
import { getImageUrl } from '../../utils/getImageUrl'

const blank = { brand: '', model: '', year: '', pricePerDay: '', category: '', transmission: 'Automatic', fuel_type: '', seating_capacity: '', location: '', description: '', features: [] }

export default function EditCar() {
  const { id } = useParams()
  const { axios, fetchCars } = useAppContext()
  const navigate = useNavigate()
  const [car, setCar] = useState(blank)
  const [oldImage, setOldImage] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    axios.get(`/api/admin/cars/${id}`).then(({ data }) => {
      if (!active) return
      if (!data.success) { toast.error(data.message); navigate('/admin/manage-cars'); return }
      const c = data.car
      setCar({ brand: c.brand || '', model: c.model || '', year: c.year || '', pricePerDay: c.pricePerDay || '', category: c.category || '', transmission: c.transmission || 'Automatic', fuel_type: c.fuel_type || '', seating_capacity: c.seating_capacity || '', location: c.location || '', description: c.description || '', features: c.features || [] })
      setOldImage(c.image)
    }).catch(error => toast.error(error.response?.data?.message || error.message)).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, axios, navigate])

  const submit = async event => {
    event.preventDefault()
    try {
      const form = new FormData()
      form.append('carData', JSON.stringify({ ...car, year: Number(car.year), pricePerDay: Number(car.pricePerDay), seating_capacity: Number(car.seating_capacity) }))
      if (image) form.append('image', image)
      const { data } = await axios.post(`/api/admin/update-car/${id}`, form)
      if (!data.success) return toast.error(data.message)
      toast.success(data.message)
      await fetchCars()
      navigate('/admin/manage-cars')
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }

  if (loading) return <Loader />
  return <section className="flex-1 px-4 py-10 md:px-10"><Title title="Edit car" subTitle="Update the details shown to renters."/><form onSubmit={submit} className="mt-6 max-w-2xl flex flex-col gap-5 text-sm text-gray-600">
    <label className="flex gap-3 items-center"><img src={image ? URL.createObjectURL(image) : getImageUrl(oldImage) || assets.upload_icon} alt="Car" className="h-16 w-24 rounded object-cover"/><span>Change image<input type="file" accept="image/*" className="block mt-1" onChange={e => setImage(e.target.files?.[0] || null)} /></span></label>
    <div className="grid sm:grid-cols-2 gap-4">{[['brand','Brand'],['model','Model'],['year','Year'],['pricePerDay','Daily price'],['seating_capacity','Seats']].map(([key,label])=><label key={key}>{label}<input required type={['year','pricePerDay','seating_capacity'].includes(key)?'number':'text'} min={['year','pricePerDay','seating_capacity'].includes(key)?1:undefined} value={car[key]} onChange={e=>setCar({...car,[key]:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"/></label>)}
    <label>Category<select required value={car.category} onChange={e=>setCar({...car,category:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"><option value="">Choose</option><option>Sedan</option><option>SUV</option><option>Van</option></select></label>
    <label>Transmission<select value={car.transmission} onChange={e=>setCar({...car,transmission:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"><option>Automatic</option><option>Manual</option><option>Semi-Automatic</option></select></label>
    <label>Fuel type<select required value={car.fuel_type} onChange={e=>setCar({...car,fuel_type:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"><option value="">Choose</option>{['Petrol','Gas','Diesel','Electric','Hybrid'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Location<select required value={car.location} onChange={e=>setCar({...car,location:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"><option value="">Choose</option>{cityList.map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label>Description<textarea required rows={4} value={car.description} onChange={e=>setCar({...car,description:e.target.value})} className="block w-full mt-1 border rounded px-3 py-2"/></label>
    <fieldset><legend className="mb-2">Features</legend><div className="grid grid-cols-2 gap-2">{carFeatures.map(feature=><label key={feature} className="flex items-center gap-2"><input type="checkbox" checked={car.features.includes(feature)} onChange={()=>setCar({...car,features:car.features.includes(feature)?car.features.filter(item=>item!==feature):[...car.features,feature]})}/>{feature}</label>)}</div></fieldset>
    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-md w-max"><img src={assets.tick_icon} alt=""/>Save changes</button>
  </form></section>
}
