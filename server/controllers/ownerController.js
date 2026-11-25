import imageKit from "../configs/imageKit.js";
import User from "../models/User.js"
import Car from "../models/Car.js"
import fs from "fs"
import path from "path"
import Booking from "../models/Booking.js";

const uploadImage = async (imageFile, folder) => {
    const hasImageKit = process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY;

    if (hasImageKit) {
        try {
            const fileBuffer = fs.readFileSync(imageFile.path)
            const response = await imageKit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder
            })

            return imageKit.url({
                path: response.filePath,
                transformation: [
                    { width: folder === '/cars' ? '1280' : '400' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            })
        } catch (error) {
            console.log("ImageKit upload failed, using local file:", error.message)
        }
    }

    return `/uploads/${path.basename(imageFile.path)}`
}


//API to list Car

export const addCar = async (req,res)=>{
    try{
        const {_id} =req.user;
        let rawCarData;
        try {
            rawCarData = typeof req.body.carData === "string" ? JSON.parse(req.body.carData) : req.body.carData;
        } catch {
            return res.json({ success: false, message: "Invalid car data format" })
        }

        const imageFile=req.file;

        if(!imageFile){
            return res.status(400).json({success: false, message: "Car image is required"})
        }

        const {
            brand,
            model,
            year,
            pricePerDay,
            category,
            transmission,
            fuel_type,
            seating_capacity,
            location,
            description,
            features
        } = rawCarData || {};

        if (!brand || !model || !year || !pricePerDay || !category || !fuel_type || !transmission || !seating_capacity || !location || !description) {
            return res.status(400).json({ success: false, message: "Please fill in all required car fields" })
        }

        const image = await uploadImage(imageFile, '/cars')

        // Whitelist only legitimate Car fields to prevent mass assignment
        const safeCar = {
            owner: _id,
            brand: String(brand).trim(),
            model: String(model).trim(),
            year: Number(year),
            pricePerDay: Number(pricePerDay),
            category: String(category).trim(),
            transmission: String(transmission).trim(),
            fuel_type: String(fuel_type).trim(),
            seating_capacity: Number(seating_capacity),
            location: String(location).trim(),
            description: String(description).trim(),
            features: Array.isArray(features) ? features.map(f => String(f).trim()).filter(Boolean) : [],
            image,
            isAvailable: true
        }

        if (!Number.isInteger(safeCar.year) || safeCar.year < 1900 || safeCar.year > new Date().getFullYear() + 1 || !Number.isFinite(safeCar.pricePerDay) || safeCar.pricePerDay <= 0 || !Number.isInteger(safeCar.seating_capacity) || safeCar.seating_capacity < 1) {
            return res.status(400).json({ success: false, message: "Enter a valid year, positive daily price, and seat count" })
        }

        await Car.create(safeCar)

        res.status(201).json({success: true, message:"Car Added"})

    } catch(error){
        console.log(error.message);
        res.json({success:false,message: error.message})
    }
}

//API to List Owner Cars

