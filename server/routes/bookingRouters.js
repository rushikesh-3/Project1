import express from "express";
import { cancelUserBooking, changeBookingsstatus, checkAvailabilityOfCar, createBooking, getOwnerBooking, getUserBooking } from "../controllers/bookingControllers.js";
import protect, { protectAdmin } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability',checkAvailabilityOfCar)
bookingRouter.post('/create',protect,createBooking)
bookingRouter.get('/user',protect,getUserBooking)
bookingRouter.get('/admin',protectAdmin,getOwnerBooking)
bookingRouter.post('/change-status',protect,changeBookingsstatus)
bookingRouter.post('/cancel',protect,cancelUserBooking)

export default bookingRouter;
