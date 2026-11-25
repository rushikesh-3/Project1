import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Title from "../components/Title"
import { assets } from '../assets/assets'
import CarCard from "../components/CarCard"
import { useAppContext } from '../context/AppContext.js'

const Cars = () => {
  const { cars, fetchCars, searchAvailableCars, setPickupLocation, setPickupDate, setReturnDate } = useAppContext()
  const [params, setParams] = useSearchParams()
  const location = params.get('location')
  const pickup = params.get('pickup')
  const ret = params.get('return')
  const input = params.get('q') || ''
  const [category, setCategory] = useState('')
  const [fuel, setFuel] = useState('')

  useEffect(() => {
    if (location) setPickupLocation(location)
    if (pickup) setPickupDate(pickup)
    if (ret) setReturnDate(ret)
    if (location && pickup && ret) searchAvailableCars({ location, pickupDate: pickup, returnDate: ret })
    else fetchCars()
  }, [location, pickup, ret, fetchCars, searchAvailableCars, setPickupDate, setPickupLocation, setReturnDate])

  const updateSearch = value => setParams(current => {
    const next = new URLSearchParams(current)
    if (value) next.set('q', value)
    else next.delete('q')
    return next
  }, { replace: true })

  const filteredCars = useMemo(() => cars.filter(car => {
    const query = input.trim().toLowerCase()
    const matchesText = !query || [car.brand, car.model, car.category, car.location].some(value => value?.toLowerCase().includes(query))
    return matchesText && (!category || car.category === category) && (!fuel || car.fuel_type === fuel)
  }), [cars, input, category, fuel])

  return <div>
    <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
      <Title title="Available Cars" subTitle="Browse vehicles available for your next trip" />
      <div className='flex flex-wrap items-center gap-3 bg-white px-4 mt-6 max-w-3xl w-full min-h-12 rounded-2xl shadow'>
        <img src={assets.search_icon} alt="" className='w-4 h-4' />
        <input onChange={e => updateSearch(e.target.value)} value={input} type="search" placeholder="Search brand, model or location" className='flex-1 min-w-40 outline-none text-gray-600' />
        <select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)} className="border-l pl-2 bg-transparent outline-none"><option value="">All types</option><option>Sedan</option><option>SUV</option><option>Van</option></select>
        <select aria-label="Filter by fuel" value={fuel} onChange={e => setFuel(e.target.value)} className="border-l pl-2 bg-transparent outline-none"><option value="">All fuel</option><option>Petrol</option><option>Gas</option><option>Diesel</option><option>Electric</option><option>Hybrid</option></select>
      </div>
    </div>
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
      <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} cars</p>
      {filteredCars.length === 0 ? <p className='text-gray-500 text-center mt-10'>No cars match these filters.</p> : <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>{filteredCars.map(car => <CarCard key={car._id} car={car} />)}</div>}
    </div>
  </div>
}

export default Cars