export const getOwnerCars = async(req,res)=>{
    try{
        const {_id}=req.user;
        const cars = await Car.find({owner: _id})
        res.json({success: true, cars})
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//API Toggle to Car Availability
export const toggleCarAvailability =async(req,res) =>{
    try{
        const {_id}=req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId)
        if(!car){
            return res.status(404).json({ success:false, message: "Car not found"});
        }

        if(car.owner.toString()!==_id.toString()){
            return res.status(403).json({ success:false, message: "Unauthorized"});
        }

        car.isAvailable= !car.isAvailable;
        await car.save()

        res.json({success: true, message: "Availability Toggled"})
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


//API delete Car
export const deleteCar =async(req,res) =>{
    try{
        const {_id}=req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId)
        if(!car){
            return res.status(404).json({ success:false, message: "Car not found"});
        }

        if(car.owner.toString()!==_id.toString()){
            return res.status(403).json({ success:false, message: "Unauthorized"});
        }

        // Block deletion if the car has any active or upcoming bookings
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const activeBooking = await Booking.findOne({
            car: carId,
            status: { $in: ["pending", "confirmed"] },
            returnDate: { $gte: today }
        })
        if (activeBooking) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete car with active or upcoming bookings. Cancel all bookings first."
            })
        }

        await Car.findByIdAndDelete(carId)

        res.json({success: true, message: "Car Removed"})
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//API to get Dashboard Data
export const getDashboardData = async(req,res)=>{
    try{
        const {_id,role}=req.user;

        if(role !== 'admin'){
            return res.status(403).json({success: false, message: "Unauthorized"});
        }

        const cars=await Car.find({owner:_id})
        const bookings=await Booking.find({owner:_id}).populate('car').sort({createdAt: -1});

        const pendingBookings= await Booking.find({owner:_id,status:"pending"})
        const compleBookings= await Booking.find({owner:_id,status:"completed"})

        // Count completed rental value within this calendar month.
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthlyRevenue=bookings.filter(booking=>booking.status==='completed' && new Date(booking.updatedAt) >= monthStart).reduce((acc,booking)=> acc+booking.price,0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: compleBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({success:true, dashboardData});


    } catch(error){
        console.log(error.message)
        res.json({success: false,message: error.message})
    }
}

export const getOwnerCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" })
        }
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" })
        }
        res.json({ success: true, car })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" })
        }
        if (car.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" })
        }

        let rawUpdates;
        try {
            rawUpdates = typeof req.body.carData === "string" ? JSON.parse(req.body.carData) : req.body.carData;
        } catch {
            return res.status(400).json({ success: false, message: "Invalid car data format" })
        }

        // Whitelist allowed fields to prevent mass assignment / unauthorized field overwriting
        const allowedUpdates = {}
        if (rawUpdates?.brand !== undefined) allowedUpdates.brand = String(rawUpdates.brand).trim()
        if (rawUpdates?.model !== undefined) allowedUpdates.model = String(rawUpdates.model).trim()
        if (rawUpdates?.year !== undefined) allowedUpdates.year = Number(rawUpdates.year)
        if (rawUpdates?.pricePerDay !== undefined) allowedUpdates.pricePerDay = Number(rawUpdates.pricePerDay)
        if (rawUpdates?.category !== undefined) allowedUpdates.category = String(rawUpdates.category).trim()
        if (rawUpdates?.transmission !== undefined) allowedUpdates.transmission = String(rawUpdates.transmission).trim()
        if (rawUpdates?.fuel_type !== undefined) allowedUpdates.fuel_type = String(rawUpdates.fuel_type).trim()
        if (rawUpdates?.seating_capacity !== undefined) allowedUpdates.seating_capacity = Number(rawUpdates.seating_capacity)
        if (rawUpdates?.location !== undefined) allowedUpdates.location = String(rawUpdates.location).trim()
        if (rawUpdates?.description !== undefined) allowedUpdates.description = String(rawUpdates.description).trim()
        if (rawUpdates?.features !== undefined) {
            allowedUpdates.features = Array.isArray(rawUpdates.features) ? rawUpdates.features.map(f => String(f).trim()).filter(Boolean) : []
        }
        if (rawUpdates?.isAvailable !== undefined) {
            allowedUpdates.isAvailable = Boolean(rawUpdates.isAvailable)
        }

        if (req.file) {
            allowedUpdates.image = await uploadImage(req.file, "/cars")
        }

        if (allowedUpdates.year !== undefined && (!Number.isInteger(allowedUpdates.year) || allowedUpdates.year < 1900 || allowedUpdates.year > new Date().getFullYear() + 1)) {
            return res.status(400).json({ success: false, message: "Enter a valid vehicle year" })
        }
        if (allowedUpdates.pricePerDay !== undefined && (!Number.isFinite(allowedUpdates.pricePerDay) || allowedUpdates.pricePerDay <= 0)) {
            return res.status(400).json({ success: false, message: "Daily price must be greater than zero" })
        }
        if (allowedUpdates.seating_capacity !== undefined && (!Number.isInteger(allowedUpdates.seating_capacity) || allowedUpdates.seating_capacity < 1)) {
            return res.status(400).json({ success: false, message: "Seat count must be a positive whole number" })
        }

        await Car.findByIdAndUpdate(req.params.id, { $set: allowedUpdates })
        res.json({ success: true, message: "Car updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//API to update user image

export const updateUserImage = async (req,res)=>{
    try {
        const {_id} = req.user;

        const imageFile=req.file;

        if(!imageFile){
            return res.status(400).json({success: false, message: "Image is required"})
        }

        const image = await uploadImage(imageFile, '/users')

        await User.findByIdAndUpdate(_id,{image});
        res.json({success:true, message : "Image Updated"})
    } catch (error){
        console.log(error.message)
        res.status(500).json({success: false,message: error.message})
    }
}
