import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js"
import Subscriber from "../models/Subscriber.js"
import Message from "../models/Message.js"
import { randomInt } from 'crypto'
import { findConfiguredAdmin, getAdminEmail, isConfiguredAdmin } from "../configs/admin.js"

// HMAC-SHA256 JWT: signed with a server secret so the SPA can stay stateless.
const generateToken =(userId)=>{
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { algorithm: "HS256", expiresIn: "7d" }
    )
}

//Register User
export const registerUser = async(req,res)=>{
    try{
        const {name, email, password}=req.body

        if(!name || !email || !password){
            return res.status(400).json({success: false, message: 'Fill all the fields'})
        }
        if(password.length<8){
            return res.status(400).json({success: false, message: 'Password must be at least 8 characters'})
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (normalizedEmail === getAdminEmail()) {
            return res.status(403).json({ success: false, message: "This account is reserved for the rental administrator" })
        }
        const userExists= await User.findOne({email: normalizedEmail})
        if(userExists){
            return res.status(409).json({success: false, message: 'User already exists'})
        }

        const hashedPassword=await bcrypt.hash(password,10)
        const user= await User.create({name, email: normalizedEmail, password: hashedPassword})


        const token = generateToken(user._id.toString())

        res.status(201).json({success:true,token})

    } catch(error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message})
    }
}


//Login User

export const loginUser = async(req,res)=>{
    try{
        const {email,password} =req.body
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" })
        const normalizedEmail = email ? email.trim().toLowerCase() : ''
        const user= await User.findOne({email: normalizedEmail})

        if(!user){
            return res.status(401).json({success: false, message: "User not found"})
        }

        const isMatch=await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({success: false, message: "Invalid Credentials"})
        }

        const token = generateToken(user._id.toString())
        res.json({success:true,token})
        
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({success: false, message: error.message})
    }
}


//Get User data Using Token (JWT)

export const getUserData= async(req,res)=>{
    try{
        const user = req.user.toObject();
        user.isAdmin = isConfiguredAdmin(req.user);
        res.json({success:true,user})
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//Get all cars for the Frontend

export const getCars= async(req,res)=>{
    try{
        const admin = await findConfiguredAdmin();
        if (!admin) return res.json({success: true, cars: []})
        const cars = await Car.find({owner: admin._id, isAvailable: true})
        res.json({success: true, cars})
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getCarById = async (req, res) => {
    try {
        const admin = await findConfiguredAdmin();
        if (!admin) return res.status(503).json({ success: false, message: "Rental inventory is not configured" })
        const car = await Car.findOne({ _id: req.params.id, owner: admin._id, isAvailable: true })
        if (!car) {
            return res.json({ success: false, message: "Car not found" })
        }
        res.json({ success: true, car })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const requestPasswordReset = async (req, res) => {
    try {
        if (process.env.NODE_ENV === "production") {
            return res.status(503).json({ success: false, message: "Password reset is not configured. Contact the rental administrator." })
        }
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" })
        }
        const normalizedEmail = email.trim().toLowerCase()
        const user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email" })
        }

        // Generate secure 6-digit numeric OTP
        const otp = randomInt(100000, 1000000).toString()
        user.resetPasswordOtp = await bcrypt.hash(otp, 10)
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        await user.save()

        // Log OTP to server terminal for local/dev use without requiring an external email service
        console.log(`\n========================================\n[AUTH] Password Reset Code for ${normalizedEmail}: ${otp}\n========================================\n`)

        res.json({ success: true, message: "Reset code generated. Check server console for your code." })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body
        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, message: "Email, reset code, and new password are required" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
        }
        const normalizedEmail = email.trim().toLowerCase()
        const user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: "No active reset request. Request a new code first." })
        }
        if (new Date() > new Date(user.resetPasswordExpires)) {
            user.resetPasswordOtp = undefined
            user.resetPasswordExpires = undefined
            await user.save()
            return res.status(400).json({ success: false, message: "Reset code has expired. Request a new one." })
        }

        const isMatch = await bcrypt.compare(String(otp).trim(), user.resetPasswordOtp)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid reset code" })
        }

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordOtp = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        res.json({ success: true, message: "Password updated. You can log in now." })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body
        if (!name || !email || !message) {
            return res.json({ success: false, message: "Fill all the fields" })
        }
        await Message.create({ name, email, message })
        res.json({ success: true, message: "Message sent. We will get back to you." })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body
        if (!email || !email.includes("@")) {
            return res.json({ success: false, message: "Enter a valid email" })
        }
        const normalizedEmail = email.trim().toLowerCase()
        const exists = await Subscriber.findOne({ email: normalizedEmail })
        if (exists) {
            return res.json({ success: true, message: "You are already subscribed" })
        }
        await Subscriber.create({ email: normalizedEmail })
        res.json({ success: true, message: "Subscribed to newsletter" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
