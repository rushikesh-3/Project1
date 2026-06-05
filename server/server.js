import express from "express";
import "dotenv/config"
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRouters.js";
import ownerRouter from "./routes/ownerRouters.js";
import bookingRouter from "./routes/bookingRouters.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express()

await connectDB()

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/booking', bookingRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
