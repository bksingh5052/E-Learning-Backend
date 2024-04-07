
import mongoose from "mongoose";
import { config } from "./config.js";


export const connectDb = async () => {
    try {
        await mongoose.connect(config.get('mongodbUrl'))
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connection failed")
    }
};
