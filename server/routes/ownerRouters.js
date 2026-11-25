import express from "express";
import protect, { protectAdmin } from "../middleware/auth.js";
import { addCar, getOwnerCars, toggleCarAvailability, deleteCar, getDashboardData, updateUserImage, getOwnerCar, updateCar } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/add-car",protectAdmin,upload.single("image"), addCar)
ownerRouter.get("/cars",protectAdmin, getOwnerCars)
ownerRouter.get("/cars/:id",protectAdmin, getOwnerCar)
ownerRouter.post("/update-car/:id",protectAdmin,upload.single("image"), updateCar)
ownerRouter.post("/toggle-car",protectAdmin, toggleCarAvailability)
ownerRouter.post("/delete-car",protectAdmin, deleteCar)

ownerRouter.get('/dashboard',protectAdmin,getDashboardData)

ownerRouter.post('/update-image',protect,upload.single("image"),updateUserImage)

export default ownerRouter;
