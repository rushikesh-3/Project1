import jwt from "jsonwebtoken"
import User from "../models/User.js";
import { isConfiguredAdmin } from "../configs/admin.js";

const JWT_ALGO = "HS256";

const protect = async(req,res,next)=>{
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({success: false, message: "not authorized"})
    }

    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [JWT_ALGO] })
        const userId = decoded.id || decoded;

        if(!userId){
            return res.status(401).json({success: false, message: "not authorized"})
        }
        const user = await User.findById(userId).select("-password -resetPasswordOtp -resetPasswordExpires")
        if(!user){
            return res.status(401).json({success: false, message: "not authorized"})
        }
        req.user = user
        next();
    } catch(error){
        return res.status(401).json({success: false, message: "not authorized"})
    }
}

export const protectAdmin = async (req, res, next) => {
    await protect(req, res, () => {
        if (!isConfiguredAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Administrator access required" });
        }
        next();
    });
};

export default protect
