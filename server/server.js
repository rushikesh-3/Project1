import express from "express";
import "dotenv/config"
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRouters.js";
import adminRouter from "./routes/ownerRouters.js";
import bookingRouter from "./routes/bookingRouters.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express()

await connectDB()

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/booking', bookingRouter)

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" })
        }
        return res.status(400).json({ success: false, message: err.message })
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
    next()
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
