import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const baseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        await mongoose.connect(`${baseUri}/car-rental`)
    } catch (error) {
        console.error("Database connection failed:", error.message);
        console.error("Install MongoDB locally OR update MONGODB_URI in server/.env with your Atlas connection string.");
        process.exit(1);
    }
}

export default connectDB
