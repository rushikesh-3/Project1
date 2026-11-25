import express from 'express'
import { getCarById, getCars, getUserData, loginUser, registerUser, requestPasswordReset, resetPassword, sendContactMessage, subscribeNewsletter } from '../controllers/userController.js';
import protect from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',getCars)
userRouter.get('/cars/:id', getCarById)
userRouter.post('/subscribe', subscribeNewsletter)
userRouter.post('/request-reset', requestPasswordReset)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/contact', sendContactMessage)

export default userRouter
