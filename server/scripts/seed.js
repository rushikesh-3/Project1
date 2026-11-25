import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Car from "../models/Car.js";
import { getAdminEmail } from "../configs/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");
const clientAssets = path.join(__dirname, "../../client/src/assets");
const isProduction = process.env.NODE_ENV === "production";
const adminEmail = getAdminEmail();
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? "" : "password123");

if (!adminEmail) {
  throw new Error("Set ADMIN_EMAIL before seeding the production rental administrator.");
}

const baseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
await mongoose.connect(`${baseUri}/car-rental`);

try {
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    if (!adminPassword) {
      throw new Error("Set ADMIN_PASSWORD to create the initial production admin account.");
    }
    admin = await User.create({
      name: process.env.ADMIN_NAME || (isProduction ? "Rental Administrator" : "Demo Admin"),
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  // Demote accounts elevated by the old public self-service owner flow.
  await User.updateMany(
    { role: { $in: ["owner", "admin"] }, email: { $ne: adminEmail } },
    { $set: { role: "user" } }
  );

  if (!isProduction) {
    const demoRenterEmail = "renter@carrental.local";
    const demoRenter = await User.findOne({ email: demoRenterEmail });
    if (!demoRenter) {
      await User.create({
        name: "Demo Renter",
        email: demoRenterEmail,
        password: await bcrypt.hash("password123", 10),
        role: "user",
      });
    }

    const existingCars = await Car.countDocuments({ owner: admin._id });
    if (existingCars === 0) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      const copyAsset = (fileName, destName) => {
        const source = path.join(clientAssets, fileName);
        const target = path.join(uploadsDir, destName);
        if (fs.existsSync(source)) fs.copyFileSync(source, target);
        return `/uploads/${destName}`;
      };

      const cars = [
        { brand: "BMW", model: "X5", image: copyAsset("car_image1.png", "seed-bmw-x5.png"), year: 2022, category: "SUV", seating_capacity: 5, fuel_type: "Hybrid", transmission: "Automatic", pricePerDay: 300, location: "BN Reddy", description: "A mid-size luxury SUV with a spacious cabin, ideal for family trips around Hyderabad.", features: ["Bluetooth", "GPS", "Sunroof", "Air Conditioning", "USB Charger"] },
        { brand: "Toyota", model: "Corolla", image: copyAsset("car_image2.png", "seed-toyota-corolla.png"), year: 2021, category: "Sedan", seating_capacity: 5, fuel_type: "Petrol", transmission: "Manual", pricePerDay: 130, location: "LB Nagar", description: "A reliable sedan with strong mileage for daily city commutes.", features: ["Bluetooth", "Air Conditioning", "USB Charger", "Rear View Mirror"] },
        { brand: "Jeep", model: "Wrangler", image: copyAsset("car_image3.png", "seed-jeep-wrangler.png"), year: 2023, category: "SUV", seating_capacity: 4, fuel_type: "Petrol", transmission: "Automatic", pricePerDay: 200, location: "KPHB", description: "An adventurous SUV for weekend getaways and highway drives.", features: ["GPS", "Bluetooth", "Air Conditioning", "360 Camera"] },
        { brand: "Ford", model: "Neo 6", image: copyAsset("car_image4.png", "seed-ford-neo.png"), year: 2022, category: "Sedan", seating_capacity: 4, fuel_type: "Diesel", transmission: "Automatic", pricePerDay: 180, location: "Miyapur", description: "A comfortable sedan with diesel efficiency for longer trips.", features: ["Heated Seats", "Bluetooth", "GPS", "Air Conditioning"] },
      ];

      await Car.insertMany(cars.map(car => ({ ...car, owner: admin._id, isAvailable: true })));
      console.log("Seeded four demo cars for the rental admin.");
    } else {
      console.log("Rental admin already has cars; skipped demo car seed.");
    }
    console.log(`Demo admin account ready: ${adminEmail}`);
    if (!process.env.ADMIN_PASSWORD) console.log("Local demo admin password: password123");
    console.log("Demo renter: renter@carrental.local / password123");
  } else {
    console.log(`Production admin account is ready: ${adminEmail}`);
    console.log("Production demo renters and demo vehicles were not created.");
  }
} finally {
  await mongoose.disconnect();
}
