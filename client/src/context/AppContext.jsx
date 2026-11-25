import { useCallback, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext.js";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppProvider = ({children})=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY
    
    const [token,setToken] = useState(() => localStorage.getItem('token'))
    const [user,setUser] = useState(null)
    const [isAdmin,setIsAdmin] = useState(false)
    const [authChecked,setAuthChecked] = useState(false)
    const [showLogin,setShowLogin] = useState(false)
    const [pickupLocation,setPickupLocation] = useState('')
    const [pickupDate,setPickupDate] = useState('')
    const [returnDate,setReturnDate] = useState('')
    const [searchQuery,setSearchQuery] = useState('')
 
    const [cars,setCars] = useState([])

    //Function to check if user is logged in
    const fetchUser = useCallback(async ()=>{
        try{
            const {data} = await axios.get('/api/user/data')

            if(data.success){
                setUser(data.user)
                setIsAdmin(data.user.isAdmin === true)
            } else{
                setUser(null)
                setIsAdmin(false)
            }
        }catch (error){
            toast.error(error.message)
        } finally {
            setAuthChecked(true)
        }
    }, [])
    //Function to fetch all cars from the server
    const fetchCars = useCallback(async () =>{
        try{
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch(error){
            toast.error(error.message)
        }
    }, [])
    //Function to log out the user
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsAdmin(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('you have been logged out')
    }

    //Useeffect to retrieve the token from localStorage
    useEffect(()=>{
        const storedToken = localStorage.getItem('token')
        setToken(storedToken)
        fetchCars()
    },[fetchCars])

    //Useeffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            setAuthChecked(false)
            axios.defaults.headers.common['Authorization']= `Bearer ${token}`
            fetchUser()
        } else {
            axios.defaults.headers.common['Authorization'] = ''
            setUser(null)
            setIsAdmin(false)
            setAuthChecked(true)
        }
    },[token, fetchUser])


    const searchAvailableCars = useCallback(async ({ location, pickupDate: start, returnDate: end } = {}) => {
        try {
            const { data } = await axios.post('/api/booking/check-availability', {
                location: location || pickupLocation,
                pickupDate: start || pickupDate,
                returnDate: end || returnDate
            })
            if (data.success) {
                setCars(data.availableCars)
                return data.availableCars
            }
            setCars([])
            toast.error(data.message)
            return []
        } catch (error) {
            setCars([])
            toast.error(error.response?.data?.message || error.message)
            return []
        }
    }, [pickupLocation, pickupDate, returnDate])

    const value = {
        navigate,currency,axios,user,setUser,token,setToken,
        isAdmin,authChecked,fetchUser,showLogin,setShowLogin,logout,
        fetchCars,cars,setCars,pickupDate,setPickupDate,returnDate,setReturnDate,
        pickupLocation,setPickupLocation,searchQuery,setSearchQuery,searchAvailableCars
    }
       
    return (
    <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
    )
}
