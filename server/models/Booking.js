import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
  car: { type: ObjectId, ref: "Car", required: true },
  user: { type: ObjectId, ref: "User", required: true },
  owner: { type: ObjectId, ref: "User", required: true },

  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },

  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },

  price: { type: Number, required: true },
  licenseNumber: { type: String, default: "" },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "pay_at_pickup"],
    default: "pay_at_pickup"
  }

}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
