import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from './src/routes/auth.routes.js'
import profileRoutes from './src/routes/profile.routes.js'
import courseRoutes from './src/routes/course.routes.js'
import categoryRoutes from './src/routes/category.routes.js'
import sectionRoutes from './src/routes/section.routes.js'
import subSectionRoutes from './src/routes/subSection.routes.js'
import cors from 'cors'
import { verifyEmail } from "./src/controllers/auth.controller.js";
import { config } from "./src/configs/config.js";
import { cloudinaryConnect } from "./src/configs/cloudinary.js";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import { token } from "morgan";
import { connectDb } from "./src/configs/database.js";

import fs from 'fs'

token('host',(req,res)=>{
	return req.hostname
})







const app = express();
const port = config.get('port') || 4000;

app.use(express.json());
app.use(
	cors({
		origin:"http://localhost:5000",
		credentials:true,
	})
)
app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
	
)
app.use(cookieParser())
app.use(morgan('common'))
app.get('/', (req,res)=>{
	res.status(200).json({messege: "Welcome to the E-Learning platform"})
})
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.get("/auth/:id/verify/:token", verifyEmail);
app.use("/api/v1/courses", courseRoutes);
app.use('/api/v1/sections', sectionRoutes)
app.use('/api/v1/subSections', subSectionRoutes)
app.use('/api/v1/categories', categoryRoutes)





app.listen(port,()=>{
    connectDb();
	cloudinaryConnect()
    console.log(`Server is running on port : ${port}`)
})




