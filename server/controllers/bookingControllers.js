import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { findConfiguredAdmin, isConfiguredAdmin } from "../configs/admin.js";

// Concurrency lock map per car ID to prevent double-booking race conditions
const bookingLocks = new Map();

const acquireCarLock = async (carId) => {
    while (bookingLocks.has(carId)) {
        await bookingLocks.get(carId);
    }
    let release;
    const lockPromise = new Promise((resolve) => {
        release = resolve;
    });
    bookingLocks.set(carId, lockPromise);
    return () => {
        bookingLocks.delete(carId);
        release();
    };
};

const parseDateToMidnight = (val) => {
    if (!val) return null;
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split("-").map(Number);
        const parsed = new Date(y, m - 1, d);
        if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) return null;
        return parsed;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const getTodayStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

//Function to check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate) => {
    const pickup = new Date(pickupDate);
    const returned = new Date(returnDate);

    const bookings = await Booking.find({
        car,
        status: { $ne: "cancelled" },
        // Treat rental intervals as [pickup, return), so same-day handoffs work.
        pickupDate: { $lt: returned },
        returnDate: { $gt: pickup },
    });
    return bookings.length === 0;
};

// API to check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        if (!pickupDate || !returnDate) {
            return res.status(400).json({ success: false, message: "Pickup and return dates are required", availableCars: [] });
        }
        if (!parseDateToMidnight(pickupDate) || !parseDateToMidnight(returnDate)) {
            return res.status(400).json({ success: false, message: "Invalid booking dates", availableCars: [] });
        }

        if (pickupDate) {
            const pickupMidnight = parseDateToMidnight(pickupDate);
            const todayMidnight = getTodayStart();
            if (pickupMidnight && pickupMidnight < todayMidnight) {
                return res.json({ success: false, message: "Pickup date cannot be in the past", availableCars: [] });
            }
        }

        if (new Date(returnDate) <= new Date(pickupDate)) {
            return res.json({ success: false, message: "Return date must be after pickup date", availableCars: [] });
        }

        const admin = await findConfiguredAdmin();
        if (!admin) {
            return res.status(503).json({ success: false, message: "Rental inventory is not configured", availableCars: [] });
        }

        const query = { owner: admin._id, isAvailable: true };
        if (location) query.location = location;
        const cars = await Car.find(query);

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
            return { ...car._doc, isAvailable: isAvailable };
        });

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter((car) => car.isAvailable === true);

        res.json({ success: true, availableCars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to create Booking
export const createBooking = async (req, res) => {
    const carId = req.body?.car ? String(req.body.car) : "unknown";
    const releaseLock = await acquireCarLock(carId);

    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, licenseNumber } = req.body;

        if (!car) {
            return res.status(400).json({ success: false, message: "Car ID is required" });
        }

        if (!licenseNumber || licenseNumber.trim().length < 4) {
            return res.status(400).json({ success: false, message: "Enter a valid driving license number" });
        }

        if (!pickupDate || !returnDate) {
            return res.status(400).json({ success: false, message: "Pickup and return dates are required" });
        }

        const pickupDateObj = new Date(pickupDate);
        const returnDateObj = new Date(returnDate);

        if (isNaN(pickupDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid booking dates" });
        }

        if (!parseDateToMidnight(pickupDate) || !parseDateToMidnight(returnDate)) {
            return res.status(400).json({ success: false, message: "Invalid booking dates" });
        }

        const pickupMidnight = parseDateToMidnight(pickupDate);
        const todayMidnight = getTodayStart();

        if (pickupMidnight < todayMidnight) {
            return res.status(400).json({ success: false, message: "Pickup date cannot be in the past" });
        }

        if (returnDateObj <= pickupDateObj) {
            return res.status(400).json({ success: false, message: "Return date must be after pickup date" });
        }

        const admin = await findConfiguredAdmin();
        if (!admin) {
            return res.status(503).json({ success: false, message: "Rental inventory is not configured" });
        }

        const carData = await Car.findOne({ _id: car, owner: admin._id, isAvailable: true });
        if (!carData) {
            return res.status(404).json({ success: false, message: "Car not available" });
        }

        if (carData.owner.toString() === _id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot book your own car" });
        }

        const isAvailable = await checkAvailability(car, pickupDateObj, returnDateObj);

        if (!isAvailable) {
            return res.status(409).json({ success: false, message: "Car not available for the selected dates" });
        }

        const noOfDays = Math.max(1, Math.ceil((returnDateObj - pickupDateObj) / (1000 * 60 * 60 * 24)));
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate: pickupDateObj,
            returnDate: returnDateObj,
            price,
            licenseNumber: licenseNumber.trim(),
            paymentStatus: "pay_at_pickup",
        });

        res.json({ success: true, message: "Booking Created" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    } finally {
        releaseLock();
    }
};

//API to list User Bookings
export const getUserBooking = async (req,res)=>{
    try{
        const {_id}= req.user;
        const bookings =await Booking.find({user: _id}).populate("car").sort({createdAt: -1})
        res.json({success: true,bookings})
    } catch (error){
       console.log(error.message);
       res.json({success: false, message: error.message}) 
    }
}

//API to get owner Bookings
export const getOwnerBooking = async (req,res)=>{
    try{
        if(!isConfiguredAdmin(req.user)){
            return res.status(403).json({success: false, message: "Unauthorized"})
        }
        const bookings=await Booking.find({owner:req.user._id}).populate('car').populate('user', 'name email image').sort({createdAt:-1})
        res.json({success: true,bookings})

    } catch (error){
       console.log(error.message);
       res.json({success: false, message: error.message}) 
    }
}

//API to change Bookings status
export const  changeBookingsstatus= async (req,res)=>{
    try{
        const {_id}=req.user;
        const {bookingId, status}=req.body
        const allowed = ["pending", "confirmed", "completed", "cancelled"]
        if (!allowed.includes(status)) {
            return res.status(400).json({success: false, message: "Invalid status"})
        }

        const booking = await Booking.findById(bookingId)
        if(!booking){
            return res.status(404).json({success: false, message: "Booking not found"})
        }

        if(booking.owner.toString() !== _id.toString()){
            return res.status(403).json({success: false, message: "Unauthorized"})
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
            return res.status(400).json({ success: false, message: "This booking can no longer be changed" })
        }
        if (booking.status === "pending" && status === "completed") {
            return res.status(400).json({ success: false, message: "Confirm the booking before marking it completed" })
        }

        booking.status =status;
        await booking.save();

        res.json({success: true, message: "Status Updated"})
    } catch (error){
       console.log(error.message);
       res.json({success: false, message: error.message}) 
    }
}

export const cancelUserBooking = async (req,res)=>{
    try{
        const {bookingId}=req.body
        const booking = await Booking.findById(bookingId)

        if(!booking){
            return res.status(404).json({success: false, message: "Booking not found"})
        }

        if(booking.user.toString() !== req.user._id.toString()){
            return res.status(403).json({success: false, message: "Unauthorized"})
        }

        if(booking.status === "cancelled"){
            return res.status(400).json({success: false, message: "Booking already cancelled"})
        }

        booking.status = "cancelled"
        await booking.save()
        res.json({success: true, message: "Booking cancelled"})
    } catch (error){
       console.log(error.message);
       res.json({success: false, message: error.message})
    }
}
