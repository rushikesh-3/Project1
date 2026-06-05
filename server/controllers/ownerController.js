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


//API to Change Role of User
export const changeRoleToOwner = async (req,res)=>{
    try{
        const {_id}=req.user;
        await User.findByIdAndUpdate(_id,{role: "owner"})
        res.json({success:true,message: "Now you can list cars"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message: error.message})
    }
}

//API to list Car

export const addCar = async (req,res)=>{
    try{
        const {_id} =req.user;
        let car=JSON.parse(req.body.carData);
        const imageFile=req.file;

        if(!imageFile){
            return res.json({success: false, message: "Car image is required"})
        }

        const image = await uploadImage(imageFile, '/cars')
        await Car.create({...car, owner: _id, image})

        res.json({success: true, message:"Car Added"})

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

        //checking is car belongs to the user
        if(car.owner.toString()!==_id.toString()){
            return res.json({ success:false, message: "Unauthorized"});
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

        //checking is car belongs to the user
        if(car.owner.toString()!==_id.toString()){
            return res.json({ success:false, message: "Unauthorized"});
        }

        car.owner= null;
        car.isAvailable=false;

        await car.save()

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

        if(role!='owner'){
            return res.json({success: false, message: "Unauthorized"});
        }

        const cars=await Car.find({owner:_id})
        const bookings=await Booking.find({owner:_id}).populate('car').sort({createdAt: -1});

        const pendingBookings= await Booking.find({owner:_id,status:"pending"})
        const compleBookings= await Booking.find({owner:_id,status:"confirmed"})

        //Calculate monthly revenue from bookings where status is confirmed
        const monthlyRevenue=bookings.slice().filter(booking=>booking.status==='confirmed').reduce((acc,booking)=> acc+booking.price,0)

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

//API to update user image

export const updateUserImage = async (req,res)=>{
    try {
        const {_id} = req.user;

        const imageFile=req.file;

        if(!imageFile){
            return res.json({success: false, message: "Image is required"})
        }

        const image = await uploadImage(imageFile, '/users')

        await User.findByIdAndUpdate(_id,{image});
        res.json({success:true, message : "Image Updated"})
    } catch (error){
        console.log(error.message)
        res.json({success: false,message: error.message})
    }
}